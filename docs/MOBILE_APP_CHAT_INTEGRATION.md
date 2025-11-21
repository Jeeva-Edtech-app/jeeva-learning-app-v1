# Mobile App Chat Integration Guide - JeevaBot

This guide explains how to integrate the JeevaBot AI chatbot into your React Native/Expo mobile app.

## Overview

JeevaBot is an AI-powered study assistant that helps nursing students prepare for the UK NMC CBT exam. It provides context-aware responses based on the student's current progress, lessons, and weak topics.

**Key Features:**
- Context-aware AI responses using Google Gemini 2.5-flash
- Rate limiting based on subscription plans (10-100 messages/day)
- Conversation history persistence
- Real-time streaming responses
- Integration with student's learning progress

## API Endpoints

All endpoints are hosted at: `http://192.168.1.8:3001/api/chat`;

### 1. Send Message

Send a message to JeevaBot and get an AI response.

**Endpoint:** `POST /api/chat/send`

**Request Body:**
```json
{
  "userId": "uuid-string",
  "content": "What is the NMC Code?",
  "conversationId": "optional-uuid"
}
```

**Response:**
```json
{
  "conversationId": "uuid-string",
  "messageId": "uuid-string",
  "response": "The NMC Code is a professional framework...",
  "tokensUsed": 150,
  "remainingMessages": 45
}
```

**Error Response (Rate Limit):**
```json
{
  "error": "Daily AI message limit reached",
  "limit": 50,
  "current": 50,
  "resetTime": "2025-11-03T00:00:00Z"
}
```

### 2. Get Conversations

Fetch all conversations for a user.

**Endpoint:** `GET /api/chat/conversations/:userId`

**Response:**
```json
[
  {
    "id": "uuid-string",
    "userId": "uuid-string",
    "title": "NMC Code Questions",
    "createdAt": "2025-11-02T10:30:00Z",
    "updatedAt": "2025-11-02T11:15:00Z",
    "messageCount": 5
  }
]
```

### 3. Get Messages

Fetch all messages in a conversation.

**Endpoint:** `GET /api/chat/messages/:conversationId`

**Response:**
```json
[
  {
    "id": "uuid-string",
    "conversationId": "uuid-string",
    "role": "user",
    "content": "What is the NMC Code?",
    "createdAt": "2025-11-02T10:30:00Z"
  },
  {
    "id": "uuid-string",
    "conversationId": "uuid-string",
    "role": "assistant",
    "content": "The NMC Code is a professional framework...",
    "tokensUsed": 150,
    "createdAt": "2025-11-02T10:30:05Z"
  }
]
```

### 4. Check Rate Limit

Check remaining AI messages for the day.

**Endpoint:** `GET /api/chat/rate-limit/:userId`

**Response:**
```json
{
  "allowed": true,
  "limit": 50,
  "current": 5,
  "remaining": 45
}
```

## React Native Implementation

### 1. API Service Setup

Create a typed chat service that supports both standard and streaming responses. The mobile app never talks to Gemini directly—everything goes through the backend at `EXPO_PUBLIC_BACKEND_URL`.

