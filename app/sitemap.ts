export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { products } from "@/lib/catalog";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/shop", "/grow-lab", "/bulk", "/about", "/contact"].map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: "weekly" as const, priority: p ? 0.8 : 1 }));
  return [...pages, ...products.map((p) => ({ url: `${SITE.url}/shop/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.7 }))];
}
