// Growth parameters for each species. Units are metres. Days of year: 1 Jan = 0.
// Plants are assumed sown or rooted on 1 July (start of monsoon), day-of-year 181.

export type SpeciesKey =
  | "neem" | "gulmohar" | "karanj" | "mango" | "chikoo"
  | "areca" | "foxtail" | "bougainvillea" | "hibiscus" | "ixora" | "duranta" | "snake";

type Window = { from: number; to: number };

export type TreeSpec = {
  kind: "tree";
  stems: number; height: number; trunkFrac: number; depth: number; children: number;
  branchStart: number; spread: number; lenDecay: number; dur0: number; durDecay: number;
  upward: number; flatten: number; radius: number; radDecay: number; bark: string;
  leaf: { c1: string; c2: string; size: number; per: number; from: number; aspect: number; tip: number };
  flower?: Window & { c1: string; c2: string; per: number; size: number; minG: number };
  fruit?: Window & { c1: string; c2: string; per: number; size: [number, number]; minG: number };
  deciduous?: Window & { amount: number };
  prune?: { h: number; w: number; d: number };
  row?: number;
};

export type PalmSpec = {
  kind: "palm";
  stems: number; height: number; fronds: number; life: number; frondLen: number; trunkRad: number;
  trunk: string; rachis: string; leaf: { c1: string; c2: string }; brush: boolean; curve: number;
};

export type RosetteSpec = { kind: "rosette"; height: number; leaves: number };

export type Species = {
  key: SpeciesKey; label: string; matureDays: number; plantOut: number; start: "seed" | "cutting";
  container: "bag" | "pot"; spec: TreeSpec | PalmSpec | RosetteSpec; note: string;
};

const tree = (o: Partial<TreeSpec> & Pick<TreeSpec, "height" | "leaf" | "bark">): TreeSpec => ({
  kind: "tree", stems: 1, trunkFrac: 0.3, depth: 5, children: 3, branchStart: 0.6, spread: 0.62,
  lenDecay: 0.72, dur0: 0.32, durDecay: 0.7, upward: 0.15, flatten: 1, radius: 0.02, radDecay: 0.62, ...o,
});

