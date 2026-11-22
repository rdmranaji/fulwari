"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useLang, useT } from "@/lib/i18n";
import { Photo } from "./Photo";
import { Petals } from "./Petals";
import { Counter } from "./Motion";

const SLIDES = [
  { slot: "hero", cap: "Gulmohar in bloom", fb: "gulmohar" },
  { slot: "story-nursery", cap: "Nursery rows", fb: "areca" },
  { slot: "door-b2c", cap: "Bougainvillea", fb: "bougainvillea" },
];
const PLACES = ["India.", "Kutch.", "your campus.", "your garden."];

export function Hero() {
  const t = useT();
  const lang = useLang();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const radius = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const drift = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  // pointer depth
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 }), sy = useSpring(my, { stiffness: 60, damping: 20 });
  const px = useTransform(sx, (v) => v * -18), py = useTransform(sy, (v) => v * -12);
  const cx = useTransform(sx, (v) => v * 8), cy = useTransform(sy, (v) => v * 6);
  const [slide, setSlide] = useState(0);
  const [place, setPlace] = useState(0);
  useEffect(() => {
    const a = setInterval(() => setSlide((x) => (x + 1) % SLIDES.length), 7000);
    let b: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => { b = setInterval(() => setPlace((x) => (x + 1) % PLACES.length), 2600); }, 3200);
    return () => { clearInterval(a); clearTimeout(start); if (b) clearInterval(b); };
  }, []);
  const words = ["Grown", "in", "Anand.", "Planted", "across"];
  const rise = { hidden: { y: "110%", filter: "blur(8px)" }, show: { y: "0%", filter: "blur(0px)", transition: { duration: 1, ease: [0.2, 0.8, 0.2, 1] } } };
  return (
    <section ref={ref} className="hero-ph" onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); }}>
      <motion.div className="hero-frame" style={{ scale, borderRadius: radius }}>
        <div className="hero-reveal">
          <motion.div className="hero-media" style={{ x: px, y: py, top: drift }}>
            <AnimatePresence initial={false}>
              <motion.div key={slide} className="hero-slide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.8, ease: "easeInOut" }}>
                <Photo slot={SLIDES[slide].slot} priority={slide === 0} sizes="100vw" fallback={SLIDES[slide].fb} className={slide % 2 ? "kb-b" : "kb-a"} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
        <div className="hero-shade" />
        <Petals />
        <motion.div className="wrap hero-copy" style={{ opacity: fade, x: cx, y: cy }}>
          <motion.span className="kicker" initial={{ opacity: 0, letterSpacing: "0.3em" }} animate={{ opacity: 1, letterSpacing: "0em" }} transition={{ duration: 1.4, delay: 0.9 }}>
            {t("hero.kicker", "Fulwari nursery, Anand · since 2014")}
          </motion.span>
          {lang === "hi" ? (
            <motion.h1 className="h-xl" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1 }}>आनंद में उगाए, पूरे भारत में लगाए।</motion.h1>
          ) : (
            <motion.h1 className="h-xl hero-h" initial="hidden" animate="show" transition={{ staggerChildren: 0.09, delayChildren: 1.05 }} aria-label={`Grown in Anand. Planted across ${PLACES[place]}`}>
              {words.map((w, i) => <span key={i} className="mask" aria-hidden="true"><motion.span variants={rise} style={{ display: "inline-block" }}>{w}</motion.span></span>)}
              <span className="mask rot" aria-hidden="true"><motion.span variants={rise} style={{ display: "inline-block" }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={place} initial={{ y: "100%", opacity: 0 }} animate={{ y: "0%", opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={{ duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }} style={{ display: "inline-block" }}>
                    {PLACES[place]}
                  </motion.span>
                </AnimatePresence>
              </motion.span></span>
            </motion.h1>
          )}
          <motion.p className="lede" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.7 }}>
            {t("hero.sub2", "Shade trees, palms, fruit trees and flowering shrubs, raised by a team of 100 at our nursery on NH48. Delivered to homes across Gujarat and to project sites across India.")}
          </motion.p>
          <motion.div className="ctas" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.95 }}>
            <Link href="/shop" className="btn">{t("cta.shop", "Shop plants")}</Link>
            <Link href="/bulk" className="btn ghost">{t("cta.quote", "Get a bulk quote")}</Link>
          </motion.div>
        </motion.div>
        <motion.div className="hero-strip wrap" aria-label="At a glance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }}>
          <span><b><Counter to={2014} plain /></b> growing since</span><span><b><Counter to={100} /></b> people on the team</span><span><b>2</b> nurseries in Gujarat</span><span>Trusted by <b>Adani</b></span>
          <span className="slide-cap" aria-live="off">
            {SLIDES.map((s, i) => <button key={s.slot} className={i === slide ? "on" : ""} onClick={() => setSlide(i)} aria-label={`Show ${s.cap}`}><i /></button>)}
            <AnimatePresence mode="wait"><motion.em key={slide} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{SLIDES[slide].cap}</motion.em></AnimatePresence>
          </span>
        </motion.div>
      </motion.div>
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
