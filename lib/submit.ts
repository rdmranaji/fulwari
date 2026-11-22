"use client";
import { variantBySku } from "./catalog";
import { enquiryMessage, orderMessage } from "./messages";
import { quote, type Fulfilment } from "./pricing";
import { IS_STATIC, waLink } from "./site";
import type { EnquiryInputT } from "./validation";

export type OrderForm = {
  items: { sku: string; qty: number }[]; name: string; phone: string; email?: string; fulfilment: Fulfilment;
  address: string; city: string; pincode: string; planting: boolean; payment: "cod" | "online"; notes?: string;
};
export type OrderResult = { number: string; total: number; whatsapp: string; razorpay?: { keyId: string; orderId: string; amount: number } | null };
export class FormError extends Error { constructor(msg: string, public fields: Record<string, string> = {}) { super(msg); } }

async function post<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new FormError(j.error || "Something went wrong. Please try again or WhatsApp us.", j.fields || {});
  return j as T;
}

/** Places an order through the API, or in the static preview composes it as a WhatsApp message. */
export async function placeOrder(f: OrderForm): Promise<OrderResult> {
  if (!IS_STATIC) return post<OrderResult>("/api/orders", f);
  const lines = f.items.map((i) => { const x = variantBySku(i.sku)!; return { name: x.product.name, label: x.variant.label, qty: i.qty, priceInr: x.variant.priceInr }; });
  const sub = lines.reduce((a, l) => a + l.qty * l.priceInr, 0);
  const q = quote(sub, lines.reduce((a, l) => a + l.qty, 0), f.fulfilment, f.planting);
  const number = "FW-" + Date.now().toString(36).toUpperCase().slice(-6);
  return { number, total: q.total, whatsapp: waLink(orderMessage({ ...f, number, lines, total: q.total })), razorpay: null };
}

export async function sendEnquiry(e: EnquiryInputT): Promise<{ whatsapp: string }> {
  if (!IS_STATIC) return post<{ whatsapp: string }>("/api/enquiries", e);
  return { whatsapp: waLink(enquiryMessage(e)) };
}

export function validatePhone(p: string) { return /^(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(p.trim()); }

export function loadRazorpay(): Promise<boolean> {
  return new Promise((res) => {
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return res(true);
    const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res(true); s.onerror = () => res(false); document.body.appendChild(s);
  });
}
