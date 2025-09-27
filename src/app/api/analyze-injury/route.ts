import { NextRequest, NextResponse } from "next/server";

// Enhanced medical terminology mapping for injury analysis
const medicalTermMap = {
  // Skull and head injuries - comprehensive coverage
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
    "temporal fracture",
    "temporal broken",
    "temporal injury",
    "temple fracture",
    "temple broken",
    "temple injury",
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
    "frontal fracture",
    "frontal broken",
    "frontal injury",
    "forehead fracture",
    "forehead broken",
    "forehead injury",
  ],
  parietal: [
    "parietal",
    "parietal bone",
    "parietal lobe",
    "parietal_left",
    "parietal_right",
    "parietal.l",
    "parietal.r",
    "parietal fracture",
    "parietal broken",
    "parietal injury",
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
    "occipital fracture",
    "occipital broken",
    "occipital injury",
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
    "jaw fracture",
    "jaw broken",
    "jaw injury",
    "lower jaw fracture",
    "lower jaw broken",
    "lower jaw injury",
  ],
  maxilla: [
    "maxilla",
    "upper jaw",
    "maxillary",
    "maxilla_left",
    "maxilla_right",
    "maxilla.l",
    "maxilla.r",
    "upper jaw fracture",
    "upper jaw broken",
    "upper jaw injury",
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
    "cheekbone fracture",
    "cheekbone broken",
    "cheekbone injury",
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
    "nose fracture",
    "nose broken",
    "nose injury",
    "nasal fracture",
    "nasal broken",
    "nasal injury",
  ],
  ethmoid: [
    "ethmoid",
    "ethmoid bone",
    "ethmoid_left",
    "ethmoid_right",
    "ethmoid.l",
    "ethmoid.r",
    "ethmoid fracture",
    "ethmoid broken",
    "ethmoid injury",
  ],
  sphenoid: [
    "sphenoid",
    "sphenoid bone",
    "sphenoid_left",
    "sphenoid_right",
    "sphenoid.l",
    "sphenoid.r",
    "sphenoid fracture",
    "sphenoid broken",
    "sphenoid injury",
  ],

  // Spine injuries - comprehensive coverage
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
    "neck fracture",
    "neck broken",
    "neck injury",
    "cervical fracture",
    "cervical broken",
    "cervical injury",
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
    "thoracic fracture",
    "thoracic broken",
    "thoracic injury",
    "upper back fracture",
    "upper back broken",
    "upper back injury",
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
    "lumbar fracture",
    "lumbar broken",
    "lumbar injury",
    "lower back fracture",
    "lower back broken",
    "lower back injury",
  ],
  sacrum: [
    "sacrum",
    "sacral",
    "sacral bone",
    "sacrum_left",
    "sacrum_right",
    "sacrum.l",
    "sacrum.r",
    "sacrum fracture",
    "sacrum broken",
    "sacrum injury",
    "sacral fracture",
    "sacral broken",
    "sacral injury",
  ],
  coccyx: [
    "coccyx",
    "tailbone",
    "coccygeal",
    "coccyx_left",
    "coccyx_right",
    "coccyx.l",
    "coccyx.r",
    "tailbone fracture",
    "tailbone broken",
    "tailbone injury",
    "coccyx fracture",
    "coccyx broken",
    "coccyx injury",
  ],
  vertebrae: [
    "vertebrae",
    "vertebra",
    "vertebral",
    "spine",
    "spinal",
    "backbone",
    "vertebral column",
    "spine fracture",
    "spine broken",
    "spine injury",
    "backbone fracture",
    "backbone broken",
    "backbone injury",
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
    "collarbone fracture",
    "collarbone broken",
    "collarbone injury",
  ],
  scapula: [
    "scapula",
    "shoulder blade",
    "scapular",
    "scapula_left",
    "scapula_right",
    "scapula.l",
    "scapula.r",
    "shoulder blade fracture",
    "shoulder blade broken",
    "shoulder blade injury",
  ],
  sternum: [
    "sternum",
    "breastbone",
    "sternal",
    "sternum_left",
    "sternum_right",
    "sternum.l",
    "sternum.r",
    "breastbone fracture",
    "breastbone broken",
    "breastbone injury",
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
    "rib fracture",
    "rib broken",
    "rib injury",
    "ribcage fracture",
    "ribcage broken",
    "ribcage injury",
  ],
  humerus: [
    "humerus",
    "upper arm bone",
    "humeral",
    "humerus_left",
    "humerus_right",
    "humerus.l",
    "humerus.r",
    "upper arm fracture",
    "upper arm broken",
    "upper arm injury",
    "arm fracture",
    "arm broken",
    "arm injury",
  ],
  radius: [
    "radius",
    "forearm bone",
    "radial",
    "radius_left",
    "radius_right",
    "radius.l",
    "radius.r",
    "forearm fracture",
    "forearm broken",
    "forearm injury",
  ],
  ulna: [
    "ulna",
    "forearm bone",
    "ulnar",
    "ulna_left",
    "ulna_right",
    "ulna.l",
    "ulna.r",
    "forearm fracture",
    "forearm broken",
    "forearm injury",
  ],
  elbow: [
    "elbow",
    "elbow joint",
    "cubital",
    "elbow_left",
    "elbow_right",
    "elbow.l",
    "elbow.r",
    "elbow fracture",
    "elbow broken",
    "elbow injury",
  ],
  shoulder: [
    "shoulder",
    "shoulder joint",
    "glenohumeral",
    "shoulder_left",
    "shoulder_right",
    "shoulder.l",
    "shoulder.r",
    "shoulder fracture",
    "shoulder broken",
    "shoulder injury",
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
    "toe fracture",
    "toe broken",
    "toe injury",
    "finger fracture",
    "finger broken",
    "finger injury",
  ],
  thumb: [
    "thumb",
    "first digit",
    "pollex",
    "thumb_left",
    "thumb_right",
    "thumb.l",
    "thumb.r",
    "thumb fracture",
    "thumb broken",
    "thumb injury",
  ],
  fingers: [
    "fingers",
    "digits",
    "finger",
    "finger_left",
    "finger_right",
    "finger.l",
    "finger.r",
    "finger fracture",
    "finger broken",
    "finger injury",
  ],
  wrist: [
    "wrist",
    "wrist joint",
    "carpal",
    "wrist_left",
    "wrist_right",
    "wrist.l",
    "wrist.r",
    "wrist fracture",
    "wrist broken",
    "wrist injury",
  ],
  hand: [
    "hand",
    "manual",
    "hand_left",
    "hand_right",
    "hand.l",
    "hand.r",
    "hand fracture",
    "hand broken",
    "hand injury",
  ],

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
    "hip fracture",
    "hip broken",
    "hip injury",
  ],
  femur: [
    "femur",
    "thigh bone",
    "femoral",
    "femur_left",
    "femur_right",
    "femur.l",
    "femur.r",
    "thigh fracture",
    "thigh broken",
    "thigh injury",
    "leg fracture",
    "leg broken",
    "leg injury",
  ],
  tibia: [
    "tibia",
    "shin bone",
    "tibial",
    "tibia_left",
    "tibia_right",
    "tibia.l",
    "tibia.r",
    "shin fracture",
    "shin broken",
    "shin injury",
  ],
  fibula: [
    "fibula",
    "calf bone",
    "fibular",
    "fibula_left",
    "fibula_right",
    "fibula.l",
    "fibula.r",
    "calf fracture",
    "calf broken",
    "calf injury",
  ],
  patella: [
    "patella",
    "kneecap",
    "patellar",
    "patella_left",
    "patella_right",
    "patella.l",
    "patella.r",
    "kneecap fracture",
    "kneecap broken",
    "kneecap injury",
  ],
  knee: [
    "knee",
    "knee joint",
    "patellar",
    "knee_left",
    "knee_right",
    "knee.l",
    "knee.r",
    "knee fracture",
    "knee broken",
    "knee injury",
  ],
  ankle: [
    "ankle",
    "ankle joint",
    "tarsal",
    "ankle_left",
    "ankle_right",
    "ankle.l",
    "ankle.r",
    "ankle fracture",
    "ankle broken",
    "ankle injury",
  ],
  foot: [
    "foot",
    "feet",
    "pedal",
    "foot_left",
    "foot_right",
    "foot.l",
    "foot.r",
    "foot fracture",
    "foot broken",
    "foot injury",
  ],
  toes: [
    "toes",
    "toe",
    "digital",
    "toe_left",
    "toe_right",
    "toe.l",
    "toe.r",
    "toe fracture",
    "toe broken",
    "toe injury",
  ],

  // General terms
  skull: [
    "skull",
    "cranium",
    "head",
    "cranial",
    "skull_left",
    "skull_right",
    "skull.l",
    "skull.r",
    "head fracture",
    "head broken",
    "head injury",
    "skull fracture",
    "skull broken",
    "skull injury",
  ],
  spine: [
    "spine",
    "spinal",
    "backbone",
    "vertebral column",
    "spine_left",
    "spine_right",
    "spine.l",
    "spine.r",
    "spine fracture",
    "spine broken",
    "spine injury",
    "backbone fracture",
    "backbone broken",
    "backbone injury",
  ],
  arm: [
    "arm",
    "upper limb",
    "brachial",
    "arm_left",
    "arm_right",
    "arm.l",
    "arm.r",
    "arm fracture",
    "arm broken",
    "arm injury",
    "upper limb fracture",
    "upper limb broken",
    "upper limb injury",
  ],
  leg: [
    "leg",
    "lower limb",
    "crural",
    "leg_left",
    "leg_right",
    "leg.l",
    "leg.r",
    "leg fracture",
    "leg broken",
    "leg injury",
    "lower limb fracture",
    "lower limb broken",
    "lower limb injury",
  ],
  limb: [
    "limb",
    "extremity",
    "appendage",
    "limb_left",
    "limb_right",
    "limb.l",
    "limb.r",
    "limb fracture",
    "limb broken",
    "limb injury",
    "extremity fracture",
    "extremity broken",
    "extremity injury",
  ],
};

