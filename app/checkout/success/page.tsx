import type { Metadata } from "next";
import Success from "@/components/Success";
export const metadata: Metadata = { title: "Order received", robots: { index: false } };
export default function Page() { return <Success />; }
