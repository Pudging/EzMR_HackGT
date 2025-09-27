// Category Extractor tool temporarily disabled due to TypeScript interface issues
// We're using API routes directly instead which works perfectly

export const categoryExtractor = {
  label: 'Category Extractor',
  description: 'Categorize medical notes - currently using API routes',
};

export default categoryExtractor;

/* Original tool commented out - using API routes instead

import { z } from 'zod';

// Schema for categorization input
const CategorizationInputSchema = z.object({
  medicalText: z.string().describe('Medical text to categorize'),
  targetCategories: z.array(z.string()).optional().describe('Specific categories to extract (optional)'),
});

// Schema for categorization output
const CategorizationOutputSchema = z.object({
  categories: z.array(z.object({
    category: z.string().describe('The EMR category name'),
    extractedText: z.string().describe('Relevant text from the medical notes'),
    confidence: z.number().min(0).max(1).describe('Confidence score from 0 to 1'),
    suggestions: z.array(z.string()).optional().describe('Additional context or interpretations'),
  })),
  summary: z.string().describe('Brief summary of the medical text content'),
  keyFindings: z.array(z.string()).describe('Important medical findings as bullet points'),
});

Original tool definition that had TypeScript errors:
export const categoryExtractor = {
  label: 'Category Extractor',
  description: 'Categorize medical text into structured EMR sections with confidence scores',
  inputSchema: CategorizationInputSchema,
  outputSchema: CategorizationOutputSchema,
  execute: async ({ context }) => {
    const { medicalText, targetCategories } = context;
    
    const categories = targetCategories || [
      'demographics', 'vitals', 'medications', 'socialHistory', 
      'pastConditions', 'immunizations', 'familyHistory', 'allergies', 'carePlans'
    ];
    
    return {
      instructions: `Analyze and categorize the following medical text into these categories: ${categories.join(', ')}. Text: "${medicalText}"`,
      schema: CategorizationOutputSchema,
      medicalText,
      targetCategories: categories
    };
  },
};

*/