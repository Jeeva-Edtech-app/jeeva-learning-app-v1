import { supabase } from '@/lib/supabase';

export interface PerformanceStats {
  examReadinessScore: number;
  practiceAccuracy: number;
  modulesCompleted: number;
  totalModules: number;
  studyStreak: number;
  totalPracticeQuestions: number;
  correctAnswers: number;
  totalLessonsCompleted: number;
  totalTimeSpentMinutes: number;
  mockExamsTaken: number;
  averageMockScore: number;
  averageScore: number;
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  attempts: number;
}

export interface RecentActivity {
  id: string;
  date: string;
  type: 'practice' | 'mock_exam' | 'lesson';
  title: string;
  score?: number;
  totalQuestions?: number;
}

export interface MockExamStats {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  lastAttemptDate: string | null;
}

interface PracticeAnswer {
  questionId: string | number;
  selectedOptionId: string | number | null;
  isCorrect: boolean;
  timeTaken: number;
}

const isPracticeAnswerArray = (value: unknown): value is PracticeAnswer[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item &&
      (typeof item.questionId === 'string' || typeof item.questionId === 'number') &&
      typeof item.isCorrect === 'boolean',
  );

const extractAnswerLog = (result: any): PracticeAnswer[] => {
  if (!result) return [];
  if (isPracticeAnswerArray(result.answer_log)) {
    return result.answer_log;
  }

  const hasRowFields =
    result.question_id !== undefined ||
    result.selected_option_id !== undefined ||
    result.is_correct !== undefined ||
    result.time_taken_seconds !== undefined;

  if (hasRowFields) {
    return [
      {
        questionId:
          result.question_id !== undefined && result.question_id !== null
            ? result.question_id
            : '',
        selectedOptionId:
          result.selected_option_id !== undefined ? result.selected_option_id : null,
        isCorrect: Boolean(result.is_correct),
        timeTaken:
          typeof result.time_taken_seconds === 'number' && Number.isFinite(result.time_taken_seconds)
            ? result.time_taken_seconds
            : 0,
      },
    ];
  }

  return [];
};

const extractSessionAnswers = (session: any): PracticeAnswer[] => {
  if (!session) return [];
  const results = Array.isArray(session.practice_results) ? session.practice_results : [];
  return results.flatMap((result: any) => extractAnswerLog(result));
};

export async function getPerformanceStats(userId: string): Promise<PerformanceStats> {
  try {
    const [
      practiceData,
      completionStats,
      moduleCount,
      streakData,
      mockSessionsData,
    ] = await Promise.all([
      // Practice sessions with results
      supabase
        .from('practice_sessions')
        .select(`
          id,
          total_questions,
          correct_count,
          incorrect_count,
          created_at,
          practice_results (*)
        `)
        .eq('user_id', userId),
      
      // Learning completions count
      supabase
        .from('learning_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      
      // Total active lessons count
      supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      
      // Study streak calculation
      supabase
        .from('practice_sessions')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30),
      
      // Mock exam sessions summary
      supabase
        .from('mock_sessions')
        .select('id, score_percentage, correct_answers, total_questions, time_taken_minutes, created_at')
        .eq('user_id', userId),
    ]);

    // Calculate practice statistics from answer logs
    let totalQuestions = 0;
    let correctAnswers = 0;
    let totalTimeSpentSeconds = 0;

    practiceData.data?.forEach((session: any) => {
      const answers = extractSessionAnswers(session);
      if (answers.length > 0) {
        totalQuestions += answers.length;
        answers.forEach((answer) => {
          if (answer.isCorrect) {
            correctAnswers += 1;
          }
          totalTimeSpentSeconds += typeof answer.timeTaken === 'number' ? answer.timeTaken : 0;
        });
      } else {
        const sessionTotal = Number(session.total_questions ?? 0);
        const sessionCorrect = Number(session.correct_count ?? 0);
        totalQuestions += sessionTotal;
        correctAnswers += sessionCorrect;
      }
    });

    const practiceAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Calculate mock exam statistics and time
    let totalMockQuestions = 0;
    let totalMockCorrect = 0;
    const mockExamsTaken = mockSessionsData.data?.length || 0;

    mockSessionsData.data?.forEach((session: any) => {
      totalMockQuestions += session.total_questions || 0;
      totalMockCorrect += session.correct_answers || 0;
      totalTimeSpentSeconds += (session.time_taken_minutes || 0) * 60;
    });

    const averageMockScore = mockSessionsData.data && mockSessionsData.data.length > 0
      ? Math.round(
          (mockSessionsData.data
            .map((session: any) => session.score_percentage || 0)
            .reduce((acc: number, score: number) => acc + score, 0)) /
            mockSessionsData.data.length,
        )
      : 0;

    // Calculate average score across both practice and mocks
    const combinedQuestions = totalQuestions + totalMockQuestions;
    const combinedCorrect = correctAnswers + totalMockCorrect;
    const averageScore = combinedQuestions > 0
      ? Math.round((combinedCorrect / combinedQuestions) * 100)
      : 0;

    // Calculate modules completed
    const modulesCompleted = completionStats.count || 0;
    const totalModules = moduleCount.count || 10;

    // Calculate study streak
    const studyStreak = calculateStreak(streakData.data || []);

    // Calculate exam readiness (weighted average)
    const completionRate = totalModules > 0 ? (modulesCompleted / totalModules) * 100 : 0;
    const examReadinessScore = Math.round(
      (practiceAccuracy * 0.4) + (completionRate * 0.3) + (averageMockScore * 0.3)
    );

    // Convert seconds to minutes
    const totalTimeSpentMinutes = Math.round(totalTimeSpentSeconds / 60);

    return {
      examReadinessScore,
      practiceAccuracy,
      modulesCompleted,
      totalModules,
      studyStreak,
      totalPracticeQuestions: totalQuestions,
      correctAnswers,
      totalLessonsCompleted: modulesCompleted,
      totalTimeSpentMinutes,
      mockExamsTaken,
      averageMockScore,
      averageScore,
    };
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    return {
      examReadinessScore: 0,
      practiceAccuracy: 0,
      modulesCompleted: 0,
      totalModules: 10,
      studyStreak: 0,
      totalPracticeQuestions: 0,
      correctAnswers: 0,
      totalLessonsCompleted: 0,
      totalTimeSpentMinutes: 0,
      mockExamsTaken: 0,
      averageMockScore: 0,
      averageScore: 0,
    };
  }
}