// Injury severity keywords
const severityKeywords = [
  "severely",
  "severely injured",
  "severe",
  "critical",
  "critical injury",
  "badly",
  "badly injured",
  "seriously",
  "seriously injured",
  "serious",
  "fractured",
  "broken",
  "cracked",
  "shattered",
  "crushed",
  "dislocated",
  "displaced",
  "misaligned",
  "torn",
  "ruptured",
  "lacerated",
  "cut",
  "pierced",
  "bruised",
  "contused",
  "swollen",
  "inflamed",
  "injured",
  "damaged",
  "hurt",
  "wounded",
];

// Determine which skeleton file to load based on body part
function getSkeletonFile(bodyPart: string): string {
  const part = bodyPart.toLowerCase();

  if (
    part.includes("skull") ||
    part.includes("cranium") ||
    part.includes("head") ||
    part.includes("temporal") ||
    part.includes("frontal") ||
    part.includes("parietal") ||
    part.includes("occipital") ||
    part.includes("mandible") ||
    part.includes("maxilla") ||
    part.includes("zygomatic") ||
    part.includes("nasal") ||
    part.includes("ethmoid") ||
    part.includes("sphenoid")
  ) {
    return "colored-skull-base.glb";
  }

  if (
    part.includes("hand") ||
    part.includes("finger") ||
    part.includes("thumb") ||
    part.includes("carpal") ||
    part.includes("metacarpal") ||
    part.includes("phalange") ||
    part.includes("wrist")
  ) {
    return "hand.glb";
  }

  if (
    part.includes("leg") ||
    part.includes("femur") ||
    part.includes("tibia") ||
    part.includes("fibula") ||
    part.includes("patella") ||
    part.includes("knee") ||
    part.includes("ankle") ||
    part.includes("foot") ||
    part.includes("toe")
  ) {
    return "lower-limb.glb";
  }

  if (
    part.includes("arm") ||
    part.includes("humerus") ||
    part.includes("radius") ||
    part.includes("ulna") ||
    part.includes("elbow") ||
    part.includes("shoulder")
  ) {
    return "upper-limb.glb";
  }

  if (
    part.includes("spine") ||
    part.includes("vertebrae") ||
    part.includes("cervical") ||
    part.includes("thoracic") ||
    part.includes("lumbar") ||
    part.includes("sacrum") ||
    part.includes("coccyx")
  ) {
    return "vertebrae.glb";
  }

  // Default to overview skeleton for general terms
  return "overview-skeleton.glb";
}

