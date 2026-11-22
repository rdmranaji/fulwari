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
// close-ups and oddities that don't sell a plant
const AVOID = /(bark|pollen|grain|boulder|comparison|\bbud\b|\bnight\b|wood|stem section|cross.?section|orchid|leaf scar|fully opened|seeds?\b|seedpod|pods?\b|insect|caterpillar|beetle|disease|close-?up|leaves|yellow poinciana|peltophorum|gall|swallowtail|papilio|butterfl|blanco|plate|pentas)/i;

const src = await fs.readFile(path.join(ROOT, "lib", "photos.ts"), "utf8");
const slots = [...src.matchAll(/"?([\w-]+)"?:\s*\{\s*wiki:\s*"([^"]+)",\s*index:\s*(\d+),\s*alt:\s*"([^"]+)"([^}]*)\}/g)]
  .map(([, key, wiki, index, alt, rest]) => ({ key, wiki, index: +index, alt, file: rest.match(/file:\s*"([^"]+)"/)?.[1], prefer: rest.match(/prefer:\s*"([^"]+)"/)?.[1] }));
const PRODUCT = new Set(["neem", "gulmohar", "karanj", "kesar-mango", "chikoo", "areca-palm", "foxtail-palm", "bougainvillea", "hibiscus", "ixora", "golden-duranta", "snake-plant"]);

