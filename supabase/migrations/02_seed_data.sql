-- Insert modules
INSERT INTO public.modules (name, description, icon_url, module_type, total_questions, estimated_time_minutes, difficulty_level, is_active)
VALUES 
  ('Practice', 'Practice mode with questions from all topics', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Jeeva%20Learning%20App/practice.png', 'practice', 500, 120, 'intermediate', true),
  ('Learning', 'Comprehensive learning materials and lessons', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Jeeva%20Learning%20App/learning.png', 'learning', 0, 180, 'beginner', true),
  ('Mock Exam', 'Full practice exams (Part A & Part B)', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Jeeva%20Learning%20App/mock.png', 'mock_exam', 350, 240, 'advanced', true)
ON CONFLICT DO NOTHING;

-- Insert topics for Practice module
INSERT INTO public.topics (module_id, name, description, order_index, icon_url, is_active)
SELECT id, 'General Nursing Knowledge', 'Core nursing concepts and patient care', 1, NULL, true FROM modules WHERE module_type = 'practice'
ON CONFLICT DO NOTHING;

INSERT INTO public.topics (module_id, name, description, order_index, icon_url, is_active)
SELECT id, 'Pharmacology', 'Drug classifications, administration, and effects', 2, NULL, true FROM modules WHERE module_type = 'practice'
ON CONFLICT DO NOTHING;

INSERT INTO public.topics (module_id, name, description, order_index, icon_url, is_active)
SELECT id, 'Infection Control', 'Prevention and management of infections', 3, NULL, true FROM modules WHERE module_type = 'practice'
ON CONFLICT DO NOTHING;

INSERT INTO public.topics (module_id, name, description, order_index, icon_url, is_active)
SELECT id, 'Communication Skills', 'Effective patient and team communication', 4, NULL, true FROM modules WHERE module_type = 'practice'
ON CONFLICT DO NOTHING;

INSERT INTO public.topics (module_id, name, description, order_index, icon_url, is_active)
SELECT id, 'Professional Practice', 'Ethics, accountability, and professional standards', 5, NULL, true FROM modules WHERE module_type = 'practice'
ON CONFLICT DO NOTHING;

-- Insert topics for Learning module
INSERT INTO public.topics (module_id, name, description, order_index, icon_url, is_active)
SELECT id, 'Anatomy & Physiology', 'Human body systems and functions', 1, NULL, true FROM modules WHERE module_type = 'learning'
ON CONFLICT DO NOTHING;

INSERT INTO public.topics (module_id, name, description, order_index, icon_url, is_active)
SELECT id, 'Pathophysiology', 'Disease processes and conditions', 2, NULL, true FROM modules WHERE module_type = 'learning'
ON CONFLICT DO NOTHING;

INSERT INTO public.topics (module_id, name, description, order_index, icon_url, is_active)
SELECT id, 'Therapeutic Interventions', 'Treatments and nursing interventions', 3, NULL, true FROM modules WHERE module_type = 'learning'
ON CONFLICT DO NOTHING;

-- Insert lessons
INSERT INTO public.lessons (topic_id, title, description, content, video_url, duration_minutes, order_index, is_active)
SELECT id, 'Introduction to Patient Care', 'Fundamentals of providing quality patient care', 'Patient care involves assessing individual needs, planning care, implementing interventions, and evaluating outcomes...', NULL, 15, 1, true 
FROM topics WHERE name = 'General Nursing Knowledge' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.lessons (topic_id, title, description, content, video_url, duration_minutes, order_index, is_active)
SELECT id, 'Hand Hygiene Best Practices', 'Learn proper hand hygiene techniques', 'Hand hygiene is the most important infection control measure...', NULL, 10, 2, true 
FROM topics WHERE name = 'Infection Control' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.lessons (topic_id, title, description, content, video_url, duration_minutes, order_index, is_active)
SELECT id, 'Drug Classification', 'Understanding different types of drugs', 'Drugs are classified into various categories...', NULL, 20, 1, true 
FROM topics WHERE name = 'Pharmacology' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.lessons (topic_id, title, description, content, video_url, duration_minutes, order_index, is_active)
SELECT id, 'Cardiovascular System', 'Heart, blood vessels, and circulation', 'The cardiovascular system consists of the heart and blood vessels...', NULL, 25, 1, true 
FROM topics WHERE name = 'Anatomy & Physiology' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert questions for Practice module
INSERT INTO public.questions (lesson_id, question_text, explanation, question_type, difficulty, points, is_active, module_id, exam_part)
SELECT id, 'What is the first step in patient assessment?', 'The ABCs (Airway, Breathing, Circulation) form the basis of emergency assessment', 'multiple_choice', 'easy', 1, true, (SELECT id FROM modules WHERE module_type = 'practice' LIMIT 1), 'part_a'
FROM lessons WHERE title = 'Introduction to Patient Care' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.questions (lesson_id, question_text, explanation, question_type, difficulty, points, is_active, module_id, exam_part)
SELECT id, 'When should hand hygiene be performed?', 'Hand hygiene should be performed before and after patient contact', 'multiple_choice', 'easy', 1, true, (SELECT id FROM modules WHERE module_type = 'practice' LIMIT 1), 'part_a'
FROM lessons WHERE title = 'Hand Hygiene Best Practices' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.questions (lesson_id, question_text, explanation, question_type, difficulty, points, is_active, module_id, exam_part)
SELECT id, 'NSAIDs are used to manage pain and inflammation.', 'NSAIDs (Non-Steroidal Anti-Inflammatory Drugs) work by inhibiting prostaglandin synthesis', 'true_false', 'medium', 1, true, (SELECT id FROM modules WHERE module_type = 'practice' LIMIT 1), 'part_b'
FROM lessons WHERE title = 'Drug Classification' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert question options
INSERT INTO public.question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Airway, Breathing, Circulation', true, 1 FROM questions WHERE question_text = 'What is the first step in patient assessment?' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Assessing vital signs first', false, 2 FROM questions WHERE question_text = 'What is the first step in patient assessment?' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Taking patient history', false, 3 FROM questions WHERE question_text = 'What is the first step in patient assessment?' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Before and after patient contact', true, 1 FROM questions WHERE question_text = 'When should hand hygiene be performed?' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Only before procedures', false, 2 FROM questions WHERE question_text = 'When should hand hygiene be performed?' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Only when visibly soiled', false, 3 FROM questions WHERE question_text = 'When should hand hygiene be performed?' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert hero section
INSERT INTO public.hero_sections (image_url, title, subtitle, cta_text, cta_link, is_active, display_order)
VALUES 
  ('https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Jeeva%20Learning%20App/homepage%20hero.png', 
   'Upgrade your career', 'want to make your career to next level.', 'Explore now', '/course', true, 0)
ON CONFLICT DO NOTHING;

-- Insert daily stats
INSERT INTO public.daily_stats (date, total_active_users, total_sessions, total_practice_questions, total_learning_completions)
VALUES 
  (CURRENT_DATE, 0, 0, 0, 0),
  (CURRENT_DATE - INTERVAL '1 day', 5, 8, 45, 12),
  (CURRENT_DATE - INTERVAL '2 days', 3, 5, 28, 8),
  (CURRENT_DATE - INTERVAL '3 days', 7, 12, 78, 20)
ON CONFLICT (date) DO NOTHING;
