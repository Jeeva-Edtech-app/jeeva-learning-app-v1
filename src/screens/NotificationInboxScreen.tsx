import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { notificationAPI, UserNotification } from '@/api/notifications'
import { useAuth } from '@/context/AuthContext'
import { Colors } from '@/constants/DesignSystem'
import { showToast } from '@/utils/toast'

export default function NotificationInboxScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadNotifications = async () => {
    if (!user?.id) return

    try {
      const data = await notificationAPI.getUserNotifications(user.id)
      setNotifications(data)
    } catch (error) {
      console.error('Failed to load notifications:', error)
      showToast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadNotifications()
    setRefreshing(false)
  }

  const handleNotificationPress = async (notification: UserNotification) => {
    if (!user?.id) return

    if (!notification.is_read) {
      try {
        await notificationAPI.markAsRead(user.id, notification.id)
        
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        )

        await notificationAPI.deleteReadNotifications(user.id)
      } catch (error) {
        console.error('Failed to mark as read:', error)
      }
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return

    try {
      await notificationAPI.markAllAsRead(user.id)
      
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
          read_at: n.read_at || new Date().toISOString(),
        }))
      )

      await notificationAPI.deleteReadNotifications(user.id)
      
      showToast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      showToast.error('Failed to mark all as read')
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user?.id])

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {unreadCount > 0 && (
        <View style={styles.actionBar}>
          <Text style={styles.unreadText}>{unreadCount} unread</Text>
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllButton}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={Colors.primary.main}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.notificationItem,
              !item.is_read && styles.unreadItem,
            ]}
            onPress={() => handleNotificationPress(item)}
          >
            <View style={styles.iconContainer}>
              <View style={[
                styles.iconCircle,
                !item.is_read && styles.iconCircleUnread
              ]}>
                <Ionicons 
                  name={getNotificationIcon(item.notification_type)} 
                  size={20} 
                  color={!item.is_read ? Colors.primary.main : Colors.text.secondary} 
                />
              </View>
            </View>
            
            <View style={styles.notificationContent}>
              <Text style={[
                styles.title,
                !item.is_read && styles.titleUnread
              ]}>
                {item.title}
              </Text>
              <Text style={styles.body} numberOfLines={2}>
                {item.body}
              </Text>
              <Text style={styles.timestamp}>
                {formatTimestamp(item.created_at)}
              </Text>
            </View>
            
            {!item.is_read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>
              You'll see important updates and reminders here
            </Text>
          </View>
        }
        contentContainerStyle={notifications.length === 0 && styles.emptyList}
      />
    </SafeAreaView>
  )
}

function getNotificationIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'welcome':
      return 'hand-left-outline'
    case 'content_approved':
      return 'book-outline'
    case 'subscription_expiring':
      return 'card-outline'
    case 'milestones':
      return 'trophy-outline'
    case 'study_reminder':
      return 'alarm-outline'
    case 'exam_reminder':
      return 'calendar-outline'
    default:
      return 'information-circle-outline'
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  unreadText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  markAllButton: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  unreadItem: {
    backgroundColor: '#F0F8FF',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleUnread: {
    backgroundColor: Colors.primary.light,
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: Colors.text.primary,
  },
  titleUnread: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  body: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.main,
    marginLeft: 8,
    alignSelf: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
})