const get = async (url) => {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA, "Api-User-Agent": UA } });
    if (r.ok) return r;
    if (r.status === 429 || r.status >= 500) { await new Promise((s) => setTimeout(s, 3000 * (i + 1))); continue; }
    throw new Error(`${r.status} ${url}`);
  }
  throw new Error(`gave up ${url}`);
};
const strip = (h = "") => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function info(files) {
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
  return out;
}
const mediaCache = new Map();
async function candidates(wiki, seedSlot) {
  const k = wiki + (seedSlot ? "#seed" : "");
  if (mediaCache.has(k)) return mediaCache.get(k);
  const j = await (await get(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(wiki)}`)).json();
  const files = (j.items || []).filter((x) => x.type === "image" && /\.jpe?g$/i.test(x.title) && !SKIP.test(x.title) && (seedSlot || !AVOID.test(x.title.replace(/_/g, " ")))).map((x) => x.title);
  const out = await info(files);
  mediaCache.set(k, out);
  return out;
}

async function download(url, file) {
  const buf = Buffer.from(await (await get(url)).arrayBuffer());
  await fs.writeFile(file, buf);
}

await fs.mkdir(OUT, { recursive: true });
const result = {};
const used = new Set(slots.filter((x) => x.file).map((x) => x.file.replace(/_/g, " ")));
let ok = 0, fail = 0;
for (const s of slots) {
  try {
    let picks;
    if (s.file) {
      picks = await info([s.file]);
      if (!picks.length) throw new Error(`pinned file not usable: ${s.file}`);
    } else {
      let list = await candidates(s.wiki, s.key === "story-seed");
      if (s.prefer) { const re = new RegExp(s.prefer, "i"); list = [...list.filter((c) => re.test(c.file)), ...list.filter((c) => !re.test(c.file))]; }
      if (!PRODUCT.has(s.key)) list = [...list.filter((c) => !used.has(c.file)), ...list.filter((c) => used.has(c.file))];
      if (PRODUCT.has(s.key)) list = list.filter((c) => !/(bud|seed|flower cluster|fully opened)/i.test(c.file)).concat(list.filter((c) => /(bud|seed|flower cluster|fully opened)/i.test(c.file)));
      if (!list.length) throw new Error("no freely licensed photos");
      picks = PRODUCT.has(s.key) ? list.slice(0, 3) : [list[Math.min(s.index, list.length - 1)]];
    }
    if (!PRODUCT.has(s.key)) picks.forEach((c) => used.add(c.file));
    result[s.key] = [];
    for (const c of picks) {
      const name = `${s.key}${result[s.key].length ? "-" + result[s.key].length : ""}`;
      const sm = c.thumb.replace(/\/1600px-/, "/800px-");
      try {
        await download(c.thumb, path.join(OUT, `${name}.jpg`));
        await download(sm, path.join(OUT, `${name}-sm.jpg`)).catch(() => fs.copyFile(path.join(OUT, `${name}.jpg`), path.join(OUT, `${name}-sm.jpg`)));
      } catch (e) { console.warn(`  skipped ${c.file}: ${e.message.slice(0, 80)}`); continue; }
      result[s.key].push({ src: `/photos/${name}.jpg`, srcSm: `/photos/${name}-sm.jpg`, w: c.w, h: c.h, alt: s.alt, credit: c.credit, license: c.license, page: c.page });
      await new Promise((r) => setTimeout(r, 400));
    }
    if (!result[s.key].length) { delete result[s.key]; throw new Error("all downloads failed"); }
    ok++; console.log(`✓ ${s.key} ← ${picks.map((p) => p.file).join(", ")}`);
  } catch (e) { fail++; console.warn(`✗ ${s.key}: ${e.message}`); }
}

/* ---------- Grow Lab: real photos of each growth stage, per species ---------- */
const LAB = JSON.parse(await fs.readFile(path.join(ROOT, "lib", "lab-stages.json"), "utf8"));
const STAGE_Q = { seed: ["seeds", "seed"], sprout: ["germination", "seedling sprouting"], seedling: ["seedling", "young plant"], sapling: ["sapling", "young tree"],
  flower: ["flowers", "flower"], fruit: ["fruit", "fruits"], cutting: ["cutting", "propagation"], bud: ["flower bud", "bud"] };
const STAGE_RE = { seed: /seed|stone|kernel|\bnut/i, sprout: /germinat|sprout|emerg|cotyledon|seedling/i, seedling: /seedling|young|juvenile|nursery|\bpups?\b|plantlet/i,
  sapling: /sapling|young|juvenile|nursery|plantation|planted/i, flower: /flower|bloom|blossom|inflorescence|panicle|bract/i, fruit: /fruit|pod|berr|drupe|mango|sapodilla/i,
  cutting: /cutting|propagat|rooting|rooted/i, bud: /\bbuds?\b/i };
const LAB_AVOID = /(map|diagram|illustration|drawing|herbarium|stamp|plate|blanco|köhler|kohler|bark|insect|butterfl|beetle|caterpillar|moth|disease|logo|\.svg|\.png|\.gif|\.tif)/i;
async function search(q) {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=30&srprop=snippet&srsearch=${encodeURIComponent(q)}`;
  const j = await (await get(u)).json();
  return (j.query?.search || []).map((r) => ({ title: r.title, text: (r.title + " " + strip(r.snippet)).replace(/_/g, " ") }));
}
for (const [sp, d] of Object.entries(LAB)) {
  const terms = new RegExp(d.terms, "i");
  const usedHere = new Set();
  for (const st of d.stages) {
    const key = `lab:${sp}:${st.key}`;
    try {
      let pick;
      if (st.key === "mature" && result[d.product]?.[0]) { result[key] = [{ ...result[d.product][0], alt: `${d.name}, ${st.label.toLowerCase()}` }]; usedHere.add(result[d.product][0].src); console.log(`✓ ${key} ← product photo`); continue; }
      for (const q of STAGE_Q[st.key] || [st.key]) {
        const hits = (await search(`${d.botanical} ${q}`)).filter((h) => /\.jpe?g$/i.test(h.title) && terms.test(h.text) && STAGE_RE[st.key].test(h.text) && !LAB_AVOID.test(h.title));
        if (!hits.length) continue;
        const infos = await info(hits.slice(0, 12).map((h) => h.title));
        pick = infos.find((c) => !usedHere.has(c.file));
        if (pick) break;
      }
      if (!pick) throw new Error("no matching photo");
      usedHere.add(pick.file);
      const name = `lab-${sp}-${st.key}`;
      await download(pick.thumb, path.join(OUT, `${name}.jpg`));
      await download(pick.thumb.replace(/\/1600px-/, "/800px-"), path.join(OUT, `${name}-sm.jpg`)).catch(() => fs.copyFile(path.join(OUT, `${name}.jpg`), path.join(OUT, `${name}-sm.jpg`)));
      result[key] = [{ src: `/photos/${name}.jpg`, srcSm: `/photos/${name}-sm.jpg`, w: pick.w, h: pick.h, alt: `${d.name}, ${st.label.toLowerCase()}`, credit: pick.credit, license: pick.license, page: pick.page }];
      console.log(`✓ ${key} ← ${pick.file}`);
      await new Promise((r) => setTimeout(r, 300));
    } catch (e) { console.warn(`✗ ${key}: ${e.message}`); }
  }
}

/* ---------- A real germination time-lapse video ---------- */
try {
  let done = false;
  for (const q of ["germination time-lapse filemime:video/webm", "seedling growth time-lapse filemime:video/webm", "germination time lapse filemime:video"]) {
    const hits = await search(q);
    for (const h of hits.slice(0, 8)) {
      const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=videoinfo&viprop=url|size|derivatives|extmetadata&titles=${encodeURIComponent(h.title)}`;
      const vi = Object.values((await (await get(u)).json()).query?.pages || {})[0]?.videoinfo?.[0];
      if (!vi) continue;
      const lic = vi.extmetadata?.LicenseShortName?.value || "";
      if (!OK_LICENCE.test(lic)) continue;
      const der = (vi.derivatives || []).filter((x) => /webm/.test(x.type) && (x.height || 999) <= 540).sort((a, b) => (b.height || 0) - (a.height || 0))[0];
      const url = der?.src || (vi.size < 25e6 ? vi.url : null);
      if (!url) continue;
      const buf = Buffer.from(await (await get(url)).arrayBuffer());
      if (buf.length > 30e6) continue;
      await fs.writeFile(path.join(OUT, "timelapse.webm"), buf);
      result.timelapse = [{ src: "/photos/timelapse.webm", srcSm: "/photos/timelapse.webm", w: vi.width, h: vi.height, alt: "Time-lapse of a seed germinating", credit: strip(vi.extmetadata?.Artist?.value) || "Wikimedia Commons contributor", license: lic, page: vi.descriptionurl }];
      console.log(`✓ timelapse ← ${h.title} (${Math.round(buf.length / 1e5) / 10} MB)`);
      done = true; break;
    }
    if (done) break;
  }
  if (!done) console.warn("✗ timelapse: none found");
} catch (e) { console.warn(`✗ timelapse: ${e.message}`); }

await fs.writeFile(JSON_OUT, JSON.stringify(result, null, 1) + "\n");
console.log(`Photos: ${ok} slots filled, ${fail} missing.`);
