"use client";
import { useEffect, useRef } from "react";

/** A few gulmohar petals drifting down over the hero. Paused when off screen or for reduced motion. */
export function Petals({ count = 22 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let W = 0, H = 0, raf = 0, on = true, last = performance.now();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => { W = c.clientWidth; H = c.clientHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const ro = new ResizeObserver(size); ro.observe(c);
    const cols = [["#e8331f", "#ff7a1a"], ["#d9261c", "#f45a1d"], ["#f0562a", "#ffb020"], ["#c81e1a", "#ef4a22"]];
    const n = window.innerWidth < 700 ? Math.round(count * 0.55) : count;
    const P = Array.from({ length: n }, (_, i) => ({
      x: Math.random(), y: Math.random() * 1.2 - 0.2, s: 7 + Math.random() * 10, r: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 1.6, vy: 0.018 + Math.random() * 0.03, sw: 0.4 + Math.random() * 1.2, ph: Math.random() * 6.28,
      flip: Math.random() * 6.28, vf: 1 + Math.random() * 2.5, col: cols[i % cols.length], a: 0.55 + Math.random() * 0.4,
    }));
    const petal = (s: number) => {
      ctx.beginPath(); ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.8, s * 0.8, s * 0.6, 0, s);
      ctx.bezierCurveTo(-s * 0.8, s * 0.6, -s * 0.9, -s * 0.8, 0, -s); ctx.closePath();
    };
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, W, H);
      for (const p of P) {
        p.y += p.vy * dt * 3; p.ph += dt * p.sw; p.r += p.vr * dt; p.flip += p.vf * dt;
        if (p.y > 1.1) { p.y = -0.1; p.x = Math.random(); }
        const x = p.x * W + Math.sin(p.ph) * 40, y = p.y * H;
        ctx.save(); ctx.translate(x, y); ctx.rotate(p.r); ctx.scale(Math.cos(p.flip), 1); ctx.globalAlpha = p.a;
        const g = ctx.createLinearGradient(0, -p.s, 0, p.s); g.addColorStop(0, p.col[0]); g.addColorStop(1, p.col[1]);
        ctx.fillStyle = g; petal(p.s); ctx.fill();
        ctx.globalAlpha = p.a * 0.35; ctx.strokeStyle = "#7a1208"; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(0, -p.s * 0.8); ctx.lineTo(0, p.s * 0.8); ctx.stroke();
        ctx.restore();
      }
      if (on) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) { last = performance.now(); raf = requestAnimationFrame(tick); } else cancelAnimationFrame(raf); });
    io.observe(c);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [count]);
  return <canvas ref={ref} className="petals" aria-hidden="true" />;
}
