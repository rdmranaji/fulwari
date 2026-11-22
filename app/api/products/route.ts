import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getCatalog());
}