```typescript
// src/services/chatService.ts
import {
  SendMessagePayload,
  SendMessageResponse,
  ConversationSummary,
  ChatMessage,
  RateLimitStatus,
  ChatStreamingChunk,
  ChatError,
} from '@/types/chat';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://192.168.1.8:3001';
const CHAT_BASE_URL = `${BACKEND_URL.replace(/\/$/, '')}/api/chat`;

class ChatService {
  async sendMessage(payload: SendMessagePayload, signal?: AbortSignal) {
    const response = await fetch(`${CHAT_BASE_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
    if (!response.ok) throw await parseError(response);
    return (await response.json()) as SendMessageResponse;
  }

  async sendMessageWithStream(
    payload: SendMessagePayload,
    handlers: {
      onChunk: (chunk: ChatStreamingChunk) => void;
      onError: (error: ChatError) => void;
      onComplete: (meta: SendMessageResponse) => void;
    },
    signal?: AbortSignal,
  ) {
    const response = await fetch(`${CHAT_BASE_URL}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ ...payload, useStreaming: true }),
      signal,
    });
    // ...read response.body and emit SSE chunks (falls back to JSON if streaming unavailable)
  }

  getConversations(userId: string): Promise<ConversationSummary[]> { /* ... */ }
  getMessages(conversationId: string): Promise<ChatMessage[]> { /* ... */ }
  getRateLimit(userId: string): Promise<RateLimitStatus> { /* ... */ }
}

export default new ChatService();
```

> 📦 **Packages**  
> `@react-native-voice/voice@^3.2.4` (speech-to-text) and `expo-speech` (future voice feedback) must be installed on the mobile client.
>
> ⚠️ Voice capture relies on native modules that are not bundled with Expo Go. Use an Expo development build (or disable the mic UI) when testing speech-to-text so the native module is available.

### 2. Chat Context/State Management

Use the dedicated React hook `src/hooks/useChatbot.ts` to orchestrate conversations, rate limiting, streaming, quick replies, error banner state, and voice input. It replaces the earlier Zustand store.

```typescript
// src/hooks/useChatbot.ts (highlights)
export const useChatbot = (initialConversationId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState(initialConversationId ?? null);
  const [rateLimit, setRateLimit] = useState<RateLimitStatus | null>(null);
  const [composerText, setComposerText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>(EMPTY_STATE_SUGGESTIONS);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const voice = useVoiceInput({ locale: 'en-GB' }); // speech-to-text controller

  const sendMessage = useCallback(async (content?: string) => {
    if (!user?.id) return;
    const trimmed = (content ?? composerText).trim();
    if (!trimmed) return;

    const payload = buildPayload(user.id, trimmed, conversationId, lessonContext, true);
    const userMessage = createUserMessage(trimmed, conversationId);
    const assistantPlaceholder = createAssistantStreamingMessage(conversationId);

    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);
    setComposerText('');
    setIsSending(true);
    setErrorBanner(null);

    try {
      await chatService.sendMessageWithStream(
        payload,
        {
          onChunk: chunk => {
            setIsTyping(!chunk.done);
            appendStreamingDelta(assistantPlaceholder.id, chunk.delta, chunk.done);
          },
          onComplete: meta => {
            setConversationId(meta.conversationId);
            updateRateLimit(meta.remainingMessages);
          },
          onError: error => setErrorBanner(deriveErrorMessage(error)),
        },
      );
    } catch (err) {
      await fallbackToNonStreaming(payload, assistantPlaceholder.id, err);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  }, [user?.id, composerText, conversationId, lessonContext]);

  return {
    messages,
    conversationId,
    composerText,
    setComposerText,
    sendMessage,
    isSending,
    isTyping,
    rateLimit,
    suggestions,
    selectSuggestion: (value: string) => setComposerText(value.replace(/^[^\w]+/u, '').trim()),
    errorBanner,
    clearError: () => setErrorBanner(null),
    refreshRateLimit,
    cancelStreaming,
    voice,
    applyLessonContext: (context: LessonContextPayload | null) => setLessonContext(context),
  };
};
```

> The hook handles:
> - speaker diarisation (user vs. assistant) and streaming deltas  
> - rate-limit bookkeeping (`GET /rate-limit/:userId`)  
> - voice recording lifecycle via `@react-native-voice/voice`  
> - context injection (lesson/practice metadata) when opened from the floating button

### 3. Chat UI Component (ChatGPT-Style)

JeevaBot v2 lives in `src/screens/JeevaBotScreen.tsx` and is exposed by the Expo Router route `app/(tabs)/ai-assistant.tsx`. The layout mirrors ChatGPT with a minimal white header, empty-state hero, quick suggestion cards, streaming assistant bubbles, and a voice-enabled composer.

```typescript
// src/screens/JeevaBotScreen.tsx (excerpt)
import ChatBubble from '@/components/ChatBubble';
import ChatComposer from '@/components/chat/ChatComposer';
import SuggestionCard from '@/components/chat/SuggestionCard';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { useChatbot } from '@/hooks/useChatbot';

const HERO_SUGGESTIONS = [
  '📚 Explain a concept',
  '💡 Practice tips',
  '🎯 Study strategy',
  '🧠 Review weak topics',
];

export default function JeevaBotScreen() {
  const {
    messages,
    composerText,
    setComposerText,
    sendMessage,
    isSending,
    isTyping,
    errorBanner,
    clearError,
    rateLimit,
    suggestions,
    selectSuggestion,
    canSend,
    voice,
    applyLessonContext,
  } = useChatbot();

  // Route params can inject lesson context + prefilled prompt
  const params = useLocalSearchParams<{ ctx?: string; prompt?: string }>();
  React.useEffect(() => {
    if (params.ctx) {
      applyLessonContext(JSON.parse(decodeURIComponent(params.ctx)));
    }
    if (params.prompt) {
      setComposerText(decodeURIComponent(params.prompt));
    }
  }, [params, applyLessonContext, setComposerText]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Header remaining={rateLimit ? `${rateLimit.remaining}/${rateLimit.limit} messages left today` : null} />

        <FlatList
          ref={listRef}
          data={messages}
          renderItem={({ item }) => <ChatBubble message={item} />}
          ListEmptyComponent={<EmptyState onSelect={selectSuggestion} />}
          ListFooterComponent={isTyping ? <TypingIndicatorRow /> : null}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        <InlineSuggestions rows={suggestions} onPress={value => selectSuggestion(value)} />

        {errorBanner ? <ErrorBanner message={errorBanner} onDismiss={clearError} /> : null}

        <ChatComposer
          value={composerText}
          onChange={setComposerText}
          onSend={() => sendMessage()}
          disabled={!canSend}
          isSending={isSending}
          voice={voice}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

**Key UI elements**

- Minimal header with back + overflow actions and a live rate-limit badge.  
- Empty-state hero banner with 4 tappable cards (auto-fill the composer).  
- Chat bubbles with avatars, timestamps, multi-paragraph formatting, and streaming indicator.  
- Horizontal quick-suggestion chips shown after each assistant response.  
- Error banner that fades in/out above the composer.  
- Voice-aware composer (`src/components/chat/ChatComposer.tsx`) that swaps the mic button for a send button, shows recording/processing banners, and pipes speech-to-text via `useVoiceInput`.

### 4. Floating Chat Button

Use the new pill CTA so students can reach JeevaBot from lessons or practice screens and pass context into the chat:

```typescript
// src/components/FloatingChatButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LessonContextPayload } from '@/hooks/useChatbot';

interface FloatingChatButtonProps {
  context?: LessonContextPayload;
  prompt?: string;
}

export default function FloatingChatButton({ context, prompt }: FloatingChatButtonProps) {
  const router = useRouter();

  const params: Record<string, string> = {};
  if (context) params.ctx = encodeURIComponent(JSON.stringify(context));
  if (prompt) params.prompt = encodeURIComponent(prompt);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.wrapper}
      onPress={() => router.push({ pathname: '/(tabs)/ai-assistant', params })}
    >
      <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.gradient}>
        <Text style={styles.icon}>🤖</Text>
        <Text style={styles.label}>Ask AI</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 28,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

- Automatically overlays bottom-right with blue glow.  
- Optional `context` prop injects lesson/practice metadata into the chat store.  
- Optional `prompt` prop seeds the composer (used for “Need help?” callouts).  
- `src/components/AskAIButton.tsx` re-exports this component so existing imports keep working.

## Authentication

The chat API expects a `userId` (UUID) from your Supabase authentication. Make sure to:

1. Get the user ID from your auth context:
```typescript
const { user } = useAuth();
const userId = user?.id;
```

2. Pass it to all chat service methods

3. Handle unauthenticated users appropriately

## Rate Limiting

Rate limits are based on subscription plans:

| Plan | Messages/Day |
|------|--------------|
| Free Trial | 10 |
| 30/60 Day Plans | 50 |
| 90 Day Plan | 75 |
| 120 Day Plan | 100 |

**Best Practices:**
- Check rate limit status on app launch and before sending
- Show remaining messages in the UI
- Display upgrade prompts when limit is reached
- Handle rate limit errors gracefully with user-friendly messages

## Error Handling

```typescript
try {
  await sendMessage(userId, content);
} catch (error: any) {
  if (error.response?.status === 429) {
    // Rate limit exceeded
    Alert.alert(
      'Daily Limit Reached',
      'You\'ve used all your AI messages for today. Upgrade your plan for more!',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Upgrade', onPress: () => navigation.navigate('Subscriptions') },
      ]
    );
  } else if (error.response?.status === 401) {
    // Authentication error
    Alert.alert('Session Expired', 'Please log in again.');
  } else {
    // Generic error
    Alert.alert('Error', 'Failed to send message. Please try again.');
  }
}
```

## Context-Aware Responses

JeevaBot automatically includes context about:
- Student's current lesson topic
- Recent practice session performance
- Identified weak topics
- Progress statistics

This makes responses more relevant and personalized.

## Testing

### Test with cURL

```bash
# Send a message
curl -X POST http://localhost:3001/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"userId":"your-user-id","content":"What is the NMC Code?"}'

# Check rate limit
curl http://localhost:3001/api/chat/rate-limit/your-user-id

# Get conversations
curl http://localhost:3001/api/chat/conversations/your-user-id
```

### Test with Postman

1. Import the collection from `docs/postman/jeeva-chat-api.json`
2. Set the `API_URL` environment variable
3. Set the `USER_ID` environment variable
4. Run the test suite

## Production Deployment

Before deploying to production:

1. **Environment Variables**: Ensure these are set in your  Secrets:
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

2. **Update API URL**: Change `API_BASE_URL` in your mobile app to production URL

3. **Monitor Usage**: Track AI costs and usage patterns via the admin dashboard

4. **Rate Limiting**: Adjust limits in subscription plans as needed

## Future Enhancements

Potential improvements for Phase 2+:

- Voice input/output for hands-free studying
- Image-based questions (student can upload practice questions)
- Study schedule recommendations
- Peer comparison insights
- Conversation export/sharing
- Multi-language support (Hindi, Malayalam, etc.)

## Support

For issues or questions:
- Check API logs in ide console
- Review error messages in mobile app
- Test endpoints with cURL/Postman
- Contact development team

---

**Version:** 1.0.0  
**Last Updated:** November 2, 2025  
**API Version:** Phase 1 - JeevaBot Core
