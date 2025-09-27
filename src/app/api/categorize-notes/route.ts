import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runMastraGenerate } from '@/mastra/run';

// Define Zod schema for categorization data
const categorizationSchema = z.object({
  categories: z.array(z.object({
    category: z.string(),
    extractedText: z.string(),
    confidence: z.number().min(0).max(1),
    suggestions: z.array(z.string()).optional(),
  })),
  summary: z.string(),
  keyFindings: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing text parameter' },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 10,000 characters allowed.' },
        { status: 400 }
      );
    }

    // Mastra Agent (Gemini) + Zod validation
    const prompt = `
Analyze the following medical text and categorize it into EMR sections. Provide confidence scores and key findings.

MEDICAL TEXT:
"${text}"

Categories to detect and analyze:
- demographics: Patient identifying information (name, DOB, address, insurance, etc.)
- vitals: Vital signs (blood pressure, heart rate, temperature, weight, height, BMI, blood type)
- medications: Current and past medications with dosages and schedules
- socialHistory: Smoking, drug use, alcohol consumption history
- pastConditions: Previous medical conditions, injuries, surgeries
- immunizations: Vaccination history
- familyHistory: Family medical history
- allergies: Known allergies and reactions
- carePlans: Treatment plans, care instructions, follow-up plans

For each detected category:
1. Extract the relevant text from the medical notes
2. Provide a confidence score (0.0 to 1.0) for how certain you are about the categorization
3. Include suggestions for additional context or interpretations if helpful

Also provide:
- A brief summary of the overall medical text content
- Key medical findings as bullet points

Be thorough in your analysis and extract as much relevant information as possible.
Return ONLY strict JSON matching the schema with no extra commentary.
    `;
    const textOut = await runMastraGenerate(prompt, 'gemini-2.0-flash-exp');
    const jsonMatch = /\{[\s\S]*\}/.exec(textOut);
    const jsonString = jsonMatch ? jsonMatch[0] : textOut;

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (_err) {
      return NextResponse.json({ error: 'AI did not return valid JSON', raw: textOut }, { status: 502 });
    }

    const validated = categorizationSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json({ error: 'AI output failed schema validation', issues: validated.error.issues, raw: parsed }, { status: 422 });
    }

    return NextResponse.json(validated.data);

  } catch (error) {
    console.error('Error categorizing medical notes:', error);
    return NextResponse.json(
      { error: 'Failed to categorize medical notes' },
      { status: 500 }
    );
  }
}