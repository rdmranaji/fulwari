"use client";
import { useState } from "react";
import { photo as getPhoto, type Photo as P } from "@/lib/photos";
import { Glyph } from "./Glyph";

/** A real photograph that fades and settles in once loaded; falls back to a soft illustrated tile. */
export function Photo({ slot, i = 0, p, className = "", sizes = "100vw", priority = false, fallback = "neem", style }: {
  slot?: string; i?: number; p?: P; className?: string; sizes?: string; priority?: boolean; fallback?: string; style?: React.CSSProperties;
}) {
  const ph = p ?? (slot ? getPhoto(slot, i) : undefined);
  const [loaded, setLoaded] = useState(false);
  return (
    <figure className={`ph ${className}`} style={style}>
      {ph ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ph.src} srcSet={`${ph.srcSm} 800w, ${ph.src} 1600w`} sizes={sizes} alt={ph.alt} width={ph.w} height={ph.h}
          loading={priority ? "eager" : "lazy"} decoding="async" className={loaded ? "in" : ""} onLoad={() => setLoaded(true)}
          ref={(el) => { if (el?.complete && el.naturalWidth) setLoaded(true); }} />
      ) : (
        <div className="ph-fallback"><Glyph species={fallback} size={140} /></div>
      )}
    </figure>
  );
}
