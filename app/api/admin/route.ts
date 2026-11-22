import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import crypto from "node:crypto";
import { db, schema } from "@/db/client";

export const dynamic = "force-dynamic";

function authorised(req: Request) {
  const want = process.env.ADMIN_TOKEN || "";
  const got = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  return want.length > 0 && got.length === want.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

export async function GET(req: Request) {
  if (!authorised(req)) return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  const [orders, enquiries] = await Promise.all([
    db.query.orders.findMany({ with: { items: true }, orderBy: [desc(schema.orders.createdAt)], limit: 100 }),
    db.query.enquiries.findMany({ orderBy: [desc(schema.enquiries.createdAt)], limit: 100 }),
  ]);
  return NextResponse.json({ orders, enquiries });
}
