import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getQuestionsByLesson,
  getQuestionsByTopic,
  getQuestionsBySubdivision,
  getQuestionsByCategory,
  getMockExamQuestions,
  startPracticeSession,
  savePracticeResults,
  getPracticeHistory,
  startMockExam,
  submitMockExam,
  getMockExamHistory,
  PracticeAnswer,
} from '@/api/practice';

export const useQuestionsByLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ['questions', 'lesson', lessonId],
    queryFn: () => getQuestionsByLesson(lessonId),
    enabled: !!lessonId,
  });
};

export const useQuestionsByTopic = (topicId: string, limit?: number) => {
  return useQuery({
    queryKey: ['questions', 'topic', topicId, limit],
    queryFn: () => getQuestionsByTopic(topicId, limit),
    enabled: !!topicId,
  });
};

export const usePracticeQuestions = (subdivision: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['questions', 'practice', subdivision],
    queryFn: () => getQuestionsBySubdivision(subdivision, limit),
    enabled: !!subdivision,
  });
};

export const useLearningQuestions = (category: string, subdivision?: string) => {
  return useQuery({
    queryKey: ['questions', 'learning', category, subdivision],
    queryFn: () => getQuestionsByCategory(category, subdivision),
    enabled: !!category,
  });
};

export const useMockExamQuestions = (examPart: 'part_a' | 'part_b') => {
  return useQuery({
    queryKey: ['questions', 'mock_exam', examPart],
    queryFn: () => getMockExamQuestions(examPart),
  });
};

type StartPracticeSessionArgs = {
  userId: string;
  context?: {
    subdivision?: string;
    topicId?: string | number;
  };
};

export const useStartPracticeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, context }: StartPracticeSessionArgs) =>
      startPracticeSession(userId, context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practiceHistory'] });
    },
  });
};

export const useSavePracticeResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      answers,
    }: {
      sessionId: string | number;
      answers: PracticeAnswer[];
    }) =>
      savePracticeResults(sessionId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practiceHistory'] });
    },
  });
};

export const usePracticeHistory = (userId: string, limit?: number) => {
  return useQuery({
    queryKey: ['practiceHistory', userId, limit],
    queryFn: () => getPracticeHistory(userId, limit),
    enabled: !!userId,
  });
};

export const useStartMockExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      examPart,
      totalQuestions,
    }: {
      userId: string;
      examPart: 'part_a' | 'part_b';
      totalQuestions: number;
    }) => startMockExam(userId, { examPart, totalQuestions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockExamHistory'] });
    },
  });
};

export const useSubmitMockExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      examId,
      legacyExamId,
      results,
    }: {
      examId: string;
      legacyExamId?: number | null;
      results: {
        examPart: 'part_a' | 'part_b';
        score: number;
        totalQuestions: number;
        correctAnswers: number;
        timeTakenSeconds: number;
        answers: PracticeAnswer[];
      };
    }) => submitMockExam(examId, { ...results, legacyExamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockExamHistory'] });
    },
  });
};

export const useMockExamHistory = (userId: string) => {
  return useQuery({
    queryKey: ['mockExamHistory', userId],
    queryFn: () => getMockExamHistory(userId),
    enabled: !!userId,
  });
};
