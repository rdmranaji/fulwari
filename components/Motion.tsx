"use client";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({ children, delay = 0, y = 28, className, as = "div" }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "section" | "li" }) {
  const M = motion[as];
  return (
    <M className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.75, delay, ease: [0.2, 0.8, 0.2, 1] }}>
      {children}
    </M>
  );
}

export function Counter({ to, suffix = "", plain = false }: { to: number; suffix?: string; plain?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const v = useMotionValue(plain ? to : 0);
  const txt = useTransform(v, (x) => (plain ? String(Math.round(x)) : Math.round(x).toLocaleString("en-IN")) + suffix);
  useEffect(() => { if (inView && !plain) { const c = animate(v, to, { duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }); return () => c.stop(); } }, [inView, to, v]);
  return <motion.span ref={ref}>{txt}</motion.span>;
}

/** Words rise one by one */
export function SplitTitle({ text, className, as = "h2" }: { text: string; className?: string; as?: "h1" | "h2" }) {
  const H = motion[as];
  return (
    <H className={className} initial="h" whileInView="s" viewport={{ once: true, margin: "-60px" }} transition={{ staggerChildren: 0.06 }} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden="true" style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.08em" }}>
          <motion.span style={{ display: "inline-block" }} variants={{ h: { y: "105%" }, s: { y: 0 } }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}>{w}&nbsp;</motion.span>
        </span>
      ))}
    </H>
  );
}
