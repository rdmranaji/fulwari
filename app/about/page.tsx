import type { Metadata } from "next";
import { Reveal, SplitTitle } from "@/components/Motion";
import { SITE } from "@/lib/site";
export const metadata: Metadata = { title: "About Fulwari", description: "From organic fertilizers in 2014 to a full-range nursery in Anand with a team of 100." };

export default function About() {
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <span className="kicker">Our story</span>
          <SplitTitle as="h1" className="h-xl" text="From organic fertilizers to a full-range nursery." />
        </div>
      </section>
      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: 48 }}>
          <Reveal>
            <p className="lede">Fulwari started in 2014 with a small range of organic fertilizers. Today a team of 100 grows the full range of plants at Mogar, Anand, and Gandhidham in Kutch, and supplies nurseries, landscapers and industrial plantations across India.</p>
            <div className="grid-2" style={{ marginTop: 32 }}>
              {[["Vision", "To become one of the biggest nurseries in the world."], ["Mission", "To give every plant lover the best quality plants."], ["Values", "To work in coordination with nature."], ["Why buyers choose us", "The best quality plants, with a wide range of varieties to choose from."]].map(([h, p]) => (
                <div key={h} className="panel-card"><h3 style={{ fontSize: 22, marginBottom: 8 }}>{h}</h3><p className="mute">{p}</p></div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="table-wrap panel-card">
              <table className="t"><tbody>
                {[["Owner", "Himanshu Bakshi"], ["Business type", "Proprietorship"], ["Established", "2014"], ["Team", "100 people"], ["GST", SITE.gst], ["Udyam (MSME)", SITE.udyam], ["Main nursery", SITE.main], ["Branch", SITE.branch]].map(([k, v]) => <tr key={k}><td className="mute">{k}</td><td>{v}</td></tr>)}
              </tbody></table>
            </div>
          </Reveal>
        </div>
        <style>{`@media(max-width:900px){.band .wrap[style]{grid-template-columns:minmax(0,1fr)!important}}`}</style>
      </section>
    </>
  );
}
