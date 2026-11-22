import "server-only";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db/client";

const KEY = process.env.RAZORPAY_KEY_ID || "";
const SECRET = process.env.RAZORPAY_KEY_SECRET || "";
export const razorpayEnabled = () => !!(KEY && SECRET);

/** Creates a Razorpay order for the amount in rupees and stores its id against our order. */
export async function createRazorpayOrder(orderId: number, receipt: string, totalInr: number) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${KEY}:${SECRET}`).toString("base64") },
    body: JSON.stringify({ amount: totalInr * 100, currency: "INR", receipt }),
  });
  if (!res.ok) throw new Error(`Razorpay ${res.status}`);
  const r = (await res.json()) as { id: string; amount: number };
  await db.update(schema.orders).set({ razorpayOrder: r.id }).where(eq(schema.orders.id, orderId));
  return { keyId: KEY, orderId: r.id, amount: r.amount };
}

export function verifySignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto.createHmac("sha256", SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  return expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