export async function getWeakTopics(userId: string, threshold: number = 70): Promise<TopicPerformance[]> {
  try {
    // Get all practice sessions with questions and topics
  const { data: sessions } = await supabase
      .from('practice_sessions')
      .select(`
        id,
        practice_results (*)
      `)
      .eq('user_id', userId);

    if (!sessions) return [];

    // Extract all question IDs from practice sessions
    const questionIds: Set<string> = new Set();
    sessions.forEach((session: any) => {
      extractSessionAnswers(session).forEach((answer) => {
        questionIds.add(String(answer.questionId));
      });
    });

    if (questionIds.size === 0) return [];

    // Get questions with their topics
    const { data: questions } = await supabase
      .from('questions')
      .select(`
        id,
        lessons (
          id,
          title,
          topics (
            id,
            title
          )
        )
      `)
      .in('id', Array.from(questionIds));

    // Calculate topic-wise performance
    const topicStats = new Map<string, {
      topicId: string;
      topicName: string;
      correct: number;
      total: number;
      attempts: number;
    }>();

    sessions.forEach((session: any) => {
      extractSessionAnswers(session).forEach((answer) => {
        const question = questions?.find((q: any) => String(q.id) === String(answer.questionId));
        const lesson = Array.isArray(question?.lessons) ? question?.lessons[0] : question?.lessons;
        const topic = Array.isArray(lesson?.topics) ? lesson?.topics[0] : lesson?.topics;
        if (topic) {
          const topicId = topic.id;
          const topicName = topic.title;

          if (!topicStats.has(topicId)) {
            topicStats.set(topicId, {
              topicId,
              topicName,
              correct: 0,
              total: 0,
              attempts: 0,
            });
          }

          const stats = topicStats.get(topicId)!;
          stats.total += 1;
          if (answer.isCorrect) stats.correct += 1;
        }
      });
    });

    // Filter weak topics (below threshold)
    const weakTopics: TopicPerformance[] = [];
    topicStats.forEach((stats) => {
      const accuracy = (stats.correct / stats.total) * 100;
      if (accuracy < threshold) {
        weakTopics.push({
          topicId: stats.topicId,
          topicName: stats.topicName,
          accuracy: Math.round(accuracy),
          totalQuestions: stats.total,
          correctAnswers: stats.correct,
          attempts: stats.total,
        });
      }
    });

    return weakTopics.sort((a, b) => a.accuracy - b.accuracy);
  } catch (error) {
    console.error('Error fetching weak topics:', error);
    return [];
  }
}

