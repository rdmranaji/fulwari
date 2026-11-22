import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db/client";
import { razorpayEnabled, verifySignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";
const Body = z.object({ razorpay_order_id: z.string(), razorpay_payment_id: z.string(), razorpay_signature: z.string() });

export async function POST(req: Request) {
  if (!razorpayEnabled()) return NextResponse.json({ error: "Online payments are not enabled" }, { status: 400 });
  const b = Body.safeParse(await req.json().catch(() => null));
  if (!b.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = b.data;
  if (!verifySignature(oid, pid, sig)) return NextResponse.json({ error: "Payment could not be verified" }, { status: 400 });
  await db.update(schema.orders).set({ status: "PAID" }).where(eq(schema.orders.razorpayOrder, oid));
  return NextResponse.json({ ok: true });
}
