import {
  SendMessagePayload,
  SendMessageResponse,
  ConversationSummary,
  ChatMessage,
  RateLimitStatus,
  ChatStreamingChunk,
  ChatError,
} from '@/types/chat';
import { supabase } from '@/lib/supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const FUNCTIONS_URL = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1`;

const parseError = async (response: Response): Promise<ChatError> => {
  const fallback: ChatError = {
    message: `Server error: ${response.status}`,
    status: response.status,
  };

  try {
    const data = await response.json();
    return {
      message: data?.error || fallback.message,
      code: data?.code,
      status: response.status,
      retryAfter: data?.retryAfter,
    };
  } catch (_err) {
    return fallback;
  }
};

class ChatService {
  /**
   * Send a message and get the full response at once
   */
  async sendMessage(
    payload: SendMessagePayload,
    abortSignal?: AbortSignal,
  ): Promise<SendMessageResponse> {
    const response = await fetch(`${FUNCTIONS_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      signal: abortSignal,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw await parseError(response);
    }

    const data = await response.json();
    return {
      success: data.success,
      conversationId: data.conversationId,
      userMessage: data.userMessage,
      aiMessage: data.aiMessage,
      rateLimit: data.rateLimit,
    };
  }

  /**
   * Send message with simulated streaming for UI compatibility
   * Uses the regular /send endpoint but delivers response as chunks
   */
  async sendMessageWithStream(
    payload: SendMessagePayload,
    handlers: {
      onChunk: (chunk: ChatStreamingChunk) => void;
      onError: (error: ChatError) => void;
      onComplete: (metadata: SendMessageResponse) => void;
    },
    abortSignal?: AbortSignal,
  ): Promise<void> {
    try {
      // Use the regular send endpoint
      const response = await this.sendMessage(payload, abortSignal);
      
      // Deliver the full response as a single "chunk"
      // Note: We don't pass messageId here because we want to use the local streamMessageId
      handlers.onChunk({
        delta: response.aiMessage.content,
        done: true,
      });
      
      // Notify completion
      handlers.onComplete(response);
    } catch (error: any) {
      handlers.onError({
        message: error?.message || 'Failed to send message',
        code: error?.code,
        status: error?.status,
      });
    }
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string): Promise<ConversationSummary[]> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to load conversations: ${error.message}`);
    }

    // Fetch message counts for each conversation
    const conversationsWithCounts = await Promise.all(
      (data || []).map(async (conv) => {
        const { count, error: countError } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id);

        if (countError) {
          console.error(`Failed to count messages for conversation ${conv.id}:`, countError);
        }

        return {
          id: conv.id,
          userId: conv.user_id,
          title: conv.title,
          createdAt: conv.created_at,
          updatedAt: conv.updated_at,
          messageCount: count || 0,
          contextData: conv.context_data,
        };
      })
    );

    return conversationsWithCounts;
  }

  /**
   * Get all messages in a conversation
   */
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to load messages: ${error.message}`);
    }

    return (data || []).map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      createdAt: msg.created_at,
    }));
  }

  /**
   * Check user's remaining AI message quota
   */
  async getRateLimit(userId: string): Promise<RateLimitStatus> {
    const response = await fetch(`${FUNCTIONS_URL}/rate-limit/${userId}`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    });
    
    // If user doesn't exist yet, return unlimited
    if (response.status === 404) {
      return {
        allowed: true,
        limit: 50,
        current: 0,
        remaining: 50,
      };
    }
    
    if (!response.ok) {
      throw await parseError(response);
    }
    
    const data = await response.json();
    return data.rateLimit;
  }
}

export default new ChatService();