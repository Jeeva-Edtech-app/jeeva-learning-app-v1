-- ============================================================================
-- SUPABASE DATABASE TRIGGER SETUP FOR AUTOMATIC USER CREATION
-- ============================================================================
-- 
-- This SQL script creates database triggers that automatically create user
-- records in the proper sequence when someone signs up through Supabase Auth.
--
-- ARCHITECTURE:
-- auth.users (Supabase Auth) → public.users → public.user_profiles
--
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard (https://app.supabase.com)
-- 2. Go to your project
-- 3. Click on "SQL Editor" in the left sidebar
-- 4. Click "New Query"
-- 5. Copy and paste ALL the SQL below
-- 6. Click "Run" to execute
--
-- ============================================================================

-- ============================================================================
-- TRIGGER 1: Create public.users from auth.users
-- ============================================================================

-- Function to create a user in public.users when auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new row into public.users for the new auth user
  INSERT INTO public.users (
    id, 
    email, 
    password_hash, 
    auth_provider, 
    is_email_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,                                           -- Same UUID from auth.users
    NEW.email,                                        -- Email from auth
    'handled_by_supabase_auth',                       -- Placeholder (auth handled by Supabase)
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),  -- Auth provider (email/google/apple)
    NEW.email_confirmed_at IS NOT NULL,               -- Email verification status
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for auth.users → public.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_created();

-- ============================================================================
-- TRIGGER 2: Create public.user_profiles from public.users
-- ============================================================================

-- Function to create user_profiles when public.users record is created
CREATE OR REPLACE FUNCTION public.handle_user_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new row into user_profiles for the new user
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (
    NEW.id,
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_user_created ON public.users;

-- Create trigger for public.users → public.user_profiles
CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_created();

-- ============================================================================
-- VERIFICATION:
-- After running this SQL, test by:
-- 1. Creating a new user account in your app
-- 2. Check auth.users table - should have the new user ✅
-- 3. Check public.users table - should have matching user ✅
-- 4. Check public.user_profiles table - should have matching profile ✅
-- ============================================================================

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- These policies control who can read/write data in each table

-- Enable RLS on public.users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on public.user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES FOR public.users
-- ============================================================================

-- Allow users to read their own user record
CREATE POLICY "Users can view their own user record"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own user record
CREATE POLICY "Users can update their own user record"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- POLICIES FOR public.user_profiles
-- ============================================================================

-- Allow users to read their own profile
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to insert their own profile (for manual profile creation)
CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Optional: Check if triggers were created successfully
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'on_user_created')
ORDER BY event_object_table;
