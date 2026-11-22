"use client";
// Grow Lab: a real-photo time-lapse. Each plant plays through photographs of its actual growth stages
// (seed → sprout → seedling → nursery sapling → full grown → flowering / fruiting) on a timeline you can scrub.
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LAB from "@/lib/lab-stages.json";
import { photo, photos } from "@/lib/photos";
import { doyOf, monthOf, seasonOf } from "./three/species";
import { Photo } from "./Photo";
import { useT } from "@/lib/i18n";

type Stage = { key: string; day: number; label: string; text: string };
type Plant = { product: string; name: string; botanical: string; mature: string; stages: Stage[] };
const PLANTS = LAB as unknown as Record<string, Plant>;
const KEYS = Object.keys(PLANTS);
const SPEEDS = [{ l: "Slow", v: 20 }, { l: "Normal", v: 60 }, { l: "Fast", v: 180 }];

const ageLabel = (d: number) => {
  d = Math.floor(d);
  if (d < 60) return `Day ${d}`;
  const y = Math.floor(d / 365), m = Math.floor((d % 365) / 30.4);
  return y ? (m ? `${y} yr ${m} mo` : `${y} yr${y > 1 ? "s" : ""}`) : `${m} months`;
};

export default function GrowLab() {
  const t = useT();
  const [sp, setSp] = useState("gulmohar");
  const plant = PLANTS[sp];
  // stages that have a real photo, in time order
  const stages = useMemo(() => [...plant.stages].sort((a, b) => a.day - b.day).filter((s) => photo(`lab:${sp}:${s.key}`)), [sp, plant]);
  const shown = stages.length ? stages : [...plant.stages].sort((a, b) => a.day - b.day);
  // stages sit evenly along the track; days interpolate between them
  const n = shown.length;
  const dayAt = (u: number) => {
    if (n < 2) return shown[0]?.day ?? 0;
    const x = Math.max(0, Math.min(1, u)) * (n - 1), i = Math.min(n - 2, Math.floor(x));
    return shown[i].day + (shown[i + 1].day - shown[i].day) * (x - i);
  };
  const [u, setU] = useState(0);
  const days = dayAt(u);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(60);
  const raf = useRef(0);
  const holdUntil = useRef(0);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("plant");
    if (q && PLANTS[q]) setSp(q);
  }, []);
  useEffect(() => { setU(0); setPlaying(true); holdUntil.current = performance.now() + 1200; }, [sp]);

  // time runs on a square-root clock so the quick early stages get screen time; it pauses on each stage
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (now >= holdUntil.current) {
        setU((x) => {
          const step = n > 1 ? 1 / (n - 1) : 1;
          const nx = Math.min(1, x + dt * (speed / 60) * step / 2.2);
          if (Math.floor(nx / step + 1e-6) > Math.floor(x / step + 1e-6)) holdUntil.current = now + 1700;
          if (nx >= 1) setPlaying(false);
          return nx;
        });
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, speed, n]);

  const idx = n > 1 ? Math.min(n - 1, Math.floor(u * (n - 1) + 1e-6)) : 0;
  const cur = shown[idx];
  const pos = (i: number) => (n > 1 ? (i / (n - 1)) * 100 : 0);
  const doy = doyOf(days);
  const tl = photos("timelapse")[0];

  return (
    <>
      <section className="journey">
        <div className="j-stage">
          <AnimatePresence initial={false}>
            <motion.div key={sp + cur.key} className="j-photo" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}>
              <Photo slot={`lab:${sp}:${cur.key}`} sizes="100vw" priority fallback="neem" className="kb-a" />
            </motion.div>
          </AnimatePresence>
          <div className="j-shade" />
          <div className="wrap j-top">
            <div>
              <span className="kicker">{t("lab.title", "Grow Lab")} · real photos of every stage</span>
              <h1 className="h-l" style={{ marginTop: 8 }}>{plant.name}, from {shown[0].label.toLowerCase()} to {shown[shown.length - 1].label.toLowerCase()}</h1>
              <p className="mute-l" style={{ fontStyle: "italic" }}>{plant.botanical} · grows to {plant.mature}</p>
            </div>
            <div className="j-read">
              <b>{ageLabel(days)}</b>
              <span>{monthOf(doy)} · {seasonOf(doy)}</span>
            </div>
          </div>
          <div className="wrap j-cap">
            <AnimatePresence mode="wait">
              <motion.div key={sp + cur.key} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }}>
                <div className="chap-t">Stage {idx + 1} of {shown.length} · {cur.label}{photo(`lab:${sp}:${cur.key}`)?.generic ? " · typical example" : ""}</div>
                <p className="j-text">{cur.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="j-bar">
          <div className="wrap">
            <div className="j-species" role="group" aria-label="Choose a plant">
              {KEYS.map((k) => <button key={k} className="chip" aria-pressed={k === sp} onClick={() => setSp(k)}>{PLANTS[k].name}</button>)}
            </div>
            <div className="j-controls">
              <button className="play" onClick={() => { if (u >= 1) setU(0); setPlaying((p) => !p); }} aria-label={playing ? "Pause" : "Play"}>
                {playing ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg>}
              </button>
              <div className="j-track">
                <div className="j-line"><i style={{ width: u * 100 + "%" }} /></div>
                {shown.map((s, i) => (
                  <button key={s.key} className={`j-mark ${i <= idx ? "on" : ""}`} style={{ left: pos(i) + "%" }} onClick={() => { setU(pos(i) / 100); setPlaying(false); }} aria-label={`${s.label}, ${ageLabel(s.day)}`}>
                    <span className="j-thumb"><Photo slot={`lab:${sp}:${s.key}`} sizes="80px" fallback="neem" /></span>
                    <em>{s.label}</em>
                  </button>
                ))}
                <input type="range" min={0} max={1000} value={Math.round(u * 1000)} aria-label="Timeline"
                  onChange={(e) => { setU(+e.target.value / 1000); setPlaying(false); }} />
              </div>
              <div className="j-speeds" role="group" aria-label="Speed">
                {SPEEDS.map((s) => <button key={s.v} className="chip" aria-pressed={speed === s.v} onClick={() => { setSpeed(s.v); setPlaying(true); }}>{s.l}</button>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap j-after">
          <div>
            <h2 className="h-m">All {shown.length} stages of {plant.name.toLowerCase()}</h2>
            <ol className="j-grid">
              {shown.map((s, i) => (
                <li key={s.key}>
                  <button onClick={() => { setU(pos(i) / 100); setPlaying(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    <Photo slot={`lab:${sp}:${s.key}`} sizes="(max-width:700px) 50vw, 220px" fallback="neem" className="j-gph" />
                    <span><b>{i + 1}. {s.label}</b><small>{ageLabel(s.day)}</small></span>
                  </button>
                </li>
              ))}
            </ol>
            <Link className="btn green" href={`/shop/${plant.product}`} style={{ marginTop: 24 }}>Buy {plant.name} from Fulwari →</Link>
          </div>
          {tl && (
            <figure className="j-video">
              <video src={tl.src} autoPlay muted loop playsInline preload="metadata" aria-label={tl.alt} />
              <figcaption>Real time-lapse: a seed germinating. Video by {tl.credit}, {tl.license}.</figcaption>
            </figure>
          )}
        </div>
        <p className="wrap mute" style={{ fontSize: 13, marginTop: 28 }}>Stage photos are freely licensed photographs from Wikimedia Commons, shown to illustrate each species&apos; growth; timings are typical for central Gujarat. See <Link href="/credits">photo credits</Link>.</p>
      </section>
    </>
  );
}
