"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, RotateCcw } from "lucide-react";
import { useCedarVoiceToText } from "@/hooks/useCedarVoiceToText";

interface VoiceToTextProps {
  onTranscriptUpdate: (transcript: string) => void;
  className?: string;
  disabled?: boolean;
}

export function VoiceToText({
  onTranscriptUpdate,
  className = "",
  disabled = false,
}: VoiceToTextProps) {
  const [fullTranscript, setFullTranscript] = useState("");

  const {
    isSupported,
    isListening,
    transcript: _transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  } = useCedarVoiceToText({
    continuous: true,
    interimResults: true,
    language: "en-US",
    onResult: (newTranscript, isFinal) => {
      if (isFinal) {
        // Only append the NEW final transcript to the parent
        onTranscriptUpdate(newTranscript.trim());
        setFullTranscript((prev) => prev + " " + newTranscript);
      }
    },
  });

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleReset = () => {
    resetTranscript();
    setFullTranscript("");
    onTranscriptUpdate("");
  };

  if (!isSupported) {
    return (
      <div
        className={`rounded-lg border border-red-500/30 bg-red-700/10 p-4 text-center dark:bg-red-900/20 ${className}`}
      >
        <MicOff className="mx-auto mb-2 h-8 w-8 text-red-400" />
        <p className="text-sm text-red-600 dark:text-red-300">
          Voice recognition is not supported in this browser.
          <br />
          Try using Chrome, Edge, or Safari for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Voice Control Buttons */}
      <div className="flex items-center space-x-3">
        <Button
          onClick={handleToggleListening}
          disabled={disabled}
          className={`flex items-center space-x-2 transition-all duration-300 ${
            isListening
              ? "animate-pulse bg-red-600 hover:bg-red-700"
              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4" />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span>Start Voice Input</span>
            </>
          )}
        </Button>

        {(fullTranscript || interimTranscript) && (
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}

        {isListening && (
          <div className="flex items-center space-x-2 text-green-400">
            <Volume2 className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Listening...</span>
          </div>
        )}
      </div>

      {/* Live Transcript Display */}
      {(fullTranscript || interimTranscript) && (
        <div className="min-h-[100px] rounded-lg border border-gray-600 bg-gray-900/50 p-4">
          <div className="mb-2 flex items-center text-sm text-gray-400">
            <Mic className="mr-2 h-4 w-4" />
            Live Transcript:
          </div>
          <div className="text-white">
            <span className="text-white">{fullTranscript}</span>
            {interimTranscript && (
              <span className="text-gray-400 italic"> {interimTranscript}</span>
            )}
            {isListening && (
              <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-green-400"></span>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3">
          <p className="flex items-center text-sm text-red-300">
            <MicOff className="mr-2 h-4 w-4" />
            {error}
          </p>
        </div>
      )}

      {/* Instructions */}
      {!isListening && !fullTranscript && !error && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-900/20 p-4 text-center">
          <Mic className="mx-auto mb-2 h-8 w-8 text-blue-400" />
          <p className="text-sm text-blue-300">
            Click "Start Voice Input" and speak clearly.
            <br />
            Your speech will be converted to text automatically.
          </p>
        </div>
      )}
    </div>
  );
}
