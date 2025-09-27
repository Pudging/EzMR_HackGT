"use client";

import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { Group } from "three";

function DodecahedronMesh() {
  const meshRef = useRef<Group>(null);
  const { pointer } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Slow ambient rotation
    meshRef.current.rotation.x += 0.002;
    meshRef.current.rotation.y += 0.003;
    
    // Very subtle mouse parallax (medical-grade: non-intrusive)
    const parallaxStrength = 0.02;
    meshRef.current.rotation.z = pointer.x * parallaxStrength;
    meshRef.current.position.x = pointer.x * parallaxStrength * 0.5;
    meshRef.current.position.y = pointer.y * parallaxStrength * 0.5;
  });

  return (
    <group ref={meshRef}>
      {/* Main dodecahedron */}
      <mesh>
        <dodecahedronGeometry args={[2, 0]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges threshold={15} color="#606060" />
      </mesh>
      
      {/* Web mesh grid behind */}
      <mesh position={[0, 0, -4]} rotation={[0.3, 0, 0]}>
        <planeGeometry args={[20, 20, 40, 40]} />
        <meshBasicMaterial color="#303030" wireframe transparent opacity={0.3} />
      </mesh>
      
      {/* Sharp contour rings */}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, i * 0.8]}>
          <ringGeometry args={[2.2 + i * 0.4, 2.4 + i * 0.4, 12]} />
          <meshBasicMaterial color="#505050" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

interface WireframeDodecahedronBackgroundProps {
  className?: string;
}

export default function WireframeDodecahedronBackground({ 
  className = "" 
}: WireframeDodecahedronBackgroundProps) {
  return (
    <div 
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'black' }}
        gl={{ alpha: false, antialias: true, powerPreference: "low-power" }}
        performance={{ min: 0.8 }}
      >
        <DodecahedronMesh />
      </Canvas>
    </div>
  );
}
