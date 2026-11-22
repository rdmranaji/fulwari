// Sample catalogue for the Fulwari preview. Prices, sizes and stock are placeholders
// until Fulwari confirms its retail list. Used to seed PostgreSQL and for the static preview.
import type { SpeciesKey } from "@/components/three/species";

export type VariantData = { sku: string; label: string; heightCm: number; bag: string; priceInr: number; ageDays: number; stock?: number };
export type ProductData = {
  slug: string; name: string; nameHi: string; botanical: string; species: SpeciesKey; category: string;
  tagline: string; description: string; sun: string; water: string; matureSize: string; growth: string;
  featured?: boolean; variants: VariantData[];
};
export type CategoryData = { slug: string; name: string; nameHi: string; sort: number };

export const categories: CategoryData[] = [
  { slug: "trees", name: "Shade & avenue trees", nameHi: "छायादार और एवेन्यू पेड़", sort: 1 },
  { slug: "palms", name: "Palms", nameHi: "पाम", sort: 2 },
  { slug: "flowering", name: "Flowering shrubs", nameHi: "फूलों वाली झाड़ियां", sort: 3 },
  { slug: "fruit", name: "Fruit trees", nameHi: "फलदार पेड़", sort: 4 },
  { slug: "hedges", name: "Hedges", nameHi: "हेज", sort: 5 },
  { slug: "indoor", name: "Indoor plants", nameHi: "इनडोर पौधे", sort: 6 },
];

