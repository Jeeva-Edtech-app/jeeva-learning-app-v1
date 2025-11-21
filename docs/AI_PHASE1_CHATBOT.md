# 🤖 AI Phase 1: JeevaBot Chatbot Implementation

## 📋 Document Overview

This guide covers **Phase 1** of Jeeva's AI integration: implementing JeevaBot, an AI-powered chatbot using Google's Gemini AI Studio API. This provides students with instant doubt-solving, context-aware help, and personalized study assistance.

**Version:** 1.0  
**Last Updated:** October 11, 2025  
**AI Service:** Google AI Studio API (Gemini)  
**Target Platform:** React Native/Expo Mobile App

---

## 🎯 Phase 1 Goals

### What We're Building:
✅ AI-powered chatbot (JeevaBot) for instant help  
✅ Context-aware responses based on user progress  
✅ Chat interface in mobile app  
✅ Message history storage  
✅ Cost controls and rate limiting  
✅ Error handling with fallbacks  

### What's NOT in Phase 1:
❌ Vertex AI custom ML models (Phase 2)  
❌ Adaptive learning paths (Phase 2)  
❌ Auto-generated practice content (Phase 2)  
❌ Predictive analytics (Phase 2)  

---

## 🏗️ Architecture Overview

### System Flow:

```
User asks question → Frontend sends to backend → 
Backend builds context (user progress + lesson content) → 
Calls Gemini API → Streams response → 
Saves to Supabase → Displays to user
```

### Components:

**Frontend (React Native/Expo):**
- `ChatScreen.tsx` - Main chat interface
- `ChatBubble.tsx` - Message display component
- `ChatInput.tsx` - User input field
- `useChatbot.ts` - React hook for chat logic
- `AskAIButton.tsx` - Floating action button on lessons

**Backend API:**
- Gemini API client (`lib/gemini.ts`)
- Context builder (user data + content)
- Rate limiter middleware
- Response streaming handler

**Database (Supabase):**
- `chat_conversations` - Conversation threads
- `chat_messages` - Individual messages
- `ai_usage_stats` - Usage tracking for cost control

---

## 🔐 1. Google AI Studio Setup

### Step 1: Get API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click "Get API Key" → "Create API key in new project"
4. Copy the API key (starts with `AIza...`)

### Step 2: Add to Backend Replit Secrets

**⚠️ CRITICAL: API Key Must Be Server-Side Only**

The Gemini API key must **NEVER** be exposed to the mobile app. Store it only in the backend.

**In Replit Admin Portal Backend:**

1. Open **Secrets** (Tools → Secrets or padlock icon)
2. Add backend-only secrets:
   - Key: `GEMINI_API_KEY` (NO `EXPO_PUBLIC_` prefix!)
   - Value: Your API key (paste the `AIza...` key)
3. Add cost control secrets:
   - Key: `AI_MAX_MESSAGES_PER_DAY`
   - Value: `50`

**For Mobile App (.env file):**
```env
# NO Gemini API key here!
# Mobile app calls backend endpoints instead
EXPO_PUBLIC_BACKEND_URL=https://your-backend.replit.app
```

### Step 3: Install SDK (Backend Only)

**Backend (Admin Portal):**
```bash
npm install @google/generative-ai
```

**Mobile App:**
```bash
# NO Gemini SDK in mobile app
# Just use fetch/axios to call backend
```

---

## 💾 2. Database Schema

### Table: `chat_conversations`

Stores conversation threads between user and JeevaBot.

```sql
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Conversation',
  context_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_created ON chat_conversations(created_at DESC);
```

**JSONB Structure (`context_data`):**
```json
{
  "currentLesson": {
    "id": "uuid",
    "title": "Introduction to Physics",
    "moduleId": "uuid"
  },
  "userLevel": "intermediate",
  "recentTopics": ["mechanics", "thermodynamics"]
}
```

---

### Table: `chat_messages`

