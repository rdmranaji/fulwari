"use client";
import { useEffect } from "react";
import Lenis from "lenis";

/** Inertial smooth scrolling for the whole site (off for reduced-motion users). */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.09, anchors: { offset: -80 }, prevent: (n) => !!n.closest?.("[data-lenis-prevent], .drawer, .nav.open, canvas") });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    return () => lenis.destroy();
  }, []);
  return null;
}
