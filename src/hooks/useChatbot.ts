import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import chatService from '@/services/chatService';
import {
  ChatMessage,
  RateLimitStatus,
  SendMessagePayload,
  SendMessageResponse,
  ChatError,
} from '@/types/chat';
import { useVoiceInput } from './useVoiceInput';

export interface LessonContextPayload {
  lessonId?: string;
  lessonTitle?: string;
  practiceSessionId?: string;
  weakTopics?: string[];
  progressSummary?: string;
  topicId?: string;
  topicTitle?: string;
  totalLessons?: number;
  completionPercentage?: number;
  nextLessonId?: string | null;
  nextLessonTitle?: string | null;
  nextLessonStatus?: string | null;
}

interface SendOptions {
  conversationId?: string | null;
  useStreaming?: boolean;
}

const createUserMessage = (content: string, conversationId: string | null): ChatMessage => ({
  id: `local-user-${Date.now()}`,
  conversationId,
  role: 'user',
  content,
  createdAt: new Date().toISOString(),
});

const createAssistantStreamingMessage = (
  conversationId: string | null,
): ChatMessage => ({
  id: `local-assistant-${Date.now()}`,
  conversationId,
  role: 'assistant',
  content: '',
  createdAt: new Date().toISOString(),
  isStreaming: true,
});

const buildPayload = (
  userId: string,
  content: string,
  conversationId: string | null,
  lessonContext: LessonContextPayload | null,
  useStreaming?: boolean,
): SendMessagePayload => ({
  userId,
  content,
  conversationId: conversationId ?? undefined,
  useStreaming,
  context: {
    ...lessonContext,
    timestamp: new Date().toISOString(),
  },
});

