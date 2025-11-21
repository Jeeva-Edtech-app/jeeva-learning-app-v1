-- Supabase Migration: Activate All Lesson Data
-- Run this in Supabase SQL Editor to fix lessons not displaying

-- 1. Ensure all modules are active
UPDATE modules SET is_active = true WHERE is_active = false;

-- 2. Ensure all topics are active
UPDATE topics SET is_active = true WHERE is_active = false;

-- 3. Ensure all lessons are active
UPDATE lessons SET is_active = true WHERE is_active = false;

-- 4. Ensure all flashcards are active
UPDATE flashcards SET is_active = true WHERE is_active = false;

-- 5. Verify the changes
SELECT 
  (SELECT COUNT(*) FROM modules WHERE is_active = true) as active_modules,
  (SELECT COUNT(*) FROM topics WHERE is_active = true) as active_topics,
  (SELECT COUNT(*) FROM lessons WHERE is_active = true) as active_lessons,
  (SELECT COUNT(*) FROM flashcards WHERE is_active = true) as active_flashcards;

-- Sample data check
SELECT 'Modules' as entity, id, title, is_active FROM modules LIMIT 1
UNION ALL
SELECT 'Topics', id, title, is_active FROM topics LIMIT 1
UNION ALL
SELECT 'Lessons', id, title, is_active FROM lessons LIMIT 1;
