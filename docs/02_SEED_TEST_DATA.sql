-- ============================================================================
-- STEP 2: Insert test data
-- ============================================================================
-- Run this in your Supabase SQL Editor AFTER running 01_ADD_COLUMNS.sql
-- This bypasses RLS policies
-- ============================================================================

BEGIN;

-- Practice - Numeracy - Dosage Calculations (Question 1)
WITH new_q AS (
  INSERT INTO questions (question_text, explanation, module_type, category, subdivision)
  VALUES (
    'A patient needs 500mg of paracetamol. The tablets available are 250mg each. How many tablets should you administer?',
    'Divide the required dose (500mg) by the tablet strength (250mg): 500 ÷ 250 = 2 tablets',
    'practice', 'Numeracy', 'Dosage Calculations'
  ) RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct)
SELECT id, '1 tablet', false FROM new_q
UNION ALL SELECT id, '2 tablets', true FROM new_q
UNION ALL SELECT id, '3 tablets', false FROM new_q
UNION ALL SELECT id, '4 tablets', false FROM new_q;

-- Practice - Numeracy - Dosage Calculations (Question 2)
WITH new_q AS (
  INSERT INTO questions (question_text, explanation, module_type, category, subdivision)
  VALUES (
    'A patient requires 75mg of aspirin. You have 25mg tablets. How many tablets are needed?',
    'Divide 75mg by 25mg per tablet: 75 ÷ 25 = 3 tablets',
    'practice', 'Numeracy', 'Dosage Calculations'
  ) RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct)
SELECT id, '2 tablets', false FROM new_q
UNION ALL SELECT id, '3 tablets', true FROM new_q
UNION ALL SELECT id, '4 tablets', false FROM new_q
UNION ALL SELECT id, '5 tablets', false FROM new_q;

-- Practice - Numeracy - Dosage Calculations (Question 3)
WITH new_q AS (
  INSERT INTO questions (question_text, explanation, module_type, category, subdivision)
  VALUES (
    'Prescription: 1.5g of medication. Available: 500mg tablets. How many tablets?',
    'First convert 1.5g to mg: 1.5g = 1500mg. Then divide: 1500mg ÷ 500mg = 3 tablets',
    'practice', 'Numeracy', 'Dosage Calculations'
  ) RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct)
SELECT id, '2 tablets', false FROM new_q
UNION ALL SELECT id, '3 tablets', true FROM new_q
UNION ALL SELECT id, '4 tablets', false FROM new_q
UNION ALL SELECT id, '1.5 tablets', false FROM new_q;

-- Practice - Numeracy - IV Flow Rate Calculations (Question 1)
WITH new_q AS (
  INSERT INTO questions (question_text, explanation, module_type, category, subdivision)
  VALUES (
    'An IV infusion of 1000ml needs to be given over 8 hours. What is the flow rate in ml/hour?',
    'Divide total volume by time: 1000ml ÷ 8 hours = 125 ml/hour',
    'practice', 'Numeracy', 'IV Flow Rate Calculations'
  ) RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct)
SELECT id, '100 ml/hour', false FROM new_q
UNION ALL SELECT id, '125 ml/hour', true FROM new_q
UNION ALL SELECT id, '150 ml/hour', false FROM new_q
UNION ALL SELECT id, '200 ml/hour', false FROM new_q;

-- Practice - Numeracy - IV Flow Rate Calculations (Question 2)
WITH new_q AS (
  INSERT INTO questions (question_text, explanation, module_type, category, subdivision)
  VALUES (
    '500ml of saline to be infused over 4 hours. Calculate the drip rate in ml/hour.',
    'Divide volume by time: 500ml ÷ 4 hours = 125 ml/hour',
    'practice', 'Numeracy', 'IV Flow Rate Calculations'
  ) RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct)
SELECT id, '100 ml/hour', false FROM new_q
UNION ALL SELECT id, '125 ml/hour', true FROM new_q
UNION ALL SELECT id, '150 ml/hour', false FROM new_q
UNION ALL SELECT id, '175 ml/hour', false FROM new_q;

-- Practice - Clinical Knowledge - Medical-Surgical Nursing (Question 1)
WITH new_q AS (
  INSERT INTO questions (question_text, explanation, module_type, category, subdivision)
  VALUES (
    'What is the normal respiratory rate for an adult at rest?',
    'The normal respiratory rate for adults is 12-20 breaths per minute at rest',
    'practice', 'Clinical Knowledge', 'Medical-Surgical Nursing'
  ) RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct)
SELECT id, '8-12 breaths/min', false FROM new_q
UNION ALL SELECT id, '12-20 breaths/min', true FROM new_q
UNION ALL SELECT id, '20-30 breaths/min', false FROM new_q
UNION ALL SELECT id, '30-40 breaths/min', false FROM new_q;

-- Practice - Clinical Knowledge - Medical-Surgical Nursing (Question 2)
WITH new_q AS (
  INSERT INTO questions (question_text, explanation, module_type, category, subdivision)
  VALUES (
    'Which position is best for a patient with difficulty breathing?',
    'High Fowler''s position (sitting upright at 60-90 degrees) promotes lung expansion and eases breathing',
    'practice', 'Clinical Knowledge', 'Medical-Surgical Nursing'
  ) RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct)
