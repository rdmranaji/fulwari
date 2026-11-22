import { NextResponse } from "next/server";
import { db, schema } from "@/db/client";
import { EnquiryInput, issues } from "@/lib/validation";
import { enquiryMessage } from "@/lib/messages";
import { waLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const parsed = EnquiryInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields.", fields: issues(parsed.error) }, { status: 400 });
  const [row] = await db.insert(schema.enquiries).values(parsed.data).returning({ id: schema.enquiries.id });
  return NextResponse.json({ id: row.id, whatsapp: waLink(enquiryMessage(parsed.data)) });
}
