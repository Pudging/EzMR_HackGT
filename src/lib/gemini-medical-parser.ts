import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/env.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(env.GOOGLE_GENERATIVE_AI_API_KEY);

interface ParsedMedicalData {
  demographics?: {
    name?: string;
    dob?: string;
    sex?: string;
    address?: string;
    phone?: string;
    insurance?: string;
    emergencyContact?: string;
    patientId?: string;
  };
  vitals?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
    height?: string;
    bmi?: string;
    bloodType?: string;
  };
  medications?: Array<{
    name: string;
    dosage?: string;
    schedule?: string;
  }>;
  socialHistory?: {
    smoking?: string;
    drugs?: string;
    alcohol?: string;
  };
  pastConditions?: Array<{
    date?: string;
    bodyPart?: string;
    notes: string;
  }>;
  immunizations?: Array<{
    date?: string;
    notes: string;
  }>;
  familyHistory?: Array<{
    date?: string;
    bodyPart?: string;
    notes: string;
  }>;
  allergies?: string;
  generalNotes?: string;
  dnr?: boolean;
  preventiveCare?: string;
}

export class GeminiMedicalParser {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent medical parsing
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });
  }

  async parseNotes(rawNotes: string): Promise<ParsedMedicalData> {
    const prompt = `
You are a medical AI assistant specialized in parsing clinical notes and extracting structured EMR data.

Parse the following medical notes and extract relevant information into JSON format. Be very thorough and extract as much relevant medical information as possible, even from casual or conversational language.

MEDICAL NOTES:
"${rawNotes}"

Please extract and structure the information into the following JSON format. If information is not available, omit the field or use null:

{
  "demographics": {
    "name": "patient name if mentioned",
    "dob": "date of birth in YYYY-MM-DD format if mentioned",
    "sex": "male/female/other if mentioned",
    "address": "address if mentioned",
    "phone": "phone number if mentioned",
    "insurance": "insurance information if mentioned",
    "emergencyContact": "emergency contact if mentioned",
    "patientId": "patient ID/MRN if mentioned"
  },
  "vitals": {
    "bloodPressure": "blood pressure reading (e.g., 120/80)",
    "heartRate": "heart rate (e.g., 72 bpm)",
    "temperature": "temperature (e.g., 98.6°F)",
    "weight": "weight (e.g., 150 lbs)",
    "height": "height (e.g., 5'8\")",
    "bmi": "BMI if calculated or mentioned",
    "bloodType": "blood type if mentioned"
  },
  "medications": [
    {
      "name": "medication name",
      "dosage": "dosage amount",
      "schedule": "frequency/schedule"
    }
  ],
  "socialHistory": {
    "smoking": "smoking history details",
    "drugs": "drug use history",
    "alcohol": "alcohol use history"
  },
  "pastConditions": [
    {
      "date": "date if mentioned (YYYY-MM-DD format)",
      "bodyPart": "affected body part or system",
      "notes": "condition details"
    }
  ],
  "immunizations": [
    {
      "date": "vaccination date (YYYY-MM-DD format)",
      "notes": "vaccination details"
    }
  ],
  "familyHistory": [
    {
      "date": "date if relevant",
      "bodyPart": "family member relationship",
      "notes": "family medical history details"
    }
  ],
  "allergies": "allergy information",
  "generalNotes": "any other relevant medical information",
  "dnr": true/false if DNR status is mentioned,
  "preventiveCare": "preventive care information"
}

IMPORTANT PARSING INSTRUCTIONS:
1. Extract information even from casual, conversational language
2. Interpret medical shorthand and common abbreviations
3. Infer medical context from colloquial descriptions
4. For family history, put the relationship (mother, father, etc.) in the "bodyPart" field
5. For chronic conditions, note them in pastConditions
6. Be liberal in interpretation - if someone says "chronically insane" interpret as mental health history
7. Convert casual drug references to appropriate medical terminology
8. Extract dates even from partial information (e.g., "2017 September 5th" → "2017-09-05")
9. Return ONLY the JSON object, no additional text or explanation

`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonRegex = /\{[\s\S]*\}/;
      const jsonMatch = jsonRegex.exec(text);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      return parsedData;
    } catch (error) {
      console.error('Error parsing medical notes with Gemini:', error);
      throw new Error('Failed to parse medical notes');
    }
  }

  async categorizeNotes(medicalText: string): Promise<{
    categories: Array<{
      category: string;
      extractedText: string;
      confidence: number;
      suggestions?: string[];
    }>;
    summary: string;
    keyFindings: string[];
  }> {
    const prompt = `
Analyze the following medical text and categorize it into EMR sections. Provide confidence scores and key findings.

MEDICAL TEXT:
"${medicalText}"

Return a JSON object with the following structure:

{
  "categories": [
    {
      "category": "category name (demographics, vitals, medications, socialHistory, pastConditions, immunizations, familyHistory, allergies, carePlans)",
      "extractedText": "relevant text from the notes",
      "confidence": 0.95,
      "suggestions": ["additional context or interpretations"]
    }
  ],
  "summary": "Brief summary of the medical text content",
  "keyFindings": ["important medical findings as bullet points"]
}

Return ONLY the JSON object.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      const jsonRegex = /\{[\s\S]*\}/;
      const jsonMatch = jsonRegex.exec(text);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in categorization response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error categorizing medical notes with Gemini:', error);
      throw new Error('Failed to categorize medical notes');
    }
  }
}

export const geminiParser = new GeminiMedicalParser();
