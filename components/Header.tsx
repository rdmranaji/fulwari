"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { cartCount, cartSubtotal, useShop } from "@/lib/store";
import { inr } from "@/lib/pricing";
import { Glyph, Leaf } from "./Glyph";

const DARK_TOP = ["/", "/grow-lab", "/bulk"];

export function Header() {
  const t = useT();
  const path = usePathname() || "/";
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);
  const lines = useShop((s) => s.lines);
  const pulse = useShop((s) => s.pulse);
  const setOpen = useShop((s) => s.setOpen);
  const lang = useShop((s) => s.lang);
  const setLang = useShop((s) => s.setLang);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const darkTop = DARK_TOP.includes(path.replace(/\/$/, "") || "/");
  useEffect(() => {
    const on = () => setSolid(window.scrollY > (path === "/" ? window.innerHeight * 0.8 : 24));
    on(); window.addEventListener("scroll", on, { passive: true }); return () => window.removeEventListener("scroll", on);
  }, [path]);
  useEffect(() => setMenu(false), [path]);
  const links = [
    ["/shop", t("nav.shop", "Shop")], ["/grow-lab", t("nav.lab", "Grow Lab")], ["/bulk", t("nav.bulk", "Bulk & industry")],
    ["/about", t("nav.about", "About")], ["/contact", t("nav.contact", "Contact")],
  ];
  const count = mounted ? cartCount(lines) : 0;
  return (
    <header className={`hdr ${solid || menu || !darkTop ? "solid" : ""} ${darkTop ? "on-dark" : ""}`}>
      <a className="skip" href="#main">Skip to content</a>
      <div className="wrap row">
        <Link href="/" className="logo" aria-label="Fulwari home">
          <Leaf size={38} />
          <span>Fulwari<small>Plant growers · Anand</small></span>
        </Link>
        <nav className={`nav ${menu ? "open" : ""}`} aria-label="Main">
          {links.map(([href, label]) => (
            <Link key={href} href={href} aria-current={path.startsWith(href) ? "page" : undefined}>{label}</Link>
          ))}
        </nav>
        <button className="icon-btn lang-btn" onClick={() => setLang(lang === "en" ? "hi" : "en")} aria-label="Switch language">{lang === "en" ? "हिं" : "EN"}</button>
        <motion.button key={pulse} initial={{ scale: 1 }} animate={{ scale: pulse ? [1, 1.25, 1] : 1 }} transition={{ duration: 0.45 }} className="icon-btn" onClick={() => setOpen(true)} aria-label={`${t("nav.cart", "Cart")}: ${count}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 8h14l-1.5 11a2 2 0 0 1-2 1.7H8.5a2 2 0 0 1-2-1.7z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>
          {count > 0 && <span className="badge">{count}</span>}
        </motion.button>
        <button className="icon-btn menu-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">{menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
        </button>
      </div>
    </header>
  );
}

export function CartDrawer() {
  const t = useT();
  const { lines, open, setOpen, setQty, remove, lang } = useShop();
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [setOpen]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside className="drawer" role="dialog" aria-modal="true" aria-label={t("cart.title", "Your cart")} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 280 }}>
            <header>
              <h3 style={{ fontSize: 26 }}>{t("cart.title", "Your cart")}</h3>
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close cart"><svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
            </header>
            <div className="lines">
              {lines.length === 0 && (
                <div style={{ padding: "48px 0", textAlign: "center", display: "grid", gap: 16, justifyItems: "center" }}>
                  <Glyph species="neem" size={96} />
                  <p className="mute">{t("cart.empty", "Your cart is empty.")}</p>
                  <Link className="btn green small" href="/shop" onClick={() => setOpen(false)}>{t("cta.shop", "Shop plants")}</Link>
                </div>
              )}
              <AnimatePresence initial={false}>
                {lines.map((l) => (
                  <motion.div key={l.sku} className="line" layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30, height: 0, padding: 0 }}>
                    <div className="thumb"><Glyph species={l.species} size={52} /></div>
                    <div>
                      <b>{lang === "hi" ? l.nameHi : l.name}</b>
                      <div className="mute" style={{ fontSize: 14 }}>{l.label}</div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
                        <div className="qty">
                          <button onClick={() => setQty(l.sku, l.qty - 1)} aria-label="Fewer">−</button><span>{l.qty}</span><button onClick={() => setQty(l.sku, l.qty + 1)} aria-label="More">+</button>
                        </div>
                        <button className="linkish" onClick={() => remove(l.sku)}>{t("cart.remove", "Remove")}</button>
                      </div>
                    </div>
                    <b className="nb">{inr(l.qty * l.priceInr)}</b>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {lines.length > 0 && (
              <footer>
                <div className="sum"><span>{t("cart.subtotal", "Subtotal")}</span><span className="nb">{inr(cartSubtotal(lines))}</span></div>
                <p className="mute" style={{ fontSize: 14 }}>Free delivery in Gujarat on orders over ₹5,000.</p>
                <Link className="btn" href="/checkout" onClick={() => setOpen(false)}>{t("cart.checkout", "Checkout")} →</Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
