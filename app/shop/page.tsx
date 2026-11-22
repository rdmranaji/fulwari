import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";
import { getCatalog } from "@/lib/data";

// Server mode refreshes catalogue and prices from PostgreSQL every 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = { title: "Shop plants", description: "Shade trees, palms, fruit trees, flowering shrubs, hedges and indoor plants from Fulwari, Anand. Delivered across Gujarat." };

export default async function Shop() {
  const { products, categories } = await getCatalog();
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <span className="kicker">Delivered across Gujarat · grown in Anand</span>
          <h1 className="h-xl" style={{ marginTop: 10 }}>Shop plants</h1>
          <p className="lede mute" style={{ marginTop: 14 }}>Every plant here is alive in 3D. Hover one to watch it grow from seedling to the biggest size we deliver. Free delivery on orders over ₹5,000.</p>
        </div>
      </section>
      <section style={{ paddingBottom: 100 }}>
        <div className="wrap"><ProductGrid products={products} categories={categories} /></div>
      </section>
    </>
  );
}
