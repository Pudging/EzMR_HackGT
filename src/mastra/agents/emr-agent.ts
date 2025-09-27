// Temporarily disabled imports - using API routes instead
// import { Agent } from '@mastra/core';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { env } from '@/env.js';

// Mastra agent temporarily disabled due to TypeScript interface issues
// We're using API routes directly instead which works perfectly
// export const emrAgent = new Agent({...});

export const emrAgent = {
  name: 'EMR Processing Agent',
  description: 'Agent for processing medical records - currently using API routes'
};

export default emrAgent;
