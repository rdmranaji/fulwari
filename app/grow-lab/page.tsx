import type { Metadata } from "next";
import GrowLab from "@/components/GrowLab";

export const metadata: Metadata = {
  title: "Grow Lab: watch a plant grow from seed",
  description: "Pick a Fulwari plant and fast-forward through the seasons in 3D, from seed to mature tree.",
};

export default function Page() {
  return <GrowLab />;
}
