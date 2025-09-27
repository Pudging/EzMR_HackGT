"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';

type UseVoiceToTextOptions = {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: Event | { message: string }) => void;
};

type UseVoiceToTextReturn = {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
};

// Minimal Cedar typings based on docs (https://docs.cedarcopilot.com/voice/voice-integration)
type CedarVoiceEvents = 'start' | 'end' | 'partial' | 'final' | 'error';
type CedarPartialPayload = { text: string } | { transcript: string } | string;
type CedarFinalPayload = { text: string } | { transcript: string } | string;

interface CedarVoiceSession {
  start: () => Promise<void> | void;
  stop: () => Promise<void> | void;
  on: (event: CedarVoiceEvents, handler: (payload?: unknown) => void) => void;
  off?: (event: CedarVoiceEvents, handler: (payload?: unknown) => void) => void;
}

interface CedarGlobal {
  voice?: {
    createSession?: (opts?: unknown) => CedarVoiceSession;
  };
}

declare global {
  interface Window {
    Cedar?: CedarGlobal;
  }
}

function extractText(payload: CedarPartialPayload | CedarFinalPayload | undefined): string {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  if ('text' in payload && typeof payload.text === 'string') return payload.text;
  if ('transcript' in payload && typeof payload.transcript === 'string') return payload.transcript;
  return '';
}

export function useCedarVoiceToText(options: UseVoiceToTextOptions = {}): UseVoiceToTextReturn {
  const { onResult, onError } = options;

  const cedar = useMemo(() => (typeof window !== 'undefined' ? window.Cedar : undefined), []);
  // Optionally read API key from the injected script data attribute
  useEffect(() => {
    if (!cedar) return;
    try {
      const el = document.querySelector('script[src*="cedar"]') as HTMLScriptElement | null;
      const key = el?.getAttribute('data-cedar-api-key') ?? process.env.NEXT_PUBLIC_CEDAR_API_KEY;
      // If Cedar requires initialization with API key, do it here.
      // Example: cedar.init?.({ apiKey: key })
      void key;
    } catch (_e) {
      // ignore
    }
  }, [cedar]);
  const isSupported = !!cedar?.voice?.createSession;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<CedarVoiceSession | null>(null);

  // Initialize session
  useEffect(() => {
    if (!isSupported) return;
    try {
      const create = cedar!.voice!.createSession!;
      const session = typeof create === 'function' ? create({}) : null;
      if (!session) throw new Error('Cedar voice createSession unavailable');
      sessionRef.current = session;

      const handleStart = () => {
        setIsListening(true);
        setError(null);
      };
      const handleEnd = () => {
        setIsListening(false);
      };
      const handlePartial = (payload?: unknown) => {
        const text = extractText(payload as CedarPartialPayload);
        setInterimTranscript(text);
        if (text && onResult) onResult(text, false);
      };
      const handleFinal = (payload?: unknown) => {
        const text = extractText(payload as CedarFinalPayload);
        if (text) {
          setTranscript(prev => (prev ? prev + ' ' : '') + text);
          setInterimTranscript('');
          if (onResult) onResult(text, true);
        }
      };
      const handleError = (payload?: unknown) => {
        const message = typeof payload === 'object' && payload && 'message' in (payload as Record<string, unknown>)
          ? String((payload as Record<string, unknown>).message)
          : 'Cedar voice error';
        setError(message);
        if (onError) onError({ message } as unknown as Event);
        setIsListening(false);
      };

      session.on('start', handleStart);
      session.on('end', handleEnd);
      session.on('partial', handlePartial);
      session.on('final', handleFinal);
      session.on('error', handleError);

      return () => {
        try {
          if (session.off) {
            session.off('start', handleStart);
            session.off('end', handleEnd);
            session.off('partial', handlePartial);
            session.off('final', handleFinal);
            session.off('error', handleError);
          }
          session.stop?.();
        } catch (_err) {
          // ignore cleanup errors
        }
      };
    } catch (e) {
      setError('Failed to initialize Cedar voice session');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!sessionRef.current || isListening) return;
    try {
      setError(null);
      sessionRef.current.start();
    } catch (_err) {
      setError('Failed to start Cedar voice session');
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!sessionRef.current || !isListening) return;
    try {
      sessionRef.current.stop();
    } catch (_err) {
      // ignore stop errors
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  if (!isSupported) {
    // Dev-friendly: fall back to Web Speech so only Gemini key is required
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('@/hooks/useVoiceToText') as typeof import('@/hooks/useVoiceToText');
      return mod.useVoiceToText(options as any) as unknown as UseVoiceToTextReturn;
    } catch {
      return {
        isSupported: false,
        isListening: false,
        transcript,
        interimTranscript,
        startListening: () => {},
        stopListening: () => {},
        resetTranscript,
        error: error ?? 'Cedar voice SDK not available',
      };
    }
  }

  return {
    isSupported: true,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
}


