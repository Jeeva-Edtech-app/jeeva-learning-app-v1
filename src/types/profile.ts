/**
 * Profile-related TypeScript types for Jeeva Learning Mobile App
 * Based on DATABASE_SCHEMA.md
 */

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  country_code: string | null;
  date_of_birth: string | null;
  gender: string | null;
  current_country: string | null;
  nmc_attempts: number;
  uses_coaching: boolean;
  nursing_id_url: string | null;
  profile_completed: boolean;
  auth_provider: 'email' | 'google' | 'apple';
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone_number?: string | null;
  country_code?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  current_country?: string | null;
  nmc_attempts?: number;
  uses_coaching?: boolean;
  nursing_id_url?: string | null;
  profile_completed?: boolean;
  auth_provider?: 'email' | 'google' | 'apple';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price_usd: number;
  duration_days: number;
  features: string[] | null;
  is_active: boolean;
  display_order: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  payment_gateway: 'stripe' | 'razorpay' | null;
  payment_method: string | null;
  amount_paid_usd: number | null;
  coupon_code: string | null;
  discount_amount: number;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStatus {
  status: 'trial' | 'active' | 'expired' | 'cancelled' | 'none';
  plan_name: string | null;
  start_date: string | null;
  end_date: string | null;
  days_remaining: number;
  is_trial: boolean;
  has_access: boolean;
  features: string[];
  subscription?: Subscription;
  plan?: SubscriptionPlan;
}

export interface PerformanceStats {
  exam_readiness: number;
  practice_accuracy: number;
  modules_completed: number;
  study_streak: number;
  total_lessons_completed: number;
  total_practice_sessions: number;
  total_mock_exams: number;
  average_practice_score: number;
  average_mock_score: number;
  best_mock_score: number;
  last_activity_date: string | null;
  weak_topics: WeakTopic[];
}

export interface WeakTopic {
  topic_id: string;
  topic_name: string;
  accuracy: number;
  attempts: number;
}

export interface StudyStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export interface LearningCompletion {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  module_id: string;
  created_at: string;
  updated_at: string;
}

export interface MockSessionProfile {
  id: string;
  user_id: string;
  exam_part: 'part_a' | 'part_b';
  started_at: string | null;
  completed_at: string | null;
  total_questions: number | null;
  correct_answers: number | null;
  score_percentage: number | null;
  time_taken_minutes: number | null;
  passed: boolean | null;
}