SELECT id, 'Supine position', false FROM new_q
UNION ALL SELECT id, 'High Fowler''s position', true FROM new_q
UNION ALL SELECT id, 'Trendelenburg position', false FROM new_q
UNION ALL SELECT id, 'Prone position', false FROM new_q;

-- Practice - Clinical Knowledge - Medical-Surgical Nursing (Question 3)
WITH new_q AS (
  INSERT INTO questions (question_text, explanation, module_type, category, subdivision)
  VALUES (
    'What is the first sign of shock in a patient?',
    'Increased heart rate (tachycardia) is typically the first compensatory sign of shock',
    'practice', 'Clinical Knowledge', 'Medical-Surgical Nursing'
  ) RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct)
SELECT id, 'Decreased blood pressure', false FROM new_q
UNION ALL SELECT id, 'Increased heart rate', true FROM new_q
UNION ALL SELECT id, 'Decreased respiratory rate', false FROM new_q
UNION ALL SELECT id, 'Increased temperature', false FROM new_q;

-- Learning - The NMC Code (Question 1)
WITH new_q AS (
  INSERT INTO questions (question_text, explanation, module_type, category)
  VALUES (
    'According to the NMC Code, what is the primary duty of a nurse?',
    'The primary duty is to prioritize people - putting the interests of people first',
    'learning', 'The NMC Code'
  ) RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct)
SELECT id, 'Follow hospital policies', false FROM new_q
UNION ALL SELECT id, 'Prioritize people', true FROM new_q
UNION ALL SELECT id, 'Complete documentation', false FROM new_q
UNION ALL SELECT id, 'Maintain equipment', false FROM new_q;

-- Learning - The NMC Code (Question 2)
WITH new_q AS (
  INSERT INTO questions (question_text, explanation, module_type, category)
  VALUES (
    'How many main principles are there in the NMC Code?',
    'There are 4 main principles: Prioritize people, Practice effectively, Preserve safety, Promote professionalism',
    'learning', 'The NMC Code'
  ) RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct)
SELECT id, '2 principles', false FROM new_q
UNION ALL SELECT id, '3 principles', false FROM new_q
UNION ALL SELECT id, '4 principles', true FROM new_q
UNION ALL SELECT id, '5 principles', false FROM new_q;

-- Mock Exam - Part A (Question 1)
WITH new_q AS (
  INSERT INTO questions (question_text, explanation, module_type, exam_part)
  VALUES (
    'A patient weighs 70kg and requires 15mg/kg of medication. What is the total dose?',
    'Multiply weight by dose per kg: 70kg × 15mg/kg = 1050mg',
    'mock_exam', 'part_a'
  ) RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct)
SELECT id, '750mg', false FROM new_q
UNION ALL SELECT id, '1050mg', true FROM new_q
UNION ALL SELECT id, '1250mg', false FROM new_q
UNION ALL SELECT id, '1500mg', false FROM new_q;

-- Mock Exam - Part A (Question 2)
WITH new_q AS (
  INSERT INTO questions (question_text, explanation, module_type, exam_part)
  VALUES (
    'Calculate: 3/4 + 1/8 = ?',
    'Find common denominator (8): 6/8 + 1/8 = 7/8',
    'mock_exam', 'part_a'
  ) RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct)
SELECT id, '5/8', false FROM new_q
UNION ALL SELECT id, '7/8', true FROM new_q
UNION ALL SELECT id, '4/8', false FROM new_q
UNION ALL SELECT id, '1', false FROM new_q;

-- Mock Exam - Part B (Question 1)
WITH new_q AS (
  INSERT INTO questions (question_text, explanation, module_type, exam_part)
  VALUES (
    'What is the normal range for adult blood pressure?',
    'Normal BP is 90/60 to 120/80 mmHg. Anything above 140/90 is considered hypertension',
    'mock_exam', 'part_b'
  ) RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct)
SELECT id, '80/50 to 100/70', false FROM new_q
UNION ALL SELECT id, '90/60 to 120/80', true FROM new_q
UNION ALL SELECT id, '100/70 to 140/90', false FROM new_q
UNION ALL SELECT id, '110/80 to 160/100', false FROM new_q;

-- Mock Exam - Part B (Question 2)
WITH new_q AS (
  INSERT INTO questions (question_text, explanation, module_type, exam_part)
  VALUES (
    'What does SBAR stand for in nursing communication?',
    'Situation, Background, Assessment, Recommendation - a structured communication tool',
    'mock_exam', 'part_b'
  ) RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct)
SELECT id, 'Summary, Background, Action, Result', false FROM new_q
UNION ALL SELECT id, 'Situation, Background, Assessment, Recommendation', true FROM new_q
UNION ALL SELECT id, 'Status, Brief, Action, Review', false FROM new_q
UNION ALL SELECT id, 'Safety, Briefing, Analysis, Report', false FROM new_q;

COMMIT;

-- Verification
SELECT 
  module_type, 
  category, 
  subdivision, 
  exam_part, 
  COUNT(*) as question_count
FROM questions 
WHERE module_type IS NOT NULL
GROUP BY module_type, category, subdivision, exam_part
ORDER BY module_type, category, subdivision, exam_part;

SELECT 'Test data inserted successfully! Total questions:' as status, COUNT(*) as total FROM questions WHERE module_type IS NOT NULL;
