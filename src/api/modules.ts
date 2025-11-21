import { supabase } from '@/lib/supabase';
import { FIXED_MODULE_IDS } from './constants';

export interface Module {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  module_id: string;
  title: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  modules?: {
    id: string;
    title: string;
    thumbnail_url: string;
  };
}

export interface Lesson {
  id: string;
  topic_id: string;
  title: string;
  content: string;
  category?: string;
  video_url?: string;
  audio_url?: string;
  notes?: string;
  duration?: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  topics?: {
    id: string;
    title: string;
    module_id: string;
    modules?: {
      id: string;
      title: string;
    };
  };
}

export interface Flashcard {
  id: string;
  lesson_id?: string;
  category?: string;
  front: string;
  back: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const getModules = async (): Promise<Module[]> => {
  return [
    {
      id: FIXED_MODULE_IDS.PRACTICE,
      title: 'Practice Module',
      description: 'Practice questions by topic to build proficiency',
      thumbnail_url: '',
      is_active: true,
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: FIXED_MODULE_IDS.LEARNING,
      title: 'Learning Module',
      description: 'Structured lessons with video, audio, text, and 80% mastery quizzes',
      thumbnail_url: '',
      is_active: true,
      display_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: FIXED_MODULE_IDS.MOCK_EXAM,
      title: 'Mock Exams',
      description: 'Full-length CBT exam simulator with real timing',
      thumbnail_url: '',
      is_active: true,
      display_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
};

export const getModuleById = async (id: string): Promise<Module> => {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
};

export const getTopicsByModule = async (moduleId: string): Promise<Topic[]> => {
  const { data, error } = await supabase
    .from('topics')
    .select(`
      *,
      modules (
        id,
        title,
        thumbnail_url
      )
    `)
    .eq('module_id', moduleId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getLessonsByTopic = async (topicId: string): Promise<Lesson[]> => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      topics (
        id,
        title,
        module_id
      )
    `)
    .eq('topic_id', topicId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getTopicById = async (topicId: string) => {
  const { data, error } = await supabase
    .from('topics')
    .select(
      `
      *,
      modules (
        id,
        title,
        thumbnail_url
      )
    `,
    )
    .eq('id', topicId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getLessonById = async (lessonId: string): Promise<Lesson> => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      topics (
        id,
        title,
        module_id,
        modules (
          id,
          title
        )
      )
    `)
    .eq('id', lessonId)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
};

export const getFlashcardsByLesson = async (lessonId: string): Promise<Flashcard[]> => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getFlashcardsByCategory = async (category: string): Promise<Flashcard[]> => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getFlashcardsByTopic = async (topicCategory: string): Promise<Flashcard[]> => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('category', topicCategory)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const markLessonComplete = async (userId: string, lessonId: string) => {
  const { data, error } = await supabase
    .from('learning_completions')
    .insert({
      user_id: userId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getCompletedLessons = async (userId: string) => {
  const { data, error } = await supabase
    .from('learning_completions')
    .select(`
      *,
      lessons (
        id,
        title,
        topic_id,
        topics (
          id,
          title,
          module_id
        )
      )
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const isLessonCompleted = async (userId: string, lessonId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('learning_completions')
    .select('id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};

export const getTopicProgress = async (userId: string, topicId: string) => {
  const { data: totalLessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id')
    .eq('topic_id', topicId)
    .eq('is_active', true);

  if (lessonsError) throw lessonsError;

  const { data: completedLessons, error: completedError } = await supabase
    .from('learning_completions')
    .select(`
      lesson_id,
      lessons!inner (
        topic_id
      )
    `)
    .eq('user_id', userId)
    .eq('lessons.topic_id', topicId);

  if (completedError) throw completedError;

  const total = totalLessons?.length || 0;
  const completed = completedLessons?.length || 0;

  return {
    total,
    completed,
    percentage: total > 0 ? (completed / total) * 100 : 0,
  };
};
