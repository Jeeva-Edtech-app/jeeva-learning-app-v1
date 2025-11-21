export interface User {
  id: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  phone_number: string | null
  date_of_birth: string | null
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  role: 'superadmin' | 'editor' | 'moderator'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Module {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Topic {
  id: string
  module_id: string
  title: string
  description: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  topic_id: string
  title: string
  content: string | null
  video_url: string | null
  audio_url: string | null
  duration: number | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  lesson_id: string | null
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer'
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  explanation: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface QuestionOption {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
  display_order: number
}

export interface Flashcard {
  id: string
  lesson_id: string
  front: string
  back: string
  image_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface LearningCompletion {
  id: string
  user_id: string
  lesson_id: string
  completed_at: string
}

export interface PracticeSession {
  id: string | number
  user_id: string
  module_id?: string | number | null
  created_at?: string
  updated_at?: string
  total_questions?: number | null
  correct_count?: number | null
  incorrect_count?: number | null
}

export interface PracticeAnswerLog {
  question_id: string | number
  selected_option_id: string | number | null
  is_correct: boolean
  time_taken?: number | null
  time_taken_seconds?: number | null
}

export interface PracticeResult {
  id: string | number
  session_id: string | number
  answer_log?: PracticeAnswerLog[]
  question_id?: string | number
  selected_option_id?: string | number | null
  is_correct?: boolean
  time_taken_seconds?: number | null
}

export interface MockSession {
  id: string
  user_id: string
  exam_part: 'part_a' | 'part_b'
  started_at: string | null
  completed_at: string | null
  total_questions: number | null
  correct_answers: number | null
  score_percentage: number | null
  time_taken_minutes: number | null
  passed: boolean | null
  created_at: string
  updated_at: string
  legacy_exam_id?: number | null
}

export interface AIRecommendationData {
  type: string
  topic_id: string
  reason: string
  confidence: number
}

export interface AIRecommendation {
  id: string
  user_id: string
  recommendation_data: AIRecommendationData
  created_at: string
}

export interface UserAnalyticsData {
  total_study_time: number
  lessons_completed: number
  average_score: number
  current_streak: number
  longest_streak: number
}

export interface UserAnalytics {
  id: string
  user_id: string
  analytics_data: UserAnalyticsData
  created_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string | null
  price: number
  billing_cycle: 'monthly' | 'yearly' | 'lifetime'
  features: string[]
  max_users: number | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  start_date: string
  end_date: string | null
  auto_renew: boolean
  payment_method: string | null
  last_payment_date: string | null
  next_payment_date: string | null
  created_at: string
  updated_at: string
}

export interface AppSetting {
  id: string
  key: string
  value: string | null
}

export interface DashboardHero {
  id: string
  title: string
  description: string | null
  image_url: string | null
  cta_text: string | null
  cta_link: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ContentApproval {
  id: string
  resource_id: string
  resource_type: 'module' | 'topic' | 'lesson' | 'question' | 'flashcard'
  resource_title: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_by: string
  reviewed_by: string | null
  review_comments: string | null
  created_at: string
  updated_at: string
  reviewed_at: string | null
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}
