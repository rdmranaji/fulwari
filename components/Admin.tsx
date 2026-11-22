"use client";
import { useState } from "react";
import { inr } from "@/lib/pricing";
import { IS_STATIC } from "@/lib/site";

type Order = { id: number; number: string; name: string; phone: string; city: string; fulfilment: string; payment: string; totalInr: number; status: string; createdAt: string; items: { name: string; label: string; qty: number }[] };
type Enq = { id: number; type: string; name: string; phone: string; company: string | null; city: string | null; plants: string | null; quantity: string | null; createdAt: string };

export default function Admin() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<{ orders: Order[]; enquiries: Enq[] } | null>(null);
  const [err, setErr] = useState("");
  const load = async (e?: React.FormEvent) => {
    e?.preventDefault(); setErr("");
    const r = await fetch("/api/admin", { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) { setErr(r.status === 401 ? "Wrong token." : "Could not load."); return; }
    setData(await r.json());
  };
  if (IS_STATIC) return <div className="wrap" style={{ padding: "160px 18px" }}><h1 className="h-l">Orders dashboard</h1><p className="lede mute" style={{ marginTop: 12 }}>Available on the live site, where orders and enquiries are stored in PostgreSQL.</p></div>;
  return (
    <div className="wrap" style={{ paddingTop: 120, paddingBottom: 100 }}>
      <h1 className="h-l">Orders and enquiries</h1>
      {!data && (
        <form onSubmit={load} className="form panel-card" style={{ maxWidth: 420, marginTop: 24 }}>
          <label className="field"><span>Admin token</span><input type="password" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="current-password" /></label>
          {err && <p className="err">{err}</p>}
          <button className="btn green" type="submit">Open</button>
        </form>
      )}
      {data && (
        <div style={{ display: "grid", gap: 40, marginTop: 28 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2 className="h-m">Orders ({data.orders.length})</h2><button className="btn small ghost" onClick={() => load()}>Refresh</button></div>
            <div className="table-wrap panel-card" style={{ marginTop: 14 }}>
              <table className="t">
                <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Where</th><th>Pay</th><th className="num">Total</th><th>Status</th></tr></thead>
                <tbody>{data.orders.map((o) => (
                  <tr key={o.id}><td className="nb"><b>{o.number}</b><br /><span className="mute">{new Date(o.createdAt).toLocaleString("en-IN")}</span></td><td>{o.name}<br /><span className="mute nb">{o.phone}</span></td>
                    <td>{o.items.map((i) => `${i.qty} × ${i.name} (${i.label})`).join(", ")}</td><td>{o.fulfilment === "delivery" ? o.city : o.fulfilment}</td><td>{o.payment}</td><td className="num">{inr(o.totalInr)}</td><td>{o.status}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
          <div>
            <h2 className="h-m">Enquiries ({data.enquiries.length})</h2>
            <div className="table-wrap panel-card" style={{ marginTop: 14 }}>
              <table className="t">
                <thead><tr><th>Type</th><th>Name</th><th>Company</th><th>Site</th><th>Plants</th><th>Qty</th><th>When</th></tr></thead>
                <tbody>{data.enquiries.map((e) => (
                  <tr key={e.id}><td>{e.type}</td><td>{e.name}<br /><span className="mute nb">{e.phone}</span></td><td>{e.company ?? "-"}</td><td>{e.city ?? "-"}</td><td>{e.plants ?? "-"}</td><td>{e.quantity ?? "-"}</td><td className="nb">{new Date(e.createdAt).toLocaleDateString("en-IN")}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
