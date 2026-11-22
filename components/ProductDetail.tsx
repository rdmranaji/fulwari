"use client";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ProductData } from "@/lib/catalog";
import { inr } from "@/lib/pricing";
import { useLang, useT } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import { ageLabel } from "./three/species";
import { photos } from "@/lib/photos";
import { Photo } from "./Photo";
import ProductGrid from "./ProductGrid";
import { Reveal } from "./Motion";


export default function ProductDetail({ p, related }: { p: ProductData; related: ProductData[] }) {
  const t = useT();
  const lang = useLang();
  const add = useShop((s) => s.add);
  const [vi, setVi] = useState(Math.min(1, p.variants.length - 1));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const v = p.variants[vi];
  const gallery = photos(p.slug);
  const [gi, setGi] = useState(0);

  return (
    <>
      <div className="wrap pdp">
        <div className="gallery">
          <div className="g-main">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={gi} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ position: "absolute", inset: 0 }}>
                <Photo p={gallery[gi]} priority sizes="(max-width:900px) 100vw, 55vw" fallback={p.species} />
              </motion.div>
            </AnimatePresence>
          </div>
          {gallery.length > 1 && (
            <div className="g-thumbs" role="group" aria-label="Photos">
              {gallery.map((g, i) => (
                <button key={g.src} aria-pressed={i === gi} onClick={() => setGi(i)} aria-label={`Photo ${i + 1}`}><Photo p={g} sizes="120px" /></button>
              ))}
            </div>
          )}
          <Link className="lab-link" href={`/grow-lab/?plant=${p.species}`}>See how a {p.name.toLowerCase().replace(/ \(grafted\)/, "")} grows over 5 years in the Grow Lab →</Link>
        </div>

        <div style={{ display: "grid", gap: 22 }}>
          <nav className="mute" style={{ fontSize: 14 }}><Link href="/shop">{t("nav.shop", "Shop")}</Link> / {p.name}</nav>
          <div>
            <h1 className="h-l">{lang === "hi" ? p.nameHi : p.name}</h1>
            <p className="mute" style={{ fontStyle: "italic", marginTop: 6 }}>{p.botanical}</p>
          </div>
          <p className="lede">{p.description}</p>

          <div>
            <p style={{ fontWeight: 700, marginBottom: 10 }}>{t("p.size", "Choose a size")}</p>
            <div className="variants" role="radiogroup" aria-label="Size">
              {p.variants.map((x, i) => (
                <button key={x.sku} className="variant" role="radio" aria-checked={i === vi} aria-pressed={i === vi} onClick={() => setVi(i)}>
                  <span className="dot" />
                  <span><b>{x.label}</b><br /><span className="mute" style={{ fontSize: 14 }}>{x.bag} · about {ageLabel(x.ageDays).replace("Day ", "") } old</span></span>
                  <b className="nb">{inr(x.priceInr)}</b>
                </button>
              ))}
            </div>
          </div>

          <div className="buy">
            <div className="qty" aria-label={t("p.qty", "Quantity")}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Fewer">−</button><span>{qty}</span><button onClick={() => setQty((q) => Math.min(999, q + 1))} aria-label="More">+</button>
            </div>
            <button className="btn" style={{ flex: "1 1 220px" }} onClick={() => { add({ sku: v.sku, slug: p.slug, name: p.name, nameHi: p.nameHi, label: v.label, priceInr: v.priceInr, species: p.species }, qty); setAdded(true); setTimeout(() => setAdded(false), 1600); }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={added ? "y" : "n"} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}>
                  {added ? `${t("p.added", "Added")} ✓` : `${t("p.add", "Add to cart")} · ${inr(v.priceInr * qty)}`}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
          <p className="mute" style={{ fontSize: 15 }}>Delivered in its nursery bag across Gujarat, or collect from Anand. <Link href="/bulk">{t("p.bulk", "Need 100 or more? Get a bulk quote")}</Link>.</p>

          <div className="facts">
            <div><b>{t("p.sun", "Light")}</b>{p.sun}</div>
            <div><b>{t("p.water", "Water")}</b>{p.water}</div>
            <div><b>{t("p.mature", "Full size")}</b>{p.matureSize}</div>
            <div><b>{t("p.growth", "Growth")}</b>{p.growth}</div>
          </div>
          {gallery[gi] && <p className="mute" style={{ fontSize: 12 }}>Photo: {gallery[gi].credit}, {gallery[gi].license}, via Wikimedia Commons. Representative of the species; Fulwari's own stock photos to follow.</p>}
        </div>
      </div>
      {related.length > 0 && (
        <section className="band" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Reveal><h2 className="h-m" style={{ marginBottom: 24 }}>Grows well alongside</h2></Reveal>
            <ProductGrid products={related} categories={[]} filter={false} />
          </div>
        </section>
      )}
    </>
  );
}
