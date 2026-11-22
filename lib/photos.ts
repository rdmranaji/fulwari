// Real photography for the site. Each slot names a Wikipedia article; scripts/fetch-photos.mjs picks
// the Nth photo from that article's media, keeps only freely licensed files (CC BY / BY-SA / CC0 / PD)
// from Wikimedia Commons, downloads them into public/photos and records the credits.
// Replace any slot with Fulwari's own photos later by dropping a file in public/photos and editing generated.json.
import generated from "./photos.generated.json";

export type Photo = { src: string; srcSm: string; w: number; h: number; alt: string; credit: string; license: string; page: string };

export const PHOTO_SLOTS: Record<string, { wiki: string; index: number; alt: string; file?: string; prefer?: string }> = {
  hero: { wiki: "Delonix_regia", index: 0, alt: "Gulmohar tree in full scarlet bloom", file: "File:Royal Poinciana.jpg" },
  "story-seed": { wiki: "Seed", index: 0, alt: "Seeds" },
  "story-sprout": { wiki: "Seedling", index: 0, alt: "A young seedling", prefer: "seedling|sprout|germinat" },
  "story-nursery": { wiki: "Plant_nursery", index: 0, alt: "Rows of young plants in a nursery", file: "File:Cutchogue - Oregon Road - Plant Nursery.jpg" },
  "story-planting": { wiki: "Tree_planting", index: 0, alt: "Planting a young tree", prefer: "planting|plant" },
  "story-bloom": { wiki: "Delonix_regia", index: 0, alt: "Gulmohar canopy in flower", prefer: "flower|bloom|blossom|tree|gulmohar|flame" },
  "door-b2b": { wiki: "Tree_planting", index: 0, alt: "A large tree-planting drive", file: "File:Tree planting Ghana 2.jpg" },
  "door-b2c": { wiki: "Bougainvillea", index: 0, alt: "Bougainvillea in bloom", file: "File:Pink paperflowers (Bougainvillea glabra).jpg" },
  visit: { wiki: "Plant_nursery", index: 0, alt: "Walking through a plant nursery", prefer: "nursery|greenhouse|garden cent" },
  // products: index 0..2 are used for the gallery
  neem: { wiki: "Azadirachta_indica", index: 0, alt: "Neem tree" },
  gulmohar: { wiki: "Delonix_regia", index: 0, alt: "Gulmohar" },
  karanj: { wiki: "Millettia_pinnata", index: 0, alt: "Karanj (Pongamia)" },
  "kesar-mango": { wiki: "Mangifera_indica", index: 0, alt: "Mango tree" },
  chikoo: { wiki: "Manilkara_zapota", index: 0, alt: "Chikoo (sapodilla)" },
  "areca-palm": { wiki: "Dypsis_lutescens", index: 0, alt: "Areca palm" },
  "foxtail-palm": { wiki: "Wodyetia", index: 0, alt: "Foxtail palm" },
  bougainvillea: { wiki: "Bougainvillea", index: 0, alt: "Bougainvillea" },
  hibiscus: { wiki: "Hibiscus_rosa-sinensis", index: 0, alt: "Red hibiscus" },
  ixora: { wiki: "Ixora_coccinea", index: 0, alt: "Ixora flower cluster" },
  "golden-duranta": { wiki: "Duranta_erecta", index: 0, alt: "Duranta" },
  "snake-plant": { wiki: "Dracaena_trifasciata", index: 0, alt: "Snake plant" },
};

const data = generated as Record<string, Photo[]>;
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const withBase = (p: Photo): Photo => (p.src.startsWith("/") ? { ...p, src: base + p.src, srcSm: base + p.srcSm } : p);

/** Photos for a slot (products get up to 3 for the gallery). Empty when the photos have not been fetched yet. */
export function photos(key: string): Photo[] { return (data[key] || []).map(withBase); }
export function photo(key: string, i = 0): Photo | undefined { const l = photos(key); return l[i] ?? l[0]; }
export function allCredits() {
  const seen = new Map<string, Photo>();
  for (const k of Object.keys(data)) for (const p of data[k]) seen.set(p.src, p);
  return [...seen.values()];
}
