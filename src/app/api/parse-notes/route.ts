import { type NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Define Zod schema for medical data
const medicalDataSchema = z.object({
  demographics: z.object({
    name: z.string().optional(),
    dob: z.string().optional(),
    sex: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    insurance: z.string().optional(),
    emergencyContact: z.string().optional(),
    patientId: z.string().optional(),
  }).optional(),
  vitals: z.object({
    bloodPressure: z.string().optional(),
    heartRate: z.string().optional(),
    temperature: z.string().optional(),
    weight: z.string().optional(),
    height: z.string().optional(),
    bmi: z.string().optional(),
    bloodType: z.string().optional(),
  }).optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string().optional(),
    schedule: z.string().optional(),
  })).optional(),
  socialHistory: z.object({
    smoking: z.string().optional(),
    drugs: z.string().optional(),
    alcohol: z.string().optional(),
  }).optional(),
  pastConditions: z.array(z.object({
    date: z.string().optional(),
    bodyPart: z.string(),
    notes: z.string(),
  })).optional(),
  immunizations: z.array(z.object({
    date: z.string().optional(),
    notes: z.string(),
  })).optional(),
  familyHistory: z.array(z.object({
    date: z.string().optional(),
    bodyPart: z.string(),
    notes: z.string(),
  })).optional(),
  allergies: z.string().optional(),
  generalNotes: z.string().optional(),
  dnr: z.boolean().optional(),
  preventiveCare: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { notes } = await request.json();

    if (!notes || typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing notes parameter' },
        { status: 400 }
      );
    }

    if (notes.length > 10000) {
      return NextResponse.json(
        { error: 'Notes too long. Maximum 10,000 characters allowed.' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const now = new Date().toISOString(); // Get current timestamp

    // Use Vercel AI SDK with Google Gemini
    const result = await generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: medicalDataSchema,
      prompt: `
You are a medical AI assistant specialized in parsing clinical notes and extracting structured EMR data.

Parse the following medical notes and extract relevant information. Be very thorough and extract as much relevant medical information as possible, even from casual or conversational language.

MEDICAL NOTES:
"${notes}"

IMPORTANT PARSING INSTRUCTIONS:
1. Extract information even from casual, conversational language
2. Interpret medical shorthand and common abbreviations
3. Infer medical context from colloquial descriptions
4. For family history, put the relationship (mother, father, etc.) in the "bodyPart" field
5. For chronic conditions, note them in pastConditions
6. Be liberal in interpretation - if someone says "chronically insane" interpret as mental health history
7. Convert casual drug references to appropriate medical terminology
8. Extract dates even from partial information (e.g., "2017 September 5th" → "2017-09-05")
9. **CURRENT INJURIES/CONDITIONS**: If the notes describe current/present injuries or conditions (e.g., "presented with", "has a wound", "is bleeding"), treat these as pastConditions with today's date (${today})
10. **AUTOMATIC TIMESTAMPING**: Add timestamp to all notes - prefix condition notes with "[${now}] "
11. **CURRENT ALLERGIES**: If allergies are mentioned as current reactions (e.g., "allergy to poison"), include in allergies field
12. **PROGNOSIS**: Include prognosis information in the generalNotes field
13. **BODY PART MAPPING**: Map body part mentions to specific categories:
    - "head" → "HEAD"
    - "neck" → "NECK"
    - "chest" → "CHEST"
    - "heart" → "HEART"
    - "lung/lungs" → "LEFT LUNG" or "RIGHT LUNG" (or both if not specified)
    - "abdomen/belly/stomach area" → "ABDOMEN"
    - "stomach" (organ) → "STOMACH"
    - "liver" → "LIVER"
    - "kidney" → "LEFT KIDNEY" or "RIGHT KIDNEY"
    - "shoulder" → "LEFT SHOULDER" or "RIGHT SHOULDER"
    - "arm" → "LEFT ARM" or "RIGHT ARM"
    - "forearm" → "LEFT FOREARM" or "RIGHT FOREARM"
    - "thigh/leg" → "LEFT THIGH" or "RIGHT THIGH"
    - "shin/calf" → "LEFT SHIN" or "RIGHT SHIN"
    - "spine/back" → "SPINE"
    - "pelvis/hip" → "PELVIS"
    - If side not specified, use general area or "OTHER"
14. **VITAL SIGNS STANDARDIZATION**:
    - **Blood Pressure**: Always format as "systolic/diastolic" in mmHg (e.g., "120/80")
    - **Heart Rate**: Always in bpm, remove "bpm" from number (e.g., "72" not "72 bpm")
    - **Temperature**: Convert to °F if needed:
      * Celsius to Fahrenheit: (C × 9/5) + 32
      * Examples: 37°C → 98.6, 38°C → 100.4
    - **Weight**: Convert to kg as single number:
      * lbs to kg: lbs ÷ 2.20462
      * Examples: 154 lbs → 70, 176 lbs → 80
      * Remove units, just the number (e.g., "70" not "70 kg")
    - **Height**: Convert to meters as decimal:
      * feet'inches to meters: (feet × 12 + inches) × 0.0254
      * cm to meters: cm ÷ 100
      * Examples: 5'9" → 1.75, 175cm → 1.75, 6'0" → 1.83
      * Use 2 decimal places maximum (e.g., "1.75" not "1.7526")
    - **BMI**: Calculate if weight and height provided but BMI not mentioned:
      * BMI = weight(kg) ÷ height(m)²
      * Round to 1 decimal place (e.g., "22.5")
    - **Blood Type**: Extract exact blood type (A+, A-, B+, B-, AB+, AB-, O+, O-), include Rh factor

Extract all relevant medical information from the notes and structure it according to the schema.
      `,
      temperature: 0.1, // Low temperature for consistent medical parsing
    });

    return NextResponse.json(result.object);

  } catch (error) {
    console.error('Error parsing medical notes:', error);
    return NextResponse.json(
      { error: 'Failed to parse medical notes' },
      { status: 500 }
    );
  }
}