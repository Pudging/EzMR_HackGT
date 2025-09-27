"use client";

import { useState, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Box, Sphere, Cylinder } from "@react-three/drei";
import type * as THREE from "three";

interface HumanBodyModelProps {
  selectedBodyPart: string | null;
  onBodyPartSelect: (bodyPart: string) => void;
  patientData: Record<string, string>;
}

const BODY_PARTS = [
  {
    id: "head",
    name: "HEAD",
    position: [0, 3, 0] as [number, number, number],
    size: [0.8, 0.8, 0.8] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "neck",
    name: "NECK",
    position: [0, 2.2, 0] as [number, number, number],
    size: [0.3, 0.4, 0.3] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "chest",
    name: "CHEST",
    position: [0, 1.2, 0] as [number, number, number],
    size: [1.2, 1, 0.6] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "heart",
    name: "HEART",
    position: [-0.15, 1.3, 0.8] as [number, number, number],
    size: [0.25, 0.3, 0.2] as [number, number, number],
    type: "box",
    isOrgan: true,
  },
  {
    id: "left-lung",
    name: "LEFT LUNG",
    position: [0.35, 1.2, 0.7] as [number, number, number],
    size: [0.3, 0.6, 0.25] as [number, number, number],
    type: "box",
    isOrgan: true,
  },
  {
    id: "right-lung",
    name: "RIGHT LUNG",
    position: [-0.35, 1.2, 0.7] as [number, number, number],
    size: [0.3, 0.6, 0.25] as [number, number, number],
    type: "box",
    isOrgan: true,
  },
  {
    id: "abdomen",
    name: "ABDOMEN",
    position: [0, 0, 0] as [number, number, number],
    size: [1, 0.8, 0.5] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "stomach",
    name: "STOMACH",
    position: [-0.2, 0.1, 0.6] as [number, number, number],
    size: [0.25, 0.3, 0.2] as [number, number, number],
    type: "box",
    isOrgan: true,
  },
  {
    id: "liver",
    name: "LIVER",
    position: [0.3, 0.1, 0.6] as [number, number, number],
    size: [0.35, 0.25, 0.2] as [number, number, number],
    type: "box",
    isOrgan: true,
  },
  {
    id: "left-kidney",
    name: "LEFT KIDNEY",
    position: [0.25, -0.2, 0.5] as [number, number, number],
    size: [0.15, 0.25, 0.15] as [number, number, number],
    type: "box",
    isOrgan: true,
  },
  {
    id: "right-kidney",
    name: "RIGHT KIDNEY",
    position: [-0.25, -0.2, 0.5] as [number, number, number],
    size: [0.15, 0.25, 0.15] as [number, number, number],
    type: "box",
    isOrgan: true,
  },
  {
    id: "left-shoulder",
    name: "LEFT SHOULDER",
    position: [0.8, 1.8, 0] as [number, number, number],
    size: [0.3, 0.3, 0.3] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "right-shoulder",
    name: "RIGHT SHOULDER",
    position: [-0.8, 1.8, 0] as [number, number, number],
    size: [0.3, 0.3, 0.3] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "left-arm",
    name: "LEFT ARM",
    position: [1.2, 1, 0] as [number, number, number],
    size: [0.25, 1.2, 0.25] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "right-arm",
    name: "RIGHT ARM",
    position: [-1.2, 1, 0] as [number, number, number],
    size: [0.25, 1.2, 0.25] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "left-forearm",
    name: "LEFT FOREARM",
    position: [1.2, 0.2, 0] as [number, number, number],
    size: [0.2, 1, 0.2] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "right-forearm",
    name: "RIGHT FOREARM",
    position: [-1.2, 0.2, 0] as [number, number, number],
    size: [0.2, 1, 0.2] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "left-thigh",
    name: "LEFT THIGH",
    position: [0.3, -1.2, 0] as [number, number, number],
    size: [0.25, 1, 0.25] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "right-thigh",
    name: "RIGHT THIGH",
    position: [-0.3, -1.2, 0] as [number, number, number],
    size: [0.25, 1, 0.25] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "left-shin",
    name: "LEFT SHIN",
    position: [0.3, -2.5, 0] as [number, number, number],
    size: [0.22, 1.2, 0.22] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "right-shin",
    name: "RIGHT SHIN",
    position: [-0.3, -2.5, 0] as [number, number, number],
    size: [0.22, 1.2, 0.22] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "spine",
    name: "SPINE",
    position: [0, 0.8, -0.15] as [number, number, number],
    size: [0.08, 2.5, 0.08] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "pelvis",
    name: "PELVIS",
    position: [0, -0.8, 0] as [number, number, number],
    size: [1, 0.4, 0.4] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "left-wrist",
    name: "LEFT WRIST",
    position: [1.2, -0.3, 0] as [number, number, number],
    size: [0.15, 0.15, 0.15] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "right-wrist",
    name: "RIGHT WRIST",
    position: [-1.2, -0.3, 0] as [number, number, number],
    size: [0.15, 0.15, 0.15] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "left-foot",
    name: "LEFT FOOT",
    position: [0.3, -3.8, 0.1] as [number, number, number],
    size: [0.25, 0.15, 0.4] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "right-foot",
    name: "RIGHT FOOT",
    position: [-0.3, -3.8, 0.1] as [number, number, number],
    size: [0.25, 0.15, 0.4] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
];

// Component to render different 3D shapes
function BodyShape({
  type,
  args,
  ...props
}: {
  type: string;
  args: number[];
  [key: string]: unknown;
}) {
  switch (type) {
    case "sphere":
      return <Sphere args={[args[0]]} {...props} />;
    case "cylinder":
      return <Cylinder args={[args[0], args[0], args[1], 8]} {...props} />;
    case "box":
    default:
      return (
        <Box
          args={args as [number, number, number, number, number, number]}
          {...props}
        />
      );
  }
}

function BodyPart({
  part,
  isSelected,
  isHovered,
  hasData,
  onClick,
  onHover,
  otherSelected,
}: {
  part: (typeof BODY_PARTS)[0];
  isSelected: boolean;
  isHovered: boolean;
  hasData: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  otherSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Removed rotation animation

  const getMaterial = () => {
    const normalOpacity = otherSelected && !isSelected ? 0.3 : 1;

    // Selected = Blue
    if (isSelected) {
      return {
        color: "#4444ff", // Blue for selected
        wireframe: false,
        transparent: false,
        opacity: 1,
        metalness: 0.4,
        roughness: 0.1,
        emissive: "#001166", // Blue glow
      };
    }
    
    // Has data (notes) = Red  
    if (hasData) {
      return {
        color: "#ff4444", // Red for parts with notes
        wireframe: false,
        transparent: normalOpacity < 1,
        opacity: normalOpacity,
        metalness: 0.2,
        roughness: 0.5,
        emissive: "#220000", // Red glow for data parts
      };
    }
    
    // Hovered but no data = light blue highlight
    if (isHovered) {
      return {
        color: "#88aaff", // Light blue hover
        wireframe: false,
        transparent: false,
        opacity: 1,
        metalness: 0.3,
        roughness: 0.2,
        emissive: "#001144", // Subtle blue glow
      };
    }
    
    // Default unselected = White/Light Gray
    return {
      color: "#f0f0f0", // Light gray for better visibility against black background
      wireframe: false,
      transparent: normalOpacity < 1,
      opacity: normalOpacity,
      metalness: 0.0, // No metalness for matte finish
      roughness: 0.7, // Moderate roughness for good light reflection
      emissive: "#222222", // Slight emission for visibility in dark scene
    };
  };

  const material = getMaterial();

  return (
    <group>
      <BodyShape
        ref={meshRef}
        type={part.type}
        position={part.position}
        args={part.size}
        onClick={onClick}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
      >
        <meshStandardMaterial {...material} />
      </BodyShape>
      {(isSelected || isHovered) && (
        <Text
          position={[
            part.position[0],
            part.position[1] + part.size[1] / 2 + 0.3,
            part.position[2],
          ]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {part.name}
        </Text>
      )}
    </group>
  );
}

export function HumanBodyModel({
  selectedBodyPart,
  onBodyPartSelect,
  patientData,
}: HumanBodyModelProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const hasData = (partId: string) => {
    const data = patientData[partId];
    // Check if data exists and has meaningful content (not just whitespace)
    return data !== undefined && data !== null && typeof data === 'string' && data.trim().length > 0;
  };

  const handlePartClick = (partId: string) => {
    // If clicking the same part, unhighlight it
    if (selectedBodyPart === partId) {
      onBodyPartSelect("");
    } else {
      onBodyPartSelect(partId);
    }
  };

  return (
    <div className="h-full w-full bg-black">
      <Canvas
        camera={{ position: [0, 1, 10], fov: 45 }}
        style={{ background: "#000000" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.0} castShadow />
        <directionalLight position={[-5, 5, 5]} intensity={0.6} />
        <pointLight position={[0, 8, 3]} intensity={0.7} />
        <pointLight position={[3, -3, 3]} intensity={0.5} />
        <pointLight position={[-3, -3, 3]} intensity={0.5} />

        <Suspense fallback={null}>
          {BODY_PARTS.map((part) => (
            <BodyPart
              key={part.id}
              part={part}
              isSelected={selectedBodyPart === part.id}
              isHovered={hoveredPart === part.id}
              hasData={hasData(part.id)}
              onClick={() => handlePartClick(part.id)}
              onHover={(hovered) => setHoveredPart(hovered ? part.id : null)}
              otherSelected={!!selectedBodyPart && selectedBodyPart !== part.id}
            />
          ))}
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
          target={[0, 0.5, 0]}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
