import { supabase } from '@/lib/supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_usd: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string;
  payment_gateway: string;
  amount_paid_usd: number;
  plan?: SubscriptionPlan;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: UserSubscription | null;
  daysRemaining: number;
  daysUsed: number;
  totalDays: number;
  progressPercentage: number;
}

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      return {
        hasActiveSubscription: false,
        subscription: null,
        daysRemaining: 0,
        daysUsed: 0,
        totalDays: 0,
        progressPercentage: 0,
      };
    }

    const now = new Date();
    const startDate = new Date(subscription.start_date);
    const endDate = new Date(subscription.end_date);
    
    const totalMs = endDate.getTime() - startDate.getTime();
    const usedMs = now.getTime() - startDate.getTime();
    const remainingMs = endDate.getTime() - now.getTime();
    
    const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const daysUsed = Math.floor(usedMs / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60 * 24)));
    const progressPercentage = Math.min(100, Math.round((daysUsed / totalDays) * 100));

    return {
      hasActiveSubscription: true,
      subscription,
      daysRemaining,
      daysUsed,
      totalDays,
      progressPercentage,
    };
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return {
      hasActiveSubscription: false,
      subscription: null,
      daysRemaining: 0,
      daysUsed: 0,
      totalDays: 0,
      progressPercentage: 0,
    };
  }
}

export async function getSubscriptionPlans() {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
}
