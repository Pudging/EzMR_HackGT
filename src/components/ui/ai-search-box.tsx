"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  X,
  Loader2
} from "lucide-react";
import { useAISearch } from "@/hooks/useAISearch";

interface AISearchBoxProps {
  patientData?: unknown;
  onHighlightSection?: (section: string) => void;
}

export function AISearchBox({ patientData, onHighlightSection }: AISearchBoxProps) {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { search, isSearching, results, error, clearResults } = useAISearch();

  const handleSearch = async () => {
    if (!query.trim()) return;
    await search(query, patientData);
    setIsExpanded(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      void handleSearch();
    }
  };

  const handleClearResults = () => {
    clearResults();
    setQuery("");
    setIsExpanded(false);
  };

  const getUrgencyColor = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'low': return 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200';
    }
  };

  const getDataStatusColor = (status: 'present' | 'missing' | 'concerning') => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'missing': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      case 'concerning': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
    }
  };

  const getDataStatusIcon = (status: 'present' | 'missing' | 'concerning') => {
    switch (status) {
      case 'present': return '✓';
      case 'missing': return '!';
      case 'concerning': return '⚠';
    }
  };

  const getSeverityIcon = (severity: 'caution' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'caution': return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const handleSectionClick = (section: string) => {
    onHighlightSection?.(section);
    // Scroll to section
    const element = document.getElementById(`section-${section}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add temporary highlight
      element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
      }, 3000);
    }
  };

  return (
    <Card className="border shadow-sm mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center text-lg">
            <Sparkles className="text-primary mr-2 h-5 w-5" />
            AI Clinical Search
          </CardTitle>
          {(results ?? error) && (
            <Button variant="ghost" size="sm" onClick={handleClearResults}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="e.g., 'patient shot in right leg' or 'severe chest pain'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
              disabled={isSearching}
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {(results ?? error ?? isSearching) && (
        <CardContent className="pt-0">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <h3 className="text-blue-800 dark:text-blue-200 font-semibold text-sm mb-2">Clinical Summary</h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">{results.summary}</p>
              </div>

              {/* Warnings */}
              {results.warnings.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">⚠️ Warnings & Contraindications</h3>
                  {results.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start space-x-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                      {getSeverityIcon(warning.severity)}
                      <div className="flex-1">
                        <p className="text-red-800 dark:text-red-200 text-sm mb-1">{warning.warning}</p>
                        <p className="text-red-700 dark:text-red-300 text-xs font-mono bg-red-100 dark:bg-red-900/30 rounded px-2 py-1">
                          <strong>Based on:</strong> {warning.basedOn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Relevant Conditions */}
              {results.relevantConditions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">🔍 Relevant Clinical Considerations</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-xs"
                    >
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                  
                  <div className={`space-y-2 ${isExpanded ? '' : 'max-h-40 overflow-hidden'}`}>
                    {results.relevantConditions.map((condition, index) => (
                      <div key={index} className={`rounded-lg border p-3 cursor-pointer hover:shadow-sm transition-shadow ${getUrgencyColor(condition.urgency)}`} onClick={() => handleSectionClick(condition.section)}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <p className="font-medium text-sm">{condition.condition}</p>
                              <Badge variant="outline" className="text-xs">
                                {condition.section.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </Badge>
                              <Badge variant={condition.urgency === 'high' ? 'destructive' : condition.urgency === 'medium' ? 'default' : 'secondary'} className="text-xs">
                                {condition.urgency}
                              </Badge>
                              <Badge className={`text-xs ${getDataStatusColor(condition.dataStatus)}`}>
                                {getDataStatusIcon(condition.dataStatus)} {condition.dataStatus}
                              </Badge>
                            </div>
                            <p className="text-sm opacity-90 mb-2">{condition.relevance}</p>
                            <div className="rounded bg-black/5 dark:bg-white/5 p-2">
                              <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
                                <strong>Data finding:</strong> {condition.specificFindings}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}