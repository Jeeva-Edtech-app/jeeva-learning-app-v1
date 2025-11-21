declare module '@react-native-voice/voice' {
  export interface SpeechResultsEvent {
    value?: string[];
  }

  export interface SpeechErrorEvent {
    error?: {
      message?: string;
      code?: string;
    };
  }

  interface VoiceModule {
    start(locale?: string): Promise<void>;
    stop(): Promise<void>;
    cancel(): Promise<void>;
    destroy(): Promise<void>;
    removeAllListeners(): void;
    onSpeechResults?: (event: SpeechResultsEvent) => void;
    onSpeechError?: (event: SpeechErrorEvent) => void;
  }

  const Voice: VoiceModule;
  export default Voice;
}
