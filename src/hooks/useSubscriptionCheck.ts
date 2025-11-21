import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import { router } from 'expo-router'

export function useSubscriptionCheck() {
  const { user, loading: authLoading } = useAuth()
  const { subscription, isValid, isValidLoading, expiringsSoon, refetch } = useSubscription()

  useEffect(() => {
    checkSubscriptionFlow()
  }, [user, authLoading, isValid])

  const checkSubscriptionFlow = async () => {
    // Wait for auth to load
    if (authLoading) return

    // Not authenticated - go to login
    if (!user) {
      router.replace('/auth/signin' as any)
      return
    }

    // Still checking subscription status
    if (isValidLoading) return

    // No subscription - offer free trial
    if (!subscription) {
      router.replace('/(tabs)/plans' as any)
      return
    }

    // Subscription expired - show upgrade screen
    if (!isValid) {
      router.replace('/(tabs)/plans' as any)
      return
    }

    // All good - dashboard will show with expiring banner if needed
    if (expiringsSoon) {
      // Banner will be shown in dashboard
      console.log('Subscription expiring soon')
    }
  }

  return {
    isSubscriptionValid: isValid,
    subscription,
    expiringsSoon,
    refetch,
  }
}
