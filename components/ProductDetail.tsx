"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ProductData } from "@/lib/catalog";
import { inr } from "@/lib/pricing";
import { useLang, useT } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import type { Clock } from "./three/GrowScene";
import type { GrowthInfo } from "./three/plantGen";
import { ageLabel } from "./three/species";
import ProductGrid from "./ProductGrid";
import { Reveal } from "./Motion";

const GrowScene = dynamic(() => import("./three/GrowScene"), { ssr: false, loading: () => <div style={{ position: "absolute", inset: 0, background: "#cfe3c4" }} /> });

export default function ProductDetail({ p, related }: { p: ProductData; related: ProductData[] }) {
  const t = useT();
  const lang = useLang();
  const add = useShop((s) => s.add);
  const [vi, setVi] = useState(Math.min(1, p.variants.length - 1));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const v = p.variants[vi];
  const clock = useRef<Clock>({ days: 4, target: v.ageDays, playing: false, speed: 0, max: 99999, loop: false }).current;
  const [when, setWhen] = useState<number>(0);
  const info = useRef<GrowthInfo>({ g: 0, height: 0, doy: 0 });
  const [read, setRead] = useState({ d: 0, h: 0 });
  useEffect(() => { clock.target = v.ageDays + when * 365; }, [v.ageDays, when, clock]);
  useEffect(() => { const id = setInterval(() => setRead({ d: clock.days, h: info.current.height }), 100); return () => clearInterval(id); }, [clock]);
  const hText = read.h < 1 ? `${Math.round(read.h * 100)} cm` : `${read.h.toFixed(1)} m`;

  return (
    <>
      <div className="wrap pdp">
        <div className="viewer">
          <GrowScene species={p.species} clock={clock} rain={false} dayCycle={false} onInfo={(i) => (info.current = i)} frame={2.4} />
          <div className="ctrl">
            <span className="read">{when === 0 ? "As delivered" : `${when} yr after planting`} · {hText}</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} role="group" aria-label={t("p.see", "See how big it will get")}>
              {[[0, t("p.today", "Delivered")], [1, t("p.y1", "+1 yr")], [3, t("p.y3", "+3 yrs")], [5, t("p.y5", "+5 yrs")]].map(([y, l]) => (
                <button key={y} className="chip" aria-pressed={when === y} onClick={() => setWhen(y as number)}>{l}</button>
              ))}
            </div>
          </div>
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
                <button key={x.sku} className="variant" role="radio" aria-checked={i === vi} aria-pressed={i === vi} onClick={() => { setVi(i); setWhen(0); }}>
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
          <p className="mute" style={{ fontSize: 13 }}>3D preview shows typical growth from a 1 July planting in central Gujarat; real plants vary with soil, water and care. Currently showing {ageLabel(read.d).toLowerCase()} from sowing.</p>
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
