import type { Metadata } from "next";
import { VisitForm } from "@/components/Forms";
import { SITE, waLink } from "@/lib/site";
export const metadata: Metadata = { title: "Visit or contact Fulwari", description: "Fulwari nursery, NH48 near HTC Foodland, Mogar, Anand. Open every day, 8 AM to 6 PM." };

export default function Contact() {
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <span className="kicker">Open every day · 8 AM to 6 PM</span>
          <h1 className="h-xl" style={{ marginTop: 10 }}>Visit the nursery</h1>
        </div>
      </section>
      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.1fr)", gap: 40 }}>
          <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
            <div className="panel-card"><h3 style={{ fontSize: 22 }}>Main nursery</h3><p style={{ margin: "8px 0" }}>{SITE.main}</p><a href={SITE.maps}>Get directions →</a></div>
            <div className="panel-card"><h3 style={{ fontSize: 22 }}>Branch</h3><p style={{ marginTop: 8 }}>{SITE.branch}</p></div>
            <div className="panel-card"><h3 style={{ fontSize: 22 }}>Phone and WhatsApp</h3><p style={{ marginTop: 8 }}><a className="nb" href={`tel:${SITE.phoneRaw}`}>{SITE.phone}</a> · <a href={waLink("Hello Fulwari")}>WhatsApp</a></p><p><a href={`mailto:${SITE.email}`}>{SITE.email}</a></p></div>
          </div>
          <div className="panel-card"><h2 className="h-m" style={{ marginBottom: 18 }}>Book a visit</h2><VisitForm /></div>
        </div>
        <style>{`@media(max-width:900px){.band .wrap[style]{grid-template-columns:minmax(0,1fr)!important}}`}</style>
      </section>
    </>
  );
}
