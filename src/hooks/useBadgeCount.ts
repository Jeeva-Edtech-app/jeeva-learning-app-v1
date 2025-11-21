import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { notificationAPI } from '@/api/notifications'
import { supabase } from '@/lib/supabase'

export function useBadgeCount() {
  const { user } = useAuth()
  const userId = user?.id
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Get initial count
    fetchUnreadCount()

    // Setup real-time subscription
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notification_reads',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const fetchUnreadCount = async () => {
    if (!userId) return
    try {
      const count = await notificationAPI.getUnreadCount(userId)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    unreadCount,
    loading,
    refetch: fetchUnreadCount,
  }
}
