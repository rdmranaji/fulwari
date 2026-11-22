import { Color, Euler, Quaternion, Vector3 } from "three";
import { doyOf, growthOf, type PalmSpec, type RosetteSpec, type Species, type TreeSpec } from "./species";

export interface Emitter {
  wood(start: Vector3, dir: Vector3, len: number, rad: number, color: Color): void;
  leaf(pos: Vector3, q: Quaternion, sx: number, sy: number, color: Color): void;
  flower(pos: Vector3, q: Quaternion, s: number, color: Color): void;
  fruit(pos: Vector3, sx: number, sy: number, color: Color): void;
  sword(pos: Vector3, q: Quaternion, sx: number, sy: number): void;
}

export type GrowthInfo = { g: number; height: number; doy: number };

const UP = new Vector3(0, 1, 0);
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ease = (s: number) => s * (2 - s);

function rng(seed: number) {
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Intensity 0..1 of a seasonal window (handles wrap past 31 Dec) with soft edges */
export function windowAmt(doy: number, from: number, to: number, ramp = 16) {
  const len = (to - from + 365) % 365 || 365;
  const pos = (doy - from + 365) % 365;
  if (pos > len) return 0;
  return Math.max(0, Math.min(1, pos / ramp, (len - pos) / ramp));
}

const tmpC = new Color();
const q = new Quaternion();
const eul = new Euler();
let maxY = 0;
const track = (y: number) => { if (y > maxY) maxY = y; };

function perpAxes(dir: Vector3) {
  const a = Math.abs(dir.y) < 0.9 ? UP : new Vector3(1, 0, 0);
  const p1 = new Vector3().crossVectors(dir, a).normalize();
  const p2 = new Vector3().crossVectors(dir, p1).normalize();
  return [p1, p2] as const;
}

/* ---------------- Trees and shrubs ---------------- */
function growTree(sp: TreeSpec, g: number, doy: number, e: Emitter, seed: number) {
  const r = rng(seed);
  const leafC1 = new Color(sp.leaf.c1), leafC2 = new Color(sp.leaf.c2), bark = new Color(sp.bark);
  const greenWood = new Color("#5d8a3a");
  // season tint: summer slightly paler, monsoon lush
  const summer = windowAmt(doy, 75, 165, 30), monsoon = windowAmt(doy, 166, 273, 25);
  const tint = new Color(1 - 0.06 * monsoon, 1 - 0.04 * summer + 0.04 * monsoon, 1 - 0.18 * summer);
  const drop = sp.deciduous ? sp.deciduous.amount * windowAmt(doy, sp.deciduous.from, sp.deciduous.to, 18) : 0;
  const bloom = sp.flower ? windowAmt(doy, sp.flower.from, sp.flower.to, 18) : 0;
  const fruitAmt = sp.fruit ? windowAmt(doy, sp.fruit.from, sp.fruit.to, 20) : 0;
  const fruitRipe = sp.fruit ? clamp01(((doy - sp.fruit.from + 365) % 365) / Math.max(1, (sp.fruit.to - sp.fruit.from + 365) % 365 || 365)) : 0;
  const fC1 = sp.flower ? new Color(sp.flower.c1) : tmpC, fC2 = sp.flower ? new Color(sp.flower.c2) : tmpC;
  const frC1 = sp.fruit ? new Color(sp.fruit.c1) : tmpC, frC2 = sp.fruit ? new Color(sp.fruit.c2) : tmpC;
  const G = g * 1.08;
  const H = sp.height;
  const thick = 0.05 + 0.95 * Math.pow(g, 1.1);

  const clampP = (p: Vector3, origin: Vector3) => {
    if (!sp.prune) return p;
    const { h, w, d } = sp.prune;
    p.y = Math.min(p.y, h * (0.3 + 0.7 * g) + 0.05);
    p.x = origin.x + Math.max(-w, Math.min(w, p.x - origin.x));
    p.z = Math.max(-d, Math.min(d, p.z));
    return p;
  };

  const node = (depth: number, start: Vector3, dir: Vector3, birth: number, dur: number, lenFull: number, rad: number, origin: Vector3) => {
    const isTip = depth === sp.depth;
    const n = isTip ? 0 : depth === 0 && sp.stems > 1 ? sp.children + 1 : sp.children + (r() < 0.35 ? 1 : 0);
    const kids: { frac: number; az: number; el: number; lm: number }[] = [];
    for (let i = 0; i < n; i++) {
      const apical = i === 0 && sp.stems === 1;
      kids.push({
        frac: apical ? 1 : sp.branchStart + (1 - sp.branchStart) * ((i + 0.5) / n) * (0.85 + 0.3 * r()),
        az: i * 2.39996 + r() * 1.2,
        el: apical ? 0.12 + 0.12 * r() : sp.spread * (0.7 + 0.6 * r()),
        lm: sp.lenDecay * (apical ? 0.95 : 0.78 + 0.35 * r()),
      });
    }
    const leaves: number[][] = [];
    const juvenile = depth < sp.leaf.from;
    const nl = juvenile ? 14 : sp.leaf.per + (isTip ? sp.leaf.tip : 0);
    for (let k = 0; k < nl; k++) leaves.push([r(), r(), r(), r(), r(), r(), r(), r()]);
    const fl: number[][] = [];
    const nf = sp.flower && depth >= sp.depth - 1 ? sp.flower.per : 0;
    for (let k = 0; k < nf; k++) fl.push([r(), r(), r(), r(), r(), r()]);
    const fr: number[][] = [];
    const nfr = sp.fruit && depth === sp.depth - 1 ? sp.fruit.per : 0;
    for (let k = 0; k < nfr; k++) fr.push([r(), r(), r(), r()]);

    const s = clamp01((G - birth) / dur);
    if (s > 0) {
      const es = ease(s);
      const len = lenFull * es;
      const radius = rad * thick * (0.55 + 0.45 * es);
      const woodC = depth >= sp.depth - 1 ? tmpC.copy(bark).lerp(greenWood, 0.55) : bark;
      e.wood(start, dir, len, radius, woodC);
      track(start.y + dir.y * len);
      const tip = start.clone().addScaledVector(dir, len);
      const [p1, p2] = perpAxes(dir);
      // leaves
      for (let k = 0; k < nl; k++) {
        const [a, b, c, d, sz, col, rank, t0] = leaves[k];
        const onTip = !juvenile && k >= sp.leaf.per;
        const juvFade = juvenile ? clamp01(1 - (g - 0.4 - depth * 0.1) / 0.16) : 1;
        if (juvFade <= 0) continue;
        const t = onTip ? 1 : (k + 0.5) / (juvenile ? 14 : sp.leaf.per);
        const lb = juvenile ? birth + 0.004 + k * 0.0025 : birth + dur * (onTip ? 0.95 : t * 0.95) + 0.005;
        const ls = clamp01((G - lb) / 0.035);
        if (ls <= 0 || rank < drop) continue;
        const spreadR = onTip ? sp.leaf.size * 1.3 : sp.leaf.size * 0.35;
        const p = start.clone().addScaledVector(dir, juvenile ? len * (0.25 + 0.75 * t) : Math.min(len, lenFull * t));
        const ang = t0 * Math.PI * 2;
        p.addScaledVector(p1, Math.cos(ang) * spreadR * d).addScaledVector(p2, Math.sin(ang) * spreadR * d);
        if (onTip) p.y += (c - 0.3) * spreadR * 0.8;
        clampP(p, origin);
        eul.set(a * 6.283, b * 6.283, c * 6.283); q.setFromEuler(eul);
        const sc = sp.leaf.size * (0.7 + 0.6 * sz) * ease(ls) * (juvenile ? 0.45 * juvFade : 0.5 + 0.5 * Math.min(1, g * 1.5));
        tmpC.copy(leafC1).lerp(leafC2, col).multiply(tint);
        if (drop > 0 && rank < drop + 0.15) tmpC.lerp(new Color("#b9a23a"), 0.5);
        e.leaf(p, q, sc * sp.leaf.aspect, sc, tmpC);
        track(p.y + sc);
      }
      // flowers
      if (sp.flower && g > sp.flower.minG) {
        for (let k = 0; k < nf; k++) {
          const [a, b, c, rank, col, t0] = fl[k];
          if (rank > bloom * Math.min(1, (g - sp.flower.minG) * 4)) continue;
          const p = tip.clone();
          const R = sp.flower.size * 2.4;
          p.x += (a - 0.5) * R; p.y += (b - 0.2) * R * 0.8; p.z += (c - 0.5) * R;
          clampP(p, origin);
          eul.set(t0 * 6.28, a * 6.28, b * 6.28); q.setFromEuler(eul);
          tmpC.copy(fC1).lerp(fC2, col);
          e.flower(p, q, sp.flower.size * (0.75 + 0.5 * col), tmpC);
        }
      }
      // fruit
      if (sp.fruit && g > sp.fruit.minG) {
        for (let k = 0; k < nfr; k++) {
          const [a, b, rank, sz] = fr[k];
          if (rank > fruitAmt * Math.min(1, (g - sp.fruit.minG) * 3)) continue;
          const p = start.clone().addScaledVector(dir, len * (0.4 + 0.5 * a));
          p.y -= sp.fruit.size[1] * 1.6; p.x += (b - 0.5) * 0.2;
          tmpC.copy(frC1).lerp(frC2, Math.min(1, fruitRipe * 1.4 + sz * 0.15));
          e.fruit(p, sp.fruit.size[0] * (0.8 + 0.4 * sz), sp.fruit.size[1] * (0.8 + 0.4 * sz), tmpC);
        }
      }
      // cotyledons on the first stem while tiny
      if (depth === 0 && g < 0.08 && sp.stems === 1) {
        const cs = 0.035 * (1 - g / 0.08) + 0.01;
        tmpC.set("#7fbf4a");
        for (const sgn of [-1, 1]) {
          eul.set(0, 0, sgn * 1.1); q.setFromEuler(eul);
          e.leaf(tip, q, cs * 0.8, cs, tmpC);
        }
      }
    }
    // children (always recurse to keep the random sequence stable)
    for (const k of kids) {
      const cb = birth + dur * k.frac;
      const cs = start.clone().addScaledVector(dir, lenFull * k.frac);
      const [p1, p2] = perpAxes(dir);
      const axis = p1.clone().multiplyScalar(Math.cos(k.az)).addScaledVector(p2, Math.sin(k.az)).normalize();
      const cd = dir.clone().applyAxisAngle(axis, k.el);
      cd.lerp(UP, sp.upward).normalize();
      if (depth >= 1 && sp.flatten < 1) { cd.y *= sp.flatten; cd.normalize(); }
      node(depth + 1, cs, cd, cb, dur * sp.durDecay, lenFull * k.lm, rad * sp.radDecay, origin);
    }
  };

  const rows = sp.row ?? 1;
  for (let rI = 0; rI < rows; rI++) {
    const origin = new Vector3(rows > 1 && sp.prune ? (rI - (rows - 1) / 2) * sp.prune.w * 1.9 : 0, 0, 0);
    if (sp.stems === 1) {
      node(0, origin.clone(), UP.clone(), 0, sp.dur0, H * sp.trunkFrac, H * sp.radius, origin);
    } else {
      for (let s = 0; s < sp.stems; s++) {
        const az = s * 2.39996 + r();
        const lean = 0.25 + 0.3 * r();
        const d = new Vector3(Math.cos(az) * Math.sin(lean), Math.cos(lean), Math.sin(az) * Math.sin(lean)).normalize();
        const st = origin.clone().add(new Vector3(Math.cos(az) * 0.03, 0, Math.sin(az) * 0.03));
        node(1, st, d, s * 0.06, sp.dur0 * 0.85, H * sp.trunkFrac * (0.8 + 0.4 * r()), H * sp.radius * 0.7, origin);
      }
    }
  }
}

/* ---------------- Palms ---------------- */
function growPalm(sp: PalmSpec, g: number, doy: number, e: Emitter, seed: number) {
  const r = rng(seed);
  const trunkC = new Color(sp.trunk), rachisC = new Color(sp.rachis), l1 = new Color(sp.leaf.c1), l2 = new Color(sp.leaf.c2);
  const brown = new Color("#9b8a55");
  const H = sp.height;
  for (let si = 0; si < sp.stems; si++) {
    const ox = si === 0 ? 0 : Math.cos(si * 2.4 + r()) * 0.09 * (1 + si * 0.3);
    const oz = si === 0 ? 0 : Math.sin(si * 2.4 + r()) * 0.09 * (1 + si * 0.3);
    const leanAz = r() * 6.283, lean = si === 0 ? 0.02 : 0.08 + r() * 0.12, hMul = si === 0 ? 1 : 0.55 + 0.4 * r();
    const birth = si === 0 ? 0 : 0.12 + si * 0.13;
    const fr: number[][] = [];
    for (let j = 0; j < sp.fronds; j++) fr.push([r(), r(), r(), r()]);
    const gs = clamp01((g - birth) / (1 - birth));
    if (gs <= 0 && !(si === 0 && g === 0)) continue;
    const trunkH = H * 0.55 * hMul * Math.pow(Math.max(0, gs - 0.12) / 0.88, 1.3);
    const rad = sp.trunkRad * (0.35 + 0.65 * gs) * (si === 0 ? 1 : 0.7);
    let p = new Vector3(ox, 0, oz);
    const lv = new Vector3(Math.cos(leanAz), 0, Math.sin(leanAz));
    const SEG = 7;
    for (let k = 0; k < SEG && trunkH > 0.001; k++) {
      const d = UP.clone().addScaledVector(lv, lean * (k / SEG) * 2).normalize();
      const len = trunkH / SEG;
      const bulge = sp.brush ? 1 + 0.25 * Math.sin((k / SEG) * Math.PI) : 1 - 0.15 * (k / SEG);
      e.wood(p, d, len, rad * bulge, trunkC);
      p = p.clone().addScaledVector(d, len);
    }
    const crown = p; track(crown.y);
    // fronds
    for (let j = 0; j < sp.fronds; j++) {
      const [aJ, eJ, lJ, side] = fr[j];
      const fb = (j / sp.fronds) * 1.02 - sp.life * 0.6;
      const age = (gs * 1.05 - fb) / sp.life;
      if (age <= 0 || age >= 1) continue;
      const unfurl = clamp01(age / 0.12);
      const sm = age * age * (3 - 2 * age);
      let el = 1.35 - 0.85 * sm - (age > 0.72 ? (age - 0.72) * 2.6 : 0) + (eJ - 0.5) * 0.15;
      const az = j * 2.39996 + aJ * 0.4;
      const flen = sp.frondLen * H * (0.25 + 0.75 * gs) * (0.85 + 0.3 * lJ) * (0.35 + 0.65 * unfurl) * (si === 0 ? 1 : 0.8);
      const old = age > 0.85 ? (age - 0.85) / 0.15 : 0;
      let rp = crown.clone();
      const RS = 7;
      for (let k = 0; k < RS; k++) {
        const elk = el - k * sp.curve * (0.4 + unfurl);
        const d = new Vector3(Math.cos(elk) * Math.cos(az), Math.sin(elk), Math.cos(elk) * Math.sin(az)).normalize();
        const sl = flen / RS;
        tmpC.copy(rachisC).lerp(brown, old);
        e.wood(rp, d, sl, rad * 0.16 * (1 - k / RS * 0.6), tmpC);
        const side1 = new Vector3().crossVectors(d, UP).normalize();
        const t = (k + 0.5) / RS;
        const ll = flen * 0.32 * Math.sin(Math.PI * (0.15 + 0.8 * t)) * (0.5 + 0.5 * unfurl);
        const pairs = 3;
        for (let m = 0; m < pairs; m++) {
          const pos = rp.clone().addScaledVector(d, sl * (m + 0.5) / pairs);
          const dirs = sp.brush ? [0, 1, 2, 3] : [0, 1];
          for (const di of dirs) {
            let ld: Vector3;
            if (sp.brush) {
              const [p1, p2] = perpAxes(d);
              const a = di * 1.5708 + side * 0.6;
              ld = p1.clone().multiplyScalar(Math.cos(a)).addScaledVector(p2, Math.sin(a)).multiplyScalar(0.85).addScaledVector(d, 0.45);
            } else {
              const s = di === 0 ? 1 : -1;
              ld = side1.clone().multiplyScalar(s * 0.85).addScaledVector(d, 0.5).addScaledVector(UP, -0.18 - 0.3 * old);
            }
            ld.lerp(d, 1 - unfurl).normalize();
            q.setFromUnitVectors(UP, ld);
            tmpC.copy(l1).lerp(l2, (m + k) % 3 / 3 * 0.6 + 0.2 * side).lerp(brown, old * 0.9);
            e.leaf(pos, q, ll * 0.12, ll, tmpC);
            track(pos.y + ld.y * ll);
          }
        }
        rp = rp.clone().addScaledVector(d, sl);
      }
    }
  }
}

/* ---------------- Rosettes (snake plant) ---------------- */
function growRosette(sp: RosetteSpec, g: number, _doy: number, e: Emitter, seed: number, potTop: number) {
  const r = rng(seed);
  for (let i = 0; i < sp.leaves; i++) {
    const az = i * 2.39996 + r() * 0.4, tilt = 0.05 + r() * 0.22, hm = 0.55 + 0.45 * r(), off = r();
    const birth = (i / sp.leaves) * 0.85;
    const ls = clamp01((g - birth) / 0.28);
    if (ls <= 0) continue;
    const h = sp.height * hm * ease(ls) * (i < 3 ? 0.75 : 1);
    const w = 0.075 * (0.5 + 0.5 * ls);
    const dir = new Vector3(Math.cos(az) * Math.sin(tilt), Math.cos(tilt), Math.sin(az) * Math.sin(tilt)).normalize();
    const pos = new Vector3(Math.cos(az) * 0.035 * off, potTop, Math.sin(az) * 0.035 * off);
    q.setFromUnitVectors(UP, dir);
    const roll = new Quaternion().setFromAxisAngle(dir, -az + Math.PI / 2);
    q.premultiply(roll);
    e.sword(pos, q, w, h);
    track(potTop + h);
  }
}

export const POT_TOP = 0.26;

export function generatePlant(sp: Species, days: number, e: Emitter, seed = 7): GrowthInfo {
  maxY = 0;
  const g = growthOf(sp, days);
  const doy = doyOf(days);
  if (sp.start === "seed" && days < 8) {
    const soil = new Color("#6b4a2e");
    e.fruit(new Vector3(0, 0.008, 0), 0.012, 0.008, soil);
    if (days > 4) {
      tmpC.set("#e7e0c4");
      e.wood(new Vector3(0, 0, 0), UP, 0.012 * (days - 4) / 4, 0.002, tmpC);
    }
    return { g: 0, height: 0.03, doy };
  }
  if (sp.spec.kind === "tree") growTree(sp.spec, g, doy, e, seed);
  else if (sp.spec.kind === "palm") growPalm(sp.spec, g, doy, e, seed);
  else growRosette(sp.spec, g, doy, e, seed, POT_TOP);
  return { g, height: Math.max(0.05, maxY), doy };
}
