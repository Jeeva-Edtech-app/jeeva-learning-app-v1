-- ============================================================================
-- DATABASE MIGRATION: Tag-Based Architecture
-- ============================================================================
-- This migration adds new columns for tag-based filtering and test data
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Step 1: Add new columns to questions table
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS module_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS subdivision VARCHAR(100),
ADD COLUMN IF NOT EXISTS exam_part VARCHAR(20);

-- Step 2: Add category column to flashcards table  
ALTER TABLE flashcards
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Step 3: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_module_type ON questions(module_type);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_subdivision ON questions(subdivision);
CREATE INDEX IF NOT EXISTS idx_questions_exam_part ON questions(exam_part);
CREATE INDEX IF NOT EXISTS idx_flashcards_category ON flashcards(category);

-- ============================================================================
-- TEST DATA: Sample Questions
-- ============================================================================

-- Practice - Numeracy - Dosage Calculations
INSERT INTO questions (question_text, explanation, module_type, category, subdivision, lesson_id) VALUES
('A patient needs 500mg of paracetamol. The tablets available are 250mg each. How many tablets should you administer?', 
 'Divide the required dose (500mg) by the tablet strength (250mg): 500 ÷ 250 = 2 tablets', 
 'practice', 'Numeracy', 'Dosage Calculations', NULL),

('A patient requires 75mg of aspirin. You have 25mg tablets. How many tablets are needed?', 
 'Divide 75mg by 25mg per tablet: 75 ÷ 25 = 3 tablets', 
 'practice', 'Numeracy', 'Dosage Calculations', NULL),

('Prescription: 1.5g of medication. Available: 500mg tablets. How many tablets?', 
 'First convert 1.5g to mg: 1.5g = 1500mg. Then divide: 1500mg ÷ 500mg = 3 tablets', 
 'practice', 'Numeracy', 'Dosage Calculations', NULL);

-- Practice - Numeracy - IV Flow Rate Calculations
INSERT INTO questions (question_text, explanation, module_type, category, subdivision, lesson_id) VALUES
('An IV infusion of 1000ml needs to be given over 8 hours. What is the flow rate in ml/hour?', 
 'Divide total volume by time: 1000ml ÷ 8 hours = 125 ml/hour', 
 'practice', 'Numeracy', 'IV Flow Rate Calculations', NULL),

('500ml of saline to be infused over 4 hours. Calculate the drip rate in ml/hour.', 
 'Divide volume by time: 500ml ÷ 4 hours = 125 ml/hour', 
 'practice', 'Numeracy', 'IV Flow Rate Calculations', NULL);

-- Practice - Clinical Knowledge - Medical-Surgical Nursing
INSERT INTO questions (question_text, explanation, module_type, category, subdivision, lesson_id) VALUES
('What is the normal respiratory rate for an adult at rest?', 
 'The normal respiratory rate for adults is 12-20 breaths per minute at rest', 
 'practice', 'Clinical Knowledge', 'Medical-Surgical Nursing', NULL),

('Which position is best for a patient with difficulty breathing?', 
 'High Fowler''s position (sitting upright at 60-90 degrees) promotes lung expansion and eases breathing', 
 'practice', 'Clinical Knowledge', 'Medical-Surgical Nursing', NULL),

('What is the first sign of shock in a patient?', 
 'Increased heart rate (tachycardia) is typically the first compensatory sign of shock', 
 'practice', 'Clinical Knowledge', 'Medical-Surgical Nursing', NULL);

-- Learning - Numeracy
INSERT INTO questions (question_text, explanation, module_type, category, lesson_id) VALUES
('Convert 2.5 liters to milliliters.', 
 'Multiply by 1000: 2.5 × 1000 = 2500ml', 
 'learning', 'Numeracy', NULL),

('A patient needs 60mg of a drug. The solution contains 20mg/ml. How many ml do you give?', 
 'Divide required dose by concentration: 60mg ÷ 20mg/ml = 3ml', 
 'learning', 'Numeracy', NULL);

-- Learning - The NMC Code
INSERT INTO questions (question_text, explanation, module_type, category, lesson_id) VALUES
('According to the NMC Code, what is the primary duty of a nurse?', 
 'The primary duty is to prioritize people - putting the interests of people first', 
 'learning', 'The NMC Code', NULL),

('How many principles are there in the NMC Code?', 
 'There are 4 main principles in the NMC Code: Prioritize people, Practice effectively, Preserve safety, Promote professionalism', 
 'learning', 'The NMC Code', NULL);

-- Learning - Safeguarding
INSERT INTO questions (question_text, explanation, module_type, category, lesson_id) VALUES
('What are the main types of abuse in safeguarding?', 
 'Physical, emotional, sexual, financial, neglect, and institutional abuse', 
 'learning', 'Safeguarding', NULL),

('Who is responsible for safeguarding vulnerable adults?', 
 'Everyone has a responsibility, but healthcare professionals have a professional duty to identify and report concerns', 
 'learning', 'Safeguarding', NULL);

-- Mock Exam - Part A (Numeracy)
INSERT INTO questions (question_text, explanation, module_type, exam_part, lesson_id) VALUES
('A patient weighs 70kg and requires 15mg/kg of medication. What is the total dose?', 
 'Multiply weight by dose per kg: 70kg × 15mg/kg = 1050mg', 
 'mock_exam', 'part_a', NULL),

('Calculate: 3/4 + 1/8 = ?', 
 'Find common denominator (8): 6/8 + 1/8 = 7/8', 
 'mock_exam', 'part_a', NULL),

('A medication comes as 250mg/5ml. How many mg are in 15ml?', 
 'Set up ratio: 250mg/5ml = x/15ml. Cross multiply: x = (250 × 15) ÷ 5 = 750mg', 
 'mock_exam', 'part_a', NULL);

-- Mock Exam - Part B (Clinical Knowledge)
INSERT INTO questions (question_text, explanation, module_type, exam_part, lesson_id) VALUES
('What is the normal range for adult blood pressure?', 
 'Normal BP is 90/60 to 120/80 mmHg. Anything above 140/90 is considered hypertension', 
 'mock_exam', 'part_b', NULL),

('What does SBAR stand for in nursing communication?', 
 'Situation, Background, Assessment, Recommendation - a structured communication tool', 
 'mock_exam', 'part_b', NULL),

('What is the proper hand washing duration recommended by WHO?', 
 '40-60 seconds for handwashing with soap and water, 20-30 seconds for alcohol-based handrub', 
 'mock_exam', 'part_b', NULL);

-- ============================================================================
-- Now we need to add options for each question
-- Let's get the question IDs first, then add options
-- ============================================================================

-- Note: You'll need to run this query to get question IDs, then insert options
-- SELECT id, question_text, module_type, category, subdivision FROM questions ORDER BY created_at DESC;

-- For now, let's add a sample with proper structure
-- You can add more options following this pattern

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run these queries to verify the migration:
-- 
-- SELECT module_type, category, subdivision, COUNT(*) 
-- FROM questions 
-- WHERE module_type IS NOT NULL 
-- GROUP BY module_type, category, subdivision;
--
-- SELECT COUNT(*) as total_questions FROM questions;
-- ============================================================================
