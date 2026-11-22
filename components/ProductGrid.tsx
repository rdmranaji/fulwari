"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CategoryData, ProductData } from "@/lib/catalog";
import { inr } from "@/lib/pricing";
import { useLang, useT } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import { photos } from "@/lib/photos";
import { Photo } from "./Photo";

function Card({ p, i }: { p: ProductData; i: number }) {
  const lang = useLang();
  const t = useT();
  const add = useShop((s) => s.add);
  const v = p.variants[0];
  const ph = photos(p.slug);
  const from = Math.min(...p.variants.map((x) => x.priceInr));
  const [justAdded, setJustAdded] = useState(false);
  return (
    <motion.article layout initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
      className="card">
      <Link href={`/shop/${p.slug}`} aria-label={p.name} style={{ position: "absolute", inset: 0, zIndex: 3 }} />
      <div className="viz">
        <Photo p={ph[0]} className="card-ph" sizes="(max-width:640px) 100vw, (max-width:1100px) 50vw, 33vw" fallback={p.species} />
        {ph[1] && <Photo p={ph[1]} className="card-ph alt" sizes="(max-width:640px) 100vw, (max-width:1100px) 50vw, 33vw" fallback={p.species} />}
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
  const list = useMemo(() => {
    let l = products.filter((p) => cat === "all" || p.category === cat);
    const min = (p: ProductData) => Math.min(...p.variants.map((v) => v.priceInr));
    if (sort === "low") l = [...l].sort((a, b) => min(a) - min(b));
    if (sort === "high") l = [...l].sort((a, b) => min(b) - min(a));
    if (sort === "featured") l = [...l].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return limit ? l.slice(0, limit) : l;
  }, [products, cat, sort, limit]);
  return (
    <div>
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
          {list.map((p, i) => <Card key={p.slug} p={p} i={i} />)}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