// Extract body parts from injury text and return actual mesh names
function extractInjuredParts(text: string): string[] {
  const injuredParts: string[] = [];
  const lowerText = text.toLowerCase();

  // Check for each medical term and return the actual mesh names that would be found
  Object.entries(medicalTermMap).forEach(([key, terms]) => {
    terms.forEach((term) => {
      if (lowerText.includes(term)) {
        // Return the key as the body part name that will be used for highlighting
        injuredParts.push(key);
      }
    });
  });

  return [...new Set(injuredParts)]; // Remove duplicates
}

// Check if text contains injury indicators
function hasInjuryIndicators(text: string): boolean {
  const lowerText = text.toLowerCase();
  return severityKeywords.some((keyword) => lowerText.includes(keyword));
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Extract injured body parts
    const injuredParts = extractInjuredParts(text);

    if (injuredParts.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No recognizable body parts found in the injury description",
        injuredParts: [],
        skeletonFile: null,
      });
    }

    // Determine the best skeleton file to load
    const skeletonFile = getSkeletonFile(injuredParts[0]!);

    // Check if the text actually indicates injury
    const hasInjury = hasInjuryIndicators(text);

    return NextResponse.json({
      success: true,
      injuredParts,
      skeletonFile,
      hasInjury,
      message: hasInjury
        ? `Found ${injuredParts.length} injured body part(s): ${injuredParts.join(", ")}`
        : `Found ${injuredParts.length} body part(s) mentioned: ${injuredParts.join(", ")}`,
    });
  } catch (error) {
    console.error("Error analyzing injury:", error);
    return NextResponse.json(
      { error: "Failed to analyze injury text" },
      { status: 500 },
    );
  }
}
