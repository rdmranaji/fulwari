import { Hero, SeedToShade } from "@/components/HomePhoto";
import ProductGrid from "@/components/ProductGrid";
import { Doors, LabTeaser, Proof, VisitBand } from "@/components/HomeSections";
import { getCatalog } from "@/lib/data";
import Link from "next/link";

// Server mode refreshes catalogue and prices from PostgreSQL every 5 minutes.
export const revalidate = 300;

export default async function Home() {
  const { products, categories } = await getCatalog();
  const featured = products.filter((p) => p.featured);
  return (
    <>
      <Hero />
      <SeedToShade />
      <Doors />
      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
            <div>
              <span className="kicker">From our nursery</span>
              <h2 className="h-l" style={{ marginTop: 8 }}>Bestsellers from our rows</h2>
              <p className="mute" style={{ marginTop: 10 }}>Delivered in nursery bags across Gujarat. Free delivery over ₹5,000.</p>
            </div>
            <Link className="btn ghost" href="/shop">See all {products.length} plants →</Link>
          </div>
          <ProductGrid products={featured} categories={categories} filter={false} />
        </div>
      </section>
      <LabTeaser />
      <Proof />
      <VisitBand />
    </>
  );
}
