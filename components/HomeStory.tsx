"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { Clock } from "./three/GrowScene";
import type { GrowthInfo } from "./three/plantGen";
import { ageLabel, doyOf, monthOf, seasonOf } from "./three/species";
import { useT } from "@/lib/i18n";

const GrowScene = dynamic(() => import("./three/GrowScene"), { ssr: false, loading: () => <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 60% at 60% 70%, #1d4a2c, #07140d)" }} /> });

// scroll progress → days since sowing; holds give time to read each chapter
const P = [0, 0.12, 0.18, 0.28, 0.36, 0.46, 0.52, 0.62, 0.72, 0.8, 0.88, 1];
const D = [0, 0, 21, 21, 120, 120, 240, 240, 730, 730, 1418, 1418];
const daysAt = (p: number) => {
  for (let i = 1; i < P.length; i++) if (p <= P[i]) { const t = (p - P[i - 1]) / (P[i] - P[i - 1]); return D[i - 1] + (D[i] - D[i - 1]) * t; }
  return D[D.length - 1];
};

const CHAPTERS = [
  { k: "story.1", t: "Day 0 · Seed", c: "Sown at the start of the monsoon in our Anand nursery.", r: [0.04, 0.07, 0.11, 0.14] },
  { k: "story.2", t: "Day 21 · Sprout", c: "The first two leaves. Every seedling gets its own bag and its own space.", r: [0.16, 0.19, 0.27, 0.3] },
  { k: "story.3", t: "Day 120 · In the nursery", c: "Hardened in full sun, so it survives the move to your site.", r: [0.33, 0.36, 0.45, 0.48] },
  { k: "story.4", t: "Day 240 · Dispatched", c: "Checked, loaded and planted at your site.", r: [0.49, 0.52, 0.61, 0.64] },
  { k: "story.5", t: "Year 2 · Settled in", c: "Monsoon, winter, summer. It widens its branches every season.", r: [0.67, 0.71, 0.79, 0.82] },
  { k: "story.6", t: "Year 4 · Gulmohar in flower", c: "Now it shades your building, and turns scarlet every summer.", r: [0.85, 0.88, 1.01, 1.02] },
];

function Chapter({ p, ch, t }: { p: MotionValue<number>; ch: (typeof CHAPTERS)[number]; t: ReturnType<typeof useT> }) {
  const op = useTransform(p, ch.r, [0, 1, 1, 0]);
  const y = useTransform(p, ch.r, [40, 0, 0, -40]);
  return (
    <motion.div style={{ opacity: op, y }}>
      <div className="chap-t">{t(ch.k + "t", ch.t)}</div>
      <p className="chap">{t(ch.k, ch.c)}</p>
    </motion.div>
  );
}

export default function HomeStory() {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const clock = useRef<Clock>({ days: 0, target: 0, playing: false, speed: 0, max: 1500, loop: false }).current;
  const info = useRef<GrowthInfo>({ g: 0, height: 0, doy: 181 });
  const [hud, setHud] = useState({ days: 0, h: 0 });
  useMotionValueEvent(scrollYProgress, "change", (v) => { clock.target = daysAt(v); });
  useEffect(() => {
    const id = setInterval(() => setHud({ days: clock.days, h: info.current.height }), 90);
    return () => clearInterval(id);
  }, [clock]);
  const heroOp = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.05], [0, -60]);
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const doy = doyOf(hud.days);

  return (
    <section ref={ref} className="story" aria-label="From seed to tree">
      <div className="stage">
        <GrowScene species="gulmohar" clock={clock} interactive={false} autoRotate rain dayCycle={false} onInfo={(i) => (info.current = i)} />
        <div className="shade" />
        <div className="hud" aria-hidden="true">
          <b>{ageLabel(hud.days)}</b>
          <span>{monthOf(doy)} · {seasonOf(doy)} · {hud.h < 1 ? `${Math.round(hud.h * 100)} cm` : `${hud.h.toFixed(1)} m`}</span>
        </div>
        <div className="copy">
          <motion.div className="hero-copy" style={{ opacity: heroOp, y: heroY }}>
            <span className="kicker">{t("hero.kicker", "Fulwari nursery, Anand · since 2014")}</span>
            <h1 className="h-xl" style={{ margin: "14px 0 18px" }}>{t("hero.title", "Every plant starts as a seed.")}</h1>
            <p className="lede" style={{ color: "#d6e7cf" }}>{t("hero.sub", "Scroll to watch five years at our nursery pass in seconds. Then take one home.")}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
              <Link href="/shop" className="btn">{t("cta.shop", "Shop plants")}</Link>
              <Link href="/bulk" className="btn ghost" style={{ color: "#fff" }}>{t("cta.quote", "Get a bulk quote")}</Link>
            </div>
          </motion.div>
          {CHAPTERS.map((c) => <Chapter key={c.k} p={scrollYProgress} ch={c} t={t} />)}
        </div>
        <motion.div className="scroll-hint" style={{ opacity: heroOp }} aria-hidden="true">
          <span>Scroll to grow</span>
          <motion.svg width="18" height="28" viewBox="0 0 18 28" animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}><rect x="1" y="1" width="16" height="26" rx="8" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="9" cy="9" r="2.5" fill="currentColor" /></motion.svg>
        </motion.div>
        <div className="progress"><motion.i style={{ scaleX: bar }} /></div>
      </div>
    </section>
  );
}