export const SPECIES: Record<SpeciesKey, Species> = {
  neem: {
    key: "neem", label: "Neem", matureDays: 1460, plantOut: 240, start: "seed", container: "bag",
    note: "Evergreen. Sheds and renews leaves briefly in March.",
    spec: tree({ height: 8, bark: "#5a3f2a", leaf: { c1: "#2c6a2a", c2: "#4f8f36", size: 0.55, per: 11, from: 3, aspect: 0.55, tip: 16 },
      deciduous: { from: 60, to: 90, amount: 0.35 }, flower: { from: 75, to: 110, c1: "#f3f1d8", c2: "#e6e2b4", per: 3, size: 0.07, minG: 0.55 } }),
  },
  gulmohar: {
    key: "gulmohar", label: "Gulmohar", matureDays: 1460, plantOut: 240, start: "seed", container: "bag",
    note: "Leafless in late winter, scarlet bloom April to June.",
    spec: tree({ height: 8, bark: "#6b5440", flatten: 0.45, spread: 0.8, upward: 0.05, lenDecay: 0.76,
      leaf: { c1: "#4c9a3a", c2: "#86c25a", size: 0.5, per: 11, from: 3, aspect: 0.6, tip: 16 },
      deciduous: { from: 30, to: 100, amount: 0.8 },
      flower: { from: 92, to: 175, c1: "#e8331f", c2: "#ff7a1a", per: 11, size: 0.17, minG: 0.45 } }),
  },
  karanj: {
    key: "karanj", label: "Karanj", matureDays: 1460, plantOut: 240, start: "seed", container: "bag",
    note: "Glossy evergreen, lilac flowers in spring.",
    spec: tree({ height: 9, bark: "#5e5245", leaf: { c1: "#25602a", c2: "#3f8a35", size: 0.55, per: 11, from: 3, aspect: 0.62, tip: 16 },
      flower: { from: 75, to: 125, c1: "#c9a6e6", c2: "#efd9ff", per: 4, size: 0.07, minG: 0.5 } }),
  },
  mango: {
    key: "mango", label: "Kesar mango", matureDays: 1825, plantOut: 270, start: "seed", container: "bag",
    note: "Flowers in January, Kesar fruit ripens April to June.",
    spec: tree({ height: 7, bark: "#4e3a2b", spread: 0.72, children: 3, upward: 0.08, radius: 0.03,
      leaf: { c1: "#1f5424", c2: "#3b7d30", size: 0.55, per: 10, from: 2, aspect: 0.42, tip: 16 },
      flower: { from: 0, to: 45, c1: "#f1d9a0", c2: "#e9c27a", per: 3, size: 0.09, minG: 0.55 },
      fruit: { from: 60, to: 170, c1: "#4f8f2a", c2: "#f2b120", per: 2, size: [0.07, 0.1], minG: 0.6 } }),
  },
  chikoo: {
    key: "chikoo", label: "Chikoo", matureDays: 1825, plantOut: 270, start: "seed", container: "bag",
    note: "Evergreen, fruits through most of the year once mature.",
    spec: tree({ height: 6, bark: "#4a3a30", spread: 0.66, upward: 0.12,
      leaf: { c1: "#255a29", c2: "#3e7a32", size: 0.5, per: 10, from: 2, aspect: 0.45, tip: 15 },
      fruit: { from: 0, to: 364, c1: "#8a6a3e", c2: "#9b7444", per: 2, size: [0.06, 0.07], minG: 0.6 } }),
  },
  areca: {
    key: "areca", label: "Areca palm", matureDays: 1825, plantOut: 300, start: "seed", container: "bag",
    note: "Clumping. New canes keep rising from the base.",
    spec: { kind: "palm", stems: 5, height: 5, fronds: 30, life: 0.38, frondLen: 0.42, trunkRad: 0.045,
      trunk: "#b9b45a", rachis: "#c7b84a", leaf: { c1: "#4f9a34", c2: "#8cc63f" }, brush: false, curve: 0.13 },
  },
  foxtail: {
    key: "foxtail", label: "Foxtail palm", matureDays: 2190, plantOut: 360, start: "seed", container: "bag",
    note: "Single smooth trunk with bottlebrush fronds.",
    spec: { kind: "palm", stems: 1, height: 9, fronds: 34, life: 0.36, frondLen: 0.36, trunkRad: 0.16,
      trunk: "#9a9790", rachis: "#6f8f3a", leaf: { c1: "#2f7a2d", c2: "#5aa845" }, brush: true, curve: 0.11 },
  },
  bougainvillea: {
    key: "bougainvillea", label: "Bougainvillea", matureDays: 365, plantOut: 120, start: "cutting", container: "bag",
    note: "Bracts peak in the dry months, October to May.",
    spec: tree({ height: 2.4, stems: 5, depth: 4, trunkFrac: 0.28, bark: "#6a5236", spread: 0.75, lenDecay: 0.78, radius: 0.02, upward: 0.05,
      leaf: { c1: "#3d7d2f", c2: "#5c9a3c", size: 0.12, per: 6, from: 1, aspect: 0.7, tip: 6 },
      flower: { from: 275, to: 150, c1: "#d6247f", c2: "#f0479b", per: 9, size: 0.09, minG: 0.25 } }),
  },
  hibiscus: {
    key: "hibiscus", label: "Hibiscus", matureDays: 365, plantOut: 120, start: "cutting", container: "bag",
    note: "Blooms through the warm months, February to November.",
    spec: tree({ height: 2, stems: 4, depth: 4, trunkFrac: 0.3, bark: "#5a4a35", spread: 0.55, upward: 0.2, radius: 0.018,
      leaf: { c1: "#1f5a24", c2: "#357a2d", size: 0.14, per: 6, from: 1, aspect: 0.75, tip: 7 },
      flower: { from: 35, to: 320, c1: "#d7191f", c2: "#ff3b30", per: 2, size: 0.12, minG: 0.25 } }),
  },
  ixora: {
    key: "ixora", label: "Ixora", matureDays: 365, plantOut: 120, start: "cutting", container: "bag",
    note: "Orange clusters most of the year, strongest after the monsoon.",
    spec: tree({ height: 1.3, stems: 5, depth: 4, trunkFrac: 0.3, bark: "#4f3f2c", spread: 0.6, upward: 0.18, radius: 0.014,
      leaf: { c1: "#1e5223", c2: "#2f6e2a", size: 0.1, per: 6, from: 1, aspect: 0.5, tip: 8 },
      flower: { from: 150, to: 60, c1: "#ff6a13", c2: "#ff8f2b", per: 6, size: 0.06, minG: 0.25 } }),
  },
  duranta: {
    key: "duranta", label: "Golden duranta", matureDays: 300, plantOut: 110, start: "cutting", container: "bag",
    note: "Clipped into a neat lime-gold hedge.",
    spec: tree({ height: 1.1, stems: 4, depth: 4, trunkFrac: 0.3, bark: "#6a5a3a", spread: 0.7, upward: 0.12, radius: 0.012, row: 3,
      leaf: { c1: "#a6c83a", c2: "#d4e04a", size: 0.09, per: 7, from: 1, aspect: 0.6, tip: 8 },
      prune: { h: 0.95, w: 0.42, d: 0.32 } }),
  },
  snake: {
    key: "snake", label: "Snake plant", matureDays: 720, plantOut: 99999, start: "cutting", container: "pot",
    note: "Slow and steady. New leaves rise from the centre.",
    spec: { kind: "rosette", height: 0.85, leaves: 11 },
  },
};