Stores individual messages in conversations.

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);
```

**JSONB Structure (`metadata`):**
```json
{
  "model": "gemini-1.5-flash",
  "tokensUsed": 245,
  "responseTime": 1.2,
  "confidenceScore": 0.87
}
```

---

### Table: `ai_usage_stats`

Tracks daily AI usage for cost control.

```sql
CREATE TABLE ai_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_ai_usage_user_date ON ai_usage_stats(user_id, date);
```

---

## 🔧 3. Backend Implementation (Admin Portal)

### Create Gemini Client (`server/lib/gemini.ts` - Backend Only!)

**⚠️ This code runs ONLY on the backend server, NOT in the mobile app!**

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

// Backend secret - NEVER exposed to clients
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not configured in backend secrets');
}

export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const chatModel = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
});

export const getModelResponse = async (
  prompt: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<string> => {
  try {
    const chat = chatModel.startChat({
      history: conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to get AI response');
  }
};
```

### Create Backend Chat Endpoint (`server/routes/chat.ts`)

```typescript
import express from 'express';
import { getModelResponse } from '../lib/gemini';
import { buildChatContext } from '../utils/chatContext';
import { supabase } from '../lib/supabase';

const router = express.Router();

// POST /api/chat/send
router.post('/send', async (req, res) => {
  try {
    const { userId, conversationId, content } = req.body;
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.authorization?.replace('Bearer ', '')
    );
    
    if (authError || !user || user.id !== userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check rate limit
    const canSend = await checkMessageLimit(userId);
    if (!canSend) {
      return res.status(429).json({ 
        error: 'Daily message limit reached (50 messages/day)' 
      });
    }
    
    // Save user message
    const { data: userMsg } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content
      })
      .select()
      .single();
    
    // Build context and get AI response
    const context = await buildChatContext(userId);
    const history = await getConversationHistory(conversationId);
    const aiResponse = await getModelResponse(`${context}\n\n${content}`, history);
    
    // Save AI response
    const { data: aiMsg } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        metadata: {
          model: 'gemini-1.5-flash',
          tokensUsed: Math.ceil(aiResponse.length / 4)
        }
      })
      .select()
      .single();
    
    // Update usage stats
    await updateUsageStats(userId, Math.ceil(aiResponse.length / 4));
    
    res.json({ userMsg, aiMsg });
    
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
```

---

### Context Builder (`src/utils/chatContext.ts`)

```typescript
import { supabase } from '@/lib/supabase';

interface UserContext {
  userId: string;
  currentLesson?: any;
  recentProgress?: any[];
  weakTopics?: string[];
}

export const buildChatContext = async (userId: string): Promise<string> => {
  // Get user's current lesson
  const { data: currentLesson } = await supabase
    .from('learning_completions')
    .select('lesson:lessons(*), module:modules(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  // Get recent practice performance
  const { data: recentPractice } = await supabase
    .from('practice_sessions')
    .select('score, topic:topics(title)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Build context string for AI
  let context = `You are JeevaBot, an AI tutor for medical exam preparation.

Student Context:
`;

  if (currentLesson) {
    context += `- Currently studying: ${currentLesson.lesson?.title} in ${currentLesson.module?.title}\n`;
  }

  if (recentPractice && recentPractice.length > 0) {
    context += `- Recent practice scores:\n`;
    recentPractice.forEach(p => {
      context += `  * ${p.topic?.title}: ${p.score}%\n`;
    });
  }

  context += `
Instructions:
1. Provide clear, concise explanations suitable for medical students
2. Reference the student's current lesson when relevant
3. If the student is struggling (low scores), offer encouraging support
4. Use simple language and break down complex concepts
5. Suggest relevant practice topics when appropriate
6. Keep responses under 200 words unless detailed explanation is requested

