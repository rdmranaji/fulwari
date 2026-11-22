"use client";
// One WebGL canvas drives every product card: each card is a drei <View> that renders its own
// living plant into its slot. Hovering a card replays its growth from seedling to the size you buy.
import { PerspectiveCamera, View } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import type { Group } from "three";
import { Container, PlantMesh, type DaysSource } from "./PlantMesh";
import { SPECIES, type SpeciesKey } from "./species";

function CardScene({ species, days, growing }: { species: SpeciesKey; days: number; growing: { current: boolean } }) {
  const src = useRef<DaysSource>({ days }).current;
  const height = useRef(0.3);
  const spin = useRef<Group>(null);
  const lift = useRef<Group>(null);
  const t = useRef(1);
  const { camera } = useThree();
  const camH = useRef(0.5);
  useFrame((_, dt) => {
    if (growing.current && t.current >= 1) t.current = 0;
    if (t.current < 1) { t.current = Math.min(1, t.current + dt / 1.8); }
    const e = 1 - Math.pow(1 - t.current, 3);
    src.days = 6 + (days - 6) * e;
    if (spin.current) spin.current.rotation.y += dt * (growing.current ? 0.9 : 0.25);
    const sp = SPECIES[species];
    const inBag = sp.container === "bag" && src.days < sp.plantOut;
    const bagH = inBag ? Math.min(0.3, 0.05 + height.current * 0.07) * 1.15 : 0;
    if (lift.current) lift.current.position.y = bagH;
    // frame the final size so the plant grows into the card
    camH.current += (Math.max(0.25, height.current + bagH) - camH.current) * Math.min(1, dt * 1.5);
    const target = t.current < 1 ? camH.current : height.current + bagH;
    const h = Math.max(0.25, target);
    camera.position.set(0, h * 0.62, h * 2.05 + 0.25);
    camera.lookAt(0, h * 0.46, 0);
  });
  return (
    <>
      <PerspectiveCamera makeDefault fov={30} near={0.01} far={100} position={[0, 0.5, 1.6]} />
      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#f4fff0", "#6b7d3a", 0.8]} />
      <directionalLight position={[2, 4, 3]} intensity={2.2} color="#fff4dc" />
      <group ref={spin}>
        <group ref={lift}>
          <PlantMesh species={species} src={src} onInfo={(i) => (height.current = i.height)} />
          <Container species={species} src={src} height={height} />
        </group>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}><circleGeometry args={[0.6, 40]} /><meshBasicMaterial color="#9fca78" transparent opacity={0.45} /></mesh>
    </>
  );
}

export function PlantView({ species, days, growing }: { species: SpeciesKey; days: number; growing: { current: boolean } }) {
  return (
    <View className="v3d">
      <CardScene species={species} days={days} growing={growing} />
    </View>
  );
}

export function ViewsCanvas({ eventSource }: { eventSource: RefObject<HTMLElement | null> }) {
  return (
    <Canvas className="views-canvas" eventSource={eventSource as RefObject<HTMLElement>} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
      <View.Port />
    </Canvas>
  );
}
