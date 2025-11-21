-- Jeeva Learning App - Complete Learning Schema
-- This migration creates all tables needed for the learning module

-- ============================================
-- 1. CORE LEARNING TABLES
-- ============================================

-- Modules (Practice, Learning, Mock Exam)
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics (e.g., "Numeracy", "The NMC Code", etc.)
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons (Individual learning units)
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  video_url TEXT,
  audio_url TEXT,
  lesson_type VARCHAR(50) DEFAULT 'text', -- 'text', 'video', 'audio', 'mixed'
  passing_score_percentage INTEGER DEFAULT 80,
  category VARCHAR(255),
  duration INTEGER, -- in minutes
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions (Quiz questions for lessons and practice)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'short_answer'
  difficulty VARCHAR(50) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  points INTEGER DEFAULT 1,
  explanation TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  module_type VARCHAR(50), -- 'practice', 'learning', 'mock'
  category VARCHAR(255),
  subdivision VARCHAR(255),
  exam_part VARCHAR(20), -- 'part_a', 'part_b'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question Options (Answer choices for multiple choice questions)
CREATE TABLE IF NOT EXISTS question_options (
  id SERIAL PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. USER PROGRESS TABLES
-- ============================================

-- Learning Completions (Tracks completed lessons)
CREATE TABLE IF NOT EXISTS learning_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT true,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Lesson Quiz Results (Tracks quiz performance)
CREATE TABLE IF NOT EXISTS lesson_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score_percentage INTEGER NOT NULL,
  passed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================
-- 3. PRACTICE MODULE TABLES
-- ============================================

-- Practice Sessions (User practice quiz sessions)
CREATE TABLE IF NOT EXISTS practice_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  subtopic_id VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_questions INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice Results (Individual answers in a practice session)
CREATE TABLE IF NOT EXISTS practice_results (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id INTEGER REFERENCES question_options(id) ON DELETE SET NULL,
  is_correct BOOLEAN DEFAULT false,
  time_taken_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. MOCK EXAM TABLES
-- ============================================

-- Mock Exams (Legacy exam attempts)
CREATE TABLE IF NOT EXISTS mock_exams (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_questions INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mock Results (Individual answers in mock exams)
CREATE TABLE IF NOT EXISTS mock_results (
  id SERIAL PRIMARY KEY,
  mock_exam_id INTEGER REFERENCES mock_exams(id) ON DELETE SET NULL,
  mock_session_id UUID REFERENCES mock_sessions(id) ON DELETE SET NULL,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id INTEGER REFERENCES question_options(id) ON DELETE SET NULL,
  is_correct BOOLEAN DEFAULT false,
  time_taken_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mock Sessions (Extended mock exam tracking)
CREATE TABLE IF NOT EXISTS mock_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_part VARCHAR(20) NOT NULL, -- 'part_a', 'part_b'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  score_percentage INTEGER DEFAULT 0,
  time_taken_minutes INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. ANALYTICS TABLES
-- ============================================

-- User Analytics (Per-user progress metrics)
CREATE TABLE IF NOT EXISTS user_analytics (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subtopic_id VARCHAR(255),
  lessons_completed INTEGER DEFAULT 0,
  questions_attempted INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  accuracy_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. FLASHCARDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty VARCHAR(50) DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_topics_module_id ON topics(module_id);
CREATE INDEX IF NOT EXISTS idx_topics_is_active ON topics(is_active);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_lessons_is_active ON lessons(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_lesson_id ON questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_subdivision ON questions(subdivision);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_learning_completions_user ON learning_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_completions_lesson ON learning_completions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_quiz_results_user ON lesson_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_quiz_results_lesson ON lesson_quiz_results(lesson_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_topic ON practice_sessions(topic_id);
CREATE INDEX IF NOT EXISTS idx_practice_results_session ON practice_results(session_id);
CREATE INDEX IF NOT EXISTS idx_mock_sessions_user ON mock_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_exams_user ON mock_exams(user_id);

-- ============================================
-- 8. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE learning_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own learning completions" ON learning_completions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz results" ON lesson_quiz_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own practice sessions" ON practice_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own mock sessions" ON mock_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON user_analytics
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Service role can insert/update user data
CREATE POLICY "Service role can manage learning completions" ON learning_completions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage quiz results" ON lesson_quiz_results
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage practice sessions" ON practice_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage mock sessions" ON mock_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- 9. SEED TEST DATA
-- ============================================

-- Insert modules
INSERT INTO modules (id, title, description, display_order, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Practice', 'Practice questions to familiarize with NMC CBT exam scenarios', 1, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Learning', 'Comprehensive lessons with video, audio, and reading materials', 2, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Mock Exam', 'Full-length practice exams simulating real NMC CBT experience', 3, true)
ON CONFLICT DO NOTHING;

-- Insert topics for Learning Module
INSERT INTO topics (id, module_id, title, description, display_order, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440002', 'Numeracy', 'Numeracy calculations essential for nursing practice', 1, true),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440002', 'The NMC Code', 'NMC Code of Conduct and professional standards', 2, true),
  ('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440002', 'Mental Capacity Act', 'Mental Capacity Act 2005 and its application', 3, true),
  ('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440002', 'Safeguarding', 'Safeguarding principles and procedures', 4, true),
  ('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440002', 'Consent & Confidentiality', 'Consent procedures and confidentiality requirements', 5, true),
  ('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440002', 'Equality & Diversity', 'Equality Act 2010 and diversity considerations', 6, true),
  ('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440002', 'Duty of Candour', 'Duty of candour and NHS incident reporting', 7, true),
  ('550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440002', 'Cultural Adaptation', 'Cultural competence and communication styles', 8, true)
ON CONFLICT DO NOTHING;

-- Insert lessons for Numeracy topic
INSERT INTO lessons (id, topic_id, title, content, lesson_type, duration, display_order, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', 'Dosage Calculations', 'Learn how to calculate medication dosages accurately', 'text', 15, 1, true),
  ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440101', 'Unit Conversions', 'Master unit conversions for healthcare measurements', 'text', 12, 2, true),
  ('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440101', 'IV Flow Rate Calculations', 'Calculate IV flow rates for infusions', 'text', 14, 3, true),
  ('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440101', 'Fluid Balance', 'Understand and calculate fluid balance', 'text', 16, 4, true)
ON CONFLICT DO NOTHING;

-- Insert lessons for The NMC Code topic
INSERT INTO lessons (id, topic_id, title, content, lesson_type, duration, display_order, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440102', 'Prioritise People', 'Understanding how to put people at the centre of care', 'text', 18, 1, true),
  ('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440102', 'Practice Effectively', 'Practicing with competence and commitment', 'text', 20, 2, true),
  ('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440102', 'Preserve Safety', 'Safety in nursing practice', 'text', 17, 3, true),
  ('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440102', 'Promote Professionalism', 'Professional conduct and behavior', 'text', 19, 4, true)
ON CONFLICT DO NOTHING;

-- Insert sample questions for Dosage Calculations lesson
INSERT INTO questions (id, lesson_id, question_text, question_type, difficulty, points, explanation, category, subdivision, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440201', 'A patient requires 500mg of amoxicillin. The available strength is 250mg/5ml. How many ml should be administered?', 'multiple_choice', 'easy', 1, 'Use the formula: (Required dose / Available strength) × Volume = (500/250) × 5 = 10ml', 'Numeracy', 'Dosage Calculations', true),
  ('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440201', 'Calculate the dose for a 70kg patient requiring 15mg/kg of a medication.', 'multiple_choice', 'medium', 1, 'Total dose = Weight × Dose per kg = 70 × 15 = 1050mg', 'Numeracy', 'Dosage Calculations', true),
  ('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440201', 'A child weighs 25kg and requires 25mg/kg/day divided into 4 doses. What is each dose?', 'multiple_choice', 'hard', 2, 'Total daily dose = 25kg × 25mg = 625mg. Per dose = 625/4 = 156.25mg', 'Numeracy', 'Dosage Calculations', true)
ON CONFLICT DO NOTHING;

-- Insert answer options for first question
INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440401', '5ml', false, 1),
  ('550e8400-e29b-41d4-a716-446655440401', '10ml', true, 2),
  ('550e8400-e29b-41d4-a716-446655440401', '15ml', false, 3),
  ('550e8400-e29b-41d4-a716-446655440401', '20ml', false, 4)
ON CONFLICT DO NOTHING;

-- Insert answer options for second question
INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440402', '950mg', false, 1),
  ('550e8400-e29b-41d4-a716-446655440402', '1050mg', true, 2),
  ('550e8400-e29b-41d4-a716-446655440402', '1150mg', false, 3),
  ('550e8400-e29b-41d4-a716-446655440402', '1200mg', false, 4)
ON CONFLICT DO NOTHING;

-- Insert answer options for third question
INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440403', '125mg', false, 1),
  ('550e8400-e29b-41d4-a716-446655440403', '156.25mg', true, 2),
  ('550e8400-e29b-41d4-a716-446655440403', '200mg', false, 3),
  ('550e8400-e29b-41d4-a716-446655440403', '250mg', false, 4)
ON CONFLICT DO NOTHING;

-- Insert sample questions for The NMC Code lessons
INSERT INTO questions (id, lesson_id, question_text, question_type, difficulty, points, explanation, category, subdivision, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440301', 'What does it mean to prioritise people in nursing?', 'multiple_choice', 'easy', 1, 'Prioritising people means putting people at the heart of care, treating them with dignity and respect', 'Learning', 'NMC Code', true),
  ('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440302', 'Which of the following best describes practising effectively?', 'multiple_choice', 'medium', 1, 'Practising effectively means using knowledge, skills and experience to deliver safe care', 'Learning', 'NMC Code', true),
  ('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440303', 'What is the primary focus of preserving safety in nursing?', 'multiple_choice', 'medium', 1, 'Preserving safety focuses on protecting people from harm and maintaining standards', 'Learning', 'NMC Code', true)
ON CONFLICT DO NOTHING;

-- Insert answer options for NMC Code questions
INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440501', 'Focusing on hospital policies', false, 1),
  ('550e8400-e29b-41d4-a716-446655440501', 'Putting people at the heart of care', true, 2),
  ('550e8400-e29b-41d4-a716-446655440501', 'Following doctor''s orders only', false, 3),
  ('550e8400-e29b-41d4-a716-446655440501', 'Minimizing costs', false, 4),
  ('550e8400-e29b-41d4-a716-446655440502', 'Just following protocols', false, 1),
  ('550e8400-e29b-41d4-a716-446655440502', 'Using knowledge and skills to deliver safe care', true, 2),
  ('550e8400-e29b-41d4-a716-446655440502', 'Working fast', false, 3),
  ('550e8400-e29b-41d4-a716-446655440502', 'Reducing paperwork', false, 4),
  ('550e8400-e29b-41d4-a716-446655440503', 'Protecting people from harm', true, 1),
  ('550e8400-e29b-41d4-a716-446655440503', 'Increasing productivity', false, 2),
  ('550e8400-e29b-41d4-a716-446655440503', 'Reducing staffing levels', false, 3),
  ('550e8400-e29b-41d4-a716-446655440503', 'Cutting costs', false, 4)
ON CONFLICT DO NOTHING;

-- Verify data insertion
SELECT 
  (SELECT COUNT(*) FROM modules) as total_modules,
  (SELECT COUNT(*) FROM topics) as total_topics,
  (SELECT COUNT(*) FROM lessons) as total_lessons,
  (SELECT COUNT(*) FROM questions) as total_questions,
  (SELECT COUNT(*) FROM question_options) as total_options;
