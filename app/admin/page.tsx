import type { Metadata } from "next";
import Admin from "@/components/Admin";
export const metadata: Metadata = { title: "Orders", robots: { index: false } };
export default function Page() { return <Admin />; }