export async function getStrongTopics(userId: string, threshold: number = 85): Promise<TopicPerformance[]> {
  try {
    // Get all practice sessions with questions and topics
    const { data: sessions } = await supabase
      .from('practice_sessions')
      .select(`
        id,
        practice_results (*)
      `)
      .eq('user_id', userId);

    if (!sessions) return [];

    // Extract all question IDs
    const questionIds: Set<string> = new Set();
    sessions.forEach((session: any) => {
      extractSessionAnswers(session).forEach((answer) => {
        questionIds.add(String(answer.questionId));
      });
    });

    if (questionIds.size === 0) return [];

    // Get questions with their topics
    const { data: questions } = await supabase
      .from('questions')
      .select(`
        id,
        lessons (
          id,
          title,
          topics (
            id,
            title
          )
        )
      `)
      .in('id', Array.from(questionIds));

    // Calculate topic-wise performance
    const topicStats = new Map<string, {
      topicId: string;
      topicName: string;
      correct: number;
      total: number;
    }>();

    sessions.forEach((session: any) => {
      extractSessionAnswers(session).forEach((answer) => {
        const question = questions?.find((q: any) => String(q.id) === String(answer.questionId));
        const lesson = Array.isArray(question?.lessons) ? question?.lessons[0] : question?.lessons;
        const topic = Array.isArray(lesson?.topics) ? lesson?.topics[0] : lesson?.topics;
        if (topic) {
          const topicId = topic.id;
          const topicName = topic.title;

          if (!topicStats.has(topicId)) {
            topicStats.set(topicId, {
              topicId,
              topicName,
              correct: 0,
              total: 0,
            });
          }

          const stats = topicStats.get(topicId)!;
          stats.total += 1;
          if (answer.isCorrect) stats.correct += 1;
        }
      });
    });

    // Filter strong topics (above threshold)
    const strongTopics: TopicPerformance[] = [];
    topicStats.forEach((stats) => {
      const accuracy = (stats.correct / stats.total) * 100;
      if (accuracy >= threshold) {
        strongTopics.push({
          topicId: stats.topicId,
          topicName: stats.topicName,
          accuracy: Math.round(accuracy),
          totalQuestions: stats.total,
          correctAnswers: stats.correct,
          attempts: stats.total,
        });
      }
    });

    return strongTopics.sort((a, b) => b.accuracy - a.accuracy);
  } catch (error) {
    console.error('Error fetching strong topics:', error);
    return [];
  }
}

export async function getRecentActivity(userId: string, days: number = 7): Promise<RecentActivity[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [practiceSessions, mockExams, completions] = await Promise.all([
      // Practice sessions
      supabase
        .from('practice_sessions')
        .select(`
          id,
          created_at,
          total_questions,
          correct_count,
          practice_results (*)
        `)
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false }),
      
      // Mock exams
      supabase
        .from('mock_sessions')
        .select('id, created_at, total_questions, correct_answers, score_percentage')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false }),
      
      // Learning completions
      supabase
        .from('learning_completions')
        .select(`
          id,
          completed_at,
          lessons (
            title
          )
        `)
        .eq('user_id', userId)
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: false }),
    ]);

    const activities: RecentActivity[] = [];

    // Add practice sessions
    practiceSessions.data?.forEach((session: any) => {
      const answers = extractSessionAnswers(session);
      let totalQuestions = answers.length;
      let correctAnswers = answers.filter((answer) => answer.isCorrect).length;

      if (totalQuestions === 0) {
        totalQuestions = Number(session.total_questions ?? 0);
        correctAnswers = Number(session.correct_count ?? 0);
      }

      if (totalQuestions > 0) {
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        activities.push({
          id: session.id,
          date: session.created_at,
          type: 'practice',
          title: 'Practice Session',
          score,
          totalQuestions,
        });
      }
    });

    // Add mock exams
    mockExams.data?.forEach((exam: any) => {
      const total = Number(exam.total_questions ?? 0);
      const correct = Number(exam.correct_answers ?? 0);
      const score = total > 0 ? Math.round((correct / total) * 100) : exam.score_percentage ?? 0;

      if (total > 0 || score > 0) {
        activities.push({
          id: exam.id,
          date: exam.created_at,
          type: 'mock_exam',
          title: 'Mock Exam',
          score,
          totalQuestions: total,
        });
      }
    });

    // Add lesson completions
    completions.data?.forEach((completion: any) => {
      activities.push({
        id: completion.id,
        date: completion.completed_at,
        type: 'lesson',
        title: completion.lessons?.title || 'Lesson Completed',
      });
    });

    // Sort by date (most recent first)
    return activities.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

export async function getMockExamStats(userId: string): Promise<MockExamStats> {
  try {
    const { data: sessions } = await supabase
      .from('mock_sessions')
      .select('id, created_at, score_percentage')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!sessions || sessions.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        lastAttemptDate: null,
      };
    }

    const validScores = sessions
      .map((session: any) => session.score_percentage ?? 0)
      .filter((score: number) => typeof score === 'number');

    const averageScore = validScores.length > 0
      ? Math.round(validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length)
      : 0;

    const bestScore = validScores.length > 0 ? Math.max(...validScores) : 0;

    return {
      totalAttempts: sessions.length,
      averageScore,
      bestScore,
      lastAttemptDate: sessions[0]?.created_at || null,
    };
  } catch (error) {
    console.error('Error fetching mock exam stats:', error);
    return {
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      lastAttemptDate: null,
    };
  }
}

function calculateStreak(sessions: { created_at: string }[]): number {
  if (sessions.length === 0) return 0;

  const dates = sessions.map(s => new Date(s.created_at).toDateString());
  const uniqueDates = [...new Set(dates)].sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }

  let currentDate = new Date();
  for (let i = 0; i < uniqueDates.length; i++) {
    const sessionDate = new Date(uniqueDates[i]);
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (sessionDate.toDateString() === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
