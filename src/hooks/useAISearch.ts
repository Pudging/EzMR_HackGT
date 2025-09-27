import { useState, useCallback } from 'react';

export interface AISearchResult {
  summary: string;
  relevantConditions: Array<{
    condition: string;
    relevance: string;
    urgency: 'low' | 'medium' | 'high';
    section: 'allergies' | 'medications' | 'socialHistory' | 'pastConditions' | 'familyHistory' | 'vitals' | 'immunizations' | 'general';
    dataStatus: 'present' | 'missing' | 'concerning';
    specificFindings: string;
  }>;
  warnings: Array<{
    warning: string;
    severity: 'caution' | 'warning' | 'critical';
    basedOn: string;
  }>;
}

export function useAISearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<AISearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, patientData?: any) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, patientData }),
      });

      if (!response.ok) {
        throw new Error(`AI search failed: ${response.status}`);
      }

      const data: AISearchResult = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform AI search');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    search,
    isSearching,
    results,
    error,
    clearResults
  };
}
