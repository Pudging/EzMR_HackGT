"use client";
import dynamic from "next/dynamic";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { type Group } from "three";
import { useTheme } from "next-themes";

function DodecahedronMesh({ isLight }: { isLight: boolean }) {
  const meshRef = useRef<Group>(null);
  const { pointer } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;

    // Slow ambient rotation
    meshRef.current.rotation.x += 0.002;
    meshRef.current.rotation.y += 0.003;

    // Very subtle mouse parallax (medical-grade: non-intrusive)
    const parallaxStrength = 0.01;
    meshRef.current.rotation.z = pointer.x * parallaxStrength;
    meshRef.current.position.x = pointer.x * parallaxStrength * 0.3;
    meshRef.current.position.y = pointer.y * parallaxStrength * 0.3;
  });

  // Theme-aware colors
  const edgeColor = isLight ? "#505050" : "#606060";
  const gridColor = isLight ? "#2a2a2a" : "#303030";

  return (
    <group ref={meshRef}>
      {/* Red blood cell - biconcave disc shape using torus */}
      <mesh position={[0, 0, 0]} scale={[1, 1, 1]}>
        <torusGeometry args={[1.5, 0.6, 16, 32]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges threshold={1} color={edgeColor} />
      </mesh>

      {/* Top dimple - cup-shaped inverted sphere half */}
      <mesh
        position={[0, 0, 0.3]}
        scale={[1, 0.1, 1]}
        rotation={[Math.PI * 0.5, 0, Math.PI]}
      >
        <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges threshold={1} color={edgeColor} />
      </mesh>

      {/* Bottom dimple - cup-shaped inverted sphere half */}
      <mesh
        position={[0, 0, -0.3]}
        scale={[1, 0.15, 1]}
        rotation={[Math.PI * 1.5, 0, Math.PI]}
      >
        <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges threshold={1} color={edgeColor} />
      </mesh>

      {/* Dense web mesh grid behind */}
      <mesh position={[0, 0, -4]} rotation={[0.3, 0, 0]}>
        <planeGeometry args={[20, 20, 80, 80]} />
        <meshBasicMaterial
          color={gridColor}
          wireframe
          transparent
          opacity={isLight ? 0.3 : 0.2}
        />
      </mesh>
    </group>
  );
}

interface WireframeDodecahedronBackgroundProps {
  className?: string;
}

export function WireframeDodecahedronBackground({
  className = "",
}: WireframeDodecahedronBackgroundProps) {
  const { theme, resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light" || theme === "light";
  const background = isLight ? "white" : "black";

  return (
    <div
      className={`fixed inset-0 -z-10 ${className}`}
      style={{
        pointerEvents: "none",
        backgroundColor: background,
      }}
      aria-hidden="true"
    >
      <Suspense>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          style={{ background }}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
          performance={{ min: 0.8 }}
        >
          <DodecahedronMesh isLight={isLight} />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default dynamic(() => Promise.resolve(WireframeDodecahedronBackground), {
  ssr: false,
});
