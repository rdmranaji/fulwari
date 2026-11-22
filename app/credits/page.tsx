import type { Metadata } from "next";
import { allCredits } from "@/lib/photos";
export const metadata: Metadata = { title: "Photo credits" };

export default function Credits() {
  const list = allCredits();
  return (
    <div className="wrap" style={{ paddingTop: 130, paddingBottom: 100 }}>
      <h1 className="h-l">Photo credits</h1>
      <p className="lede mute" style={{ margin: "12px 0 28px" }}>Until Fulwari's own photo shoot, this site uses freely licensed photographs from Wikimedia Commons. Thank you to the photographers below.</p>
      {list.length === 0 ? <p className="mute">Photos are added when the site is built.</p> : (
        <div className="table-wrap panel-card">
          <table className="t">
            <thead><tr><th>Photo</th><th>Photographer</th><th>Licence</th></tr></thead>
            <tbody>{list.map((p) => <tr key={p.src}><td>{p.alt}</td><td>{p.credit}</td><td><a href={p.page}>{p.license}</a></td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
