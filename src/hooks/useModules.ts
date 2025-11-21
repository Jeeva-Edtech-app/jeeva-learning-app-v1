import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getModules, 
  getModuleById, 
  getTopicsByModule,
  getLessonsByTopic,
  getLessonById,
  getFlashcardsByLesson,
  getFlashcardsByCategory,
  markLessonComplete,
  getCompletedLessons,
  isLessonCompleted,
  getTopicProgress
} from '@/api/modules';

export const useModules = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: getModules,
  });
};

export const useModule = (moduleId: string) => {
  return useQuery({
    queryKey: ['modules', moduleId],
    queryFn: () => getModuleById(moduleId),
    enabled: !!moduleId,
  });
};

export const useTopicsByModule = (moduleId: string) => {
  return useQuery({
    queryKey: ['topics', moduleId],
    queryFn: () => getTopicsByModule(moduleId),
    enabled: !!moduleId,
  });
};

export const useLessonsByTopic = (topicId: string) => {
  return useQuery({
    queryKey: ['lessons', topicId],
    queryFn: () => getLessonsByTopic(topicId),
    enabled: !!topicId,
  });
};

export const useLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ['lessons', lessonId],
    queryFn: () => getLessonById(lessonId),
    enabled: !!lessonId,
  });
};

export const useFlashcardsByLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ['flashcards', lessonId],
    queryFn: () => getFlashcardsByLesson(lessonId),
    enabled: !!lessonId,
  });
};

export const useFlashcardsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['flashcards', 'category', category],
    queryFn: () => getFlashcardsByCategory(category),
    enabled: !!category,
  });
};

export const useMarkLessonComplete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, lessonId }: { userId: string; lessonId: string }) =>
      markLessonComplete(userId, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completedLessons'] });
      queryClient.invalidateQueries({ queryKey: ['topicProgress'] });
    },
  });
};

export const useCompletedLessons = (userId: string) => {
  return useQuery({
    queryKey: ['completedLessons', userId],
    queryFn: () => getCompletedLessons(userId),
    enabled: !!userId,
  });
};

export const useIsLessonCompleted = (userId: string, lessonId: string) => {
  return useQuery({
    queryKey: ['lessonCompleted', userId, lessonId],
    queryFn: () => isLessonCompleted(userId, lessonId),
    enabled: !!userId && !!lessonId,
  });
};

export const useTopicProgress = (userId: string, topicId: string) => {
  return useQuery({
    queryKey: ['topicProgress', userId, topicId],
    queryFn: () => getTopicProgress(userId, topicId),
    enabled: !!userId && !!topicId,
  });
};
