import type { Metadata } from "next";
import GrowLab from "@/components/GrowLab";

export const metadata: Metadata = {
  title: "Grow Lab: real photos of every growth stage",
  description: "Watch neem, gulmohar, mango and nine more plants grow from seed to full size, stage by stage, in real photographs.",
};

export default function Page() {
  return <GrowLab />;
}
