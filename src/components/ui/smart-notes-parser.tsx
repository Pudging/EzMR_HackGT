"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import {
  useMastraAgent,
  type ParsedMedicalData,
  type CategoryExtraction,
} from "@/hooks/useMastraAgent";

interface SmartNotesParserProps {
  notes: string;
  onDataExtracted: (data: ParsedMedicalData) => void;
  className?: string;
}

export function SmartNotesParser({
  notes,
  onDataExtracted,
  className = "",
}: SmartNotesParserProps) {
  const [showResults, setShowResults] = useState(false);
  const [extractedData, setExtractedData] = useState<ParsedMedicalData | null>(
    null,
  );
  const [categories, setCategories] = useState<CategoryExtraction | null>(null);

  const { parseNotes, categorizeNotes, isProcessing, error, clearError } =
    useMastraAgent();

  const handleParseNotes = async () => {
    if (!notes.trim()) return;

    clearError();
    setShowResults(false);

    try {
      // Parse the notes and categorize them
      const [parsedData, categoryData] = await Promise.all([
        parseNotes(notes),
        categorizeNotes(notes),
      ]);

      if (parsedData) {
        setExtractedData(parsedData);
        setCategories(categoryData);
        setShowResults(true);
      }
    } catch (err) {
      console.error("Failed to process notes:", err);
    }
  };

  const handleApplyData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      setShowResults(false);
    }
  };

  const hasNotes = notes.trim().length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Parse Button */}
      <div className="flex items-center space-x-3">
        <Button
          onClick={handleParseNotes}
          disabled={!hasNotes || isProcessing}
          className="flex w-full items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              <span>AI Medical Parse</span>
            </>
          )}
        </Button>

        {hasNotes && !isProcessing && (
          <div className="text-sm text-gray-400">
            {notes.length} characters ready for AI processing
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/30 bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <Card className="border-blue-500/30 bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              <div>
                <div className="font-medium text-blue-300">
                  Gemini AI Processing Medical Notes
                </div>
                <div className="text-sm text-gray-400">
                  Processing current injuries, conditions, allergies, and
                  medical history with automatic timestamping...
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {showResults && extractedData && (
        <Card className="border-green-500/30 bg-green-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-green-300">
              <CheckCircle className="h-5 w-5" />
              <span>AI Extraction Complete</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            {categories?.summary && (
              <div className="rounded-lg bg-gray-900/50 p-3">
                <div className="mb-2 text-sm text-gray-300">Summary:</div>
                <div className="text-sm text-white">{categories.summary}</div>
              </div>
            )}

            {/* Key Findings */}
            {categories?.keyFindings && categories.keyFindings.length > 0 && (
              <div>
                <div className="mb-2 text-sm text-gray-300">Key Findings:</div>
                <div className="flex flex-wrap gap-2">
                  {categories.keyFindings.map(
                    (finding: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {finding.length > 50
                          ? finding.substring(0, 50) + "..."
                          : finding}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Extracted Categories */}
            {categories?.categories && categories.categories.length > 0 && (
              <div>
                <div className="mb-2 text-sm text-gray-300">
                  Detected Categories:
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {categories.categories.map((cat, index: number) => (
                    <div key={index} className="rounded bg-gray-800/50 p-2">
                      <div className="text-xs font-semibold text-purple-300 capitalize">
                        {cat.category}
                      </div>
                      <div className="text-xs text-gray-400">
                        {Math.round(cat.confidence * 100)}% confidence
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Preview */}
            <div className="rounded-lg bg-gray-900/50 p-3">
              <div className="mb-2 text-sm text-gray-300">
                Extracted Data Preview:
              </div>
              <div className="space-y-1 text-xs text-gray-400">
                {extractedData.vitals &&
                  Object.keys(extractedData.vitals).length > 0 && (
                    <div>
                      • Vitals: {Object.keys(extractedData.vitals).join(", ")}
                    </div>
                  )}
                {extractedData.medications &&
                  extractedData.medications.length > 0 && (
                    <div>
                      • Medications: {extractedData.medications.length} items
                    </div>
                  )}
                {extractedData.pastConditions &&
                  extractedData.pastConditions.length > 0 && (
                    <div>
                      • Conditions: {extractedData.pastConditions.length} items
                    </div>
                  )}
                {extractedData.allergies && <div>• Allergies: Found</div>}
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex space-x-3">
              <Button
                onClick={handleApplyData}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Apply to EMR Form
              </Button>
              <Button
                onClick={() => setShowResults(false)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {!hasNotes && (
        <div className="rounded-lg border border-gray-700 p-4 text-center dark:bg-gray-900/30">
          <FileText className="mx-auto mb-2 h-8 w-8 text-gray-800 dark:text-gray-400" />
          <p className="mb-2 text-sm text-gray-800 dark:text-gray-400">
            Add medical notes above, then use AI to automatically extract and
            categorize the information.
          </p>
          <div className="text-xs text-gray-800 dark:text-gray-400">
            Handles current injuries, ongoing conditions, allergies, medical
            history, and automatically timestamps all entries.
          </div>
        </div>
      )}
    </div>
  );
}
