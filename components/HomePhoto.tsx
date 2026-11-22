"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useT } from "@/lib/i18n";
import { Photo } from "./Photo";

export function Hero() {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  return (
    <section ref={ref} className="hero-ph">
      <motion.div className="hero-media" style={{ y }}>
        <Photo slot="hero" priority sizes="100vw" fallback="gulmohar" className="kenburns" />
      </motion.div>
      <div className="hero-shade" />
      <motion.div className="wrap hero-copy" style={{ opacity: fade }}>
        <motion.span className="kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          {t("hero.kicker", "Fulwari nursery, Anand · since 2014")}
        </motion.span>
        <motion.h1 className="h-xl" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}>
          {t("hero.title2", "Grown in Anand. Planted across India.")}
        </motion.h1>
        <motion.p className="lede" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6 }}>
          {t("hero.sub2", "Shade trees, palms, fruit trees and flowering shrubs, raised by a team of 100 at our nursery on NH48. Delivered to homes across Gujarat and to project sites across India.")}
        </motion.p>
        <motion.div className="ctas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.85 }}>
          <Link href="/shop" className="btn">{t("cta.shop", "Shop plants")}</Link>
          <Link href="/bulk" className="btn ghost">{t("cta.quote", "Get a bulk quote")}</Link>
        </motion.div>
      </motion.div>
      <div className="hero-strip wrap" aria-label="At a glance">
        <span><b>2014</b> growing since</span><span><b>100</b> people on the team</span><span><b>2</b> nurseries in Gujarat</span><span>Trusted by <b>Adani</b></span>
      </div>
    </section>
  );
}

const STEPS = [
  { slot: "story-seed", k: "story.1", t: "Day 0 · Seed", c: "Sown at the start of the monsoon in our Anand nursery.", fb: "neem" },
  { slot: "story-sprout", k: "story.2", t: "Day 21 · Sprout", c: "The first leaves. Every seedling gets its own bag and its own space.", fb: "neem" },
  { slot: "story-nursery", k: "story.3", t: "Day 120 · In the nursery", c: "Hardened in full sun, so it survives the move to your site.", fb: "areca" },
  { slot: "story-planting", k: "story.4", t: "Day 240 · Planted", c: "Checked, loaded and planted at your site, with after-care guidance.", fb: "neem" },
  { slot: "story-bloom", k: "story.6", t: "Year 4 · In flower", c: "Now it shades your building, and turns scarlet every summer.", fb: "gulmohar" },
];

function Slide({ p, i, n, s }: { p: MotionValue<number>; i: number; n: number; s: (typeof STEPS)[number] }) {
  const a = i / n, b = (i + 1) / n, e = 0.06;
  const op = useTransform(p, [a - e, a + e, b - e, b + e], i === 0 ? [1, 1, 1, 0] : i === n - 1 ? [0, 1, 1, 1] : [0, 1, 1, 0]);
  const scale = useTransform(p, [a - e, b + e], [1.08, 1]);
  return (
    <motion.div className="slide" style={{ opacity: op }}>
      <motion.div style={{ scale, position: "absolute", inset: 0 }}><Photo slot={s.slot} sizes="100vw" fallback={s.fb} /></motion.div>
    </motion.div>
  );
}
function Caption({ p, i, n, s, t }: { p: MotionValue<number>; i: number; n: number; s: (typeof STEPS)[number]; t: ReturnType<typeof useT> }) {
  const a = i / n, b = (i + 1) / n, e = 0.05;
  const op = useTransform(p, [a - e, a + e, b - e, b + e], i === 0 ? [1, 1, 1, 0] : i === n - 1 ? [0, 1, 1, 1] : [0, 1, 1, 0]);
  const y = useTransform(p, [a - e, a + e, b - e, b + e], [30, 0, 0, -30]);
  return (
    <motion.div className="cap" style={{ opacity: op, y }}>
      <div className="chap-t">{t(s.k + "t", s.t)}</div>
      <p className="chap">{t(s.k, s.c)}</p>
    </motion.div>
  );
}
function Dot({ p, i, n }: { p: MotionValue<number>; i: number; n: number }) {
  const w = useTransform(p, [i / n, (i + 1) / n], ["0%", "100%"]);
  return <span><motion.i style={{ width: w }} /></span>;
}

export function SeedToShade() {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = STEPS.length;
  return (
    <section ref={ref} className="s2s" aria-label="From seed to shade">
      <div className="stage">
        {STEPS.map((s, i) => <Slide key={s.slot} p={scrollYProgress} i={i} n={n} s={s} />)}
        <div className="s2s-shade" />
        <div className="wrap s2s-head"><span className="kicker">From seed to shade</span></div>
        <div className="wrap s2s-copy">{STEPS.map((s, i) => <Caption key={s.slot} p={scrollYProgress} i={i} n={n} s={s} t={t} />)}</div>
        <div className="wrap s2s-dots" aria-hidden="true">{STEPS.map((s, i) => <Dot key={s.slot} p={scrollYProgress} i={i} n={n} />)}</div>
      </div>
    </section>
  );
}
