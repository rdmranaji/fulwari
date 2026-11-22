"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CategoryData, ProductData } from "@/lib/catalog";
import { inr } from "@/lib/pricing";
import { useLang, useT } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import { Glyph } from "./Glyph";

const PlantView = dynamic(() => import("./three/CardViews").then((m) => m.PlantView), { ssr: false });
const ViewsCanvas = dynamic(() => import("./three/CardViews").then((m) => m.ViewsCanvas), { ssr: false });

function Card({ p, i, gl }: { p: ProductData; i: number; gl: boolean }) {
  const lang = useLang();
  const t = useT();
  const add = useShop((s) => s.add);
  const growing = useRef(false);
  const v = p.variants[0];
  const big = p.variants[p.variants.length - 1];
  const from = Math.min(...p.variants.map((x) => x.priceInr));
  const [justAdded, setJustAdded] = useState(false);
  return (
    <motion.article layout initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
      className="card" onMouseEnter={() => (growing.current = true)} onMouseLeave={() => (growing.current = false)} onFocus={() => (growing.current = true)} onBlur={() => (growing.current = false)}>
      <Link href={`/shop/${p.slug}`} aria-label={p.name} style={{ position: "absolute", inset: 0, zIndex: 3 }} />
      <div className="viz">
        {gl ? <PlantView species={p.species} days={big.ageDays} growing={growing} /> : <div className="v3d" style={{ display: "grid", placeItems: "center" }}><Glyph species={p.species} size={140} /></div>}
        <span className="tag pill">{p.featured ? "Bestseller" : p.botanical}</span>
      </div>
      <div className="body">
        <h3>{lang === "hi" ? p.nameHi : p.name}</h3>
        <span className="bot">{p.botanical}</span>
        <p className="mute" style={{ fontSize: 15 }}>{p.tagline}</p>
        <div className="row">
          <span className="price">{inr(from)} <small className="mute" style={{ fontWeight: 500, fontSize: 13 }}>{t("shop.from", "onwards")}</small></span>
          <button className="btn small green" style={{ position: "relative", zIndex: 4 }} aria-label={`Add ${p.name} ${v.label} to cart`}
            onClick={() => { add({ sku: v.sku, slug: p.slug, name: p.name, nameHi: p.nameHi, label: v.label, priceInr: v.priceInr, species: p.species }); setJustAdded(true); setTimeout(() => setJustAdded(false), 1400); }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={justAdded ? "a" : "b"} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}>{justAdded ? "Added ✓" : "+ Add"}</motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function ProductGrid({ products, categories, filter = true, limit }: { products: ProductData[]; categories: CategoryData[]; filter?: boolean; limit?: number }) {
  const t = useT();
  const lang = useLang();
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("featured");
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const c = document.createElement("canvas"); setReady(!!(c.getContext("webgl2") || c.getContext("webgl"))); } catch { setReady(false); }
  }, []);
  const list = useMemo(() => {
    let l = products.filter((p) => cat === "all" || p.category === cat);
    const min = (p: ProductData) => Math.min(...p.variants.map((v) => v.priceInr));
    if (sort === "low") l = [...l].sort((a, b) => min(a) - min(b));
    if (sort === "high") l = [...l].sort((a, b) => min(b) - min(a));
    if (sort === "featured") l = [...l].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return limit ? l.slice(0, limit) : l;
  }, [products, cat, sort, limit]);
  return (
    <div ref={root}>
      {filter && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between", marginBottom: 26 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label="Filter by category">
            <button className="chip" aria-pressed={cat === "all"} onClick={() => setCat("all")}>{t("shop.all", "All plants")}</button>
            {categories.map((c) => <button key={c.slug} className="chip" aria-pressed={cat === c.slug} onClick={() => setCat(c.slug)}>{lang === "hi" ? c.nameHi : c.name}</button>)}
          </div>
          <label className="field" style={{ gridAutoFlow: "column", alignItems: "center", gap: 10 }}>
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ minHeight: 44, padding: "8px 12px" }}>
              <option value="featured">Bestsellers first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
            </select>
          </label>
        </div>
      )}
      <motion.div className="cards" layout>
        <AnimatePresence>
          {list.map((p, i) => <Card key={p.slug} p={p} i={i} gl={ready} />)}
        </AnimatePresence>
      </motion.div>
      {ready && <ViewsCanvas eventSource={root} />}
    </div>
  );
}
