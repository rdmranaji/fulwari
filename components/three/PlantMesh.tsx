"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  CanvasTexture, Color, CylinderGeometry, DoubleSide, InstancedBufferAttribute, InstancedMesh, LatheGeometry,
  Matrix4, MeshStandardMaterial, PlaneGeometry, Quaternion, RepeatWrapping, Shape, ShapeGeometry, SphereGeometry,
  SRGBColorSpace, Vector2, Vector3, type BufferGeometry,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { generatePlant, POT_TOP, type Emitter, type GrowthInfo } from "./plantGen";
import { SPECIES, type SpeciesKey } from "./species";

const MAX = { wood: 2200, leaf: 9000, flower: 2500, fruit: 500, sword: 40 };
const UP = new Vector3(0, 1, 0);

function leafGeo() {
  const s = new Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.55, 0.22, 0.48, 0.78, 0, 1);
  s.bezierCurveTo(-0.48, 0.78, -0.55, 0.22, 0, 0);
  const g = new ShapeGeometry(s, 5);
  // gentle fold along the midrib so leaves catch light
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.abs(p.getX(i)) * 0.35 - p.getY(i) * p.getY(i) * 0.15);
  g.computeVertexNormals();
  return g;
}
function flowerGeo() {
  const parts: BufferGeometry[] = [];
  for (let i = 0; i < 5; i++) {
    const s = new Shape();
    s.moveTo(0, 0); s.bezierCurveTo(0.45, 0.3, 0.4, 0.95, 0, 1); s.bezierCurveTo(-0.4, 0.95, -0.45, 0.3, 0, 0);
    const g = new ShapeGeometry(s, 4);
    g.rotateZ((i / 5) * Math.PI * 2);
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k); p.setZ(k, (x * x + y * y) * 0.35); }
    parts.push(g);
  }
  const m = mergeGeometries(parts)!; m.computeVertexNormals(); return m;
}
function swordGeo() {
  const g = new PlaneGeometry(1, 1, 1, 10);
  g.translate(0, 0.5, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const w = y < 0.7 ? 1 - y * 0.15 : (1 - y) / 0.3 * 0.85;
    p.setX(i, p.getX(i) * w);
    p.setZ(i, Math.abs(p.getX(i)) * 0.25);
  }
  g.computeVertexNormals();
  return g;
}
function swordTex() {
  const c = document.createElement("canvas"); c.width = 64; c.height = 256;
  const x = c.getContext("2d")!;
  x.fillStyle = "#1f4d2a"; x.fillRect(0, 0, 64, 256);
  for (let y = 0; y < 256; y += 9) { x.fillStyle = y % 18 ? "#3f7a43" : "#6f9a5c"; x.fillRect(6, y, 52, 3 + (y % 5)); }
  x.fillStyle = "#d8cf52"; x.fillRect(0, 0, 5, 256); x.fillRect(59, 0, 5, 256);
  const t = new CanvasTexture(c); t.wrapS = t.wrapT = RepeatWrapping; t.colorSpace = SRGBColorSpace; return t;
}

