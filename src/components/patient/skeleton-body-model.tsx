/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface SkeletonBodyModelProps {
  selectedBodyPart: string | null;
  onBodyPartSelect: (bodyPart: string) => void;
  patientData: Record<string, string>;
  skeletonFile?: string;
  // Text to analyze from external input (e.g., Patient Status Update)
  analysisText?: string;
}

export function SkeletonBodyModel({
  selectedBodyPart,
  onBodyPartSelect,
  patientData,
  skeletonFile = "overview-skeleton.glb",
  analysisText,
}: SkeletonBodyModelProps) {
  const [currentSkeleton, setCurrentSkeleton] = useState<THREE.Group | null>(
    null,
  );
  const [originalMaterials, setOriginalMaterials] = useState<
    Map<string, THREE.Material>
  >(new Map());
  const [highlightedParts, setHighlightedParts] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [availableMeshes, setAvailableMeshes] = useState<string[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [currentSkeletonFile, setCurrentSkeletonFile] =
    useState<string>(skeletonFile);

  // Medical terminology mapping for highlighting - matches API terms
  const medicalTermMap: Record<string, string[]> = {
    // Skull and head injuries
    temporal: [
      "temporal",
      "temporal bone",
      "temporal region",
      "temporal lobe",
      "temple",
      "temporal_left",
      "temporal_right",
      "temporal.l",
      "temporal.r",
    ],
    frontal: [
      "frontal",
      "frontal bone",
      "forehead",
      "frontal lobe",
      "frontal_left",
      "frontal_right",
      "frontal.l",
      "frontal.r",
    ],
    parietal: [
      "parietal",
      "parietal bone",
      "parietal lobe",
      "parietal_left",
      "parietal_right",
      "parietal.l",
      "parietal.r",
    ],
    occipital: [
      "occipital",
      "occipital bone",
      "back of head",
      "occipital lobe",
      "occipital_left",
      "occipital_right",
      "occipital.l",
      "occipital.r",
    ],
    mandible: [
      "mandible",
      "jaw",
      "lower jaw",
      "mandibular",
      "mandible_left",
      "mandible_right",
      "mandible.l",
      "mandible.r",
    ],
    maxilla: [
      "maxilla",
      "upper jaw",
      "maxillary",
      "maxilla_left",
      "maxilla_right",
      "maxilla.l",
      "maxilla.r",
    ],
    zygomatic: [
      "zygomatic",
      "cheekbone",
      "zygomatic bone",
      "zygoma",
      "zygomatic_left",
      "zygomatic_right",
      "zygomatic.l",
      "zygomatic.r",
    ],
    nasal: [
      "nasal",
      "nose",
      "nasal bone",
      "nasal cavity",
      "nasal_left",
      "nasal_right",
      "nasal.l",
      "nasal.r",
    ],
    ethmoid: [
      "ethmoid",
      "ethmoid bone",
      "ethmoid_left",
      "ethmoid_right",
      "ethmoid.l",
      "ethmoid.r",
    ],
    sphenoid: [
      "sphenoid",
      "sphenoid bone",
      "sphenoid_left",
      "sphenoid_right",
      "sphenoid.l",
      "sphenoid.r",
    ],
    skull: [
      "skull",
      "cranium",
      "head",
      "cranial",
      "skull_left",
      "skull_right",
      "skull.l",
      "skull.r",
    ],

    // Spine injuries
    cervical: [
      "cervical",
      "neck",
      "cervical spine",
      "cervical vertebrae",
      "c1",
      "c2",
      "c3",
      "c4",
      "c5",
      "c6",
      "c7",
      "cervical_left",
      "cervical_right",
      "cervical.l",
      "cervical.r",
    ],
    thoracic: [
      "thoracic",
      "thoracic spine",
      "thoracic vertebrae",
      "t1",
      "t2",
      "t3",
      "t4",
      "t5",
      "t6",
      "t7",
      "t8",
      "t9",
      "t10",
      "t11",
      "t12",
      "thoracic_left",
      "thoracic_right",
      "thoracic.l",
      "thoracic.r",
    ],
    lumbar: [
      "lumbar",
      "lumbar spine",
      "lumbar vertebrae",
      "lower back",
      "l1",
      "l2",
      "l3",
      "l4",
      "l5",
      "lumbar_left",
      "lumbar_right",
      "lumbar.l",
      "lumbar.r",
    ],
    sacrum: [
      "sacrum",
      "sacral",
      "sacral bone",
      "sacrum_left",
      "sacrum_right",
      "sacrum.l",
      "sacrum.r",
    ],
    coccyx: [
      "coccyx",
      "tailbone",
      "coccygeal",
      "coccyx_left",
      "coccyx_right",
      "coccyx.l",
      "coccyx.r",
    ],
    vertebrae: [
      "vertebrae",
      "vertebra",
      "vertebral",
      "spine",
      "spinal",
      "backbone",
      "vertebral column",
    ],

    // Upper body injuries
    clavicle: [
      "clavicle",
      "collarbone",
      "clavicular",
      "clavicle_left",
      "clavicle_right",
      "clavicle.l",
      "clavicle.r",
    ],
    scapula: [
      "scapula",
      "shoulder blade",
      "scapular",
      "scapula_left",
      "scapula_right",
      "scapula.l",
      "scapula.r",
    ],
    sternum: [
      "sternum",
      "breastbone",
      "sternal",
      "sternum_left",
      "sternum_right",
      "sternum.l",
      "sternum.r",
    ],
    ribs: [
      "ribs",
      "rib",
      "ribcage",
      "rib cage",
      "costal",
      "rib_left",
      "rib_right",
      "rib.l",
      "rib.r",
      "ribs_left",
      "ribs_right",
      "ribs.l",
      "ribs.r",
      "rib1",
      "rib2",
      "rib3",
      "rib4",
      "rib5",
      "rib6",
      "rib7",
      "rib8",
      "rib9",
      "rib10",
      "rib11",
      "rib12",
    ],
    humerus: [
      "humerus",
      "upper arm bone",
      "humeral",
      "humerus_left",
      "humerus_right",
      "humerus.l",
      "humerus.r",
    ],
    radius: [
      "radius",
      "forearm bone",
      "radial",
      "radius_left",
      "radius_right",
      "radius.l",
      "radius.r",
    ],
    ulna: [
      "ulna",
      "forearm bone",
      "ulnar",
      "ulna_left",
      "ulna_right",
      "ulna.l",
      "ulna.r",
    ],
    elbow: [
      "elbow",
      "elbow joint",
      "cubital",
      "elbow_left",
      "elbow_right",
      "elbow.l",
      "elbow.r",
    ],
    shoulder: [
      "shoulder",
      "shoulder joint",
      "glenohumeral",
      "shoulder_left",
      "shoulder_right",
      "shoulder.l",
      "shoulder.r",
    ],

    // Hand and wrist injuries
    carpals: [
      "carpals",
      "carpal bones",
      "wrist bones",
      "carpal",
      "carpal_left",
      "carpal_right",
      "carpal.l",
      "carpal.r",
    ],
    metacarpals: [
      "metacarpals",
      "metacarpal bones",
      "hand bones",
      "metacarpal",
      "metacarpal_left",
      "metacarpal_right",
      "metacarpal.l",
      "metacarpal.r",
    ],
    phalanges: [
      "phalanges",
      "finger bones",
      "toe bones",
      "phalange",
      "phalanx",
      "phalange_left",
      "phalange_right",
      "phalange.l",
      "phalange.r",
    ],
    thumb: [
      "thumb",
      "first digit",
      "pollex",
      "thumb_left",
      "thumb_right",
      "thumb.l",
      "thumb.r",
    ],
    fingers: [
      "fingers",
      "digits",
      "finger",
      "finger_left",
      "finger_right",
      "finger.l",
      "finger.r",
    ],
    wrist: [
      "wrist",
      "wrist joint",
      "carpal",
      "wrist_left",
      "wrist_right",
      "wrist.l",
      "wrist.r",
    ],
    hand: ["hand", "manual", "hand_left", "hand_right", "hand.l", "hand.r"],

    // Lower body injuries
    pelvis: [
      "pelvis",
      "pelvic",
      "hip bone",
      "pelvic bone",
      "pelvis_left",
      "pelvis_right",
      "pelvis.l",
      "pelvis.r",
    ],
    femur: [
      "femur",
      "thigh bone",
      "femoral",
      "femur_left",
      "femur_right",
      "femur.l",
      "femur.r",
    ],
    tibia: [
      "tibia",
      "shin bone",
      "tibial",
      "tibia_left",
      "tibia_right",
      "tibia.l",
      "tibia.r",
    ],
    fibula: [
      "fibula",
      "calf bone",
      "fibular",
      "fibula_left",
      "fibula_right",
      "fibula.l",
      "fibula.r",
    ],
    patella: [
      "patella",
      "kneecap",
      "patellar",
      "patella_left",
      "patella_right",
      "patella.l",
      "patella.r",
    ],
    knee: [
      "knee",
      "knee joint",
      "patellar",
      "knee_left",
      "knee_right",
      "knee.l",
      "knee.r",
    ],
    ankle: [
      "ankle",
      "ankle joint",
      "tarsal",
      "ankle_left",
      "ankle_right",
      "ankle.l",
      "ankle.r",
    ],
    foot: [
      "foot",
      "feet",
      "pedal",
      "foot_left",
      "foot_right",
      "foot.l",
      "foot.r",
    ],
    toes: ["toes", "toe", "digital", "toe_left", "toe_right", "toe.l", "toe.r"],

    // General terms
    spine: [
      "spine",
      "spinal",
      "backbone",
      "vertebral column",
      "spine_left",
      "spine_right",
      "spine.l",
      "spine.r",
    ],
    arm: [
      "arm",
      "upper limb",
      "brachial",
      "arm_left",
      "arm_right",
      "arm.l",
      "arm.r",
    ],
    leg: [
      "leg",
      "lower limb",
      "crural",
      "leg_left",
      "leg_right",
      "leg.l",
      "leg.r",
    ],
    limb: [
      "limb",
      "extremity",
      "appendage",
      "limb_left",
      "limb_right",
      "limb.l",
      "limb.r",
    ],
  };

  // Load the skeleton model
  useEffect(() => {
    const loadSkeleton = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(
          `/blender_files/${currentSkeletonFile}`,
        );

        const skeleton = gltf.scene.clone();

        // Apply renaming rules
        applyRenamingRules(skeleton);

        // Store original materials and collect mesh names
        const materials = new Map<string, THREE.Material>();
        const meshNames: string[] = [];
        skeleton.traverse((child) => {
          const mesh = child as unknown as THREE.Mesh;
          if ((mesh as any).isMesh && (mesh as any).material) {
            materials.set(mesh.name, (mesh as any).material.clone());
            meshNames.push(mesh.name);
          }
        });
        setOriginalMaterials(materials);
        setAvailableMeshes(meshNames.sort());

        setCurrentSkeleton(skeleton);
        setIsLoading(false);

        // Focus camera on the loaded skeleton with proper viewport scaling
        setTimeout(() => {
          const box = new THREE.Box3().setFromObject(skeleton);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);

          const currentCamera = cameraRef.current;
          if (currentCamera) {
            const fov =
              (currentCamera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
            let distance = (maxDim / (2 * Math.tan(fov / 2))) * 0.001; // 0.001x multiplier for 1000x closer zoom

            // For very small models like colored-skull-base, use a minimum distance
            if (distance < 0.1) {
              distance = 0.1; // Minimum distance to prevent camera from being inside the model
            }

            currentCamera.position.set(center.x, center.y, center.z + distance);
            setCameraTarget(center);
          }
        }, 100);
      } catch (_err) {
        setError("Failed to load 3D skeleton model");
        setIsLoading(false);
      }
    };

    void loadSkeleton();
  }, [currentSkeletonFile]);

  // Apply renaming rules to skeleton
  const applyRenamingRules = (skeleton: THREE.Group) => {
    skeleton.traverse((child) => {
      const mesh = child as unknown as THREE.Mesh;
      if ((mesh as any).isMesh) {
        const originalName = mesh.name;
        const name = originalName.toLowerCase();

        // Check for right.00x pattern and rename to _left
        if (name.includes("right.00") || name.includes("right.0")) {
          const leftName = originalName.replace(/right\.\d+/i, "_left");
          mesh.name = leftName;
        } else if (
          name.includes("_r") ||
          name.includes("_right") ||
          name.includes("right.")
        ) {
          const leftName = originalName.replace(
            /_r\b|_right\b|right\./gi,
            "_left",
          );
          mesh.name = leftName;
        }
      }
    });
  };

  // Highlight parts based on patient data
  useEffect(() => {
    if (!currentSkeleton || !originalMaterials.size) return;

    // Clear previous highlights
    clearHighlights();

    // Highlight parts that have data
    Object.entries(patientData).forEach(([bodyPart, data]) => {
      if (data && data.trim().length > 0) {
        highlightPartByText(bodyPart, data);
      }
    });

    // Also react to external analysis text (from Patient Status Update)
    if (analysisText && analysisText.trim().length > 0) {
      setSearchText(analysisText);
      void analyzeInjury();
    }

    // Highlight selected part
    if (selectedBodyPart) {
      highlightPartByName(selectedBodyPart);
    }
  }, [
    currentSkeleton,
    originalMaterials,
    patientData,
    selectedBodyPart,
    analysisText,
  ]);

  // Clear all highlights
  const clearHighlights = () => {
    if (!currentSkeleton) return;

    currentSkeleton.traverse((child) => {
      const mesh = child as unknown as THREE.Mesh;
      if ((mesh as any).isMesh && highlightedParts.has(mesh.name)) {
        const originalMaterial = originalMaterials.get(mesh.name);
        if (originalMaterial) {
          (mesh as any).material = originalMaterial;
        }
      }
    });

    setHighlightedParts(new Set());
  };

  // Highlight part by name
  const highlightPartByName = (bodyPart: string) => {
    if (!currentSkeleton) return;

    const terms = medicalTermMap[bodyPart] ?? [bodyPart];
    let found = false;

    currentSkeleton.traverse((child) => {
      const mesh = child as unknown as THREE.Mesh;
      if ((mesh as any).isMesh) {
        const childName = mesh.name.toLowerCase();
        const shouldHighlight = terms.some((term) =>
          childName.includes(term.toLowerCase()),
        );

        if (shouldHighlight) {
          const highlightMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.8,
          });

          (mesh as any).material = highlightMaterial;
          setHighlightedParts((prev) => new Set([...prev, mesh.name]));
          found = true;
        }
      }
    });

    if (found) {
      onBodyPartSelect(bodyPart);
    }
  };

  // Focus camera on highlighted parts with proper viewport scaling
  const focusOnHighlightedParts = () => {
    if (!currentSkeleton) return;

    const highlightedMeshes: THREE.Mesh[] = [];
    const boundingBox = new THREE.Box3();

    currentSkeleton.traverse((child) => {
      const mesh = child as unknown as THREE.Mesh;
      if ((mesh as any).isMesh && highlightedParts.has(mesh.name)) {
        highlightedMeshes.push(mesh);
        const childBox = new THREE.Box3().setFromObject(mesh);
        boundingBox.union(childBox);
      }
    });

    if (highlightedMeshes.length > 0 && !boundingBox.isEmpty()) {
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);

      const size = new THREE.Vector3();
      boundingBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * 3;

      const currentCamera = cameraRef.current;
      if (currentCamera) {
        const direction = new THREE.Vector3()
          .subVectors(currentCamera.position, center)
          .normalize();
        const newPosition = center
          .clone()
          .add(direction.multiplyScalar(distance));
        currentCamera.position.copy(newPosition);
        setCameraTarget(center);

        // Force controls update
        setTimeout(() => {
          const perspective = currentCamera as THREE.PerspectiveCamera;
          if (
            perspective &&
            typeof perspective.updateProjectionMatrix === "function"
          ) {
            perspective.updateProjectionMatrix();
          }
        }, 0);
      }
    }
  };

  // Highlight part by text content
  const highlightPartByText = (bodyPart: string, text: string) => {
    if (!currentSkeleton) return;

    // First try to highlight by the body part name directly
    highlightPartByName(bodyPart);

    // Also try to find meshes that contain the body part name
    let foundAny = false;
    currentSkeleton.traverse((child) => {
      const mesh = child as unknown as THREE.Mesh;
      if ((mesh as any).isMesh) {
        const childName = mesh.name.toLowerCase();
        const bodyPartLower = bodyPart.toLowerCase();

        // Check if the mesh name contains the body part name
        if (
          childName.includes(bodyPartLower) ||
          bodyPartLower.includes(childName)
        ) {
          const highlightMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.8,
          });

          (mesh as any).material = highlightMaterial;
          setHighlightedParts((prev) => new Set([...prev, mesh.name]));
          foundAny = true;
        }
      }
    });

    if (foundAny) {
      // Focus camera on highlighted parts after highlighting
      setTimeout(focusOnHighlightedParts, 100);
    }
  };

  // Analyze injury text and highlight affected parts
  const analyzeInjury = async () => {
    if (!searchText.trim()) return;

    try {
      const response = await fetch("/api/analyze-injury", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: searchText }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.skeletonFile) {
          setCurrentSkeletonFile(result.skeletonFile);

          // Highlight all injured parts at once
          setTimeout(() => {
            highlightMultipleParts(result.injuredParts);
          }, 1000);
        } else {
          // No specific skeleton file, just highlight parts
          highlightMultipleParts(result.injuredParts);
        }
      }
    } catch (error) {
      // silent fail
    }
  };

  // Highlight multiple parts at once
  const highlightMultipleParts = (partNames: string[]) => {
    if (!currentSkeleton || !partNames || partNames.length === 0) {
      return;
    }

    // DON'T clear previous highlights - accumulate them
    let totalFound = 0;
    const boundingBox = new THREE.Box3();

    partNames.forEach((partName) => {
      let partFound = false;

      // Search through all meshes for partial matches
      currentSkeleton.traverse(function (child) {
        const mesh = child as unknown as THREE.Mesh;
        if ((mesh as any).isMesh) {
          const childName = mesh.name.toLowerCase();
          const searchTerm = partName.toLowerCase();

          // Try multiple matching strategies
          if (
            childName.includes(searchTerm) ||
            searchTerm.includes(childName) ||
            childName.includes(searchTerm.replace("s", "")) ||
            searchTerm.includes(childName.replace("s", ""))
          ) {
            const highlightMaterial = new THREE.MeshLambertMaterial({
              color: 0xff0000,
              transparent: true,
              opacity: 0.8,
            });

            (mesh as any).material = highlightMaterial;
            setHighlightedParts((prev) => new Set([...prev, mesh.name]));

            // Add to bounding box for camera focus
            const childBox = new THREE.Box3().setFromObject(mesh);
            boundingBox.union(childBox);

            if (!partFound) {
              totalFound++;
              partFound = true;
            }
          }
        }
      });
    });

    // Focus camera on all highlighted parts
    if (totalFound > 0 && !boundingBox.isEmpty()) {
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);

      const size = new THREE.Vector3();
      boundingBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * 3;

      const currentCamera = cameraRef.current;
      if (currentCamera) {
        const direction = new THREE.Vector3()
          .subVectors(currentCamera.position, center)
          .normalize();
        const newPosition = center
          .clone()
          .add(direction.multiplyScalar(distance));
        currentCamera.position.copy(newPosition);
        setCameraTarget(center);

        // Force controls update
        setTimeout(() => {
          const perspective = currentCamera as THREE.PerspectiveCamera;
          if (typeof perspective.updateProjectionMatrix === "function") {
            perspective.updateProjectionMatrix();
          }
        }, 0);
      }
    }
  };

  // Highlight a specific mesh by name
  const highlightSpecificMesh = (meshName: string) => {
    if (!currentSkeleton) return;

    currentSkeleton.traverse((child) => {
      const mesh = child;
      if ((mesh as any).isMesh && mesh.name === meshName) {
        const highlightMaterial = new THREE.MeshLambertMaterial({
          color: 0xff0000,
          transparent: true,
          opacity: 0.8,
        });

        (mesh as any).material = highlightMaterial;
        setHighlightedParts((prev) => new Set([...prev, mesh.name]));

        // Focus camera on this specific part
        const partBox = new THREE.Box3().setFromObject(mesh);
        const partCenter = new THREE.Vector3();
        partBox.getCenter(partCenter);

        const partSize = new THREE.Vector3();
        partBox.getSize(partSize);
        const maxDim = Math.max(partSize.x, partSize.y, partSize.z);

        const currentCamera = cameraRef.current;
        if (currentCamera) {
          const fov =
            (currentCamera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
          let distance = (maxDim / (2 * Math.tan(fov / 2))) * 0.001; // 0.001x multiplier for 1000x closer zoom

          // For very small models like colored-skull-base, use a minimum distance
          if (distance < 0.1) {
            distance = 0.1; // Minimum distance to prevent camera from being inside the model
          }

          const direction = new THREE.Vector3()
            .subVectors(currentCamera.position, partCenter)
            .normalize();
          currentCamera.position
            .copy(partCenter)
            .add(direction.multiplyScalar(distance));
          setCameraTarget(partCenter);

          // Force controls update
          setTimeout(() => {
            const perspective = currentCamera as THREE.PerspectiveCamera;
            if (
              perspective &&
              typeof perspective.updateProjectionMatrix === "function"
            ) {
              perspective.updateProjectionMatrix();
            }
          }, 0);
        }
      }
    });
  };

  // Handle mesh click
  const handleMeshClick = (event: any) => {
    const mesh = event?.object as THREE.Mesh | undefined;
    if (mesh && (mesh as any).isMesh) {
      // Find which body part this mesh corresponds to
      const meshName = mesh.name.toLowerCase();

      for (const [bodyPart, terms] of Object.entries(medicalTermMap)) {
        if (terms.some((term) => meshName.includes(term.toLowerCase()))) {
          onBodyPartSelect(bodyPart);
          break;
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="text-center text-foreground">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-foreground"></div>
          <p>Loading 3D skeleton...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="text-center text-destructive">
          <p className="mb-2 text-lg">⚠️</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-background">
      {/* 3D Viewer - Full Screen */}
      <div className="relative h-full w-full">
        <Canvas
          camera={{ position: [0, 1, 5], fov: 45 }}
          style={{ background: "transparent" }}
          onCreated={({ camera }) => {
            cameraRef.current = camera;
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
          <directionalLight position={[-5, 5, 5]} intensity={0.6} />

          <Suspense fallback={null}>
            {currentSkeleton && (
              <primitive object={currentSkeleton} onClick={handleMeshClick} />
            )}
          </Suspense>

          <OrbitControls
            enableDamping={true}
            dampingFactor={0.05}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={15}
            target={
              cameraTarget
                ? [cameraTarget.x, cameraTarget.y, cameraTarget.z]
                : [0, 0.5, 0]
            }
          />
        </Canvas>

        {isLoading && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center font-mono text-foreground">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-foreground"></div>
            <p>Loading 3D skeleton...</p>
          </div>
        )}
      </div>

      {/* Bottom Arrow and Collapsible Panel */}
      <div className="absolute right-4 bottom-0">
        {/* Arrow Button */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="flex items-center space-x-2 border-2 border-foreground bg-background px-4 py-2 font-mono text-sm text-foreground transition-all duration-200 hover:bg-muted"
        >
          <span>3D Controls</span>
          <span
            className={`transform transition-transform duration-200 ${isPanelOpen ? "rotate-180" : ""}`}
          >
            ▲
          </span>
        </button>

        {/* Collapsible Panel */}
        {isPanelOpen && (
          <div className="absolute right-0 bottom-full mb-2 max-h-80 w-64 overflow-y-auto border-2 border-foreground bg-background p-4">
            <div className="space-y-4">
              {/* Component Selection */}
              <div>
                <h3 className="mb-2 border-b border-gray-600 pb-1 text-xs font-normal tracking-wider text-gray-300 uppercase">
                  Component Selection
                </h3>
                <select
                  id="subcomponent-dropdown"
                  className="mb-2 w-full border border-gray-600 bg-black p-2 font-mono text-xs text-white focus:border-white focus:outline-none"
                >
                  <option value="">Select anatomical component...</option>
                  <optgroup label="SKULL & HEAD">
                    <option value="skull">SKULL</option>
                    <option value="temporal">TEMPORAL</option>
                    <option value="frontal">FRONTAL</option>
                    <option value="mandible">MANDIBLE</option>
                  </optgroup>
                  <optgroup label="SPINE & BACK">
                    <option value="spine">SPINE</option>
                    <option value="cervical">CERVICAL</option>
                    <option value="lumbar">LUMBAR</option>
                  </optgroup>
                  <optgroup label="UPPER BODY">
                    <option value="ribs">RIBS</option>
                    <option value="humerus">HUMERUS</option>
                    <option value="clavicle">CLAVICLE</option>
                  </optgroup>
                  <optgroup label="HAND & WRIST">
                    <option value="phalanges">PHALANGES</option>
                    <option value="fingers">FINGERS</option>
                    <option value="wrist">WRIST</option>
                  </optgroup>
                  <optgroup label="LOWER BODY">
                    <option value="femur">FEMUR</option>
                    <option value="tibia">TIBIA</option>
                    <option value="knee">KNEE</option>
                  </optgroup>
                </select>
                <button
                  className="border border-gray-500 bg-black px-3 py-1 font-mono text-xs text-white transition-all duration-100 hover:bg-gray-500"
                  onClick={() => {
                    const dropdown = document.getElementById(
                      "subcomponent-dropdown",
                    ) as HTMLSelectElement;
                    if (dropdown?.value) {
                      setSearchText(dropdown.value);
                      void analyzeInjury();
                    }
                  }}
                >
                  Load & Highlight
                </button>
              </div>

              {/* Skeleton Files */}
              <div>
                <h3 className="mb-2 border-b border-gray-600 pb-1 text-xs font-normal tracking-wider text-gray-300 uppercase">
                  Skeleton Files
                </h3>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    "overview-skeleton.glb",
                    "colored-skull-base.glb",
                    "hand.glb",
                    "lower-limb.glb",
                    "upper-limb.glb",
                    "vertebrae.glb",
                  ].map((file) => (
                    <button
                      key={file}
                      className="border border-gray-500 bg-black px-2 py-1 font-mono text-xs text-white transition-all duration-100 hover:bg-gray-500"
                      onClick={() => {
                        setCurrentSkeletonFile(file);
                      }}
                    >
                      {file.replace(".glb", "").toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currently Highlighted */}
              <div>
                <h3 className="mb-2 border-b border-gray-600 pb-1 text-xs font-normal tracking-wider text-gray-300 uppercase">
                  Currently Highlighted
                </h3>
                <button
                  className="mb-2 border border-red-500 bg-black px-3 py-1 font-mono text-xs text-red-500 transition-all duration-100 hover:bg-red-500 hover:text-black"
                  onClick={() => {
                    clearHighlights();
                    setHighlightedParts(new Set());
                  }}
                >
                  Clear All Highlights
                </button>
                <div className="max-h-32 overflow-y-auto border border-gray-600 bg-black p-2">
                  {currentSkeleton ? (
                    <div className="space-y-1">
                      {Array.from(highlightedParts).map((part) => (
                        <div
                          key={part}
                          className="border border-red-500 bg-red-900 px-2 py-1 font-mono text-xs text-red-200"
                        >
                          {part.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="font-mono text-xs text-gray-500">
                      No skeleton loaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
