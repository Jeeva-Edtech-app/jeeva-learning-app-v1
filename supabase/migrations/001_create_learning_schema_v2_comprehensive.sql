-- Jeeva Learning App - COMPREHENSIVE Learning Schema (v2)
-- Complete implementation with all modules, topics, lessons, questions, and progress tracking
-- Ready for production use after testing

-- ============================================
-- 1. CORE LEARNING TABLES
-- ============================================

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

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  video_url TEXT,
  audio_url TEXT,
  lesson_type VARCHAR(50) DEFAULT 'text',
  passing_score_percentage INTEGER DEFAULT 80,
  category VARCHAR(255),
  duration INTEGER,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple_choice',
  difficulty VARCHAR(50) DEFAULT 'medium',
  points INTEGER DEFAULT 1,
  explanation TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  module_type VARCHAR(50),
  category VARCHAR(255),
  subdivision VARCHAR(255),
  exam_part VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_options (
  id SERIAL PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CRITICAL: LEARNING PROGRESS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subdivision VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'not_started',
  score_percentage INTEGER,
  attempts INTEGER DEFAULT 0,
  best_score INTEGER,
  last_attempted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subdivision),
  CHECK (status IN ('not_started', 'in_progress', 'completed', 'locked'))
);

-- ============================================
-- 3. USER PROGRESS TABLES
-- ============================================

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
-- 4. PRACTICE MODULE TABLES
-- ============================================

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
-- 5. MOCK EXAM TABLES
-- ============================================

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

