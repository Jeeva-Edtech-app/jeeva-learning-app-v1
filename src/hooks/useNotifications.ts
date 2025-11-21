import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import * as notificationAPI from '@/api/notifications'
import { useEffect, useState } from 'react'

export function useNotifications() {
  const { user } = useAuth()
  const userId = user?.id
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread notifications
  const unreadQuery = useQuery({
    queryKey: ['unreadNotifications', userId],
    queryFn: () => (userId ? notificationAPI.fetchUnreadNotifications(userId) : []),
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1 minute
  })

  // Fetch all notifications with pagination
  const allNotificationsQuery = useQuery({
    queryKey: ['allNotifications', userId],
    queryFn: () => (userId ? notificationAPI.fetchNotifications(userId, 50, 0) : { data: [], total: 0 }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1 minute
  })

  // Get unread count
  const unreadCountQuery = useQuery({
    queryKey: ['unreadCount', userId],
    queryFn: () => (userId ? notificationAPI.getUnreadCount(userId) : 0),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationAPI.markNotificationAsRead(notificationId),
    onSuccess: () => {
      unreadQuery.refetch()
      unreadCountQuery.refetch()
      allNotificationsQuery.refetch()
    },
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => (userId ? notificationAPI.markAllNotificationsAsRead(userId) : Promise.resolve(false)),
    onSuccess: () => {
      unreadQuery.refetch()
      unreadCountQuery.refetch()
      allNotificationsQuery.refetch()
    },
  })

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => notificationAPI.deleteNotification(notificationId),
    onSuccess: () => {
      allNotificationsQuery.refetch()
      unreadCountQuery.refetch()
    },
  })

  // Setup real-time subscription
  useEffect(() => {
    if (!userId) return

    const subscription = notificationAPI.subscribeToNotifications(userId, (notification) => {
      unreadQuery.refetch()
      unreadCountQuery.refetch()
      allNotificationsQuery.refetch()
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [userId])

  // Update unread count from query
  useEffect(() => {
    if (unreadCountQuery.data !== undefined) {
      setUnreadCount(unreadCountQuery.data)
    }
  }, [unreadCountQuery.data])

  return {
    // Data
    unreadNotifications: unreadQuery.data || [],
    allNotifications: allNotificationsQuery.data?.data || [],
    totalNotifications: allNotificationsQuery.data?.total || 0,
    unreadCount,

    // Loading states
    loading: unreadQuery.isLoading || allNotificationsQuery.isLoading,
    unreadLoading: unreadQuery.isLoading,
    countLoading: unreadCountQuery.isLoading,

    // Mutations
    markAsRead: markAsReadMutation.mutate,
    markAsReadLoading: markAsReadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutate,
    markAllAsReadLoading: markAllAsReadMutation.isPending,
    deleteNotification: deleteNotificationMutation.mutate,
    deleteLoading: deleteNotificationMutation.isPending,

    // Refetch
    refetch: () => {
      unreadQuery.refetch()
      allNotificationsQuery.refetch()
      unreadCountQuery.refetch()
    },
  }
}

export function useNotificationPreferences() {
  const { user } = useAuth()
  const userId = user?.id

  const preferencesQuery = useQuery({
    queryKey: ['notificationPreferences', userId],
    queryFn: () => (userId ? notificationAPI.fetchNotificationPreferences(userId) : null),
    enabled: !!userId,
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs: any) =>
      userId ? notificationAPI.updateNotificationPreferences(userId, prefs) : Promise.resolve(null),
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
