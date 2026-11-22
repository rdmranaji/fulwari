"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cartSubtotal, useShop } from "@/lib/store";
import { FREE_DELIVERY_FROM, GUJARAT_CITIES, PLANTING_PER_PLANT, inr, quote, type Fulfilment } from "@/lib/pricing";
import { FormError, loadRazorpay, placeOrder, validatePhone } from "@/lib/submit";
import { IS_STATIC } from "@/lib/site";
import { useT, useLang } from "@/lib/i18n";
import { Glyph } from "./Glyph";

type RZ = new (o: Record<string, unknown>) => { open: () => void };

export default function Checkout() {
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const { lines } = useShop();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [f, setF] = useState({ name: "", phone: "", email: "", fulfilment: "delivery" as Fulfilment, address: "", city: "Anand", pincode: "", planting: false, payment: "cod" as "cod" | "online", notes: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [placed, setPlaced] = useState(false);
  const sub = cartSubtotal(lines);
  const plants = lines.reduce((a, l) => a + l.qty, 0);
  const q = useMemo(() => quote(sub, plants, f.fulfilment, f.planting), [sub, plants, f.fulfilment, f.planting]);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  const check = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = "Enter your name";
    if (!validatePhone(f.phone)) e.phone = "Enter a 10-digit Indian mobile number";
    if (f.fulfilment === "delivery") {
      if (f.address.trim().length < 8) e.address = "Enter the full delivery address";
      if (!/^3[6-9]\d{4}$/.test(f.pincode.trim())) e.pincode = "We deliver within Gujarat (pincodes 36xxxx to 39xxxx)";
    }
    setErrs(e);
    if (Object.keys(e).length) { document.getElementById(`co-${Object.keys(e)[0]}`)?.focus(); return false; }
    return true;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!check()) return;
    setBusy(true); setMsg("");
    try {
      const r = await placeOrder({ ...f, items: lines.map((l) => ({ sku: l.sku, qty: l.qty })) });
      try { sessionStorage.setItem("fw-last-order", JSON.stringify({ ...r, lines, fulfilment: f.fulfilment, payment: f.payment })); } catch {}
      if (r.razorpay && (await loadRazorpay())) {
        const Razorpay = (window as unknown as { Razorpay: RZ }).Razorpay;
        new Razorpay({
          key: r.razorpay.keyId, order_id: r.razorpay.orderId, amount: r.razorpay.amount, currency: "INR", name: "Fulwari", description: `Order ${r.number}`,
          prefill: { name: f.name, contact: f.phone, email: f.email }, theme: { color: "#0f4d2c" },
          handler: async (resp: Record<string, string>) => {
            await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resp) });
            setPlaced(true); router.push(`/checkout/success/?no=${encodeURIComponent(r.number)}&paid=1`);
          },
        }).open();
        setBusy(false);
        return;
      }
      setPlaced(true);
      router.push(`/checkout/success/?no=${encodeURIComponent(r.number)}`);
    } catch (e) {
      if (e instanceof FormError) { setErrs(e.fields); setMsg(e.message); } else setMsg("Could not place the order. Please WhatsApp us on +91 99133 69100.");
      setBusy(false);
    }
  };

  if (!mounted || placed) return <div style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>{placed && <p className="lede">Confirming your order…</p>}</div>;
  if (!lines.length) return (
    <div className="wrap" style={{ padding: "160px 18px 120px", textAlign: "center", display: "grid", gap: 18, justifyItems: "center" }}>
      <Glyph species="hibiscus" size={120} /><h1 className="h-l">{t("cart.empty", "Your cart is empty.")}</h1><Link className="btn green" href="/shop">{t("cta.shop", "Shop plants")}</Link>
    </div>
  );

  const field = (k: "name" | "phone" | "email" | "address" | "pincode", label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="field">
      <span>{label}</span>
      <input id={`co-${k}`} value={f[k]} onChange={set(k)} aria-invalid={!!errs[k]} aria-describedby={errs[k] ? `e-${k}` : undefined} {...props} />
      {errs[k] && <span className="err" id={`e-${k}`}>{errs[k]}</span>}
    </label>
  );

  return (
    <div className="wrap" style={{ paddingTop: 120, paddingBottom: 100 }}>
      <h1 className="h-l" style={{ marginBottom: 28 }}>{t("co.title", "Checkout")}</h1>
      <form onSubmit={submit} noValidate style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)", gap: 28, alignItems: "start" }} className="co-grid">
        <div style={{ display: "grid", gap: 22 }}>
          <div className="panel-card form">
            <h2 className="h-m" style={{ fontSize: 24 }}>{t("co.contact", "Your details")}</h2>
            <div className="cols-2">{field("name", t("co.name", "Full name"), { autoComplete: "name" })}{field("phone", t("co.phone", "Mobile"), { autoComplete: "tel", inputMode: "tel", placeholder: "98765 43210" })}</div>
            {field("email", t("co.email", "Email (optional)"), { autoComplete: "email", type: "email" })}
          </div>
          <div className="panel-card form">
            <h2 className="h-m" style={{ fontSize: 24 }}>{t("co.where", "Delivery or pickup")}</h2>
            <div className="radio-cards">
              {([["delivery", t("co.delivery", "Deliver in Gujarat"), `Free over ${inr(FREE_DELIVERY_FROM)}, otherwise ₹299`], ["pickup-anand", t("co.pickA", "Collect from Anand nursery"), "NH48, Mogar · free"], ["pickup-gandhidham", t("co.pickG", "Collect from Gandhidham"), "Kutch · free"]] as const).map(([v, l, s]) => (
                <label key={v} className="radio-card"><input type="radio" name="ful" checked={f.fulfilment === v} onChange={() => setF((x) => ({ ...x, fulfilment: v }))} /><span><b>{l}</b><br /><span className="mute" style={{ fontSize: 14 }}>{s}</span></span></label>
              ))}
            </div>
            {f.fulfilment === "delivery" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="form" style={{ overflow: "hidden" }}>
                {field("address", t("co.address", "Address"), { autoComplete: "street-address", placeholder: "House, street, area" })}
                <div className="cols-2">
                  <label className="field"><span>{t("co.city", "City")}</span><select value={f.city} onChange={set("city")}>{GUJARAT_CITIES.map((c) => <option key={c}>{c}</option>)}</select></label>
                  {field("pincode", t("co.pin", "Pincode"), { autoComplete: "postal-code", inputMode: "numeric", maxLength: 6 })}
                </div>
                <label className="radio-card"><input type="checkbox" checked={f.planting} onChange={(e) => setF((x) => ({ ...x, planting: e.target.checked }))} /><span><b>{t("co.planting", "Have our team plant them")}</b><br /><span className="mute" style={{ fontSize: 14 }}>{inr(PLANTING_PER_PLANT)} per plant, including pit and first watering</span></span></label>
              </motion.div>
            )}
          </div>
          <div className="panel-card form">
            <h2 className="h-m" style={{ fontSize: 24 }}>{t("co.pay", "Payment")}</h2>
            <div className="radio-cards">
              <label className="radio-card"><input type="radio" name="pay" checked={f.payment === "cod"} onChange={() => setF((x) => ({ ...x, payment: "cod" }))} /><span><b>{t("co.cod", "Pay on delivery or by UPI")}</b><br /><span className="mute" style={{ fontSize: 14 }}>We confirm stock on WhatsApp first</span></span></label>
              <label className="radio-card"><input type="radio" name="pay" checked={f.payment === "online"} onChange={() => setF((x) => ({ ...x, payment: "online" }))} /><span><b>{t("co.online", "Pay online now (UPI, cards, netbanking)")}</b><br /><span className="mute" style={{ fontSize: 14 }}>Secure checkout by Razorpay{IS_STATIC ? " (enabled on the live site)" : ""}</span></span></label>
            </div>
          </div>
        </div>

        <aside className="panel-card" style={{ position: "sticky", top: 96, display: "grid", gap: 14 }}>
          <h2 className="h-m" style={{ fontSize: 24 }}>Order summary</h2>
          {lines.map((l) => (
            <div key={l.sku} style={{ display: "grid", gridTemplateColumns: "48px minmax(0,1fr) auto", gap: 12, alignItems: "center" }}>
              <div className="thumb" style={{ width: 48, height: 48, borderRadius: 12, background: "#e3f1d2", display: "grid", placeItems: "center" }}><Glyph species={l.species} size={40} /></div>
              <span><b>{lang === "hi" ? l.nameHi : l.name}</b><br /><span className="mute" style={{ fontSize: 13 }}>{l.qty} × {l.label}</span></span>
              <span className="nb">{inr(l.qty * l.priceInr)}</span>
            </div>
          ))}
          <hr style={{ border: 0, borderTop: "1px solid var(--line)", width: "100%" }} />
          <Row l={t("cart.subtotal", "Subtotal")} v={inr(q.subtotal)} />
          {f.fulfilment === "delivery" && <Row l={t("co.deliveryFee", "Delivery")} v={q.delivery ? inr(q.delivery) : "Free"} />}
          {q.planting > 0 && <Row l={`${t("co.plantingFee", "Planting")} (${plants})`} v={inr(q.planting)} />}
          <div className="sum"><span>{t("co.total", "Total")}</span><span className="nb">{inr(q.total)}</span></div>
          {f.fulfilment === "delivery" && q.subtotal < FREE_DELIVERY_FROM && <p className="mute" style={{ fontSize: 14 }}>Add {inr(FREE_DELIVERY_FROM - q.subtotal)} more for free delivery.</p>}
          {msg && <p className="err" role="alert">{msg}</p>}
          <button className="btn" type="submit" disabled={busy}>{busy ? "Placing order…" : `${t("co.place", "Place order")} · ${inr(q.total)}`}</button>
          <p className="mute" style={{ fontSize: 13 }}>Sample prices for this preview. Final availability is confirmed by Fulwari before dispatch.</p>
        </aside>
      </form>
      <style>{`@media(max-width:900px){.co-grid{grid-template-columns:minmax(0,1fr)!important}.co-grid aside{position:static!important}}`}</style>
    </div>
  );
}
const Row = ({ l, v }: { l: string; v: string }) => <div style={{ display: "flex", justifyContent: "space-between" }}><span className="mute">{l}</span><span className="nb">{v}</span></div>;
