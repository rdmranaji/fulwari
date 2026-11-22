import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { getCatalog } from "@/lib/data";
import { products as seed } from "@/lib/catalog";
import { SITE } from "@/lib/site";

// Server mode refreshes catalogue and prices from PostgreSQL every 5 minutes.
export const revalidate = 300;

export const dynamicParams = false;
export function generateStaticParams() { return seed.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = seed.find((x) => x.slug === slug);
  return p ? { title: `${p.name} (${p.botanical})`, description: `${p.tagline}. ${p.description}` } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products } = await getCatalog();
  const p = products.find((x) => x.slug === slug);
  if (!p) notFound();
  const ld = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description, brand: { "@type": "Brand", name: "Fulwari" },
    offers: p.variants.map((v) => ({ "@type": "Offer", sku: v.sku, priceCurrency: "INR", price: v.priceInr, availability: "https://schema.org/InStock", url: `${SITE.url}/shop/${p.slug}` })),
  };
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ProductDetail p={p} related={related} />
    </>
  );
}
