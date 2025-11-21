-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone_number VARCHAR(20),
  country VARCHAR(100),
  qualification_level VARCHAR(100),
  years_experience INTEGER,
  target_exam_date DATE,
  profile_image_url VARCHAR(500),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create modules table (Practice, Learning, Mock Exam)
CREATE TABLE IF NOT EXISTS public.modules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  module_type VARCHAR(50), -- 'practice', 'learning', 'mock_exam'
  total_questions INTEGER,
  estimated_time_minutes INTEGER,
  difficulty_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create topics table
CREATE TABLE IF NOT EXISTS public.topics (
  id SERIAL PRIMARY KEY,
  module_id INTEGER NOT NULL REFERENCES modules(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER,
  icon_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES topics(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  video_url VARCHAR(500),
  image_url VARCHAR(500),
  duration_minutes INTEGER,
  order_index INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id),
  question_text TEXT NOT NULL,
  explanation TEXT,
  image_url VARCHAR(500),
  question_type VARCHAR(50), -- 'multiple_choice', 'true_false', 'short_answer'
  difficulty VARCHAR(50), -- 'easy', 'medium', 'hard'
  points INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  module_id INTEGER REFERENCES modules(id),
  exam_part VARCHAR(10), -- 'part_a', 'part_b'
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create question_options table
CREATE TABLE IF NOT EXISTS public.question_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning_completions table
CREATE TABLE IF NOT EXISTS public.learning_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create practice_sessions table
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES modules(id),
  topic_id INTEGER REFERENCES topics(id),
  total_questions INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  score_percentage INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practice_results table
CREATE TABLE IF NOT EXISTS public.practice_results (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  selected_option_id INTEGER REFERENCES question_options(id),
  is_correct BOOLEAN,
  time_taken_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mock_exams table
CREATE TABLE IF NOT EXISTS public.mock_exams (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_part VARCHAR(10), -- 'part_a', 'part_b'
  total_questions INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  score_percentage INTEGER,
  passing_score INTEGER DEFAULT 70,
  passed BOOLEAN,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mock_exam_results table
CREATE TABLE IF NOT EXISTS public.mock_exam_results (
  id SERIAL PRIMARY KEY,
  mock_exam_id INTEGER NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  selected_option_id INTEGER REFERENCES question_options(id),
  is_correct BOOLEAN,
  time_taken_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id),
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  is_marked BOOLEAN DEFAULT false,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id),
  title VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role VARCHAR(50), -- 'user', 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name VARCHAR(100), -- 'free', 'basic', 'premium'
  status VARCHAR(50), -- 'active', 'cancelled', 'expired'
  price DECIMAL(10, 2),
  currency VARCHAR(10),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_usage_stats table
CREATE TABLE IF NOT EXISTS public.ai_usage_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create chat_rate_limits table
CREATE TABLE IF NOT EXISTS public.chat_rate_limits (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create hero_sections table
CREATE TABLE IF NOT EXISTS public.hero_sections (
  id SERIAL PRIMARY KEY,
  image_url VARCHAR(500),
  title VARCHAR(255),
  subtitle TEXT,
  cta_text VARCHAR(100),
  cta_link VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_stats table
CREATE TABLE IF NOT EXISTS public.daily_stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_active_users INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_practice_questions INTEGER DEFAULT 0,
  total_learning_completions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_modules_type ON modules(module_type);
CREATE INDEX IF NOT EXISTS idx_topics_module ON topics(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_topic ON lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_lesson ON questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_module ON questions(module_id);
CREATE INDEX IF NOT EXISTS idx_question_options_question ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_learning_completions_user ON learning_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_completions_lesson ON learning_completions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_module ON practice_sessions(module_id);
CREATE INDEX IF NOT EXISTS idx_practice_results_session ON practice_results(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_results_question ON practice_results(question_id);
CREATE INDEX IF NOT EXISTS idx_mock_exams_user ON mock_exams(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_exam_results_exam ON mock_exam_results(mock_exam_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_user_date ON ai_usage_stats(user_id, date);
CREATE INDEX IF NOT EXISTS idx_chat_rate_limits_user_date ON chat_rate_limits(user_id, date);
