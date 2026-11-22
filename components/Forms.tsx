"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FormError, sendEnquiry, validatePhone } from "@/lib/submit";
import { IS_STATIC } from "@/lib/site";

type Field = { k: string; label: string; type?: "text" | "tel" | "date" | "select" | "textarea"; opts?: string[]; ph?: string; req?: boolean; half?: boolean };

function EnquiryForm({ type, fields, cta, done }: { type: "BULK" | "VISIT"; fields: Field[]; cta: string; done: string }) {
  const [v, setV] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.k, f.opts?.[0] ?? ""])));
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<null | string>(null);
  const [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if ((v.name || "").trim().length < 2) er.name = "Enter your name";
    if (!validatePhone(v.phone || "")) er.phone = "Enter a 10-digit Indian mobile number";
    setErrs(er);
    if (Object.keys(er).length) { document.getElementById(`${type}-${Object.keys(er)[0]}`)?.focus(); return; }
    setBusy(true); setMsg("");
    try { const r = await sendEnquiry({ type, ...v } as never); setOk(r.whatsapp); }
    catch (x) { if (x instanceof FormError) { setErrs(x.fields); setMsg(x.message); } else setMsg("Could not send. Please WhatsApp us on +91 99133 69100."); }
    setBusy(false);
  };
  if (ok) return (
    <motion.div className="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} role="status">
      <h3 className="h-m" style={{ fontSize: 26 }}>{IS_STATIC ? "Your message is ready." : "Thank you, we have your request."}</h3>
      <p>{IS_STATIC ? "Send it to Fulwari on WhatsApp to finish." : done}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a className="btn green" href={ok} target="_blank" rel="noopener">Send on WhatsApp</a>
        <button className="btn ghost" onClick={() => setOk(null)}>New request</button>
      </div>
      <p className="mute" style={{ fontSize: 14 }}>Or call <span className="nb">+91 99133 69100</span>.</p>
    </motion.div>
  );
  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="cols-2">
        {fields.map((f) => {
          const id = `${type}-${f.k}`;
          const common = { id, value: v[f.k] ?? "", "aria-invalid": !!errs[f.k], onChange: (e: { target: { value: string } }) => setV((x) => ({ ...x, [f.k]: e.target.value })) };
          return (
            <label key={f.k} className="field" style={{ gridColumn: f.half ? undefined : "1 / -1" }}>
              <span>{f.label}{f.req && " *"}</span>
              {f.type === "select" ? <select {...common}>{f.opts!.map((o) => <option key={o}>{o}</option>)}</select>
                : f.type === "textarea" ? <textarea {...common} placeholder={f.ph} />
                : <input {...common} type={f.type === "tel" ? "tel" : f.type === "date" ? "date" : "text"} placeholder={f.ph} inputMode={f.type === "tel" ? "tel" : undefined} />}
              {errs[f.k] && <span className="err">{errs[f.k]}</span>}
            </label>
          );
        })}
      </div>
      {msg && <p className="err" role="alert">{msg}</p>}
      <button className="btn" type="submit" disabled={busy} style={{ justifySelf: "start" }}>{busy ? "Sending…" : cta}</button>
    </form>
  );
}

export function BulkForm() {
  return <EnquiryForm type="BULK" cta="Request a quote" done="Our team will call you within one working day with varieties, sizes and a quote."
    fields={[
      { k: "name", label: "Your name", req: true, half: true }, { k: "phone", label: "Mobile", type: "tel", req: true, half: true, ph: "98765 43210" },
      { k: "company", label: "Company", half: true }, { k: "buyerType", label: "You are", type: "select", half: true, opts: ["Industry / plant site", "Landscaper", "Retail nursery", "Dealer or distributor", "Online plant brand", "Government / tender"] },
      { k: "city", label: "Site city and state", half: true, ph: "Mundra, Gujarat" }, { k: "timeline", label: "Needed by", type: "select", half: true, opts: ["This month", "In 1–3 months", "Monsoon plantation", "Still planning"] },
      { k: "plants", label: "Plants needed", type: "textarea", ph: "Neem 2,000 nos, 6–8 ft; Areca palm 500 nos, 4 ft" }, { k: "quantity", label: "Approximate total plants", half: true, ph: "2,500" },
    ]} />;
}

export function VisitForm() {
  return <EnquiryForm type="VISIT" cta="Book my visit" done="We will confirm your slot on WhatsApp."
    fields={[
      { k: "name", label: "Your name", req: true, half: true }, { k: "phone", label: "Mobile", type: "tel", req: true, half: true, ph: "98765 43210" },
      { k: "nursery", label: "Nursery", type: "select", half: true, opts: ["Mogar, Anand", "Gandhidham, Kutch"] }, { k: "visitDate", label: "Date", type: "date", half: true },
      { k: "plants", label: "Looking for", type: "select", opts: ["Garden and terrace plants", "Trees for a farmhouse", "Plants for a society or office", "Not sure yet"] },
    ]} />;
}