Remember: You're a supportive tutor, not just an information source.`;

  return context;
};
```

---

## 📱 4. Mobile App Implementation

### Chat API Hook (`src/hooks/useChatbot.ts` - Mobile App)

**Mobile app calls backend API endpoints (NO direct Gemini access!)**

```typescript
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://your-backend.replit.app';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export const useChatbot = (conversationId?: string) => {
  const { user, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);

  // Send message to backend
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Create or get conversation
      let convId = currentConversationId;
      if (!convId) {
        const { data: newConv, error: convError } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            title: content.substring(0, 50) + '...',
          })
          .select()
          .single();

        if (convError) throw convError;
        convId = newConv.id;
        setCurrentConversationId(convId);
      }

      // Call backend API (authenticated)
      const response = await fetch(`${BACKEND_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          conversationId: convId,
          content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const { userMsg, aiMsg } = await response.json();

      // Add both messages to UI
      setMessages(prev => [...prev, 
        {
          id: userMsg.id,
          role: 'user',
          content: userMsg.content,
          createdAt: userMsg.created_at,
        },
        {
          id: aiMsg.id,
          role: 'assistant',
          content: aiMsg.content,
          createdAt: aiMsg.created_at,
        }
      ]);

    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to send message');
      
      // Fallback response
      const fallbackMsg = {
        id: 'fallback-' + Date.now(),
        role: 'assistant' as const,
        content: "I'm having trouble connecting right now. Please try again in a moment, or contact support if the issue persists.",
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  }, [user, session, currentConversationId]);

  // Load conversation history
  const loadConversation = useCallback(async (convId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading conversation:', error);
      return;
    }

    setMessages(data.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.created_at,
    })));
    setCurrentConversationId(convId);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    loadConversation,
    conversationId: currentConversationId,
  };
};
```

---

## 📱 4. Frontend Components

### Chat Screen (`src/screens/ChatScreen.tsx`)

```typescript
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useChatbot } from '@/hooks/useChatbot';
import ChatBubble from '@/components/ChatBubble';

export default function ChatScreen({ route }) {
  const { conversationId } = route.params || {};
  const { messages, loading, error, sendMessage, loadConversation } = useChatbot(conversationId);
  const [inputText, setInputText] = React.useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>JeevaBot</Text>
        <Text style={styles.headerSubtitle}>Your AI Study Assistant</Text>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>👋 Hi! I'm JeevaBot</Text>
          <Text style={styles.emptyText}>
            Ask me anything about your studies. I can help with:
          </Text>
          <Text style={styles.emptyList}>
            • Explaining difficult concepts{'\n'}
            • Practice question tips{'\n'}
            • Study recommendations{'\n'}
            • Exam strategies
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask JeevaBot anything..."
          placeholderTextColor="#9E9E9E"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={loading || !inputText.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 16,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyList: {
    fontSize: 14,
    color: '#888',
    lineHeight: 24,
  },
  messageList: {
    padding: 16,
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

### Chat Bubble Component (`src/components/ChatBubble.tsx`)

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
      </View>
      <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
        {format(new Date(message.createdAt), 'HH:mm')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 4,
  },
  userBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#E0E0E0',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#1A1A1A',
  },
  timestamp: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  userTimestamp: {
    textAlign: 'right',
  },
});
```

---

### Ask AI Button (`src/components/AskAIButton.tsx`)

Floating action button to launch chat from lesson screens.

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AskAIButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => navigation.navigate('Chat')}
    >
      <Text style={styles.icon}>🤖</Text>
      <Text style={styles.text}>Ask AI</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## 🔒 5. Security & Cost Controls

### Rate Limiting (Database Function)