const deriveErrorMessage = (error: ChatError | Error | unknown): string => {
  if (!error) return 'Something went wrong.';

  if (typeof error === 'string') return error;

  const chatError = error as ChatError;

  if (chatError?.message) {
    return chatError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to reach JeevaBot. Please try again.';
};

export const useChatbot = (initialConversationId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId ?? null,
  );
  const [lessonContext, setLessonContext] = useState<LessonContextPayload | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitStatus | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const voice = useVoiceInput({ locale: 'en-GB' });

  const canSend = useMemo(() => {
    if (!rateLimit) return true;
    if (!rateLimit.allowed) return false;
    return rateLimit.remaining > 0;
  }, [rateLimit]);

  const refreshRateLimit = useCallback(async () => {
    if (!user?.id) return;
    try {
      const status = await chatService.getRateLimit(user.id);
      setRateLimit(status);
    } catch (error) {
      console.warn('Failed to load rate limit', error);
    }
  }, [user?.id]);

  const updateSuggestions = useCallback(
    (assistantMessage?: ChatMessage) => {
      // Build dynamic suggestions ONLY based on actual context
      
      // Context-aware suggestions for current lesson
      if (lessonContext?.lessonTitle) {
        setSuggestions([
          `📚 Deep dive: ${lessonContext.lessonTitle}`,
          `🎯 Practice questions on this topic`,
          `⚠️ Common mistakes in ${lessonContext.topicTitle || 'this topic'}`,
        ]);
        return;
      }

      // No suggestions if no lesson context and no AI response
      if (!assistantMessage) {
        setSuggestions([]);
        return;
      }

      const lower = assistantMessage.content.toLowerCase();

      // Content-specific suggestions based on AI response context
      if (lower.includes('dose') || lower.includes('dosage')) {
        setSuggestions([
          '📊 Show medication dose example',
          '👶 Pediatric dosing tips',
          '🔁 Unit conversion help',
        ]);
        return;
      }

      if (lower.includes('nmc') || lower.includes('code')) {
        setSuggestions([
          '📜 Confidentiality rules',
          '🩺 Duty of candour guidance',
          '⚖️ Accountability scenarios',
        ]);
        return;
      }

      if (lower.includes('sepsis')) {
        setSuggestions([
          '🚨 Sepsis six checklist',
          '⏱️ Escalation timeline',
          '📈 Observation trends to watch',
        ]);
        return;
      }

      // No generic fallback - only show suggestions with actual context
      setSuggestions([]);
    },
    [lessonContext?.lessonTitle, lessonContext?.topicTitle],
  );

  useEffect(() => {
    if (user?.id) {
      refreshRateLimit();
    }
  }, [refreshRateLimit, user?.id]);

  useEffect(() => {
    if (voice.status === 'processing' && voice.transcript) {
      setComposerText(voice.transcript);
    }

    if (voice.status === 'error') {
      setErrorBanner(voice.error ?? 'Voice input error');
    }
  }, [voice.status, voice.transcript, voice.error]);

  const clearError = useCallback(() => setErrorBanner(null), []);

  const cancelStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
    setIsTyping(false);
  }, []);

  const applyRateLimitConsumption = useCallback(
    (remaining: number, limit?: number, current?: number) => {
      setRateLimit(prev => {
        if (!prev) {
          return {
            allowed: remaining > 0,
            remaining,
            limit: limit ?? remaining,
            current: current ?? 0,
          };
        }

        return {
          ...prev,
          remaining,
          current: prev.limit - remaining,
          allowed: remaining > 0,
        };
      });
    },
    [],
  );

  const consumeRateLimit = useCallback((response: SendMessageResponse) => {
    // Only consume rate limit once per successful message
    applyRateLimitConsumption(response.rateLimit.remaining, response.rateLimit.limit, response.rateLimit.current);
  }, [applyRateLimitConsumption]);

  const finalizeAssistantMessage = useCallback(
    (messageId: string, updater: (prev: ChatMessage) => ChatMessage) => {
      setMessages(prev =>
        prev.map(message => {
          if (message.id !== messageId) return message;
          return updater(message);
        }),
      );
    },
    [],
  );

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const buildStreamingHandlers = useCallback(
    (streamMessageId: string, conversation: string | null) => {
      let buffer = '';
      return {
      onChunk: (chunk: { delta: string; done: boolean; messageId?: string }) => {
        const targetId = chunk.messageId || streamMessageId;
        setIsTyping(!chunk.done);

        buffer += chunk.delta;

        finalizeAssistantMessage(targetId, prev => ({
          ...prev,
          content: buffer,
          isStreaming: !chunk.done,
        }));

        if (chunk.done) {
          setIsStreaming(false);
          updateSuggestions({
            id: targetId,
            role: 'assistant',
            conversationId: conversation,
            content: buffer,
            createdAt: new Date().toISOString(),
          });
        }
      },
      onError: (error: ChatError) => {
        cancelStreaming();
        setErrorBanner(deriveErrorMessage(error));
        finalizeAssistantMessage(streamMessageId, prev => ({
          ...prev,
          isStreaming: false,
          content:
            prev.content ||
            "I'm having trouble connecting right now. Please try again shortly.",
        }));
      },
      onComplete: (metadata: SendMessageResponse) => {
        setConversationId(metadata.conversationId);
        // Rate limit consumption is now handled in sendFallback only to prevent double consumption
      },
    };
    },
    [cancelStreaming, finalizeAssistantMessage, updateSuggestions],
  );

  const sendViaStreaming = useCallback(
    async (payload: SendMessagePayload, streamMessageId: string, conversation: string | null) => {
      abortControllerRef.current = new AbortController();
      setIsStreaming(true);
      setIsTyping(true);

      await chatService.sendMessageWithStream(
        payload,
        buildStreamingHandlers(streamMessageId, conversation),
        abortControllerRef.current.signal,
      );
    },
    [buildStreamingHandlers],
  );

  const sendFallback = useCallback(
    async (payload: SendMessagePayload, streamMessageId: string) => {
      const response = await chatService.sendMessage(payload);

      setConversationId(response.conversationId);
      finalizeAssistantMessage(streamMessageId, prev => ({
        ...prev,
        content: response.aiMessage.content,
        isStreaming: false,
      }));
      // Only consume rate limit here to prevent double consumption
      consumeRateLimit(response);
      updateSuggestions({
        id: streamMessageId,
        conversationId: response.conversationId,
        role: 'assistant',
        content: response.aiMessage.content,
        createdAt: new Date().toISOString(),
      });
    },
    [consumeRateLimit, finalizeAssistantMessage, updateSuggestions],
  );

  const sendMessage = useCallback(
    async (content?: string, options?: SendOptions) => {
      if (!user?.id) {
        setErrorBanner('Please sign in to use JeevaBot.');
        return;
      }

      const trimmed = (content ?? composerText).trim();
      if (!trimmed || isSending) return;

      if (!canSend) {
        setErrorBanner('Daily AI message limit reached. Come back tomorrow!');
        return;
      }

      const activeConversation = options?.conversationId ?? conversationId ?? null;
      const payload = buildPayload(
        user.id,
        trimmed,
        activeConversation,
        lessonContext,
        options?.useStreaming ?? true,
      );

      const userMessage = createUserMessage(trimmed, activeConversation);
      const assistantMessage = createAssistantStreamingMessage(activeConversation);
      const streamId = assistantMessage.id;

      appendMessage(userMessage);
      appendMessage(assistantMessage);

      setComposerText('');
      setIsSending(true);
      setErrorBanner(null);

      try {
        if (payload.useStreaming) {
          await sendViaStreaming(payload, streamId, activeConversation);
        } else {
          await sendFallback(payload, streamId);
        }
      } catch (error) {
        console.error('Streaming failed, falling back:', error);
        await sendFallback(payload, streamId).catch(err => {
          const message = deriveErrorMessage(err);
          setErrorBanner(message);
          finalizeAssistantMessage(streamId, prev => ({
            ...prev,
            isStreaming: false,
            content:
              prev.content ||
              "I'm offline for a moment. Please try again in a little bit.",
          }));
        });
      } finally {
        setIsSending(false);
        setIsTyping(false);
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [
      appendMessage,
      canSend,
      composerText,
      conversationId,
      finalizeAssistantMessage,
      lessonContext,
      sendFallback,
      sendViaStreaming,
      user?.id,
      isSending,
    ],
  );

  const loadConversation = useCallback(
    async (id: string) => {
      if (!user?.id) return;

      setLoadingHistory(true);
      setErrorBanner(null);

      try {
        const history = await chatService.getMessages(id);
        setMessages(history);
        setConversationId(id);
        if (history.length > 0) {
          const lastAssistant = [...history].reverse().find(msg => msg.role === 'assistant');
          updateSuggestions(lastAssistant);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        setErrorBanner(deriveErrorMessage(error));
      } finally {
        setLoadingHistory(false);
      }
    },
    [updateSuggestions, user?.id],
  );

  const resetConversation = useCallback(() => {
    cancelStreaming();
    setMessages([]);
    setConversationId(null);
    setLessonContext(null);
    setSuggestions([]);
  }, [cancelStreaming]);

  const applyLessonContext = useCallback((context: LessonContextPayload | null) => {
    setLessonContext(context);
  }, []);

  const selectSuggestion = useCallback(
    (suggestion: string) => {
      setComposerText(suggestion.replace(/^[^\w]+/u, '').trim());
    },
    [],
  );

  return {
    messages,
    conversationId,
    composerText,
    setComposerText,
    isSending,
    isStreaming,
    isTyping,
    errorBanner,
    clearError,
    sendMessage,
    cancelStreaming,
    loadConversation,
    resetConversation,
    rateLimit,
    refreshRateLimit,
    canSend,
    suggestions,
    selectSuggestion,
    loadingHistory,
    lessonContext,
    applyLessonContext,
    voice,
  };
};
