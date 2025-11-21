/**
 * Profile API services for Jeeva Learning Mobile App
 * Handles user profiles, subscriptions, and performance statistics
 * Based on DATABASE_SCHEMA.md
 */

import { supabase } from '@/lib/supabase';
import type {
  UserProfile,
  UpdateProfileData,
  SubscriptionStatus,
  PerformanceStats,
  SubscriptionPlan,
  WeakTopic,
  StudyStreak,
} from '@/types/profile';

/**
 * Get user profile with email from users table
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) throw profileError;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, auth_provider')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    if (!profile || !user) return null;

    return {
      ...profile,
      email: user.email,
      auth_provider: user.auth_provider as 'email' | 'google' | 'apple',
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

/**
 * Update user profile (creates if doesn't exist)
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileData
): Promise<UserProfile | null> {
  try {
    // Extract auth_provider if present (it belongs to users table)
    const { auth_provider, ...profileData } = data;

    // Check if profile exists first
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    // Use upsert to create or update profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString(),
        created_at: existingProfile ? undefined : new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      throw profileError;
    }

    // Update users table if auth_provider is provided
    if (auth_provider) {
      const { error: userError } = await supabase
        .from('users')
        .update({ auth_provider })
        .eq('id', userId);

      if (userError) {
        console.error('User update error:', userError);
        throw userError;
      }
    }

    return getProfile(userId);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Get user subscription status with plan details
 */
export async function getSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus> {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !subscription) {
      return {
        status: 'none',
        plan_name: null,
        start_date: null,
        end_date: null,
        days_remaining: 0,
        is_trial: false,
        has_access: false,
        features: [],
      };
    }

    const plan = subscription.plan as SubscriptionPlan;
    const endDate = new Date(subscription.end_date);
    const now = new Date();
    const daysRemaining = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const isTrial = subscription.status === 'trial';
    const isActive = subscription.status === 'active' && daysRemaining > 0;
    const hasAccess = isTrial || isActive;

    return {
      status: subscription.status,
      plan_name: plan?.name || null,
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      days_remaining: Math.max(0, daysRemaining),
      is_trial: isTrial,
      has_access: hasAccess,
      features: plan?.features || [],
      subscription,
      plan,
    };
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    throw error;
  }
}

/**
 * Calculate study streak from learning completions
 */
