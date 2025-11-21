import { supabase } from '@/lib/supabase';

export const saveTopicQuizResult = async (
  userId: string,
  topicCategory: string,
  score: number,
  totalQuestions: number
) => {
  const percentage = (score / totalQuestions) * 100;
  const passed = percentage >= 80;

  try {
    // Use practice_results to store quiz results
    const { error } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: userId,
        total_questions: totalQuestions,
        correct_count: score,
        incorrect_count: totalQuestions - score,
        skipped_count: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { score_percentage: Math.round(percentage), passed };
  } catch (error) {
    console.error('Error saving quiz result:', error);
    throw error;
  }
};

export const getTopicQuizResult = async (
  userId: string,
  topicCategory: string
) => {
  try {
    // Fetch most recent practice session for this user
    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    
    if (data && data.total_questions) {
      const percentage = (data.correct_count / data.total_questions) * 100;
      return { 
        passed: percentage >= 80,
        score_percentage: Math.round(percentage)
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching quiz result:', error);
    throw error;
  }
};

export const hasPassedTopicQuiz = async (
  userId: string,
  topicCategory: string
): Promise<boolean> => {
  try {
    const result = await getTopicQuizResult(userId, topicCategory);
    return result?.passed || false;
  } catch (error) {
    console.error('Error checking quiz pass:', error);
    return false;
  }
};
