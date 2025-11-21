-- Fix notification function type mismatch
-- This fixes the error: "Returned type character varying(255) does not match expected type text in column 2"

-- Drop the existing function first (required when changing return type)
-- Note: We need to specify the exact parameter types to drop it
DROP FUNCTION IF EXISTS get_user_notifications_with_read_status(UUID, INTEGER, INTEGER) CASCADE;

-- Recreate the function with correct types
CREATE OR REPLACE FUNCTION get_user_notifications_with_read_status(
  user_id_param UUID,
  limit_param INT DEFAULT 50,
  offset_param INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  body TEXT,
  notification_type TEXT,
  image_url TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN,
  read_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title::TEXT,
    n.body::TEXT,
    n.notification_type::TEXT,
    n.image_url::TEXT,
    n.data,
    n.created_at,
    (unr.id IS NOT NULL) AS is_read,
    unr.read_at
  FROM notifications n
  LEFT JOIN user_notification_reads unr 
    ON n.id = unr.notification_id AND unr.user_id = user_id_param
  ORDER BY n.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_notifications_with_read_status TO authenticated;

