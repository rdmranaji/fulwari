import { eq } from "drizzle-orm";
import { categories, products } from "../lib/catalog";
import { db, pool, schema } from "./client";

async function main() {
  for (const c of categories) {
    await db.insert(schema.categories).values(c).onConflictDoUpdate({ target: schema.categories.slug, set: { name: c.name, nameHi: c.nameHi, sort: c.sort } });
  }
  for (const p of products) {
    const [cat] = await db.select().from(schema.categories).where(eq(schema.categories.slug, p.category));
    const data = {
      name: p.name, nameHi: p.nameHi, botanical: p.botanical, species: p.species, tagline: p.tagline, description: p.description,
      sun: p.sun, water: p.water, matureSize: p.matureSize, growth: p.growth, featured: !!p.featured, categoryId: cat.id,
    };
    const [prod] = await db.insert(schema.products).values({ slug: p.slug, ...data })
      .onConflictDoUpdate({ target: schema.products.slug, set: data }).returning();
    for (const v of p.variants) {
      const vd = { label: v.label, heightCm: v.heightCm, bag: v.bag, priceInr: v.priceInr, ageDays: v.ageDays, stock: v.stock ?? 100, productId: prod.id };
      await db.insert(schema.variants).values({ sku: v.sku, ...vd }).onConflictDoUpdate({ target: schema.variants.sku, set: vd });
    }
  }
  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
}

main().finally(() => pool.end());
