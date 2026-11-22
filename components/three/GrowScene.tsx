"use client";
import { ContactShadows, OrbitControls, Sky } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, Fog, InstancedMesh, Matrix4, Object3D, Vector3, type Group, type DirectionalLight, type HemisphereLight, type Mesh, type MeshStandardMaterial } from "three";
import type { OrbitControls as OC } from "three-stdlib";
import { windowAmt, type GrowthInfo } from "./plantGen";
import { Container, PlantMesh, type DaysSource } from "./PlantMesh";
import { SPECIES, doyOf, type SpeciesKey } from "./species";

export type Clock = DaysSource & { playing: boolean; speed: number; max: number; loop: boolean; target?: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function Rig({ height, interactive, autoRotate, frame }: { height: { current: number }; interactive: boolean; autoRotate: boolean; frame: number }) {
  const controls = useRef<OC>(null);
  const { camera } = useThree();
  const dist = useRef(1);
  const ty = useRef(0.2);
  useFrame((_, dt) => {
    const h = Math.max(0.06, height.current);
    const want = Math.max(0.45, h * frame + 0.35);
    dist.current = lerp(dist.current, want, Math.min(1, dt * 2.2));
    ty.current = lerp(ty.current, h * 0.52, Math.min(1, dt * 2.2));
    const c = controls.current;
    const target = c ? c.target : new Vector3();
    target.set(0, ty.current, 0);
    const off = camera.position.clone().sub(target);
    if (off.length() < 1e-3) off.set(0.6, 0.25, 1);
    off.setLength(dist.current);
    if (off.y < dist.current * 0.05) off.y = dist.current * 0.05;
    camera.position.copy(target).add(off);
    camera.lookAt(target);
    c?.update();
  });
  return <OrbitControls ref={controls as never} enableZoom={false} enablePan={false} enabled={interactive} autoRotate={autoRotate} autoRotateSpeed={0.6} minPolarAngle={0.35} maxPolarAngle={1.5} enableDamping />;
}

/** Background field of nursery rows and distant trees for scale */
function Field() {
  const bags = useRef<InstancedMesh>(null);
  const tops = useRef<InstancedMesh>(null);
  const trees = useRef<InstancedMesh>(null);
  useMemo(() => null, []);
  const once = useRef(false);
  useFrame(() => {
    if (once.current || !bags.current || !tops.current || !trees.current) return;
    once.current = true;
    const o = new Object3D(); let i = 0; let s = 3;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let row = 0; row < 7; row++) for (let k = 0; k < 26; k++) {
      const x = -13 + k * 1.05 + rnd() * 0.2, z = -7 - row * 1.4;
            const sc = 0.55 + rnd() * 0.5;
      o.position.set(x, 0.12 * sc, z); o.scale.set(0.12 * sc, 0.24 * sc, 0.12 * sc); o.rotation.set(0, 0, 0); o.updateMatrix(); bags.current.setMatrixAt(i, o.matrix);
      o.position.set(x, 0.24 * sc + 0.28 * sc, z); o.scale.setScalar(0.3 * sc); o.updateMatrix(); tops.current.setMatrixAt(i, o.matrix);
      tops.current.setColorAt(i, new Color().setHSL(0.27 + rnd() * 0.06, 0.45, 0.28 + rnd() * 0.1));
      i++;
    }
    bags.current.count = tops.current.count = i;
    let t = 0;
    for (let k = 0; k < 60; k++) {
      const a = (k / 60) * Math.PI * 2 + rnd() * 0.1, r = 26 + rnd() * 16;
      const sc = 2.5 + rnd() * 3.5;
      o.position.set(Math.cos(a) * r, sc * 0.9, Math.sin(a) * r); o.scale.set(sc, sc * 1.1, sc); o.updateMatrix();
      trees.current.setMatrixAt(t, o.matrix); trees.current.setColorAt(t, new Color().setHSL(0.28 + rnd() * 0.05, 0.4, 0.22 + rnd() * 0.08)); t++;
    }
    trees.current.count = t;
    for (const m of [bags.current, tops.current, trees.current]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
  });
  return (
    <group>
      <instancedMesh ref={bags} args={[undefined, undefined, 200]} frustumCulled={false}><cylinderGeometry args={[1, 0.9, 1, 8]} /><meshStandardMaterial color="#1b1e1b" roughness={0.8} /></instancedMesh>
      <instancedMesh ref={tops} args={[undefined, undefined, 200]} frustumCulled={false}><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial roughness={0.8} /></instancedMesh>
      <instancedMesh ref={trees} args={[undefined, undefined, 60]} frustumCulled={false}><icosahedronGeometry args={[1, 3]} /><meshStandardMaterial roughness={0.9} flatShading={false} /></instancedMesh>
    </group>
  );
}

function Rain({ clock, center }: { clock: DaysSource; center: { current: number } }) {
  const ref = useRef<InstancedMesh>(null);
  const N = 700;
  const drops = useMemo(() => Array.from({ length: N }, () => new Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5)), []);
  const m = useMemo(() => new Matrix4(), []);
  useFrame((_, dt) => {
    const mesh = ref.current; if (!mesh) return;
    const amt = windowAmt(doyOf(clock.days), 166, 273, 10) * Math.min(1, Math.max(0, (center.current - 0.25) / 0.4));
    const n = Math.floor(N * amt);
    const span = Math.max(0.9, center.current * 4);
    for (let i = 0; i < n; i++) {
      const d = drops[i];
      d.y -= dt * 1.6; if (d.y < 0) d.y += 1;
      m.makeScale(0.0012 * span, 0.03 * span, 0.0012 * span);
      m.setPosition(d.x * span, d.y * span * 0.9, d.z * span);
      mesh.setMatrixAt(i, m);
    }
    mesh.count = n; mesh.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}><boxGeometry /><meshBasicMaterial color="#cfe6ff" transparent opacity={0.55} /></instancedMesh>;
}

function World({ species, clock, onInfo, interactive, autoRotate, frame, rain, field, dayCycle }: SceneProps & { frame: number }) {
  const height = useRef(0.1);
  const lift = useRef<Group>(null);
  const sun = useRef<DirectionalLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const ground = useRef<Mesh>(null);
  const sunPos = useMemo(() => new Vector3(4, 6, 3), []);
  const skyRef = useRef<Mesh>(null);
  const { scene } = useThree();
  useMemo(() => { scene.fog = new Fog("#cfe3c4", 18, 70); }, [scene]);
  const grassMonsoon = useMemo(() => new Color("#4f8f36"), []), grassSummer = useMemo(() => new Color("#a7a85a"), []), grassWinter = useMemo(() => new Color("#7a9e4e"), []);
  const tmp = useMemo(() => new Color(), []);

  useFrame((_, dt) => {
    // clock
    if (clock.target !== undefined && !clock.playing) {
      const diff = clock.target - clock.days;
      clock.days = Math.abs(diff) < 0.3 ? clock.target : clock.days + diff * Math.min(1, dt * 3.2);
    }
    if (clock.playing) {
      clock.days += dt * clock.speed;
      if (clock.days > clock.max) { if (clock.loop) clock.days = 0; else { clock.days = clock.max; clock.playing = false; } }
    }
    const sp = SPECIES[species];
    const inBag = sp.container === "bag" && clock.days < sp.plantOut;
    if (lift.current) lift.current.position.y = inBag ? Math.min(0.3, 0.05 + height.current * 0.07) * 1.15 : 0;
    // sun
    const cycle = dayCycle && clock.speed <= 2;
    const t = cycle ? (clock.days % 1) : 0.36;
    const ang = (t - 0.25) * Math.PI * 2;
    const elev = Math.sin(ang);
    sunPos.set(Math.cos(ang) * 8, Math.max(-2, elev * 9), 4);
    const light = cycle ? Math.max(0.04, Math.min(1, elev * 2 + 0.15)) : 1;
    if (sun.current) { sun.current.position.copy(sunPos); sun.current.intensity = 2.4 * light; }
    if (hemi.current) hemi.current.intensity = 0.25 + 0.85 * light;
    const mat = (skyRef.current?.material as unknown as { uniforms?: Record<string, { value: Vector3 }> })?.uniforms;
    if (mat?.sunPosition) mat.sunPosition.value.copy(sunPos);
    // seasonal ground
    const doy = doyOf(clock.days);
    const mon = windowAmt(doy, 166, 273, 25), sum = windowAmt(doy, 70, 165, 30);
    tmp.copy(grassWinter).lerp(grassSummer, sum).lerp(grassMonsoon, mon).multiplyScalar(0.35 + 0.65 * light);
    if (ground.current) (ground.current.material as MeshStandardMaterial).color.copy(tmp);
    if (scene.fog) (scene.fog as Fog).color.setRGB(0.81 * light + 0.02, 0.89 * light + 0.03, 0.77 * light + 0.05);
  });

  return (
    <>
      <Sky ref={skyRef as never} distance={450000} sunPosition={[4, 6, 3]} turbidity={5} rayleigh={1.2} mieCoefficient={0.006} mieDirectionalG={0.85} />
      <hemisphereLight ref={hemi} args={["#e8f5ff", "#4d6b2e", 1]} />
      <directionalLight ref={sun} castShadow intensity={2.4} color="#fff2d6" shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={12} shadow-camera-bottom={-2} />
      <mesh ref={ground} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[120, 48]} /><meshStandardMaterial color="#6a9a45" roughness={1} /></mesh>
      {field && <Field />}
      <group ref={lift}>
        <PlantMesh species={species} src={clock} onInfo={(i) => { height.current = i.height; onInfo?.(i); }} />
        <Container species={species} src={clock} height={height} />
      </group>
      <ContactShadows position={[0, 0.003, 0]} opacity={0.45} scale={6} blur={2.4} far={4} resolution={512} />
      {rain && <Rain clock={clock} center={height} />}
      <Rig height={height} interactive={!!interactive} autoRotate={!!autoRotate} frame={frame} />
    </>
  );
}

export type SceneProps = {
  species: SpeciesKey; clock: Clock; onInfo?: (i: GrowthInfo) => void;
  interactive?: boolean; autoRotate?: boolean; rain?: boolean; field?: boolean; dayCycle?: boolean; frame?: number; className?: string;
};

export default function GrowScene(p: SceneProps) {
  return (
    <Canvas className={p.className} shadows dpr={[1, 1.75]} camera={{ fov: 38, near: 0.01, far: 900, position: [0.6, 0.3, 1] }} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <World {...p} interactive={p.interactive ?? true} autoRotate={p.autoRotate ?? true} rain={p.rain ?? true} field={p.field ?? true} dayCycle={p.dayCycle ?? true} frame={p.frame ?? 2.25} />
    </Canvas>
  );
}