class Writer implements Emitter {
  n = { wood: 0, leaf: 0, flower: 0, fruit: 0, sword: 0 };
  m = new Matrix4(); s = new Vector3(); qq = new Quaternion();
  constructor(public meshes: Record<keyof typeof MAX, InstancedMesh>) {}
  begin() { for (const k in this.n) this.n[k as keyof typeof MAX] = 0; }
  private put(k: keyof typeof MAX, c?: Color) {
    const i = this.n[k]; if (i >= MAX[k]) return;
    const mesh = this.meshes[k]; mesh.setMatrixAt(i, this.m); if (c) mesh.setColorAt(i, c); this.n[k]++;
  }
  wood(start: Vector3, dir: Vector3, len: number, rad: number, color: Color) {
    this.qq.setFromUnitVectors(UP, dir); this.s.set(rad, len, rad); this.m.compose(start, this.qq, this.s); this.put("wood", color);
  }
  leaf(pos: Vector3, q: Quaternion, sx: number, sy: number, color: Color) { this.s.set(sx, sy, sx); this.m.compose(pos, q, this.s); this.put("leaf", color); }
  flower(pos: Vector3, q: Quaternion, s: number, color: Color) { this.s.set(s, s, s); this.m.compose(pos, q, this.s); this.put("flower", color); }
  fruit(pos: Vector3, sx: number, sy: number, color: Color) { this.qq.identity(); this.s.set(sx, sy, sx); this.m.compose(pos, this.qq, this.s); this.put("fruit", color); }
  sword(pos: Vector3, q: Quaternion, sx: number, sy: number) { this.s.set(sx, sy, 1); this.m.compose(pos, q, this.s); this.put("sword"); }
  end() {
    for (const k in this.n) {
      const mesh = this.meshes[k as keyof typeof MAX];
      mesh.count = this.n[k as keyof typeof MAX];
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }
}

export type DaysSource = { days: number };

/** Renders one species at the days held in `src.days`, regenerating only when the value changes. */
export function PlantMesh({ species, src, onInfo, seed = 7 }: { species: SpeciesKey; src: DaysSource; onInfo?: (i: GrowthInfo) => void; seed?: number }) {
  const geos = useMemo(() => {
    const wood = new CylinderGeometry(0.72, 1, 1, 7, 1); wood.translate(0, 0.5, 0);
    return { wood, leaf: leafGeo(), flower: flowerGeo(), fruit: new SphereGeometry(1, 12, 10), sword: swordGeo() };
  }, []);
  const mats = useMemo(() => ({
    wood: new MeshStandardMaterial({ roughness: 0.92 }),
    leaf: new MeshStandardMaterial({ roughness: 0.55, side: DoubleSide }),
    flower: new MeshStandardMaterial({ roughness: 0.45, side: DoubleSide, emissive: new Color("#220000"), emissiveIntensity: 0.4 }),
    fruit: new MeshStandardMaterial({ roughness: 0.35 }),
    sword: new MeshStandardMaterial({ roughness: 0.5, side: DoubleSide, map: swordTex() }),
  }), []);
  const refs = { wood: useRef<InstancedMesh>(null), leaf: useRef<InstancedMesh>(null), flower: useRef<InstancedMesh>(null), fruit: useRef<InstancedMesh>(null), sword: useRef<InstancedMesh>(null) };
  const writer = useRef<Writer | null>(null);
  const last = useRef({ days: -1, species: "" });

  useFrame(() => {
    const ms = { wood: refs.wood.current, leaf: refs.leaf.current, flower: refs.flower.current, fruit: refs.fruit.current, sword: refs.sword.current };
    if (!ms.wood || !ms.leaf || !ms.flower || !ms.fruit || !ms.sword) return;
    if (!writer.current) {
      for (const k of ["wood", "leaf", "flower", "fruit"] as const) ms[k]!.instanceColor = new InstancedBufferAttribute(new Float32Array(MAX[k] * 3).fill(1), 3);
      writer.current = new Writer(ms as Record<keyof typeof MAX, InstancedMesh>);
    }
    const d = Math.round(src.days * 4) / 4;
    if (d === last.current.days && species === last.current.species) return;
    last.current = { days: d, species };
    writer.current.begin();
    const info = generatePlant(SPECIES[species], d, writer.current, seed);
    writer.current.end();
    onInfo?.(info);
  });

  return (
    <group>
      {(Object.keys(MAX) as (keyof typeof MAX)[]).map((k) => (
        <instancedMesh key={k} ref={refs[k]} args={[geos[k], mats[k], MAX[k]]} castShadow={k !== "flower"} frustumCulled={false} />
      ))}
    </group>
  );
}

/** Nursery bag, planted mound or terracotta pot, depending on the stage */
export function Container({ species, src, height }: { species: SpeciesKey; src: DaysSource; height: { current: number } }) {
  const sp = SPECIES[species];
  const bag = useRef<THREE_Group>(null);
  const mound = useRef<THREE_Group>(null);
  const pot = useMemo(() => {
    const pts = [new Vector2(0.11, 0), new Vector2(0.14, 0.02), new Vector2(0.17, POT_TOP - 0.03), new Vector2(0.19, POT_TOP - 0.02), new Vector2(0.19, POT_TOP), new Vector2(0.165, POT_TOP)];
    return new LatheGeometry(pts, 28);
  }, []);
  useFrame(() => {
    const inBag = sp.container === "bag" && src.days < sp.plantOut;
    if (bag.current) {
      bag.current.visible = inBag;
      const rr = Math.min(0.3, 0.05 + height.current * 0.07);
      bag.current.scale.set(rr, rr * 1.15, rr);
    }
    if (mound.current) {
      mound.current.visible = sp.container === "bag" && !inBag;
      const rr = Math.min(1.4, 0.3 + height.current * 0.12);
      mound.current.scale.set(rr, 1, rr);
    }
  });
  if (sp.container === "pot") {
    return (
      <group>
        <mesh geometry={pot} castShadow receiveShadow><meshStandardMaterial color="#b8653a" roughness={0.85} side={DoubleSide} /></mesh>
        <mesh position={[0, POT_TOP - 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.17, 24]} /><meshStandardMaterial color="#3b2a1d" roughness={1} /></mesh>
      </group>
    );
  }
  return (
    <group>
      <group ref={bag}>
        <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1, 0.92, 1, 20, 3]} />
          <meshStandardMaterial color="#1a1d1a" roughness={0.7} metalness={0.05} />
        </mesh>
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.98, 24]} /><meshStandardMaterial color="#4a3322" roughness={1} /></mesh>
      </group>
      <group ref={mound}>
        <mesh position={[0, -0.02, 0]} scale={[1, 0.08, 1]} receiveShadow><sphereGeometry args={[1, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#5a3e27" roughness={1} /></mesh>
      </group>
    </group>
  );
}
type THREE_Group = import("three").Group;