```sql
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_user_id UUID,
  p_date DATE,
  p_message_count INTEGER DEFAULT 1,
  p_tokens INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_usage_stats (user_id, date, message_count, total_tokens)
  VALUES (p_user_id, p_date, p_message_count, p_tokens)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    message_count = ai_usage_stats.message_count + p_message_count,
    total_tokens = ai_usage_stats.total_tokens + p_tokens,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

### Error Handling Strategy

**1. API Failures:**
- Show fallback message to user
- Log error for admin review
- Don't expose technical details

**2. Rate Limit Exceeded:**
- Clear message: "Daily limit reached"
- Suggest alternative help (contact support)
- Reset at midnight

**3. Network Issues:**
- Retry logic (max 3 attempts)
- Offline indicator
- Queue messages for later

---

## 📊 6. Admin Dashboard

### AI Usage Monitoring

Create admin view to track:
- Daily message volume
- Cost estimates (tokens × price)
- Popular questions
- Error rates
- User engagement

**Query for Admin Dashboard:**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_messages,
  COUNT(DISTINCT conversation_id) as conversations,
  SUM((metadata->>'tokensUsed')::INTEGER) as total_tokens
FROM chat_messages
WHERE role = 'assistant'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 💰 7. Cost Management

### Gemini API Pricing (as of Oct 2025)

**Free Tier:**
- 60 requests per minute
- Good for testing and low traffic

**Paid Tier:**
- Input: $0.00025 per 1K tokens
- Output: $0.00075 per 1K tokens

**Cost Estimates:**
- Average message: ~500 tokens (input + output)
- Cost per message: ~$0.0005 (half a cent)
- 1000 students × 20 messages/day = 20,000 messages
- Daily cost: ~$10
- Monthly cost: ~$300

### Optimization Strategies:

1. **Message Limits:** 50 messages/user/day
2. **Response Length:** Max 1024 tokens
3. **Caching:** Cache common Q&A pairs
4. **Conversation History:** Limit to last 10 messages
5. **Model Choice:** Use `gemini-1.5-flash` (cheaper than Pro)

---

## ✅ 8. Testing Checklist

### Before Launch:

- [ ] API key securely stored in Replit Secrets
- [ ] Database tables created with correct schema
- [ ] Rate limiting working (test with >50 messages)
- [ ] Chat UI responsive on iOS and Android
- [ ] Messages persist across app restarts
- [ ] Error handling shows friendly messages
- [ ] Context includes user's current lesson
- [ ] Conversation history loads correctly
- [ ] Admin dashboard shows usage stats
- [ ] Cost tracking accurate

### Test Scenarios:

1. **Happy Path:** User asks question → Gets relevant answer
2. **Rate Limit:** Send 51st message → See limit message
3. **API Failure:** Disable internet → See fallback
4. **Long Conversation:** 20+ messages → History maintained
5. **Context Awareness:** Ask about current lesson → AI references it

---

## 🚀 9. Deployment Steps

### Phase 1 Rollout:

**Week 1:**
1. Set up Gemini API key
2. Create database tables
3. Deploy backend changes
4. Test with internal team (5-10 users)

**Week 2:**
1. Deploy mobile app update
2. Beta test with 50 users
3. Monitor usage and costs
4. Gather feedback

**Week 3:**
1. Fix any issues
2. Adjust rate limits if needed
3. Full rollout to all users
4. Announce JeevaBot launch

---

## 📈 10. Success Metrics

Track these KPIs:

**Engagement:**
- Daily active chatbot users
- Messages per user per day
- Conversation length (avg messages)
- Repeat usage rate

**Quality:**
- Thumbs up/down ratings
- Follow-up question rate (indicates unclear answers)
- Support ticket reduction

**Cost:**
- Daily/monthly API costs
- Cost per user
- Token efficiency

**Business Impact:**
- Student retention (do chatbot users stay longer?)
- Study time increase
- Exam score improvement

---

## 📊 11. AI-Powered Performance Analysis & Recommendations

### Feature Overview

Beyond reactive chat support, JeevaBot proactively analyzes student performance and generates **personalized weekly study plans** based on their learning patterns, practice results, and mock exam scores.

**Purpose:**
- Identify weak areas automatically
- Generate actionable study recommendations
- Create personalized weekly schedules
- Motivate students with progress insights
- Improve exam readiness scores

---

### Database Schema

**Table: `ai_recommendations`** (already exists)

```sql
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommendation_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_recommendations_user ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_created ON ai_recommendations(created_at DESC);
```

**JSONB Structure:**
```json
{
  "generated_at": "2025-10-18T10:00:00Z",
  "analysis_period": "last_7_days",
  "exam_readiness": 68,
  "urgent_topics": [
    {
      "topic": "Pharmacology",
      "accuracy": 65,
      "priority": "high",
      "recommended_lessons": ["drug-interactions", "anticoagulants"],
      "practice_target": 20
    }
  ],
  "strong_areas": [
    { "topic": "Infection Control", "accuracy": 92 }
  ],
  "weekly_schedule": {
    "monday": "Pharmacology review + 20 practice MCQs",
    "tuesday": "Pharmacology continued",
    "wednesday": "IV calculations (Numeracy)",
    "thursday": "Numeracy practice",
    "friday": "Numeracy practice",
    "saturday": "Mock exam attempt",
    "sunday": "Review mistakes from mock exam"
  },
  "motivational_message": "You're close! Just 2 more weeks of focused study and you'll be exam-ready!",
  "days_until_subscription_ends": 45
}
```

---

### Backend Implementation

**Recommendation Generator (`server/utils/generateRecommendations.ts`):**

```typescript
import { supabase } from '../lib/supabase';
import { getModelResponse } from '../lib/gemini';