export const SPECIES_LIST = Object.values(SPECIES);

/** Map days since planting to a growth fraction 0..1 */
export function growthOf(sp: Species, days: number) {
  const germ = sp.start === "seed" ? 8 : 0;
  if (days < germ) return 0;
  const u = Math.min(1, (days - germ) / sp.matureDays);
  const g = Math.pow(u, 1.15);
  return sp.start === "cutting" ? 0.06 + 0.94 * g : g;
}

export const PLANTED_DOY = 181;
export const doyOf = (days: number) => (((PLANTED_DOY + Math.floor(days)) % 365) + 365) % 365;

export function seasonOf(doy: number): "Winter" | "Summer" | "Monsoon" | "Post-monsoon" {
  if (doy < 59 || doy >= 334) return "Winter";
  if (doy < 166) return "Summer";
  if (doy < 274) return "Monsoon";
  return "Post-monsoon";
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_START = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
export const monthOf = (doy: number) => { let m = 0; for (let i = 0; i < 12; i++) if (doy >= MONTH_START[i]) m = i; return MONTHS[m]; };

export function stageOf(sp: Species, days: number) {
  if (sp.start === "seed" && days < 8) return "Seed";
  if (days < 30) return sp.start === "seed" ? "Sprouting" : "Rooting";
  if (sp.container === "pot") return days < sp.matureDays * 0.5 ? "Growing in the nursery" : days < sp.matureDays ? "Young plant" : "Mature";
  if (days < sp.plantOut * 0.6) return "Seedling in the nursery";
  if (days < sp.plantOut) return "Hardening for dispatch";
  if (days < sp.matureDays * 0.55) return "Establishing at site";
  if (days < sp.matureDays) return "Young plant";
  return "Mature";
}

export function ageLabel(days: number) {
  const d = Math.floor(days);
  if (d < 60) return `Day ${d}`;
  const y = Math.floor(d / 365), m = Math.floor((d % 365) / 30.4);
  if (y === 0) return `${m} months`;
  return m ? `${y} yr ${m} mo` : `${y} yr`;
}
