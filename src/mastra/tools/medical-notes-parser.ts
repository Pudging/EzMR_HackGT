// Medical Notes Parser tool temporarily disabled due to TypeScript interface issues
// We're using API routes directly instead which works perfectly

export const medicalNotesParser = {
  label: 'Medical Notes Parser',
  description: 'Parse raw medical notes - currently using API routes',
};

export default medicalNotesParser;

/* Original tool commented out - using API routes instead

import { z } from 'zod';

// Define the schema for parsed medical data
const ParsedMedicalDataSchema = z.object({
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

Original tool definition that had TypeScript errors:
export const medicalNotesParser = {
  label: 'Medical Notes Parser',  
  description: 'Parse raw medical notes and extract structured medical information',
  inputSchema: z.object({
    rawNotes: z.string().describe('Raw medical notes text to be parsed'),
  }),
  outputSchema: ParsedMedicalDataSchema,
  execute: async ({ context }) => {
    const { rawNotes } = context;
    
    return {
      instructions: `Parse the following medical notes and extract structured EMR information: "${rawNotes}"`,
      schema: ParsedMedicalDataSchema,
      rawNotes
    };
  },
};

*/