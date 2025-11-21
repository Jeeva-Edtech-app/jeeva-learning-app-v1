export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled'
export type PaymentMethod = 'stripe' | 'razorpay' | 'free_trial'
export type BillingPeriod = 'trial' | 'monthly' | 'yearly'
export type FeatureType = 'practice' | 'learning_module' | 'mock_exams' | 'ai_chat' | 'voice_tutoring' | 'personalised_recommendations'

export interface SubscriptionFeatures {
  unlimitedPractice: boolean
  learningModule: boolean
  mockExams: boolean
  aiChat: boolean
  personalisedRecommendations: boolean
  voiceTutoring: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  price_usd: number
  billingPeriod: BillingPeriod
  durationDays: number
  features: SubscriptionFeatures
  isActive: boolean
  displayOrder?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  startDate: Date
  endDate: Date
  paymentMethod: PaymentMethod
  stripePaymentId?: string
  razorpayPaymentId?: string
  autoRenew: boolean
  amountPaidUsd?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface SubscriptionUsage {
  id: string
  userId: string
  feature: FeatureType
  usedThisMonth: number
  limitThisMonth: number | null
  resetDate: Date
}

export interface PaymentCreateRequest {
  userId: string
  planId: string
  paymentMethod: 'stripe' | 'razorpay'
  currency: 'usd' | 'inr'
}

export interface PaymentCreateResponse {
  clientSecret?: string
  orderId?: string
  amount: number
  currency: string
}

export interface PaymentVerifyRequest {
  paymentId: string
  userId: string
  signature?: string
}

export interface PaymentVerifyResponse {
  success: boolean
  subscriptionId?: string
  message: string
}

export interface FeatureAccessCheck {
  hasAccess: boolean
  remaining?: number
  limit?: number
  message?: string
}

export interface CountryInfo {
  countryCode: string
  countryName: string
  currency: string
  paymentProvider: 'stripe' | 'razorpay'
}
