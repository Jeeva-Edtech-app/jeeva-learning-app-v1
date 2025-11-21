-- Fix Analytics RLS Policies
-- This script grants authenticated users read access to user_sessions table
-- Run this in your Supabase SQL Editor to fix 400 Bad Request errors in analytics

-- Enable RLS on user_sessions if not already enabled
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Service role can manage all sessions" ON user_sessions;

-- Allow users to view their own sessions
CREATE POLICY "Users can view their own sessions"
ON user_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow service role (backend) to manage all sessions
CREATE POLICY "Service role can manage all sessions"
ON user_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON user_sessions TO authenticated;
GRANT ALL ON user_sessions TO service_role;

-- Verify the policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_sessions';
