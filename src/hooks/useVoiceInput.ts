import { useCallback, useEffect, useState } from 'react';
import type {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from '@react-native-voice/voice';

export type VoiceStatus = 'idle' | 'recording' | 'processing' | 'error';

interface VoiceHookConfig {
  locale?: string;
}

export interface VoiceHookReturn {
  transcript: string;
  status: VoiceStatus;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  reset: () => void;
}

type VoiceModule = typeof import('@react-native-voice/voice').default;

let voiceModule: VoiceModule | null = null;
try {
  const required = require('@react-native-voice/voice');
  voiceModule = required?.default ?? required;
} catch (error) {
  if (__DEV__) {
    console.warn(
      '[useVoiceInput] Native voice module unavailable. Voice input requires a development build.',
    );
  }
}

const voiceUnavailableMessage =
  'Voice input requires a development build of the app. Please switch from Expo Go to a dev build to use the microphone.';

export const useVoiceInput = (config?: VoiceHookConfig): VoiceHookReturn => {
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!voiceModule) {
      return () => undefined;
    }

    const voice = voiceModule;

    voice.onSpeechResults = (event: SpeechResultsEvent) => {
      const results = event.value ?? [];
      setTranscript(results[results.length - 1] || '');
      setStatus('processing');
    };

    voice.onSpeechError = (event: SpeechErrorEvent) => {
      setError(event.error?.message || 'Voice recognition error');
      setStatus('error');
    };

    return () => {
      voice
        .destroy()
        .catch(() => undefined)
        .finally(() => {
          voice.removeAllListeners();
        });
    };
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setStatus('idle');
    setError(null);
  }, []);

  const startRecording = useCallback(async () => {
    if (!voiceModule) {
      setError(voiceUnavailableMessage);
      setStatus('error');
      return;
    }

    try {
      setError(null);
      setTranscript('');
      setStatus('recording');
      await voiceModule.start(config?.locale ?? 'en-GB');
    } catch (err: any) {
      setStatus('error');
      setError(err?.message || 'Failed to start recording');
    }
  }, [config?.locale]);

  const stopRecording = useCallback(async () => {
    if (!voiceModule) {
      setError(voiceUnavailableMessage);
      setStatus('error');
      return;
    }

    try {
      setStatus('processing');
      await voiceModule.stop();
    } catch (err: any) {
      setStatus('error');
      setError(err?.message || 'Failed to stop recording');
    }
  }, []);

  const cancelRecording = useCallback(async () => {
    if (!voiceModule) {
      reset();
      return;
    }

    try {
      await voiceModule.cancel();
    } catch {
      // ignore cancellation error
    } finally {
      reset();
    }
  }, [reset]);

  return {
    transcript,
    status,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
  };
};
