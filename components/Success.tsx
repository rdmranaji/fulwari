"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { inr } from "@/lib/pricing";
import { IS_STATIC } from "@/lib/site";
import { useShop } from "@/lib/store";
import { Glyph } from "./Glyph";

type Last = { number: string; total: number; whatsapp: string; lines: { name: string; label: string; qty: number; species: string }[] };

export default function Success() {
  const [o, setO] = useState<Last | null>(null);
  const [paid, setPaid] = useState(false);
  const clear = useShop((s) => s.clear);
  useEffect(() => {
    try { const last = JSON.parse(sessionStorage.getItem("fw-last-order") || "null"); setO(last); if (last) clear(); } catch {}
    setPaid(new URLSearchParams(location.search).get("paid") === "1");
  }, [clear]);
  return (
    <div className="wrap" style={{ paddingTop: 140, paddingBottom: 120, maxWidth: 760 }}>
      <motion.div initial={{ scale: 0.6, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", damping: 12 }}><Glyph species="gulmohar" size={120} /></motion.div>
      <h1 className="h-l" style={{ marginTop: 18 }}>{paid ? "Paid. Your plants are booked." : "Order received."}</h1>
      {o && <p className="lede" style={{ marginTop: 12 }}>Order <b>{o.number}</b> · {inr(o.total)}</p>}
      <p className="mute" style={{ marginTop: 12 }}>{IS_STATIC ? "This preview doesn't store orders. Send the order to Fulwari on WhatsApp to confirm it." : "We will confirm stock and a delivery date on WhatsApp within a few working hours."}</p>
      {o && (
        <div className="panel-card" style={{ marginTop: 24, display: "grid", gap: 10 }}>
          {o.lines.map((l, i) => <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}><Glyph species={l.species} size={36} /><span>{l.qty} × {l.name} <span className="mute">({l.label})</span></span></div>)}
        </div>
      )}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
        {o && <a className="btn green" href={o.whatsapp} target="_blank" rel="noopener">{IS_STATIC ? "Send order on WhatsApp" : "Message us about this order"}</a>}
        <Link className="btn ghost" href="/grow-lab">Watch your plants grow →</Link>
      </div>
    </div>
  );
}
