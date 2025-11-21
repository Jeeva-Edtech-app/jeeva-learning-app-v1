-- Check RLS status and policies for all tables
-- Run this in your Supabase SQL editor

-- 1. Check which tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Check all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    qual as "USING Clause",
    with_check as "WITH CHECK Clause"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check specific policies for lessons, topics, modules tables
SELECT 
    table_name,
    policy_name,
    roles,
    operation,
    definition
FROM information_schema.constraint_table_usage
JOIN pg_policies ON pg_policies.tablename = information_schema.table_name
WHERE table_schema = 'public' 
  AND table_name IN ('lessons', 'topics', 'modules', 'flashcards')
ORDER BY table_name;

-- 4. Quick check - List all policies on key tables
SELECT * FROM pg_policies
WHERE tablename IN ('lessons', 'topics', 'modules', 'flashcards');

-- 5. Check if auth.users exists and is accessible
SELECT COUNT(*) FROM auth.users;

-- 6. Debug: Try querying lessons directly (should show any RLS errors)
SELECT id, title, is_active, COUNT(*) as total_lessons
FROM lessons
GROUP BY is_active
ORDER BY is_active;
