import React, { useCallback } from 'react'
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { useNotifications } from '@/hooks/useNotifications'
import { Colors, DesignSystem } from '@/constants/DesignSystem'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationsScreen() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch } =
    useNotifications()
  const [refreshing, setRefreshing] = React.useState(false)

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch])
  )

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
        </View>
      </SafeAreaView>
    )
  }

  if (notifications.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={48} color={Colors.text.tertiary} />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
          <Text style={styles.markAllText}>Mark all as read</Text>
          <Ionicons name="checkmark-done" size={14} color={Colors.primary.main} />
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onMarkAsRead={() => handleMarkAsRead(item.id)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        scrollEnabled
      />
    </SafeAreaView>
  )
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: any
  onMarkAsRead: () => void
}) {
  return (
    <View style={[styles.card, !notification.is_read && styles.unreadCard]}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {notification.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={styles.time}>
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </Text>
      </View>

      {!notification.is_read && (
        <TouchableOpacity style={styles.readButton} onPress={onMarkAsRead}>
          <View style={styles.dot} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  badge: {
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  markAllText: {
    color: Colors.primary.main,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
    alignItems: 'center',
  },
  unreadCard: {
    backgroundColor: Colors.accent.lightBlue,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  body: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  time: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  readButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.main,
  },
})
