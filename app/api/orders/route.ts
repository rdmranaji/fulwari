import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { OrderInput, issues } from "@/lib/validation";
import { quote } from "@/lib/pricing";
import { orderMessage } from "@/lib/messages";
import { waLink } from "@/lib/site";
import { createRazorpayOrder, razorpayEnabled } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

const orderNumber = () => {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `FW-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = OrderInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields.", fields: issues(parsed.error) }, { status: 400 });
  const o = parsed.data;

  // Prices always come from the database, never from the browser
  const skus = o.items.map((i) => i.sku);
  const rows = await db.query.variants.findMany({ where: inArray(schema.variants.sku, skus), with: { product: true } });
  const bySku = new Map(rows.map((r) => [r.sku, r]));
  const missing = skus.filter((s) => !bySku.has(s));
  if (missing.length) return NextResponse.json({ error: `Some items are no longer available: ${missing.join(", ")}` }, { status: 409 });
  const lines = o.items.map((i) => { const v = bySku.get(i.sku)!; return { variantId: v.id, name: v.product.name, label: v.label, qty: i.qty, priceInr: v.priceInr }; });
  const short = o.items.filter((i) => i.qty > bySku.get(i.sku)!.stock).map((i) => bySku.get(i.sku)!.product.name);
  if (short.length) return NextResponse.json({ error: `Only limited stock left for ${short.join(", ")}. Reduce the quantity or ask us on WhatsApp.` }, { status: 409 });

  const subtotal = lines.reduce((a, l) => a + l.qty * l.priceInr, 0);
  const plants = lines.reduce((a, l) => a + l.qty, 0);
  const q = quote(subtotal, plants, o.fulfilment, o.planting);
  const number = orderNumber();
  const isDelivery = o.fulfilment === "delivery";

  const order = await db.transaction(async (tx) => {
    const [row] = await tx.insert(schema.orders).values({
      number, name: o.name, phone: o.phone, email: o.email || null,
      address: isDelivery ? o.address : o.fulfilment, city: isDelivery ? o.city : o.fulfilment === "pickup-anand" ? "Anand" : "Gandhidham", pincode: isDelivery ? o.pincode : "-",
      fulfilment: o.fulfilment, planting: isDelivery && o.planting, payment: o.payment,
      subtotalInr: q.subtotal, deliveryInr: q.delivery, plantingInr: q.planting, totalInr: q.total, notes: o.notes ?? null,
    }).returning();
    await tx.insert(schema.orderItems).values(lines.map((l) => ({ orderId: row.id, ...l })));
    return row;
  });

  const message = orderMessage({ number, name: o.name, phone: o.phone, fulfilment: o.fulfilment, address: o.address, city: o.city, pincode: o.pincode, planting: o.planting, payment: o.payment, lines, total: q.total });
  let razorpay: Awaited<ReturnType<typeof createRazorpayOrder>> | null = null;
  if (o.payment === "online" && razorpayEnabled()) {
    try { razorpay = await createRazorpayOrder(order.id, number, q.total); } catch (e) { console.error("razorpay", e); }
  }
  return NextResponse.json({ number, total: q.total, whatsapp: waLink(message), razorpay });
}
