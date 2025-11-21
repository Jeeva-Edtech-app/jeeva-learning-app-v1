import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { notificationAPI, NotificationPreferences } from '@/api/notifications'
import { useEffect, useState } from 'react'

export function useNotifications() {
  const { user } = useAuth()
  const userId = user?.id
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch all notifications
  const notificationsQuery = useQuery({
    queryKey: ['allNotifications', userId],
    queryFn: () => (userId ? notificationAPI.getUserNotifications(userId, 50, 0) : []),
    enabled: !!userId,
    staleTime: 1000 * 60 * 1,
  })

  // Get unread count
  const unreadCountQuery = useQuery({
    queryKey: ['unreadCount', userId],
    queryFn: () => (userId ? notificationAPI.getUnreadCount(userId) : 0),
    enabled: !!userId,
    staleTime: 1000 * 30,
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      userId ? notificationAPI.markAsRead(userId, notificationId) : Promise.resolve(),
    onSuccess: () => {
      notificationsQuery.refetch()
      unreadCountQuery.refetch()
    },
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => (userId ? notificationAPI.markAllAsRead(userId) : Promise.resolve()),
    onSuccess: () => {
      notificationsQuery.refetch()
      unreadCountQuery.refetch()
    },
  })

  useEffect(() => {
    if (unreadCountQuery.data !== undefined) {
      setUnreadCount(unreadCountQuery.data)
    }
  }, [unreadCountQuery.data])

  return {
    notifications: notificationsQuery.data || [],
    unreadCount,
    loading: notificationsQuery.isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAsReadLoading: markAsReadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutate,
    markAllAsReadLoading: markAllAsReadMutation.isPending,
    refetch: () => {
      notificationsQuery.refetch()
      unreadCountQuery.refetch()
    },
  }
}

export function useNotificationPreferences() {
  const { user } = useAuth()
  const userId = user?.id

  const preferencesQuery = useQuery({
    queryKey: ['notificationPreferences', userId],
    queryFn: () => (userId ? notificationAPI.getPreferences(userId) : null),
    enabled: !!userId,
    staleTime: 1000 * 60 * 60,
  })

  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      userId ? notificationAPI.updatePreferences(userId, prefs) : Promise.resolve(),
    onSuccess: () => {
      preferencesQuery.refetch()
    },
  })

  return {
    preferences: preferencesQuery.data,
    loading: preferencesQuery.isLoading,
    updatePreferences: updatePreferencesMutation.mutate,
    updating: updatePreferencesMutation.isPending,
    refetch: preferencesQuery.refetch,
  }
}
