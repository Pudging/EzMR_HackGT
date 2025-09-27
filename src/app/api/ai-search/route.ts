import { type NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { env } from "@/env";

const searchResultsSchema = z.object({
  summary: z.string().describe("Brief summary of the query and its medical relevance based on actual patient data"),
  relevantConditions: z.array(z.object({
    condition: z.string().describe("Medical condition or concern"),
    relevance: z.string().describe("Why this is relevant to the query based on patient's actual data"),
    urgency: z.enum(["low", "medium", "high"]).describe("Clinical urgency level"),
    section: z.enum(["allergies", "medications", "socialHistory", "pastConditions", "familyHistory", "vitals", "immunizations", "general"]).describe("Which patient data section this relates to"),
    dataStatus: z.enum(["present", "missing", "concerning"]).describe("Whether relevant data is present, missing, or concerning in patient record"),
    specificFindings: z.string().describe("Specific findings from patient data (e.g., 'No tetanus vaccination in last 10 years' or 'Patient has penicillin allergy')")
  })).describe("List of relevant medical conditions and concerns with specific data analysis"),
  warnings: z.array(z.object({
    warning: z.string().describe("Important warning or contraindication based on patient's actual data"),
    severity: z.enum(["caution", "warning", "critical"]).describe("Severity level"),
    basedOn: z.string().describe("What specific patient data this warning is based on")
  })).describe("Important warnings or contraindications based on actual patient data")
});

export async function POST(request: NextRequest) {
  try {
    const { query, patientData } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (query.length > 500) {
      return NextResponse.json({ error: "Query too long" }, { status: 400 });
    }

    const prompt = `You are a clinical decision support AI that must analyze a patient query against their ACTUAL medical data. You must be specific about what IS and ISN'T in their record.

PATIENT QUERY: "${query}"

COMPLETE PATIENT DATA:
${patientData ? JSON.stringify(patientData, null, 2) : "No patient data provided"}

CRITICAL INSTRUCTIONS:
1. ANALYZE ACTUAL DATA: Look at the specific patient data provided. Don't make general recommendations - be specific about what this patient has or lacks.

2. IDENTIFY GAPS: For each clinical concern, specify whether the relevant information is:
   - PRESENT: "Patient has X" (cite specific data)
   - MISSING: "No X found in patient record" 
   - CONCERNING: "Patient has X which is concerning because Y"

3. BE SPECIFIC WITH FINDINGS: Instead of "check tetanus status", say "No tetanus vaccination found in immunization record - last tetanus unknown" or "Most recent tetanus shot was 2020-08-20, due for booster"

4. MEDICATION ANALYSIS: Look at actual medications and identify:
   - Drug interactions with query-related treatments
   - Contraindications based on allergies
   - Missing medications that might be expected

5. SECTION-SPECIFIC ANALYSIS:
   - allergies: Check if patient has allergies that affect treatment of the query
   - medications: Identify interactions, contraindications, or helpful existing meds
   - socialHistory: Note smoking/alcohol/drug use that affects query
   - pastConditions: Find relevant previous conditions or note absence
   - familyHistory: Identify genetic risks related to query
   - vitals: Note concerning vital signs relevant to query
   - immunizations: Check vaccination status for infection-related queries
   - general: Overall health factors

6. EXAMPLES OF SPECIFIC ANALYSIS:
   - Query: "shot in leg" + Patient data shows "No tetanus in immunizations" → "MISSING: No tetanus vaccination found in record, urgent tetanus prophylaxis needed"
   - Query: "chest pain" + Patient data shows "Father: heart disease" → "PRESENT: Family history of cardiac disease increases risk"
   - Query: "pain management" + Patient data shows "Allergy: Penicillin" → "CONCERNING: Patient allergic to penicillin, avoid related antibiotics"

7. WARNINGS MUST BE DATA-SPECIFIC:
   - Base warnings on actual patient allergies, medications, conditions
   - Cite specific data: "Critical: Patient takes warfarin (blood thinner), bleeding risk with trauma"

You must reference the actual patient data in every response. Be a clinical detective using the real information available.`;

    const result = await generateObject({
      model: google("gemini-2.0-flash-exp", {
        apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
      }),
      schema: searchResultsSchema,
      prompt,
    });

    return NextResponse.json(result.object);

  } catch (error) {
    console.error("Error in AI search:", error);
    return NextResponse.json(
      { error: "Failed to process AI search" },
      { status: 500 }
    );
  }
}
