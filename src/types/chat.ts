export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  conversationId: string | null;
  role: ChatRole;
  content: string;
  createdAt: string;
  tokensUsed?: number;
  streamId?: string;
  isStreaming?: boolean;
}

export interface SendMessagePayload {
  userId: string;
  content: string;
  conversationId?: string | null;
  context?: Record<string, unknown>;
  useStreaming?: boolean;
}

export interface SendMessageResponse {
  success: boolean;
  conversationId: string;
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
  rateLimit: RateLimitStatus;
}

export interface ConversationSummary {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  contextData?: Record<string, unknown>;
}

export interface RateLimitStatus {
  allowed: boolean;
  limit: number;
  current: number;
  remaining: number;
  resetTime?: string;
}

export interface ChatStreamingChunk {
  delta: string;
  done: boolean;
  messageId?: string;
}

export interface ChatError {
  message: string;
  code?: string;
  status?: number;
  retryAfter?: number;
}
