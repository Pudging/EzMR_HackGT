/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Box, Sphere, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface HybridBodyModelProps {
  selectedBodyPart: string | null;
  onBodyPartSelect: (bodyPart: string) => void;
  patientData: Record<string, string>;
  skeletonFile?: string;
  analysisText?: string;
}

// Block model body parts - these are the clickable interactive elements
const BODY_PARTS = [
  {
    id: "head",
    name: "HEAD",
    position: [0, 2.7, 0] as [number, number, number],
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
    position: [0.9, 1, 0] as [number, number, number],
    size: [0.25, 1.2, 0.25] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "right-arm",
    name: "RIGHT ARM",
    position: [-0.9, 1, 0] as [number, number, number],
    size: [0.25, 1.2, 0.25] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "left-forearm",
    name: "LEFT FOREARM",
    position: [0.9, 0.2, 0] as [number, number, number],
    size: [0.2, 1, 0.2] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "right-forearm",
    name: "RIGHT FOREARM",
    position: [-0.9, 0.2, 0] as [number, number, number],
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
    position: [1.0, -0.3, 0] as [number, number, number],
    size: [0.15, 0.15, 0.15] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "right-wrist",
    name: "RIGHT WRIST",
    position: [-1.0, -0.3, 0] as [number, number, number],
    size: [0.15, 0.15, 0.15] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "left-foot",
    name: "LEFT FOOT",
    position: [0.3, -3.5, 0.1] as [number, number, number],
    size: [0.25, 0.15, 0.4] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
  {
    id: "right-foot",
    name: "RIGHT FOOT",
    position: [-0.3, -3.5, 0.1] as [number, number, number],
    size: [0.25, 0.15, 0.4] as [number, number, number],
    type: "box",
    isOrgan: false,
  },
];

// Component to render different 3D shapes for the block model
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

// Interactive block body part component
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

  const getMaterial = () => {
    const normalOpacity = otherSelected && !isSelected ? 0.2 : 0.6; // More transparent for overlay effect

    // Selected = Blue
    if (isSelected) {
      return {
        color: "#4444ff",
        wireframe: false,
        transparent: true,
        opacity: 0.8,
        metalness: 0.4,
        roughness: 0.1,
        emissive: "#001166",
      };
    }
    
    // Has data (notes) = Red  
    if (hasData) {
      return {
        color: "#ff4444",
        wireframe: false,
        transparent: true,
        opacity: normalOpacity,
        metalness: 0.2,
        roughness: 0.5,
        emissive: "#220000",
      };
    }
    
    // Hovered but no data = light blue highlight
    if (isHovered) {
      return {
        color: "#88aaff",
        wireframe: false,
        transparent: true,
        opacity: 0.7,
        metalness: 0.3,
        roughness: 0.2,
        emissive: "#001144",
      };
    }
    
    // Default unselected = Very transparent white
    return {
      color: "#f0f0f0",
      wireframe: false,
      transparent: true,
      opacity: 0.1, // Very transparent when not interacting
      metalness: 0.0,
      roughness: 0.7,
      emissive: "#111111",
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

// Skeleton background component
function SkeletonBackground({
  skeletonFile,
  highlightedParts,
}: {
  skeletonFile: string;
  highlightedParts: string[];
}) {
  const [currentSkeleton, setCurrentSkeleton] = useState<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load the skeleton model
  useEffect(() => {
    const loadSkeleton = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(`/blender_files/${skeletonFile}`);
        const skeleton = gltf.scene.clone();

        // Make skeleton transparent with better rendering stability
        skeleton.traverse((child) => {
          const mesh = child as unknown as THREE.Mesh;
          if ((mesh as any).isMesh && (mesh as any).material) {
            const material = (mesh as any).material;
            if (material) {
              const newMaterial = material.clone();
              newMaterial.transparent = true;
              newMaterial.opacity = 0.2;
              newMaterial.color = new THREE.Color(0x808080);
              newMaterial.wireframe = false; // Solid rendering for stability
              newMaterial.depthWrite = false; // Prevent z-fighting
              newMaterial.side = THREE.DoubleSide; // Render both sides
              (mesh as any).material = newMaterial;
            }
          }
        });

        setCurrentSkeleton(skeleton);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading skeleton:", err);
        setError("Failed to load skeleton model");
        setIsLoading(false);
      }
    };

    void loadSkeleton();
  }, [skeletonFile]);

  if (isLoading || error || !currentSkeleton) {
    return null;
  }

  return <primitive object={currentSkeleton} position={[0, -3.75, 0]} scale={[4, 4, 4]} />;
}

export function HybridBodyModel({
  selectedBodyPart,
  onBodyPartSelect,
  patientData,
  skeletonFile = "overview-skeleton.glb",
  analysisText,
}: HybridBodyModelProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [highlightedParts, setHighlightedParts] = useState<string[]>([]);

  const hasData = (partId: string) => {
    const data = patientData[partId];
    return data !== undefined && data !== null && typeof data === 'string' && data.trim().length > 0;
  };


  const handlePartClick = (partId: string) => {
    if (selectedBodyPart === partId) {
      onBodyPartSelect("");
    } else {
      onBodyPartSelect(partId);
    }
  };

  // Analyze injury text for highlighting (simplified version)
  useEffect(() => {
    if (analysisText && analysisText.trim().length > 0) {
      // Simple keyword matching for highlighting
      const text = analysisText.toLowerCase();
      const parts: string[] = [];
      
      BODY_PARTS.forEach(part => {
        const partName = part.name.toLowerCase();
        const partId = part.id.toLowerCase();
        
        if (text.includes(partName) || text.includes(partId.replace('-', ' '))) {
          parts.push(part.id);
        }
      });
      
      setHighlightedParts(parts);
    } else {
      setHighlightedParts([]);
    }
  }, [analysisText]);

  return (
    <div className="h-full w-full bg-black">
      <Canvas
        camera={{ position: [0, 1, 6], fov: 60 }}
        style={{ background: "#000000" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.0} castShadow />
        <directionalLight position={[-5, 5, 5]} intensity={0.6} />
        <pointLight position={[0, 8, 3]} intensity={0.7} />
        <pointLight position={[3, -3, 3]} intensity={0.5} />
        <pointLight position={[-3, -3, 3]} intensity={0.5} />

        <Suspense fallback={null}>
          {/* Skeleton background - rendered first (behind) */}
          <SkeletonBackground 
            skeletonFile={skeletonFile} 
            highlightedParts={highlightedParts}
          />
          
          {/* Interactive block model - rendered on top */}
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
          minDistance={3}
          maxDistance={15}
          target={[0, 0, 0]}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
