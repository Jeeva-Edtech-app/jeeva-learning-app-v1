-- Function to increment or create usage stats for a user
CREATE OR REPLACE FUNCTION increment_usage_stats(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
