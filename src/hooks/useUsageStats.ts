import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface UsageStats {
  messageCount: number;
  totalTokens: number;
  date: string;
  isLoading: boolean;
  error: string | null;
}

const MAX_DAILY_MESSAGES = 50;

export const useUsageStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UsageStats>({
    messageCount: 0,
    totalTokens: 0,
    date: new Date().toISOString().split('T')[0],
    isLoading: false,
    error: null,
  });

  // Fetch today's usage from ai_usage_stats table
  const fetchUsageStats = useCallback(async () => {
    if (!user) return;

    setStats(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('ai_usage_stats')
        .select('message_count, total_tokens, date')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - this is fine for first message of the day
        throw error;
      }

      setStats({
        messageCount: data?.message_count || 0,
        totalTokens: data?.total_tokens || 0,
        date: today,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Error fetching usage stats:', err);
      setStats(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load usage stats',
      }));
    }
  }, [user]);

  // Auto-fetch on mount and when user changes
  useEffect(() => {
    fetchUsageStats();
  }, [fetchUsageStats]);

  // Helper to check if user is approaching limit
  const isApproachingLimit = stats.messageCount >= 45;
  const isAtLimit = stats.messageCount >= MAX_DAILY_MESSAGES;

  // Get usage level for color coding
  const getUsageLevel = (): 'safe' | 'warning' | 'danger' => {
    if (stats.messageCount >= 45) return 'danger';
    if (stats.messageCount >= 30) return 'warning';
    return 'safe';
  };

  // Calculate estimated cost (Gemini 1.5 Flash pricing)
  // NOTE: Using 40/60 split estimate - actual costs may vary
  const estimatedCost = {
    input: (stats.totalTokens * 0.4 * 0.00025) / 1000, // $0.00025 per 1K input tokens
    output: (stats.totalTokens * 0.6 * 0.00075) / 1000, // $0.00075 per 1K output tokens
    total: ((stats.totalTokens * 0.4 * 0.00025) / 1000) + ((stats.totalTokens * 0.6 * 0.00075) / 1000),
  };

  return {
    messageCount: stats.messageCount,
    totalTokens: stats.totalTokens,
    maxMessages: MAX_DAILY_MESSAGES,
    isLoading: stats.isLoading,
    error: stats.error,
    isApproachingLimit,
    isAtLimit,
    usageLevel: getUsageLevel(),
    estimatedCost,
    refetch: fetchUsageStats,
  };
};