async function getStudyStreak(userId: string): Promise<StudyStreak> {
  try {
    const { data: completions, error } = await supabase
      .from('learning_completions')
      .select('completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    if (!completions || completions.length === 0) {
      return {
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
      };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = completions.map(c => {
      const date = new Date(c.completed_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b - a);

    for (let i = 0; i < uniqueDates.length; i++) {
      const daysDiff = Math.floor(
        (today.getTime() - uniqueDates[i]) / (1000 * 60 * 60 * 24)
      );

      if (i === 0 && daysDiff <= 1) {
        currentStreak = 1;
      } else if (i > 0) {
        const prevDaysDiff = Math.floor(
          (uniqueDates[i - 1] - uniqueDates[i]) / (1000 * 60 * 60 * 24)
        );
        if (prevDaysDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const daysDiff = Math.floor(
        (uniqueDates[i] - uniqueDates[i + 1]) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_activity_date: completions[0]?.completed_at || null,
    };
  } catch (error) {
    console.error('Error calculating study streak:', error);
    return {
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
    };
  }
}

/**
 * Get weak topics from practice results
 */
async function getWeakTopics(userId: string): Promise<WeakTopic[]> {
  try {
    const { data: sessionsData, error } = await supabase
      .from('practice_sessions')
      .select(`
        id,
        practice_results(answer_log)
      `)
      .eq('user_id', userId)
      .limit(20);

    if (error) throw error;

    void sessionsData;

    return [];
  } catch (error) {
    console.error('Error fetching weak topics:', error);
    return [];
  }
}

/**
 * Get comprehensive performance statistics
 */
export async function getPerformanceStats(
  userId: string
): Promise<PerformanceStats> {
  try {
    const { count: lessonsCompleted, error: lessonsError } = await supabase
      .from('learning_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (lessonsError) throw lessonsError;

    const { data: practiceSessions, error: practiceError } = await supabase
      .from('practice_sessions')
      .select(`
        id,
        created_at,
        practice_results(answer_log)
      `)
      .eq('user_id', userId);

    if (practiceError) throw practiceError;

    let totalQuestions = 0;
    let correctAnswers = 0;

    practiceSessions?.forEach((session: any) => {
      const results = session.practice_results?.[0];
      if (results?.answer_log) {
        const answers = Array.isArray(results.answer_log)
          ? results.answer_log
          : [];
        totalQuestions += answers.length;
        correctAnswers += answers.filter((a: any) => a.isCorrect).length;
      }
    });

    const practiceAccuracy =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const averagePracticeScore = Math.round(practiceAccuracy);

    const { data: mockExams, error: mockError } = await supabase
      .from('mock_exams')
      .select(`
        id,
        created_at,
        mock_exam_results(results_data)
      `)
      .eq('user_id', userId);

    if (mockError) throw mockError;

    let totalMockScore = 0;
    let bestMockScore = 0;
    const mockScores: number[] = [];

    mockExams?.forEach((exam: any) => {
      const result = exam.mock_exam_results?.[0];
      if (result?.results_data?.score) {
        const score = result.results_data.score;
        mockScores.push(score);
        totalMockScore += score;
        bestMockScore = Math.max(bestMockScore, score);
      }
    });

    const averageMockScore =
      mockScores.length > 0
        ? Math.round(totalMockScore / mockScores.length)
        : 0;

    const streak = await getStudyStreak(userId);
    const weakTopics = await getWeakTopics(userId);

    const examReadiness = calculateExamReadiness({
      lessonsCompleted: lessonsCompleted || 0,
      practiceAccuracy,
      averageMockScore,
      studyStreak: streak.current_streak,
      totalMockExams: mockExams?.length || 0,
    });

    const modulesCompleted = Math.floor((lessonsCompleted || 0) / 10);

    return {
      exam_readiness: examReadiness,
      practice_accuracy: Math.round(practiceAccuracy),
      modules_completed: modulesCompleted,
      study_streak: streak.current_streak,
      total_lessons_completed: lessonsCompleted || 0,
      total_practice_sessions: practiceSessions?.length || 0,
      total_mock_exams: mockExams?.length || 0,
      average_practice_score: averagePracticeScore,
      average_mock_score: averageMockScore,
      best_mock_score: bestMockScore,
      last_activity_date: streak.last_activity_date,
      weak_topics: weakTopics,
    };
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    throw error;
  }
}

/**
 * Calculate exam readiness score (0-100)
 */
function calculateExamReadiness(factors: {
  lessonsCompleted: number;
  practiceAccuracy: number;
  averageMockScore: number;
  studyStreak: number;
  totalMockExams: number;
}): number {
  const {
    lessonsCompleted,
    practiceAccuracy,
    averageMockScore,
    studyStreak,
    totalMockExams,
  } = factors;

  const lessonWeight = 0.25;
  const practiceWeight = 0.3;
  const mockWeight = 0.35;
  const streakWeight = 0.1;

  const lessonScore = Math.min((lessonsCompleted / 100) * 100, 100);
  const practiceScore = practiceAccuracy;
  const mockScore = totalMockExams > 0 ? averageMockScore : 0;
  const streakScore = Math.min((studyStreak / 30) * 100, 100);

  const readiness =
    lessonScore * lessonWeight +
    practiceScore * practiceWeight +
    mockScore * mockWeight +
    streakScore * streakWeight;

  return Math.round(readiness);
}

export const uploadNursingId = async (userId: string, fileUri: string, fileName: string): Promise<string> => {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const filePath = `${userId}/${Date.now()}_${fileName}`;

    const { error } = await supabase.storage
      .from('nursing-ids')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('nursing-ids')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading nursing ID:', error);
    throw error;
  }
};

// Aliases for backward compatibility
export const getUserProfile = getProfile;
export const updateUserProfile = updateProfile;
