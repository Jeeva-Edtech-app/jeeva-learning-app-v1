import { supabase } from '@/lib/supabase'
import type {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionUsage,
  SubscriptionStatus,
} from '@/types/subscription'

/**
 * Fetch all active subscription plans
 */
export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    throw error
  }
}

/**
 * Get current user's subscription
 */
export async function fetchUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code === 'PGRST116') return null // No rows returned
    if (error) throw error

    return data || null
  } catch (error) {
    console.error('Error fetching user subscription:', error)
    return null
  }
}

/**
 * Check if user's subscription is active
 */
export async function isSubscriptionValid(userId: string): Promise<boolean> {
  try {
    const subscription = await fetchUserSubscription(userId)
    if (!subscription) return false

    const endDate = new Date(subscription.end_date)
    const today = new Date()

    return endDate > today && subscription.status === 'active'
  } catch (error) {
    console.error('Error validating subscription:', error)
    return false
  }
}

/**
 * Calculate days remaining in subscription
 */
export async function getDaysRemaining(userId: string): Promise<number> {
  try {
    const subscription = await fetchUserSubscription(userId)
    if (!subscription) return 0

    const endDate = new Date(subscription.end_date)
    const today = new Date()
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return Math.max(0, daysRemaining)
  } catch (error) {
    console.error('Error calculating days remaining:', error)
    return 0
  }
}

/**
 * Check if subscription is expiring soon (within 5 days)
 */
export async function isSubscriptionExpiringSoon(userId: string): Promise<boolean> {
  try {
    const daysRemaining = await getDaysRemaining(userId)
    return daysRemaining <= 5 && daysRemaining > 0
  } catch (error) {
    console.error('Error checking expiration:', error)
    return false
  }
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(
  userId: string,
  feature: string,
  amount: number = 1,
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data: existing } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('feature', feature)
      .single()

    if (existing) {
      await supabase
        .from('subscription_usage')
        .update({ used_this_month: existing.used_this_month + amount })
        .eq('id', existing.id)
    } else {
      await supabase.from('subscription_usage').insert({
        user_id: userId,
        feature,
        used_this_month: amount,
        limit_this_month: null,
        reset_date: today,
      })
    }
  } catch (error) {
    console.error('Error tracking feature usage:', error)
  }
}

/**
 * Get remaining usage for a feature
 */
export async function getRemainingUsage(userId: string, feature: string): Promise<number | null> {
  try {
    // First get the subscription to determine limits
    const subscription = await fetchUserSubscription(userId)
    if (!subscription) return 0

    // Define limits based on plan
    const limits: Record<string, Record<string, number | null>> = {
      free_trial: {
        ai_messages: 50,
        voice_sessions: 0,
        mock_exams: 2,
      },
      monthly: {
        ai_messages: 100,
        voice_sessions: 5,
        mock_exams: null, // unlimited
      },
      yearly: {
        ai_messages: null, // unlimited
        voice_sessions: 50,
        mock_exams: null, // unlimited
      },
    }

    const planType = subscription.plan_type || 'free_trial'
    const limit = limits[planType]?.[feature] ?? null

    if (limit === null) return 999999 // unlimited

    // Get current usage
    const { data: usage } = await supabase
      .from('subscription_usage')
      .select('used_this_month')
      .eq('user_id', userId)
      .eq('feature', feature)
      .single()

    const used = usage?.used_this_month || 0
    return Math.max(0, limit - used)
  } catch (error) {
    console.error('Error getting remaining usage:', error)
    return null
  }
}

/**
 * Start free trial for new user
 */
export async function startFreeTrial(userId: string): Promise<UserSubscription | null> {
  try {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7) // 7 days

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: 'free_trial', // Adjust to match actual plan ID
        status: 'trial' as SubscriptionStatus,
        start_date: startDate,
        end_date: endDate,
        payment_method: 'free_trial',
        auto_renew: false,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error
    return data || null
  } catch (error) {
    console.error('Error starting free trial:', error)
    return null
  }
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  userId: string,
  status: SubscriptionStatus,
): Promise<void> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating subscription status:', error)
  }
}

/**
 * Cancel user subscription
 */
export async function cancelSubscription(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' as SubscriptionStatus, is_active: false })
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return false
  }
}

/**
 * Get subscription usage stats
 */
export async function getSubscriptionUsageStats(userId: string): Promise<SubscriptionUsage[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching usage stats:', error)
    return []
  }
}
