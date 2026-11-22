"use client";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { Counter, Reveal, SplitTitle } from "./Motion";
import { Photo } from "./Photo";

export function Doors() {
  const t = useT();
  return (
    <section className="band">
      <div className="wrap">
        <SplitTitle className="h-l" text={t("home.buyT", "Two ways to buy from Fulwari")} />
        <div className="grid-2" style={{ marginTop: 36 }}>
          <Reveal className="door b2c">
            <Photo slot="door-b2c" className="door-ph" sizes="(max-width:760px) 100vw, 50vw" fallback="bougainvillea" />
            <span className="kicker" style={{ color: "#7a4d00" }}>Homes, farmhouses and societies in Gujarat</span>
            <h3 className="h-m">{t("home.b2cT", "Order online. We deliver, and plant it if you like.")}</h3>
            <p>{t("home.b2c", "Shade trees, palms, fruit and flowering plants in nursery bags, delivered across Gujarat. Free delivery over ₹5,000.")}</p>
            <Link className="btn green" href="/shop">{t("cta.shop", "Shop plants")} →</Link>
          </Reveal>
          <Reveal className="door b2b" delay={0.1}>
            <Photo slot="door-b2b" className="door-ph" sizes="(max-width:760px) 100vw, 50vw" fallback="neem" />
            <span className="kicker">Industries, landscapers, nurseries and dealers</span>
            <h3 className="h-m">{t("home.b2bT", "Bulk supply anywhere in India.")}</h3>
            <p style={{ color: "#cfe3c8" }}>{t("home.b2b", "Green belts, townships and campuses. Orders from ₹1 lakh, with variety advice and after-care guidance for your team.")}</p>
            <Link className="btn" href="/bulk">{t("cta.quote", "Get a bulk quote")} →</Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function LabTeaser() {
  const t = useT();
  return (
    <section className="band dark" style={{ position: "relative", overflow: "hidden" }}>
      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: 40, alignItems: "center" }}>
        <div>
          <span className="kicker">Grow Lab</span>
          <SplitTitle className="h-l" text={t("home.labT3", "Every stage, from seed to shade, in real photos.")} />
          <p className="lede mute" style={{ marginTop: 18 }}>{t("home.lab3", "Pick any of our plants and play its life as a time-lapse: seed, sprout, nursery sapling, full-grown, flowering and fruiting.")}</p>
          <Link className="btn lime" href="/grow-lab" style={{ marginTop: 28 }}>{t("cta.lab", "Open the Grow Lab")} →</Link>
        </div>
        <Reveal>
          <Photo slot="story-sprout" className="lab-ph" sizes="(max-width:860px) 100vw, 45vw" fallback="neem" />
        </Reveal>
      </div>
      <style>{`@media(max-width:860px){.dark .wrap[style]{grid-template-columns:minmax(0,1fr)!important}}`}</style>
    </section>
  );
}


export function Proof() {
  const t = useT();
  const names = ["Adani", "Power and ports", "Steel", "Cement", "Textiles", "Hotels and resorts", "Townships", "Landscapers", "Retail nurseries"];
  return (
    <section className="dark" style={{ paddingBottom: 80 }}>
      <div className="wrap">
        <div className="stats">
          <div className="stat"><b><Counter to={2014} plain /></b><span className="mute">Growing plants since</span></div>
          <div className="stat"><b><Counter to={100} /></b><span className="mute">People on the nursery team</span></div>
          <div className="stat"><b><Counter to={2} /></b><span className="mute">Nurseries: Anand and Gandhidham</span></div>
          <div className="stat"><b>₹1L</b><span className="mute">Minimum bulk order, anywhere in India</span></div>
        </div>
        <p className="mute" style={{ margin: "48px 0 16px", fontWeight: 600 }}>{t("home.trust", "Trusted by Adani and leading groups in steel, cement, textiles and hospitality")}</p>
      </div>
      <div className="marquee" aria-hidden="true">
        <div className="track">{[...names, ...names].map((n, i) => <span key={i} className={n === "Adani" ? "hl" : ""}>{n}</span>)}</div>
      </div>
    </section>
  );
}

export function VisitBand() {
  const t = useT();
  return (
    <section className="band visit-ph">
      <Photo slot="visit" className="visit-bg" sizes="100vw" fallback="areca" />
      <div className="wrap" style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "end", justifyContent: "space-between" }}>
        <div style={{ maxWidth: 720 }}>
          <SplitTitle className="h-l" text="Walk the rows before you choose." />
          <p className="lede" style={{ marginTop: 14 }}>Our Anand nursery on NH48 is open every day, 8 AM to 6 PM. Book a slot and a gardener will walk you round.</p>
        </div>
        <Link className="btn" href="/contact">{t("cta.visit", "Book a nursery visit")} →</Link>
      </div>
    </section>
  );
}
