import type { EnquiryInputT } from "./validation";
import { inr } from "./pricing";

export function orderMessage(o: { number: string; name: string; phone: string; fulfilment: string; address?: string; city?: string; pincode?: string; planting: boolean; payment: string; lines: { name: string; label: string; qty: number; priceInr: number }[]; total: number }) {
  const where = o.fulfilment === "delivery" ? `Deliver to: ${o.address}, ${o.city} ${o.pincode}${o.planting ? " (with planting)" : ""}` : o.fulfilment === "pickup-anand" ? "Pickup: Anand nursery" : "Pickup: Gandhidham";
  return [`Hello Fulwari, order ${o.number}`, ...o.lines.map((l) => `- ${l.qty} × ${l.name} (${l.label}) ${inr(l.qty * l.priceInr)}`), `Total: ${inr(o.total)}`, where, `Payment: ${o.payment === "online" ? "online" : "on delivery / UPI"}`, `Name: ${o.name}, ${o.phone}`].join("\n");
}

export function enquiryMessage(e: EnquiryInputT) {
  if (e.type === "VISIT") return `Hello Fulwari, I'd like to visit the nursery.\nName: ${e.name}, ${e.phone}\nNursery: ${e.nursery ?? "-"}\nDate: ${e.visitDate || "flexible"}\nLooking for: ${e.plants ?? "-"}`;
  return `Hello Fulwari, I'd like a bulk quote.\nName: ${e.name}, ${e.phone}${e.company ? `\nCompany: ${e.company}` : ""}\nBuyer type: ${e.buyerType ?? "-"}\nSite: ${e.city ?? "-"}\nPlants: ${e.plants ?? "-"}\nApprox. total: ${e.quantity ?? "-"}\nNeeded by: ${e.timeline ?? "-"}`;
}