interface PerformanceData {
  userId: string;
  practiceStats: any[];
  mockExams: any[];
  learningProgress: any;
  subscription: any;
}

export async function generateRecommendations(userId: string) {
  // Fetch performance data
  const data = await fetchPerformanceData(userId);
  
  // Build AI prompt
  const prompt = buildRecommendationPrompt(data);
  
  // Call Gemini API
  const aiResponse = await getModelResponse(prompt);
  
  // Parse and structure response
  const recommendation = parseAIRecommendation(aiResponse, data);
  
  // Save to database
  await supabase.from('ai_recommendations').insert({
    user_id: userId,
    recommendation_data: recommendation,
  });
  
  return recommendation;
}

async function fetchPerformanceData(userId: string): Promise<PerformanceData> {
  // Get practice stats
  const { data: practiceStats } = await supabase
    .from('practice_sessions')
    .select(`
      *,
      practice_results (*)
    `)
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });
  
  // Get mock exam results
  const { data: mockExams } = await supabase
    .from('mock_exams')
    .select(`
      *,
      mock_exam_results (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);
  
  // Get learning progress
  const { data: learningProgress } = await supabase
    .from('learning_completions')
    .select('*, lessons (*)')
    .eq('user_id', userId);
  
  // Get subscription info
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  // Calculate topic-wise accuracy
  const topicAccuracy = calculateTopicAccuracy(practiceStats);
  
  return {
    userId,
    practiceStats: topicAccuracy,
    mockExams,
    learningProgress,
    subscription,
  };
}

function buildRecommendationPrompt(data: PerformanceData): string {
  const weakTopics = data.practiceStats.filter(t => t.accuracy < 0.70);
  const daysRemaining = Math.ceil(
    (new Date(data.subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  return `You are an NMC CBT exam preparation expert for nursing students.
Analyze this student's performance and generate a personalized study plan.

STUDENT PERFORMANCE DATA:
${JSON.stringify(data, null, 2)}

WEAK TOPICS (< 70% accuracy):
${weakTopics.map(t => `- ${t.topic_name}: ${t.accuracy}%`).join('\n')}

MOCK EXAM SCORES:
${data.mockExams.map(m => `- Part ${m.part}: ${m.score}/${m.total_questions}`).join('\n')}

SUBSCRIPTION:
- Days remaining: ${daysRemaining}
- Plan: ${data.subscription.plan_name}

TASK:
Generate a JSON response with:
1. exam_readiness: Overall readiness percentage (0-100)
2. urgent_topics: Top 3 weak areas that need immediate attention
3. strong_areas: Topics where student is performing well (>85%)
4. weekly_schedule: Day-by-day study plan (Mon-Sun)
5. motivational_message: Encouraging message based on progress
6. practice_targets: Specific daily practice question goals

RULES:
- Be realistic and achievable
- Prioritize weak areas but don't overwhelm
- Include rest days if needed
- Consider days remaining in subscription
- If exam_readiness < 60%, recommend intensive 2-week sprint
- If exam_readiness > 85%, focus on maintaining and fine-tuning

Return only valid JSON, no markdown formatting.`;
}

function parseAIRecommendation(aiResponse: string, data: PerformanceData): any {
  try {
    // Remove markdown code blocks if present
    const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(cleanResponse);
    
    // Add metadata
    return {
      ...parsed,
      generated_at: new Date().toISOString(),
      analysis_period: 'last_7_days',
      days_until_subscription_ends: Math.ceil(
        (new Date(data.subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    };
  } catch (error) {
    console.error('Failed to parse AI recommendation:', error);
    // Return fallback recommendation
    return generateFallbackRecommendation(data);
  }
}

function generateFallbackRecommendation(data: PerformanceData): any {
  const weakTopics = data.practiceStats.filter(t => t.accuracy < 0.70);
  
  return {
    generated_at: new Date().toISOString(),
    analysis_period: 'last_7_days',
    exam_readiness: 60,
    urgent_topics: weakTopics.slice(0, 3).map(t => ({
      topic: t.topic_name,
      accuracy: t.accuracy,
      priority: 'high',
      recommended_lessons: [],
      practice_target: 20,
    })),
    strong_areas: data.practiceStats
      .filter(t => t.accuracy > 0.85)
      .map(t => ({ topic: t.topic_name, accuracy: t.accuracy })),
    weekly_schedule: {
      monday: 'Review weak topics',
      tuesday: 'Practice sessions',
      wednesday: 'Continue practice',
      thursday: 'Mock exam preparation',
      friday: 'Practice sessions',
      saturday: 'Mock exam attempt',
      sunday: 'Review and rest',
    },
    motivational_message: 'Keep practicing! Focus on your weak areas and you\'ll improve.',
  };
}
```

---

### API Endpoint

**Route: `POST /api/ai/generate-recommendations`**

```typescript
// server/routes/ai.ts
import express from 'express';
import { generateRecommendations } from '../utils/generateRecommendations';

const router = express.Router();

router.post('/generate-recommendations', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.authorization?.replace('Bearer ', '')
    );
    
    if (authError || !user || user.id !== userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Generate recommendations
    const recommendation = await generateRecommendations(userId);
    
    res.json({ success: true, recommendation });
    
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;
```

---

### Mobile App Integration

**Hook: `useAIRecommendations.ts`**

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export function useAIRecommendations() {
  const { user, session } = useAuth();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch latest recommendation
  useEffect(() => {
    if (user) {
      fetchLatestRecommendation();
    }
  }, [user]);
  
  const fetchLatestRecommendation = async () => {
    const { data } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data) {
      setRecommendation(data.recommendation_data);
    }
  };
  
  const generateNewRecommendation = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/generate-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      
      const { recommendation: newRec } = await response.json();
      setRecommendation(newRec);
      
    } catch (error) {
      console.error('Error generating recommendation:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    recommendation,
    loading,
    generateNewRecommendation,
    refresh: fetchLatestRecommendation,
  };
}
```

**UI Component: `AIRecommendationsCard.tsx`**

```typescript
import { View, Text, Button } from 'react-native';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';

