-- ============================================================================
-- STEP 1: Add new columns to existing tables
-- ============================================================================
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Add new columns to questions table for tag-based filtering
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS module_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS subdivision VARCHAR(100),
ADD COLUMN IF NOT EXISTS exam_part VARCHAR(20);

-- Add category column to flashcards table  
ALTER TABLE flashcards
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_module_type ON questions(module_type);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_subdivision ON questions(subdivision);
CREATE INDEX IF NOT EXISTS idx_questions_exam_part ON questions(exam_part);
CREATE INDEX IF NOT EXISTS idx_flashcards_category ON flashcards(category);

-- Verification
SELECT 'Columns added successfully!' as status;
