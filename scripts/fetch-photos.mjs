#!/usr/bin/env node
// Downloads freely licensed photos from Wikimedia Commons for every slot in lib/photos.ts
// into public/photos/ and writes lib/photos.generated.json (sizes, credits, licences).
// Runs in the GitHub Pages build; run it locally with `npm run photos`.
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "public", "photos");
const JSON_OUT = path.join(ROOT, "lib", "photos.generated.json");
const UA = process.env.PHOTO_USER_AGENT || "FulwariWebsiteBuild/1.0 (+https://github.com/rdmranaji/fulwari)";
const OK_LICENCE = /^(cc[ -]by|cc0|public domain|pd)/i;
const SKIP = /(map|distribution|range|diagram|illustration|drawing|köhler|kohler|botanical|herbarium|stamp|logo|icon|svg|chart|\.png$|\.gif$|\.tif)/i;

const src = await fs.readFile(path.join(ROOT, "lib", "photos.ts"), "utf8");
const slots = [...src.matchAll(/"?([\w-]+)"?:\s*\{\s*wiki:\s*"([^"]+)",\s*index:\s*(\d+),\s*alt:\s*"([^"]+)"/g)]
  .map(([, key, wiki, index, alt]) => ({ key, wiki, index: +index, alt }));
const PRODUCT = new Set(["neem", "gulmohar", "karanj", "kesar-mango", "chikoo", "areca-palm", "foxtail-palm", "bougainvillea", "hibiscus", "ixora", "golden-duranta", "snake-plant"]);

const get = async (url) => {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA, "Api-User-Agent": UA } });
    if (r.ok) return r;
    if (r.status === 429 || r.status >= 500) { await new Promise((s) => setTimeout(s, 1500 * (i + 1))); continue; }
    throw new Error(`${r.status} ${url}`);
  }
  throw new Error(`gave up ${url}`);
};
const strip = (h = "") => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const mediaCache = new Map();
async function candidates(wiki) {
  if (mediaCache.has(wiki)) return mediaCache.get(wiki);
  const j = await (await get(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(wiki)}`)).json();
  const files = (j.items || []).filter((x) => x.type === "image" && /\.jpe?g$/i.test(x.title) && !SKIP.test(x.title)).map((x) => x.title);
  const out = [];
  for (let i = 0; i < files.length; i += 20) {
    const batch = files.slice(i, i + 20).map((t) => (t.startsWith("File:") ? t : `File:${t}`));
    const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1600&titles=${encodeURIComponent(batch.join("|"))}`;
    const q = await (await get(u)).json();
    const pages = Object.values(q.query?.pages || {});
    for (const t of batch) {
      const p = pages.find((x) => x.title === t.replace(/_/g, " "));
      const ii = p?.imageinfo?.[0];
      if (!ii) continue; // not on Commons (local, possibly non-free): skip
      const m = ii.extmetadata || {};
      const lic = m.LicenseShortName?.value || "";
      if (!OK_LICENCE.test(lic) || ii.width < 900) continue;
      out.push({ file: p.title, thumb: ii.thumburl, w: ii.thumbwidth, h: ii.thumbheight, license: lic, credit: strip(m.Artist?.value) || "Wikimedia Commons contributor", page: ii.descriptionurl });
    }
  }
  mediaCache.set(wiki, out);
  return out;
}

async function download(url, file) {
  const buf = Buffer.from(await (await get(url)).arrayBuffer());
  await fs.writeFile(file, buf);
}

await fs.mkdir(OUT, { recursive: true });
const result = {};
let ok = 0, fail = 0;
for (const s of slots) {
  try {
    const list = await candidates(s.wiki);
    if (!list.length) throw new Error("no freely licensed photos");
    const picks = PRODUCT.has(s.key) ? list.slice(0, 3) : [list[Math.min(s.index, list.length - 1)]];
    result[s.key] = [];
    for (let i = 0; i < picks.length; i++) {
      const c = picks[i];
      const name = `${s.key}${i ? "-" + i : ""}`;
      const sm = c.thumb.replace(/\/1600px-/, "/800px-");
      await download(c.thumb, path.join(OUT, `${name}.jpg`));
      await download(sm, path.join(OUT, `${name}-sm.jpg`)).catch(() => fs.copyFile(path.join(OUT, `${name}.jpg`), path.join(OUT, `${name}-sm.jpg`)));
      result[s.key].push({ src: `/photos/${name}.jpg`, srcSm: `/photos/${name}-sm.jpg`, w: c.w, h: c.h, alt: s.alt, credit: c.credit, license: c.license, page: c.page });
    }
    ok++; console.log(`✓ ${s.key} ← ${picks.map((p) => p.file).join(", ")}`);
  } catch (e) { fail++; console.warn(`✗ ${s.key}: ${e.message}`); }
}
await fs.writeFile(JSON_OUT, JSON.stringify(result, null, 1) + "\n");
console.log(`Photos: ${ok} slots filled, ${fail} missing.`);
