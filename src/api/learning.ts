import { supabase } from '@/lib/supabase';

export interface LessonCompletion {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
}

export async function markLessonComplete(lessonId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('learning_completions')
      .insert({
        user_id: user.id,
        lesson_id: lessonId,
        completed_at: new Date().toISOString(),
      });

    if (error) {
      if (error.code === '23505') {
        return { success: true };
      }
      console.error('Error marking lesson complete:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    return { success: false, error: 'Failed to mark lesson complete' };
  }
}

export async function isLessonCompleted(lessonId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('learning_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking lesson completion:', error);
    return false;
  }
}

export async function getCompletedLessons(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('learning_completions')
      .select('lesson_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching completed lessons:', error);
      return [];
    }

    return data?.map(item => item.lesson_id) || [];
  } catch (error) {
    console.error('Error fetching completed lessons:', error);
    return [];
  }
}

export interface LessonCompletionRecord {
  id: string;
  lesson_id: string;
  user_id: string;
  is_completed: boolean | null;
  completed_at: string | null;
  time_spent_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export async function getLessonCompletionsForUser(
  lessonIds: string[],
): Promise<LessonCompletionRecord[]> {
  if (!lessonIds.length) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('learning_completions')
    .select('*')
    .eq('user_id', user.id)
    .in('lesson_id', lessonIds);

  if (error) {
    console.error('Error fetching lesson completions:', error);
    return [];
  }

  return data ?? [];
}
