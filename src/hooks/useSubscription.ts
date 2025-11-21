import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import * as subscriptionAPI from '@/api/subscriptions'
import type { SubscriptionPlan, UserSubscription, FeatureAccessCheck } from '@/types/subscription'

export function useSubscription() {
  const { user } = useAuth()
  const userId = user?.id

  // Fetch subscription plans
  const plansQuery = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: () => subscriptionAPI.fetchSubscriptionPlans(),
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  // Fetch user's subscription
  const subscriptionQuery = useQuery({
    queryKey: ['userSubscription', userId],
    queryFn: () => (userId ? subscriptionAPI.fetchUserSubscription(userId) : null),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Check if subscription is valid
  const isValidQuery = useQuery({
    queryKey: ['subscriptionValid', userId],
    queryFn: () => (userId ? subscriptionAPI.isSubscriptionValid(userId) : false),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Get days remaining
  const daysRemainingQuery = useQuery({
    queryKey: ['daysRemaining', userId],
    queryFn: () => (userId ? subscriptionAPI.getDaysRemaining(userId) : 0),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Check if expiring soon
  const expiringQuery = useQuery({
    queryKey: ['expiringsSoon', userId],
    queryFn: () => (userId ? subscriptionAPI.isSubscriptionExpiringSoon(userId) : false),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Get usage stats
  const usageQuery = useQuery({
    queryKey: ['usageStats', userId],
    queryFn: () => (userId ? subscriptionAPI.getSubscriptionUsageStats(userId) : []),
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1 minute
  })

  // Start free trial mutation
  const startTrialMutation = useMutation({
    mutationFn: () => (userId ? subscriptionAPI.startFreeTrial(userId) : Promise.resolve(null)),
    onSuccess: () => {
      subscriptionQuery.refetch()
      isValidQuery.refetch()
    },
  })

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: () => (userId ? subscriptionAPI.cancelSubscription(userId) : Promise.resolve(false)),
    onSuccess: () => {
      subscriptionQuery.refetch()
      isValidQuery.refetch()
    },
  })

  // Track feature usage mutation
  const trackUsageMutation = useMutation({
    mutationFn: (data: { feature: string; amount?: number }) =>
      userId
        ? subscriptionAPI.trackFeatureUsage(userId, data.feature, data.amount)
        : Promise.resolve(),
    onSuccess: () => {
      usageQuery.refetch()
    },
  })

  // Check feature access
  const checkFeatureAccess = async (feature: string): Promise<FeatureAccessCheck> => {
    if (!userId) {
      return { hasAccess: false, message: 'Please sign in to access this feature' }
    }

    const isValid = await subscriptionAPI.isSubscriptionValid(userId)
    if (!isValid) {
      return { hasAccess: false, message: 'Your subscription has expired' }
    }

    const remaining = await subscriptionAPI.getRemainingUsage(userId, feature)
    const hasAccess = remaining === null || remaining > 0

    return {
      hasAccess,
      remaining: remaining === null ? undefined : remaining,
      limit: remaining === null ? undefined : remaining,
      message: !hasAccess ? `${feature} limit reached` : undefined,
    }
  }

  // Get remaining usage
  const getRemainingUsage = async (feature: string): Promise<number | null> => {
    if (!userId) return null
    return subscriptionAPI.getRemainingUsage(userId, feature)
  }

  return {
    // Queries
    plans: plansQuery.data || [],
    plansLoading: plansQuery.isLoading,
    subscription: subscriptionQuery.data || null,
    subscriptionLoading: subscriptionQuery.isLoading,
    isValid: isValidQuery.data || false,
    isValidLoading: isValidQuery.isLoading,
    daysRemaining: daysRemainingQuery.data || 0,
    expiringsSoon: expiringQuery.data || false,
    usageStats: usageQuery.data || [],

    // Mutations
    startTrial: startTrialMutation.mutate,
    startTrialLoading: startTrialMutation.isPending,
    cancelSubscription: cancelMutation.mutate,
    cancelLoading: cancelMutation.isPending,
    trackUsage: trackUsageMutation.mutate,

    // Methods
    checkFeatureAccess,
    getRemainingUsage,

    // Refetch methods
    refetch: () => {
      subscriptionQuery.refetch()
      isValidQuery.refetch()
      daysRemainingQuery.refetch()
      expiringQuery.refetch()
      usageQuery.refetch()
    },
  }
}
