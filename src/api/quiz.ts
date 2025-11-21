import { supabase } from '@/lib/supabase';

export const saveTopicQuizResult = async (
  userId: string,
  topicCategory: string,
  score: number,
  totalQuestions: number
) => {
  const percentage = (score / totalQuestions) * 100;
  const passed = percentage >= 80;

  const { data, error } = await supabase
    .from('lesson_quiz_results')
    .insert({
      user_id: userId,
      lesson_id: topicCategory, // Reuse lesson_id column for topic category
      score_percentage: Math.round(percentage),
      passed: passed,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTopicQuizResult = async (
  userId: string,
  topicCategory: string
) => {
  const { data, error } = await supabase
    .from('lesson_quiz_results')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', topicCategory)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const hasPassedTopicQuiz = async (
  userId: string,
  topicCategory: string
): Promise<boolean> => {
  const result = await getTopicQuizResult(userId, topicCategory);
  return result?.passed || false;
};
