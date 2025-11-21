-- In-App Notifications Migration
-- Run this in your Supabase SQL Editor

-- ===========================
-- CREATE NOTIFICATIONS TABLE
-- ===========================
-- This table stores all system notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL DEFAULT 'general',
  image_url TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view all notifications
CREATE POLICY "Users can view all notifications"
ON notifications
FOR SELECT
TO authenticated
USING (true);

-- Service role can manage notifications
CREATE POLICY "Service role can manage notifications"
ON notifications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ======================================
-- CREATE USER_NOTIFICATION_READS TABLE
-- ======================================
-- Tracks which notifications each user has read
CREATE TABLE IF NOT EXISTS user_notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notification_id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_notification_reads_user_id ON user_notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_reads_notification_id ON user_notification_reads(notification_id);

-- Enable RLS
ALTER TABLE user_notification_reads ENABLE ROW LEVEL SECURITY;

-- Users can view their own read notifications
CREATE POLICY "Users can view their own read notifications"
ON user_notification_reads
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can mark notifications as read
CREATE POLICY "Users can mark notifications as read"
ON user_notification_reads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own read records
CREATE POLICY "Users can delete their own read records"
ON user_notification_reads
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ======================================
-- CREATE NOTIFICATION_PREFERENCES TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  subscription_expiring_enabled BOOLEAN DEFAULT true,
  content_approved_enabled BOOLEAN DEFAULT true,
  welcome_enabled BOOLEAN DEFAULT true,
  milestones_enabled BOOLEAN DEFAULT true,
  marketing_enabled BOOLEAN DEFAULT false,
  quiet_hours JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view their own preferences"
ON notification_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
ON notification_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Service role can manage all preferences
CREATE POLICY "Service role can manage all preferences"
ON notification_preferences
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ======================================
-- CREATE HELPER FUNCTIONS
-- ======================================

-- Function to get user notifications with read status
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

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(
  user_id_param UUID
)
RETURNS INT AS $$
DECLARE
  unread_count INT;
BEGIN
  SELECT COUNT(*)::INT INTO unread_count
  FROM notifications n
  WHERE NOT EXISTS (
    SELECT 1 FROM user_notification_reads unr
    WHERE unr.notification_id = n.id AND unr.user_id = user_id_param
  );
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================
-- CREATE TRIGGER FOR DEFAULT PREFERENCES
-- ======================================
-- Automatically create notification preferences when user signs up
CREATE OR REPLACE FUNCTION create_notification_preferences_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_notification_prefs ON auth.users;

CREATE TRIGGER on_auth_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_preferences_for_new_user();

-- ======================================
-- GRANT PERMISSIONS
-- ======================================
GRANT SELECT ON notifications TO authenticated;
GRANT SELECT, INSERT, DELETE ON user_notification_reads TO authenticated;
GRANT SELECT, UPDATE ON notification_preferences TO authenticated;

GRANT ALL ON notifications TO service_role;
GRANT ALL ON user_notification_reads TO service_role;
GRANT ALL ON notification_preferences TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_user_notifications_with_read_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO authenticated;

-- ======================================
-- SAMPLE NOTIFICATIONS (Optional)
-- ======================================
-- Uncomment to add sample welcome notification
/*
INSERT INTO notifications (title, body, notification_type)
VALUES 
  ('Welcome to Jeeva Learning!', 'We are excited to have you on board. Start your journey towards UK NMC CBT success!', 'welcome'),
  ('New Learning Module Available', 'A new module on Clinical Knowledge has been added. Check it out now!', 'content_approved');
*/

-- ======================================
-- VERIFICATION QUERIES
-- ======================================
-- Run these to verify the migration
-- SELECT * FROM notifications LIMIT 5;
-- SELECT * FROM user_notification_reads LIMIT 5;
-- SELECT * FROM notification_preferences LIMIT 5;
-- SELECT get_unread_notification_count('YOUR_USER_ID_HERE');
