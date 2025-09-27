"use client";

import { useState, useCallback } from 'react';
import { type ParsedMedicalData, type CategoryExtraction } from '@/lib/vercel-ai-medical-parser';

// Re-export types for convenience
export type { ParsedMedicalData, CategoryExtraction };

export const useMastraAgent = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ParsedMedicalData | null>(null);

  const parseNotes = useCallback(async (rawNotes: string): Promise<ParsedMedicalData | null> => {
    if (!rawNotes.trim()) return null;

    setIsProcessing(true);
    setError(null);

    try {
      // Use server-side API route to avoid client-side Mastra issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/parse-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: rawNotes }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const parsedData = await response.json();
      setLastResult(parsedData as ParsedMedicalData);
      return parsedData as ParsedMedicalData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse medical notes with AI';
      setError(errorMessage);
      console.error('AI parsing error:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const categorizeNotes = useCallback(async (medicalText: string, _targetCategories?: string[]): Promise<CategoryExtraction | null> => {
    if (!medicalText.trim()) return null;

    setIsProcessing(true);
    setError(null);

    try {
      // Use server-side API route for categorization
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/categorize-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: medicalText }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Categorization API request failed: ${response.status} - ${errorText}`);
      }

      const categorizedData = await response.json();
      return categorizedData as CategoryExtraction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to categorize medical notes with AI';
      setError(errorMessage);
      console.error('AI categorization error:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processAndFillForm = useCallback(async (rawNotes: string): Promise<ParsedMedicalData | null> => {
    const parsedData = await parseNotes(rawNotes);
    
    if (parsedData) {
      // Additional processing could be done here
      // For example, validation, formatting, or additional AI analysis
      return parsedData;
    }
    
    return null;
  }, [parseNotes]);

  return {
    parseNotes,
    categorizeNotes,
    processAndFillForm,
    isProcessing,
    error,
    lastResult,
    clearError: () => setError(null),
  };
};
