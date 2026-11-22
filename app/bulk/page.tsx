import type { Metadata } from "next";
import { BulkForm } from "@/components/Forms";
import { Reveal, SplitTitle } from "@/components/Motion";

export const metadata: Metadata = { title: "Bulk plants for industry, landscapers and nurseries", description: "Bulk plant supply across India from Fulwari, Anand. Green belts, townships, campuses. Orders from ₹1 lakh." };

const steps = [
  ["Share your requirement", "Species, quantity, plant size and site location. A list on WhatsApp is enough to start."],
  ["We suggest the right varieties", "Matched to your soil, salinity, rainfall and purpose."],
  ["A clear quote", "The price and the quality it buys, explained line by line."],
  ["Supply and dispatch", "Plants checked, hardened and loaded for your site."],
  ["Planting and after-care", "Guidance for your horticulture team after delivery."],
];
const inds = [
  ["Adani", "Named client"], ["Power, ports and energy", "Green belts and buffer zones"], ["Steel and metals", "Dust screens and townships"],
  ["Cement", "Mine reclamation and campuses"], ["Textiles", "Factory landscapes"], ["Hotels and hospitality", "Palms and flowering avenues"],
  ["Landscapers", "Full-range trade supply"], ["Retail nurseries and dealers", "Regular restocking"], ["Online plant brands", "Grower partnerships"],
];

export default function Bulk() {
  return (
    <>
      <section className="page-head dark">
        <div className="wrap">
          <span className="kicker">Bulk and industry · PAN India</span>
          <SplitTitle as="h1" className="h-xl" text="Plants by the truckload, grown in Anand." />
          <p className="lede mute" style={{ marginTop: 18 }}>Fulwari supplies green belts, townships, campuses and landscapes for companies that run their own horticulture teams, and the trade that serves them. Minimum order ₹1 lakh.</p>
          <a className="btn" href="#quote" style={{ marginTop: 26 }}>Request a quote</a>
        </div>
      </section>
      <section className="band dark" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="inds">{inds.map(([n, d], i) => <Reveal key={n} delay={(i % 3) * 0.06} className={`ind ${i === 0 ? "star" : ""}`}><b>{n}</b><span style={{ opacity: 0.8 }}>{d}</span></Reveal>)}</div>
          <h2 className="h-l" style={{ margin: "88px 0 32px" }}>How a bulk order works</h2>
          <div className="steps">{steps.map(([h, p], i) => <Reveal key={h} delay={i * 0.08} className="step"><h3 style={{ fontSize: 22, marginBottom: 8 }}>{h}</h3><p className="mute">{p}</p></Reveal>)}</div>
        </div>
      </section>
      <section className="band" id="quote">
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "minmax(0,0.8fr) minmax(0,1.2fr)", gap: 40 }}>
          <div>
            <h2 className="h-l">Get a bulk quote</h2>
            <p className="lede mute" style={{ marginTop: 14 }}>Most buyers hear back within one working day. Prefer to talk? Call <span className="nb">+91 99133 69100</span>.</p>
            <div className="facts" style={{ marginTop: 26 }}>
              <div><b>Minimum order</b>₹1 lakh</div><div><b>Supply area</b>Anywhere in India</div>
              <div><b>Nurseries</b>Anand and Gandhidham</div><div><b>Since</b>2014</div>
            </div>
          </div>
          <div className="panel-card"><BulkForm /></div>
        </div>
        <style>{`@media(max-width:900px){#quote .wrap{grid-template-columns:minmax(0,1fr)!important}}`}</style>
      </section>
    </>
  );
}