export function AIRecommendationsCard() {
  const { recommendation, loading, generateNewRecommendation } = useAIRecommendations();
  
  if (!recommendation) {
    return (
      <View>
        <Text>Get Your Personalized Study Plan</Text>
        <Button 
          title="Generate Plan" 
          onPress={generateNewRecommendation}
          disabled={loading}
        />
      </View>
    );
  }
  
  return (
    <View style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        🤖 Your Study Plan
      </Text>
      
      <View style={{ marginTop: 12 }}>
        <Text style={{ fontSize: 16 }}>
          🎯 Exam Readiness: {recommendation.exam_readiness}%
        </Text>
        <ProgressBar value={recommendation.exam_readiness} />
      </View>
      
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
          🚨 Urgent - Fix These First:
        </Text>
        {recommendation.urgent_topics.map((topic, idx) => (
          <View key={idx} style={{ marginTop: 8 }}>
            <Text>
              {idx + 1}. {topic.topic} ({topic.accuracy}%)
            </Text>
            <Text style={{ color: '#666' }}>
              → Practice {topic.practice_target} MCQs daily
            </Text>
          </View>
        ))}
      </View>
      
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
          💪 Strong Areas:
        </Text>
        {recommendation.strong_areas.map((area, idx) => (
          <Text key={idx}>✓ {area.topic} ({area.accuracy}%)</Text>
        ))}
      </View>
      
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
          📅 This Week:
        </Text>
        {Object.entries(recommendation.weekly_schedule).map(([day, plan]) => (
          <Text key={day}>
            {day.charAt(0).toUpperCase() + day.slice(1)}: {plan}
          </Text>
        ))}
      </View>
      
      <Text style={{ marginTop: 16, fontStyle: 'italic', color: '#007aff' }}>
        {recommendation.motivational_message}
      </Text>
      
      <Button 
        title="Generate New Plan" 
        onPress={generateNewRecommendation}
        disabled={loading}
      />
    </View>
  );
}
```

---

### Automation: Weekly Regeneration

**Cron Job (Backend):**

```typescript
// server/jobs/weeklyRecommendations.ts
import { supabase } from '../lib/supabase';
import { generateRecommendations } from '../utils/generateRecommendations';

