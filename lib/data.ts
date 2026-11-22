import "server-only";
import { categories as seedCats, products as seedProducts, type CategoryData, type ProductData } from "./catalog";
import type { SpeciesKey } from "@/components/three/species";

const useDb = () => process.env.STATIC_EXPORT !== "1" && !!process.env.DATABASE_URL;

/** Catalogue from PostgreSQL, falling back to the bundled sample catalogue (static preview, or DB unreachable). */
export async function getCatalog(): Promise<{ products: ProductData[]; categories: CategoryData[] }> {
  if (!useDb()) return { products: seedProducts, categories: seedCats };
  try {
    const { db } = await import("@/db/client");
    const cats = await db.query.categories.findMany({ orderBy: (c, { asc }) => [asc(c.sort)] });
    const prods = await db.query.products.findMany({ with: { category: true, variants: { orderBy: (v, { asc }) => [asc(v.priceInr)] } }, orderBy: (p, { asc }) => [asc(p.id)] });
    if (!prods.length) return { products: seedProducts, categories: seedCats };
    return {
      categories: cats.map((c) => ({ slug: c.slug, name: c.name, nameHi: c.nameHi, sort: c.sort })),
      products: prods.map((p) => ({
        slug: p.slug, name: p.name, nameHi: p.nameHi, botanical: p.botanical, species: p.species as SpeciesKey, category: p.category.slug,
        tagline: p.tagline, description: p.description, sun: p.sun, water: p.water, matureSize: p.matureSize, growth: p.growth, featured: p.featured,
        variants: p.variants.map((v) => ({ sku: v.sku, label: v.label, heightCm: v.heightCm, bag: v.bag, priceInr: v.priceInr, ageDays: v.ageDays, stock: v.stock })),
      })),
    };
  } catch (e) {
    console.warn("[fulwari] database unavailable, using bundled catalogue:", (e as Error).message);
    return { products: seedProducts, categories: seedCats };
  }
}