export const products: ProductData[] = [
  {
    slug: "neem", name: "Neem", nameHi: "नीम", botanical: "Azadirachta indica", species: "neem", category: "trees", featured: true,
    tagline: "Gujarat's toughest shade tree", description: "Evergreen, drought hardy and fast to establish. The first choice for green belts, school grounds and farmhouse boundaries across Gujarat.",
    sun: "Full sun", water: "Low once established", matureSize: "8–12 m tall, 8 m spread", growth: "Fast: about 1 m a year",
    variants: [
      { sku: "NEEM-3FT", label: "3–4 ft sapling", heightCm: 100, bag: "8 × 10 in bag", priceInr: 180, ageDays: 210 },
      { sku: "NEEM-7FT", label: "6–8 ft young tree", heightCm: 210, bag: "14 × 14 in bag", priceInr: 650, ageDays: 520 },
      { sku: "NEEM-11FT", label: "10–12 ft established tree", heightCm: 330, bag: "21 × 21 in bag", priceInr: 1800, ageDays: 900 },
    ],
  },
  {
    slug: "gulmohar", name: "Gulmohar", nameHi: "गुलमोहर", botanical: "Delonix regia", species: "gulmohar", category: "trees", featured: true,
    tagline: "A crown of flame every summer", description: "Umbrella canopy that turns scarlet from April to June. Drops its leaves briefly in late winter, then flowers on bare branches.",
    sun: "Full sun", water: "Moderate", matureSize: "8–10 m tall, 10 m spread", growth: "Fast",
    variants: [
      { sku: "GUL-4FT", label: "4–5 ft sapling", heightCm: 140, bag: "10 × 12 in bag", priceInr: 350, ageDays: 300 },
      { sku: "GUL-9FT", label: "8–10 ft young tree", heightCm: 280, bag: "18 × 18 in bag", priceInr: 1400, ageDays: 720 },
    ],
  },
  {
    slug: "karanj", name: "Karanj", nameHi: "करंज", botanical: "Pongamia pinnata", species: "karanj", category: "trees",
    tagline: "Glossy shade, lilac flowers", description: "Dense glossy canopy with soft lilac flowers in spring. Tolerates saline soil, which makes it a favourite for Kutch and coastal sites.",
    sun: "Full sun", water: "Low to moderate", matureSize: "10–15 m tall", growth: "Moderate to fast",
    variants: [
      { sku: "KAR-3FT", label: "3–4 ft sapling", heightCm: 100, bag: "8 × 10 in bag", priceInr: 160, ageDays: 220 },
      { sku: "KAR-7FT", label: "6–8 ft young tree", heightCm: 220, bag: "14 × 14 in bag", priceInr: 600, ageDays: 540 },
    ],
  },
  {
    slug: "kesar-mango", name: "Kesar mango (grafted)", nameHi: "केसर आम (ग्राफ़्टेड)", botanical: "Mangifera indica 'Kesar'", species: "mango", category: "fruit", featured: true,
    tagline: "Fruits in 3 to 4 years", description: "Grafted Kesar, Gujarat's own mango. Flowers in January, fruits ripen from April to June.",
    sun: "Full sun", water: "Regular in the first two years", matureSize: "6–8 m tall, dome canopy", growth: "Moderate",
    variants: [
      { sku: "MANGO-2FT", label: "2–3 ft graft", heightCm: 75, bag: "10 × 12 in bag", priceInr: 450, ageDays: 260 },
      { sku: "MANGO-5FT", label: "5–6 ft fruiting-age graft", heightCm: 170, bag: "18 × 18 in bag", priceInr: 1500, ageDays: 720 },
    ],
  },
  {
    slug: "chikoo", name: "Chikoo (grafted)", nameHi: "चीकू (ग्राफ़्टेड)", botanical: "Manilkara zapota", species: "chikoo", category: "fruit",
    tagline: "Sweet fruit, nearly all year", description: "Compact evergreen that crops through most of the year once it settles. Ideal for farmhouses and backyards.",
    sun: "Full sun", water: "Moderate", matureSize: "5–8 m tall", growth: "Slow to moderate",
    variants: [
      { sku: "CHIKOO-2FT", label: "2–3 ft graft", heightCm: 70, bag: "10 × 12 in bag", priceInr: 400, ageDays: 280 },
      { sku: "CHIKOO-4FT", label: "4–5 ft graft", heightCm: 140, bag: "16 × 16 in bag", priceInr: 1200, ageDays: 700 },
    ],
  },
  {
    slug: "areca-palm", name: "Areca palm", nameHi: "एरेका पाम", botanical: "Dypsis lutescens", species: "areca", category: "palms", featured: true,
    tagline: "Clumping golden canes", description: "Graceful clumping palm for entrances, poolsides and screens. Grows happily in large pots too.",
    sun: "Bright light to part sun", water: "Regular", matureSize: "4–6 m tall", growth: "Moderate",
    variants: [
      { sku: "ARECA-3FT", label: "3 ft clump", heightCm: 90, bag: "10 × 12 in bag", priceInr: 350, ageDays: 360 },
      { sku: "ARECA-6FT", label: "6 ft clump", heightCm: 180, bag: "18 × 18 in bag", priceInr: 1100, ageDays: 900 },
    ],
  },
  {
    slug: "foxtail-palm", name: "Foxtail palm", nameHi: "फॉक्सटेल पाम", botanical: "Wodyetia bifurcata", species: "foxtail", category: "palms",
    tagline: "Bushy fronds, clean trunk", description: "Fronds like a fox's tail on a smooth grey trunk. The statement palm for avenues, villas and resort driveways.",
    sun: "Full sun", water: "Moderate", matureSize: "8–10 m tall", growth: "Moderate",
    variants: [
      { sku: "FOX-4FT", label: "4 ft palm", heightCm: 120, bag: "14 × 14 in bag", priceInr: 1200, ageDays: 540 },
      { sku: "FOX-8FT", label: "8 ft palm", heightCm: 240, bag: "24 × 24 in bag", priceInr: 4500, ageDays: 1300 },
    ],
  },
  {
    slug: "bougainvillea", name: "Bougainvillea", nameHi: "बोगनविलिया", botanical: "Bougainvillea glabra", species: "bougainvillea", category: "flowering", featured: true,
    tagline: "Colour for months on end", description: "Magenta bracts through the dry months and very little water. For walls, medians, terraces and gates.",
    sun: "Full sun", water: "Low", matureSize: "2–4 m, can be trained", growth: "Fast",
    variants: [
      { sku: "BOUG-2FT", label: "2 ft bush", heightCm: 60, bag: "8 × 10 in bag", priceInr: 150, ageDays: 150 },
      { sku: "BOUG-4FT", label: "4 ft bush", heightCm: 120, bag: "12 × 12 in bag", priceInr: 450, ageDays: 330 },
    ],
  },
  {
    slug: "hibiscus", name: "Hibiscus", nameHi: "गुड़हल", botanical: "Hibiscus rosa-sinensis", species: "hibiscus", category: "flowering",
    tagline: "Big red blooms, daily", description: "Large red flowers almost every day of the warm season. A garden and temple favourite.",
    sun: "Full to part sun", water: "Regular", matureSize: "1.5–2.5 m", growth: "Fast",
    variants: [
      { sku: "HIB-2FT", label: "2 ft bush", heightCm: 60, bag: "8 × 10 in bag", priceInr: 120, ageDays: 150 },
      { sku: "HIB-3FT", label: "3 ft bush", heightCm: 95, bag: "10 × 12 in bag", priceInr: 260, ageDays: 260 },
    ],
  },
  {
    slug: "ixora", name: "Ixora", nameHi: "इक्सोरा", botanical: "Ixora coccinea", species: "ixora", category: "flowering",
    tagline: "Orange clusters, neat habit", description: "Compact shrub with ball-shaped orange flower clusters. Holds its shape for borders and low hedges.",
    sun: "Full to part sun", water: "Regular", matureSize: "1–1.5 m", growth: "Moderate",
    variants: [
      { sku: "IXO-1FT", label: "1–1.5 ft bush", heightCm: 40, bag: "6 × 8 in bag", priceInr: 110, ageDays: 140 },
      { sku: "IXO-2FT", label: "2 ft bush", heightCm: 65, bag: "8 × 10 in bag", priceInr: 220, ageDays: 260 },
    ],
  },
  {
    slug: "golden-duranta", name: "Golden duranta hedge", nameHi: "गोल्डन ड्यूरांटा हेज", botanical: "Duranta erecta 'Gold'", species: "duranta", category: "hedges",
    tagline: "A bright boundary in one season", description: "Lime-gold foliage that takes clipping well. Sold as a pack of 25 for about 6 metres of hedge.",
    sun: "Full sun", water: "Moderate", matureSize: "Kept at 0.6–1.2 m", growth: "Fast",
    variants: [
      { sku: "DUR-25", label: "Pack of 25, 1 ft", heightCm: 35, bag: "6 × 8 in bags", priceInr: 1250, ageDays: 120 },
      { sku: "DUR-25L", label: "Pack of 25, 2 ft", heightCm: 65, bag: "8 × 10 in bags", priceInr: 2400, ageDays: 240 },
    ],
  },
  {
    slug: "snake-plant", name: "Snake plant", nameHi: "स्नेक प्लांट", botanical: "Dracaena trifasciata", species: "snake", category: "indoor",
    tagline: "Thrives on neglect", description: "Upright banded leaves that tolerate low light and missed waterings. For offices, lobbies and bedrooms.",
    sun: "Low to bright indirect light", water: "Every 2–3 weeks", matureSize: "0.6–1 m", growth: "Slow",
    variants: [
      { sku: "SNAKE-1FT", label: "1–1.5 ft, 8 in pot", heightCm: 45, bag: "8 in pot", priceInr: 349, ageDays: 240 },
      { sku: "SNAKE-2FT", label: "2 ft, 10 in pot", heightCm: 70, bag: "10 in pot", priceInr: 649, ageDays: 420 },
    ],
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const variantBySku = (sku: string) => {
  for (const p of products) {
    const v = p.variants.find((x) => x.sku === sku);
    if (v) return { product: p, variant: v };
  }
  return undefined;
};
