"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SPECIES, SPECIES_LIST, ageLabel, doyOf, monthOf, seasonOf, stageOf, type SpeciesKey } from "./three/species";
import type { Clock } from "./three/GrowScene";
import type { GrowthInfo } from "./three/plantGen";
import { useT } from "@/lib/i18n";
import { products } from "@/lib/catalog";

const GrowScene = dynamic(() => import("./three/GrowScene"), { ssr: false });

const SPEEDS = [
  { label: "1 day/s", v: 1 },
  { label: "1 week/s", v: 7 },
  { label: "1 month/s", v: 30 },
  { label: "1 season/s", v: 90 },
];
const SEASON_COL: Record<string, string> = { Winter: "#8fb3d9", Summer: "#ffb020", Monsoon: "#3f8f3a", "Post-monsoon": "#c9a36a" };

export default function GrowLab({ initial = "gulmohar" as SpeciesKey }) {
  const t = useT();
  const [species, setSpecies] = useState<SpeciesKey>(initial);
  const clock = useRef<Clock>({ days: 0, playing: true, speed: 30, max: SPECIES[initial].matureDays + 365, loop: false }).current;
  const [ui, setUi] = useState({ days: 0, playing: true, speed: 30 });
  const info = useRef<GrowthInfo>({ g: 0, height: 0, doy: 181 });

  useEffect(() => { if (process.env.NODE_ENV !== "production") (window as unknown as { __fw?: unknown }).__fw = { clock, pick: (k: SpeciesKey) => pick(k) }; });
  useEffect(() => {
    const id = setInterval(() => setUi({ days: clock.days, playing: clock.playing, speed: clock.speed }), 80);
    return () => clearInterval(id);
  }, [clock]);

  const pick = (k: SpeciesKey) => {
    setSpecies(k);
    clock.days = 0; clock.max = SPECIES[k].matureDays + 365; clock.playing = true;
  };
  const sp = SPECIES[species];
  const doy = doyOf(ui.days);
  const season = seasonOf(doy);
  const pct = Math.min(100, (ui.days / clock.max) * 100);
  const product = useMemo(() => products.find((p) => p.species === species), [species]);
  const years = Math.ceil(clock.max / 365);

  return (
    <section className="lab" aria-label="Grow Lab">
      <GrowScene species={species} clock={clock} onInfo={(i) => (info.current = i)} />
      <div className="panel top">
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <span className="kicker" style={{ color: "var(--lime)" }}>{t("lab.title", "Grow Lab")}</span>
            <h1 className="h-m" style={{ marginTop: 6, textShadow: "0 2px 20px rgba(0,0,0,.4)" }}>{t("lab.sub", "Pick a plant. Fast-forward time.")}</h1>
          </div>
          <div className="species" role="group" aria-label="Choose a plant">
            {SPECIES_LIST.map((s) => (
              <button key={s.key} className="chip" aria-pressed={s.key === species} onClick={() => pick(s.key)}>{s.label}</button>
            ))}
          </div>
        </div>
        <div className="readout" aria-live="off">
          <b>{ageLabel(ui.days)}</b>
          <span>{monthOf(doy)} · {season}</span>
          <motion.span key={stageOf(sp, ui.days)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ color: "var(--lime)", fontWeight: 700 }}>
            {stageOf(sp, ui.days)}
          </motion.span>
        </div>
      </div>

      <div className="panel bottom">
        <div className="meters">
          <div><span>{t("lab.height", "Height")}</span><b>{fmtH(info.current.height, sp.container === "pot")}</b></div>
          <div><span>{t("lab.age", "Planted")}</span><b>1 July, monsoon</b></div>
          <div><span>{t("lab.season", "Now")}</span><b style={{ color: SEASON_COL[season] }}>{season}</b></div>
          <div><span>Mature in</span><b>about {Math.round(sp.matureDays / 365)} {sp.matureDays >= 730 ? "years" : "year"}</b></div>
        </div>
        <div className="controls">
          <button className="play" onClick={() => { if (clock.days >= clock.max) clock.days = 0; clock.playing = !clock.playing; }} aria-label={ui.playing ? "Pause" : "Play"}>
            {ui.playing ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg>}
          </button>
          <div className="scrub">
            <label htmlFor="scrub" className="sr" style={{ position: "absolute", left: -9999 }}>Timeline</label>
            <input id="scrub" type="range" min={0} max={clock.max} step={1} value={Math.round(ui.days)} style={{ ["--p" as string]: pct + "%" }}
              onChange={(e) => { clock.days = +e.target.value; clock.playing = false; setUi((u) => ({ ...u, days: clock.days, playing: false })); }} />
            <div className="ticks">{Array.from({ length: years + 1 }, (_, i) => <span key={i}>{i === 0 ? "Sow" : `${i} yr`}</span>)}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} role="group" aria-label={t("lab.speed", "Speed")}>
            {SPEEDS.map((s) => (
              <button key={s.v} className="chip" aria-pressed={ui.speed === s.v} onClick={() => { clock.speed = s.v; clock.playing = true; }}>{s.label}</button>
            ))}
          </div>
          {product && <Link className="btn lime small" href={`/shop/${product.slug}`}>Buy {product.name} →</Link>}
        </div>
        <p className="note" style={{ fontSize: 13, color: "var(--mute-n)" }}>{sp.note} Drag to orbit. At 1 day/s you will see day and night; the monsoon brings rain.</p>
      </div>
    </section>
  );
}

function fmtH(h: number, pot: boolean) {
  const v = pot ? Math.max(0, h - 0.26) : h;
  return v < 1 ? `${Math.round(v * 100)} cm` : `${v.toFixed(1)} m`;
}