export async function generateWeeklyRecommendations() {
  console.log('[Cron] Starting weekly recommendations generation...');
  
  // Get all active users
  const { data: activeUsers } = await supabase
    .from('subscriptions')
    .select('user_id')
    .in('status', ['active', 'trial'])
    .gte('end_date', new Date().toISOString());
  
  if (!activeUsers) return;
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const { user_id } of activeUsers) {
    try {
      await generateRecommendations(user_id);
      successCount++;
    } catch (error) {
      console.error(`Error generating for user ${user_id}:`, error);
      errorCount++;
    }
    
    // Rate limit: 1 request per second to avoid API throttling
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`[Cron] Completed: ${successCount} success, ${errorCount} errors`);
}

// Run every Sunday at 6 AM
// Add to your cron scheduler (e.g., node-cron)
```

---

### Cost Estimation

**Per Recommendation:**
- Input tokens: ~1000 (performance data)
- Output tokens: ~500 (structured recommendation)
- Total: ~1500 tokens
- Cost: ~$0.001 (0.1 cents per recommendation)

**Monthly for 1000 users:**
- 1000 users × 4 weeks = 4000 recommendations
- Cost: ~$4/month

**Very affordable for significant value!**

---

### Display Locations in App

1. **Profile Tab** - Main recommendations card
2. **Dashboard** - "Your Study Plan This Week" widget
3. **After Mock Exam** - "Improve Your Score" section with targeted recommendations
4. **Push Notification** - "Your new study plan is ready!" (Sundays)

---

## 🔄 12. Next Steps (Phase 2)

After Phase 1 is stable, plan for:

1. **Vertex AI Integration:** Custom ML models
2. **Adaptive Learning:** Personalized study paths
3. **Question Generation:** Auto-create practice content
4. **Voice Chat:** Audio conversations
5. **Image Recognition:** Analyze diagrams/equations

---

## 📚 12. Troubleshooting

### Common Issues:

**Issue:** "API key invalid"
- Solution: Check `.env` file, ensure key starts with `AIza`

**Issue:** "Messages not saving"
- Solution: Verify Supabase connection, check table permissions

**Issue:** "Rate limit not working"
- Solution: Check `increment_ai_usage` function, verify date format

**Issue:** "Context not personalized"
- Solution: Ensure `buildChatContext` fetches user data correctly

**Issue:** "High costs"
- Solution: Reduce max tokens, increase caching, limit message length

---

## 📞 Support

**For Implementation Help:**
- Email: vollstek@gmail.com
- Reference: Phase 1 AI Integration

**For API Issues:**
- [Google AI Studio Docs](https://ai.google.dev/docs)
- [Gemini API Reference](https://ai.google.dev/api)

---

**Version:** 2.0  
**Last Updated:** October 18, 2025  
**Status:** ✅ Ready for Implementation  
**Estimated Time:** 2-3 weeks for full Phase 1  
**Next Review:** After Phase 1 launch, before Phase 2 planning

**Recent Updates (v2.0):**
- Added AI-powered performance analysis & recommendations feature
- Added weekly personalized study plan generation
- Added exam readiness scoring algorithm
- Added weak area identification and remediation suggestions
- Added automated weekly recommendation generation (cron job)
- Updated for NMC CBT nursing exam context