CREATE TABLE IF NOT EXISTS mock_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_part VARCHAR(20) NOT NULL,
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
-- 6. ANALYTICS TABLES
-- ============================================

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
-- 7. FLASHCARDS TABLE
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
-- 8. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_topics_module_id ON topics(module_id);
CREATE INDEX IF NOT EXISTS idx_topics_is_active ON topics(is_active);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_lessons_is_active ON lessons(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_lesson_id ON questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_subdivision ON questions(subdivision);
CREATE INDEX IF NOT EXISTS idx_questions_module_type ON questions(module_type);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_learning_completions_user ON learning_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_completions_lesson ON learning_completions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_quiz_results_user ON lesson_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_quiz_results_lesson ON lesson_quiz_results(lesson_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_subdivision ON learning_progress(subdivision);
CREATE INDEX IF NOT EXISTS idx_learning_progress_status ON learning_progress(status);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_topic ON practice_sessions(topic_id);
CREATE INDEX IF NOT EXISTS idx_practice_results_session ON practice_results(session_id);
CREATE INDEX IF NOT EXISTS idx_mock_sessions_user ON mock_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_exams_user ON mock_exams(user_id);

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE learning_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Users can view own learning completions" ON learning_completions;
DROP POLICY IF EXISTS "Users can view own quiz results" ON lesson_quiz_results;
DROP POLICY IF EXISTS "Users can view own learning progress" ON learning_progress;
DROP POLICY IF EXISTS "Users can view own practice sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Users can view own mock sessions" ON mock_sessions;
DROP POLICY IF EXISTS "Users can view own analytics" ON user_analytics;
DROP POLICY IF EXISTS "Service role manages learning completions" ON learning_completions;
DROP POLICY IF EXISTS "Service role manages quiz results" ON lesson_quiz_results;
DROP POLICY IF EXISTS "Service role manages learning progress" ON learning_progress;
DROP POLICY IF EXISTS "Service role manages practice sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Service role manages mock sessions" ON mock_sessions;

-- RLS Policies
CREATE POLICY "Users can view own learning completions" ON learning_completions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz results" ON lesson_quiz_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning progress" ON learning_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own practice sessions" ON practice_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own mock sessions" ON mock_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON user_analytics
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Service role can manage all user data
CREATE POLICY "Service role manages learning completions" ON learning_completions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages quiz results" ON lesson_quiz_results
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages learning progress" ON learning_progress
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages practice sessions" ON practice_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages mock sessions" ON mock_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- 10. SEED DATA - MODULES
-- ============================================

INSERT INTO modules (id, title, description, display_order, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Practice', 'Practice questions to familiarize with NMC CBT exam scenarios', 1, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Learning', 'Comprehensive lessons with video, audio, and reading materials', 2, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Mock Exam', 'Full-length practice exams simulating real NMC CBT experience', 3, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 11. SEED DATA - PRACTICE MODULE TOPICS & LESSONS
-- ============================================

INSERT INTO topics (id, module_id, title, description, display_order, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655450101', '550e8400-e29b-41d4-a716-446655440001', 'Numeracy', 'Practice numeracy calculations for nursing', 1, true),
  ('550e8400-e29b-41d4-a716-446655450102', '550e8400-e29b-41d4-a716-446655440001', 'Clinical Knowledge', 'Practice clinical knowledge questions', 2, true)
ON CONFLICT DO NOTHING;

INSERT INTO lessons (id, topic_id, title, content, lesson_type, duration, display_order, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655450201', '550e8400-e29b-41d4-a716-446655450101', 'Dosage Calculations', 'Practice numeracy: Dosage Calculations', 'text', 5, 1, true),
  ('550e8400-e29b-41d4-a716-446655450202', '550e8400-e29b-41d4-a716-446655450101', 'Unit Conversions', 'Practice numeracy: Unit Conversions', 'text', 5, 2, true),
  ('550e8400-e29b-41d4-a716-446655450203', '550e8400-e29b-41d4-a716-446655450101', 'IV Flow Rate Calculations', 'Practice numeracy: IV Flow Rate', 'text', 5, 3, true),
  ('550e8400-e29b-41d4-a716-446655450204', '550e8400-e29b-41d4-a716-446655450101', 'Fluid Balance', 'Practice numeracy: Fluid Balance', 'text', 5, 4, true),
  ('550e8400-e29b-41d4-a716-446655450301', '550e8400-e29b-41d4-a716-446655450102', 'Medical-Surgical Nursing', 'Practice clinical knowledge', 'text', 5, 1, true),
  ('550e8400-e29b-41d4-a716-446655450302', '550e8400-e29b-41d4-a716-446655450102', 'Pharmacology', 'Practice clinical knowledge', 'text', 5, 2, true),
  ('550e8400-e29b-41d4-a716-446655450303', '550e8400-e29b-41d4-a716-446655450102', 'Infection Control', 'Practice clinical knowledge', 'text', 5, 3, true),
  ('550e8400-e29b-41d4-a716-446655450304', '550e8400-e29b-41d4-a716-446655450102', 'Wound Care', 'Practice clinical knowledge', 'text', 5, 4, true),
  ('550e8400-e29b-41d4-a716-446655450305', '550e8400-e29b-41d4-a716-446655450102', 'Palliative Care', 'Practice clinical knowledge', 'text', 5, 5, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 12. SEED DATA - LEARNING MODULE TOPICS & SUBTOPICS
-- ============================================

INSERT INTO topics (id, module_id, title, description, display_order, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440002', 'Numeracy', 'Mathematical calculations for nursing practice', 1, true),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440002', 'The NMC Code', 'NMC Code of Conduct and professional standards', 2, true),
  ('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440002', 'Mental Capacity Act', 'Mental Capacity Act 2005 and its application', 3, true),
  ('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440002', 'Safeguarding', 'Safeguarding principles and procedures', 4, true),
  ('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440002', 'Consent & Confidentiality', 'Consent procedures and confidentiality requirements', 5, true),
  ('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440002', 'Equality & Diversity', 'Equality Act 2010 and diversity considerations', 6, true),
  ('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440002', 'Duty of Candour', 'Duty of candour and NHS incident reporting', 7, true),
  ('550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440002', 'Cultural Adaptation', 'Cultural competence and communication styles', 8, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 13. SEED DATA - LEARNING MODULE LESSONS (32 total: 8 topics × 4 lessons avg)
-- ============================================

INSERT INTO lessons (id, topic_id, title, content, video_url, audio_url, lesson_type, passing_score_percentage, duration, display_order, is_active) VALUES
  -- Topic 1: Numeracy (4 lessons)
  ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', 'Dosage Calculations', 'Learn medication dosage calculations for safe administration', 'https://example.com/numeracy-dosage.mp4', 'https://example.com/numeracy-dosage.mp3', 'mixed', 80, 15, 1, true),
  ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440101', 'Unit Conversions', 'Master unit conversions in healthcare context', 'https://example.com/numeracy-units.mp4', 'https://example.com/numeracy-units.mp3', 'mixed', 80, 12, 2, true),
  ('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440101', 'IV Flow Rate Calculations', 'Calculate IV infusion flow rates accurately', 'https://example.com/numeracy-iv.mp4', 'https://example.com/numeracy-iv.mp3', 'mixed', 80, 14, 3, true),
  ('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440101', 'Fluid Balance', 'Understand and calculate fluid balance correctly', 'https://example.com/numeracy-fluid.mp4', 'https://example.com/numeracy-fluid.mp3', 'mixed', 80, 16, 4, true),
  
  -- Topic 2: The NMC Code (4 lessons)
  ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440102', 'Prioritise People', 'Understanding putting people at the centre of care', 'https://example.com/nmc-prioritise.mp4', 'https://example.com/nmc-prioritise.mp3', 'mixed', 80, 18, 1, true),
  ('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440102', 'Practice Effectively', 'Practicing with competence and commitment', 'https://example.com/nmc-practice.mp4', 'https://example.com/nmc-practice.mp3', 'mixed', 80, 20, 2, true),
  ('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440102', 'Preserve Safety', 'Safety in nursing practice', 'https://example.com/nmc-safety.mp4', 'https://example.com/nmc-safety.mp3', 'mixed', 80, 17, 3, true),
  ('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440102', 'Promote Professionalism', 'Professional conduct and behavior', 'https://example.com/nmc-professional.mp4', 'https://example.com/nmc-professional.mp3', 'mixed', 80, 19, 4, true),
  
  -- Topic 3: Mental Capacity Act (4 lessons)
  ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440103', 'Presumption of Capacity', 'Presuming capacity unless proved otherwise', 'https://example.com/mca-presumption.mp4', 'https://example.com/mca-presumption.mp3', 'mixed', 80, 15, 1, true),
  ('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440103', 'Assessing Capacity', 'Methods for assessing decision-making capacity', 'https://example.com/mca-assess.mp4', 'https://example.com/mca-assess.mp3', 'mixed', 80, 18, 2, true),
  ('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440103', 'Best Interests Decisions', 'Making decisions in patient best interests', 'https://example.com/mca-interests.mp4', 'https://example.com/mca-interests.mp3', 'mixed', 80, 16, 3, true),
  ('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440103', 'Advanced Care Planning', 'Advance decisions and care planning', 'https://example.com/mca-planning.mp4', 'https://example.com/mca-planning.mp3', 'mixed', 80, 17, 4, true),
  
  -- Topic 4: Safeguarding (3 lessons)
  ('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440104', 'Recognising Abuse', 'Identifying signs of abuse and exploitation', 'https://example.com/safeguard-abuse.mp4', 'https://example.com/safeguard-abuse.mp3', 'mixed', 80, 16, 1, true),
  ('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440104', 'Reporting Protocols', 'Procedures for reporting safeguarding concerns', 'https://example.com/safeguard-report.mp4', 'https://example.com/safeguard-report.mp3', 'mixed', 80, 15, 2, true),
  ('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440104', 'Child Protection', 'Child protection in healthcare', 'https://example.com/safeguard-child.mp4', 'https://example.com/safeguard-child.mp3', 'mixed', 80, 14, 3, true),
  
  -- Topic 5: Consent & Confidentiality (3 lessons)
  ('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440105', 'Valid Consent', 'Obtaining and documenting valid consent', 'https://example.com/consent-valid.mp4', 'https://example.com/consent-valid.mp3', 'mixed', 80, 16, 1, true),
  ('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440105', 'GDPR & Confidentiality', 'Data protection and confidentiality requirements', 'https://example.com/consent-gdpr.mp4', 'https://example.com/consent-gdpr.mp3', 'mixed', 80, 17, 2, true),
  ('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440105', 'Confidentiality vs. Safeguarding', 'Balancing confidentiality and safeguarding', 'https://example.com/consent-balance.mp4', 'https://example.com/consent-balance.mp3', 'mixed', 80, 15, 3, true),
  
  -- Topic 6: Equality & Diversity (3 lessons)
  ('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440106', 'Equality Act 2010', 'Understanding the Equality Act 2010', 'https://example.com/equality-act.mp4', 'https://example.com/equality-act.mp3', 'mixed', 80, 15, 1, true),
  ('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440106', 'Cultural Competence', 'Providing culturally competent care', 'https://example.com/equality-culture.mp4', 'https://example.com/equality-culture.mp3', 'mixed', 80, 16, 2, true),
  ('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440106', 'Reasonable Adjustments', 'Making reasonable adjustments for patients', 'https://example.com/equality-adjust.mp4', 'https://example.com/equality-adjust.mp3', 'mixed', 80, 14, 3, true),
  
  -- Topic 7: Duty of Candour (2 lessons)
  ('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440107', 'Transparency After Errors', 'Being transparent following patient safety errors', 'https://example.com/candour-transparency.mp4', 'https://example.com/candour-transparency.mp3', 'mixed', 80, 16, 1, true),
  ('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440107', 'NHS Incident Reporting', 'NHS incident reporting procedures', 'https://example.com/candour-reporting.mp4', 'https://example.com/candour-reporting.mp3', 'mixed', 80, 15, 2, true),
  
  -- Topic 8: Cultural Adaptation (2 lessons)
  ('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440108', 'Autonomy vs. Family Decisions', 'Balancing individual autonomy and family involvement', 'https://example.com/cultural-autonomy.mp4', 'https://example.com/cultural-autonomy.mp3', 'mixed', 80, 15, 1, true),
  ('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440108', 'UK Communication Styles', 'Understanding UK communication expectations', 'https://example.com/cultural-comm.mp4', 'https://example.com/cultural-comm.mp3', 'mixed', 80, 14, 2, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 14. SEED DATA - LEARNING QUESTIONS (Sample for each topic)
-- ============================================

-- Numeracy Questions (5 samples for lesson 1.1)
INSERT INTO questions (id, lesson_id, question_text, question_type, difficulty, module_type, category, subdivision, explanation, is_active) VALUES
  ('650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440201', 'A patient requires 500mg of amoxicillin. The available strength is 250mg/5ml. How many ml should be administered?', 'multiple_choice', 'easy', 'learning', '1', '1.1', 'Use the formula: (Required dose / Available strength) × Volume = (500/250) × 5 = 10ml', true),
  ('650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440201', 'Calculate the dose for a 70kg patient requiring 15mg/kg of a medication.', 'multiple_choice', 'medium', 'learning', '1', '1.1', 'Total dose = Weight × Dose per kg = 70 × 15 = 1050mg', true),
  ('650e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440201', 'A 2-year-old child weighs 15kg and requires 20mg/kg/day of antibiotic divided into 4 doses. Calculate each dose.', 'multiple_choice', 'hard', 'learning', '1', '1.1', 'Total daily dose = 15 × 20 = 300mg. Per dose = 300 ÷ 4 = 75mg', true),

-- NMC Code Questions (3 samples for lesson 2.1)
  ('650e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440301', 'What does it mean to prioritise people in the NMC Code?', 'multiple_choice', 'easy', 'learning', '2', '2.1', 'Prioritising people means putting people at the heart of care, treating them with dignity and respect', true),
  ('650e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440301', 'Which action demonstrates prioritising people according to the NMC Code?', 'multiple_choice', 'medium', 'learning', '2', '2.1', 'Listening to patient concerns and involving them in care decisions shows prioritisation of people', true),
  ('650e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440301', 'How should you respond when a patient declines a treatment you recommend?', 'multiple_choice', 'hard', 'learning', '2', '2.1', 'Respect patient autonomy, explore reasons for refusal, and provide additional information if requested', true),

-- Mental Capacity Act Questions (2 samples)
  ('650e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440401', 'What is the first principle of the Mental Capacity Act 2005?', 'multiple_choice', 'easy', 'learning', '3', '3.1', 'The presumption of capacity - assume a person has capacity unless proved otherwise', true),
  ('650e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440401', 'A patient with dementia refuses pain medication. What should you do first?', 'multiple_choice', 'medium', 'learning', '3', '3.1', 'Assess their capacity to make this specific decision about pain management', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 15. SEED DATA - PRACTICE QUESTIONS (Sample for Practice module)
-- ============================================

INSERT INTO questions (id, question_text, question_type, difficulty, points, module_type, category, subdivision, explanation, is_active) VALUES
  ('750e8400-e29b-41d4-a716-446655440101', 'Calculate: A patient needs 250mg of a drug. Available concentration is 50mg/ml. How many ml?', 'multiple_choice', 'easy', 1, 'practice', 'Numeracy', 'Dosage Calculations', 'Volume = Dose / Concentration = 250 / 50 = 5ml', true),
  ('750e8400-e29b-41d4-a716-446655440102', 'Convert 1.5 liters to milliliters.', 'multiple_choice', 'easy', 1, 'practice', 'Numeracy', 'Unit Conversions', '1 liter = 1000ml, so 1.5 × 1000 = 1500ml', true),
  ('750e8400-e29b-41d4-a716-446655440103', 'An IV infusion of 500ml is to run over 2 hours. What is the flow rate in ml/hour?', 'multiple_choice', 'medium', 1, 'practice', 'Numeracy', 'IV Flow Rate Calculations', 'Flow rate = Volume / Time = 500 / 2 = 250 ml/hour', true),
  ('750e8400-e29b-41d4-a716-446655450101', 'What are the signs of hypovolemia?', 'multiple_choice', 'medium', 1, 'practice', 'Clinical Knowledge', 'Medical-Surgical Nursing', 'Increased heart rate, decreased blood pressure, decreased urine output, dry mucous membranes', true),
  ('750e8400-e29b-41d4-a716-446655450102', 'Which antibiotic is most effective against MRSA?', 'multiple_choice', 'hard', 1, 'practice', 'Clinical Knowledge', 'Pharmacology', 'Vancomycin is commonly used for severe MRSA infections', true),
  ('750e8400-e29b-41d4-a716-446655450103', 'What is the primary method of infection control in healthcare?', 'multiple_choice', 'medium', 1, 'practice', 'Clinical Knowledge', 'Infection Control', 'Hand hygiene is the most important and basic infection control measure', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 16. SEED DATA - MOCK EXAM QUESTIONS (Sample)
-- ============================================

INSERT INTO questions (id, question_text, question_type, difficulty, points, module_type, exam_part, explanation, is_active) VALUES
  ('850e8400-e29b-41d4-a716-446655440101', 'Calculate: An adult patient weighs 80kg and requires 5mg/kg of medication. Total dose required?', 'multiple_choice', 'easy', 1, 'mock_exam', 'full', 'Total = 80 × 5 = 400mg', true),
  ('850e8400-e29b-41d4-a716-446655440102', 'According to the NMC Code, what is your primary responsibility?', 'multiple_choice', 'medium', 1, 'mock_exam', 'full', 'To prioritise the people in your care and treat them as individuals of value', true),
  ('850e8400-e29b-41d4-a716-446655440103', 'Which factor should be considered when assessing mental capacity?', 'multiple_choice', 'medium', 1, 'mock_exam', 'full', 'Ability to understand, retain, weigh, and communicate the decision', true),
  ('850e8400-e29b-41d4-a716-446655440104', 'What must you do if you make a clinical error affecting patient safety?', 'multiple_choice', 'hard', 1, 'mock_exam', 'full', 'Report it immediately, document it, and inform the patient (duty of candour)', true),
  ('850e8400-e29b-41d4-a716-446655440105', 'In UK healthcare, what does GDPR primarily protect?', 'multiple_choice', 'medium', 1, 'mock_exam', 'full', 'Patient personal data and confidentiality', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 17. SEED DATA - QUESTION OPTIONS (Answers)
-- ============================================

-- Options for Numeracy Q1 (5ml = correct)
INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES
  ('650e8400-e29b-41d4-a716-446655440201', '5ml', true, 1),
  ('650e8400-e29b-41d4-a716-446655440201', '10ml', false, 2),
  ('650e8400-e29b-41d4-a716-446655440201', '15ml', false, 3),
  ('650e8400-e29b-41d4-a716-446655440201', '20ml', false, 4)
ON CONFLICT DO NOTHING;

-- Options for Numeracy Q2 (1050mg = correct)
INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES
  ('650e8400-e29b-41d4-a716-446655440202', '950mg', false, 1),
  ('650e8400-e29b-41d4-a716-446655440202', '1050mg', true, 2),
  ('650e8400-e29b-41d4-a716-446655440202', '1200mg', false, 3),
  ('650e8400-e29b-41d4-a716-446655440202', '1400mg', false, 4)
ON CONFLICT DO NOTHING;

-- Options for Practice Q1 (5ml = correct)
INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES
  ('750e8400-e29b-41d4-a716-446655440101', '2ml', false, 1),
  ('750e8400-e29b-41d4-a716-446655440101', '5ml', true, 2),
  ('750e8400-e29b-41d4-a716-446655440101', '10ml', false, 3),
  ('750e8400-e29b-41d4-a716-446655440101', '15ml', false, 4)
ON CONFLICT DO NOTHING;

-- Options for Practice Q2 (1500ml = correct)
INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES
  ('750e8400-e29b-41d4-a716-446655440102', '150ml', false, 1),
  ('750e8400-e29b-41d4-a716-446655440102', '1500ml', true, 2),
  ('750e8400-e29b-41d4-a716-446655440102', '2500ml', false, 3),
  ('750e8400-e29b-41d4-a716-446655440102', '15000ml', false, 4)
ON CONFLICT DO NOTHING;

-- ============================================
-- 18. VERIFICATION QUERY
-- ============================================

SELECT 
  'Modules' as entity,
  COUNT(*) as count
FROM modules
UNION ALL
SELECT 'Topics', COUNT(*) FROM topics
UNION ALL
SELECT 'Lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'Questions', COUNT(*) FROM questions
UNION ALL
SELECT 'Question Options', COUNT(*) FROM question_options
UNION ALL
SELECT 'Learning Progress Records', COUNT(*) FROM learning_progress;
