# In-App Notifications - Mobile App Integration Guide

This guide shows how to integrate the in-app notification system into your React Native mobile app. Users can view notification history, mark items as read, and manage notification preferences.

---

## Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [API Integration](#api-integration)
4. [Notification Inbox UI](#notification-inbox-ui)
5. [Notification Preferences UI](#notification-preferences-ui)
6. [Real-time Updates](#real-time-updates)
7. [Complete Examples](#complete-examples)

---

## Overview

**Features:**
- ✅ Notification inbox with read/unread status
- ✅ Badge count for unread notifications
- ✅ Mark individual or all notifications as read
- ✅ User notification preferences (push, email, in-app)
- ✅ Quiet hours configuration
- ✅ Real-time updates via Supabase subscriptions

**Tech Stack:**
- React Native with TypeScript
- Supabase JS Client
- React Query (optional, for caching)

---

## Database Setup

Run this migration in your Supabase project:

```bash
# Navigate to database/migrations directory
cd database/migrations

# Run the in-app notifications migration
supabase db push --file add_inapp_notifications.sql
```

This creates:
- `user_notification_reads` - Tracks which notifications users have read
- `notification_preferences` - Stores user notification settings
- Helper functions for fetching notifications and unread counts

---

## API Integration

### 1. Setup Supabase Client

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2. Notification API Service

```typescript
// api/notifications.ts
import { supabase } from '../lib/supabase'

export interface UserNotification {
  id: string
  title: string
  body: string
  notification_type: string
  image_url?: string
  data?: any
  created_at: string
  is_read: boolean
  read_at?: string
}

export interface NotificationPreferences {
  id: string
  user_id: string
  push_enabled: boolean
  email_enabled: boolean
  in_app_enabled: boolean
  subscription_expiring_enabled: boolean
  content_approved_enabled: boolean
  welcome_enabled: boolean
  milestones_enabled: boolean
  marketing_enabled: boolean
  quiet_hours?: { start: string; end: string }
}

export const notificationAPI = {
  // Fetch user notifications with read status
  async getUserNotifications(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<UserNotification[]> {
    const { data, error } = await supabase.rpc(
      'get_user_notifications_with_read_status',
      {
        user_id_param: userId,
        limit_param: limit,
        offset_param: offset,
      }
    )

    if (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }

    return data || []
  },

  // Mark notification as read
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const { error } = await supabase.from('user_notification_reads').insert({
      user_id: userId,
      notification_id: notificationId,
    })

    if (error && !error.message.includes('duplicate key')) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.getUserNotifications(userId, 1000, 0)
    const unread = notifications
      .filter((n) => !n.is_read)
      .map((n) => ({
        user_id: userId,
        notification_id: n.id,
      }))

    if (unread.length === 0) return

    const { error } = await supabase
      .from('user_notification_reads')
      .insert(unread)

    if (error && !error.message.includes('duplicate key')) {
      console.error('Error marking all as read:', error)
      throw error
    }
  },

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc(
      'get_unread_notification_count',
      {
        user_id_param: userId,
      }
    )

    if (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }

    return data || 0
  },

  // Get notification preferences
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching preferences:', error)
      throw error
    }

    return data
  },

  // Update notification preferences
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    const { error } = await supabase
      .from('notification_preferences')
      .update(preferences)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating preferences:', error)
      throw error
    }
  },
}
```

---

## Notification Inbox UI

### Basic Notification List Component

```tsx
// components/NotificationInbox.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { notificationAPI, UserNotification } from '../api/notifications'
import { supabase } from '../lib/supabase'

interface NotificationInboxProps {
  userId: string
  onNotificationPress?: (notification: UserNotification) => void
}

export const NotificationInbox: React.FC<NotificationInboxProps> = ({
  userId,
  onNotificationPress,
}) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadNotifications = async () => {
    try {
      const data = await notificationAPI.getUserNotifications(userId)
      setNotifications(data)
    } catch (error) {
      console.error('Failed to load notifications:', error)
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
    // Mark as read if unread
    if (!notification.is_read) {
      try {
        await notificationAPI.markAsRead(userId, notification.id)
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        )
      } catch (error) {
        console.error('Failed to mark as read:', error)
      }
    }

    // Navigate or perform action
    onNotificationPress?.(notification)
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead(userId)
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
          read_at: n.read_at || new Date().toISOString(),
        }))
      )
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [userId])

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    )
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.header}>
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
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.notificationItem,
              !item.is_read && styles.unreadItem,
            ]}
            onPress={() => handleNotificationPress(item)}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.title}>{item.title}</Text>
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
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  )
}

// Helper function to format timestamps
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return date.toLocaleDateString()
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  unreadText: {
    fontSize: 14,
    color: '#666',
  },
  markAllButton: {
    fontSize: 14,
    color: '#007aff',
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  unreadItem: {
    backgroundColor: '#f0f8ff',
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  body: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007aff',
    marginLeft: 8,
    alignSelf: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
})
```

---

## Notification Preferences UI

```tsx
// components/NotificationPreferences.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { notificationAPI, NotificationPreferences } from '../api/notifications'

interface NotificationPreferencesProps {
  userId: string
}

export const NotificationPreferencesScreen: React.FC<
  NotificationPreferencesProps
> = ({ userId }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(
    null
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPreferences()
  }, [userId])

  const loadPreferences = async () => {
    try {
      const data = await notificationAPI.getPreferences(userId)
      setPreferences(data)
    } catch (error) {
      console.error('Failed to load preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    if (!preferences) return

    const updated = { ...preferences, [key]: value }
    setPreferences(updated)

    try {
      await notificationAPI.updatePreferences(userId, { [key]: value })
    } catch (error) {
      console.error('Failed to update preference:', error)
      // Revert on error
      setPreferences(preferences)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    )
  }

  if (!preferences) {
    return (
      <View style={styles.centered}>
        <Text>Failed to load preferences</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Channels</Text>

        <PreferenceItem
          label="Push Notifications"
          description="Receive push notifications on your device"
          value={preferences.push_enabled}
          onValueChange={(value) => updatePreference('push_enabled', value)}
        />

        <PreferenceItem
          label="Email Notifications"
          description="Receive notifications via email"
          value={preferences.email_enabled}
          onValueChange={(value) => updatePreference('email_enabled', value)}
        />

        <PreferenceItem
          label="In-App Notifications"
          description="Show notifications in your inbox"
          value={preferences.in_app_enabled}
          onValueChange={(value) => updatePreference('in_app_enabled', value)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Types</Text>

        <PreferenceItem
          label="Subscription Expiring"
          description="Get notified when your subscription is about to expire"
          value={preferences.subscription_expiring_enabled}
          onValueChange={(value) =>
            updatePreference('subscription_expiring_enabled', value)
          }
        />

        <PreferenceItem
          label="Content Updates"
          description="Get notified when new content is available"
          value={preferences.content_approved_enabled}
          onValueChange={(value) =>
            updatePreference('content_approved_enabled', value)
          }
        />

        <PreferenceItem
          label="Welcome Messages"
          description="Receive welcome and onboarding messages"
          value={preferences.welcome_enabled}
          onValueChange={(value) => updatePreference('welcome_enabled', value)}
        />

        <PreferenceItem
          label="Milestones"
          description="Celebrate your learning milestones"
          value={preferences.milestones_enabled}
          onValueChange={(value) =>
            updatePreference('milestones_enabled', value)
          }
        />

        <PreferenceItem
          label="Marketing & Tips"
          description="Receive study tips and promotional content"
          value={preferences.marketing_enabled}
          onValueChange={(value) =>
            updatePreference('marketing_enabled', value)
          }
        />
      </View>
    </ScrollView>
  )
}

interface PreferenceItemProps {
  label: string
  description: string
  value: boolean
  onValueChange: (value: boolean) => void
}

const PreferenceItem: React.FC<PreferenceItemProps> = ({
  label,
  description,
  value,
  onValueChange,
}) => (
  <View style={styles.preferenceItem}>
    <View style={styles.preferenceText}>
      <Text style={styles.preferenceLabel}>{label}</Text>
      <Text style={styles.preferenceDescription}>{description}</Text>
    </View>
    <Switch value={value} onValueChange={onValueChange} />
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  preferenceText: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
  },
})
```

---

## Real-time Updates

Add real-time notification updates using Supabase Realtime:

```typescript
// hooks/useNotificationUpdates.ts
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useNotificationUpdates = (
  userId: string,
  onNewNotification: (notification: any) => void
) => {
  useEffect(() => {
    // Subscribe to new notifications for this user
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `audience_filter->type=eq.all_users`,
        },
        (payload) => {
          onNewNotification(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, onNewNotification])
}
```

Usage:

```tsx
// In your NotificationInbox component
import { useNotificationUpdates } from '../hooks/useNotificationUpdates'

// Inside component:
useNotificationUpdates(userId, (notification) => {
  // Add new notification to the list
  setNotifications((prev) => [
    { ...notification, is_read: false },
    ...prev,
  ])

  // Show toast or badge update
  console.log('New notification received:', notification.title)
})
```

---

## Complete Examples

### Example: Notification Badge

```tsx
// components/NotificationBadge.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { notificationAPI } from '../api/notifications'

interface NotificationBadgeProps {
  userId: string
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  userId,
}) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const loadCount = async () => {
      const unreadCount = await notificationAPI.getUnreadCount(userId)
      setCount(unreadCount)
    }

    loadCount()

    // Refresh every 30 seconds
    const interval = setInterval(loadCount, 30000)

    return () => clearInterval(interval)
  }, [userId])

  if (count === 0) return null

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
})
```

---

## Testing

### Test the API endpoints:

```typescript
// Test fetching notifications
const notifications = await notificationAPI.getUserNotifications(userId)
console.log('Notifications:', notifications)

// Test marking as read
await notificationAPI.markAsRead(userId, notificationId)

// Test getting unread count
const count = await notificationAPI.getUnreadCount(userId)
console.log('Unread count:', count)

// Test preferences
const prefs = await notificationAPI.getPreferences(userId)
await notificationAPI.updatePreferences(userId, {
  push_enabled: false,
})
```

---

## Next Steps

1. **Deploy the migration** to your Supabase project
2. **Install dependencies** in your React Native app
3. **Implement the UI components** from this guide
4. **Test** the notification flow end-to-end
5. **Integrate with navigation** to handle notification taps
6. **Add analytics** to track user engagement

---

## Troubleshooting

**Issue: Notifications not showing**
- Check RLS policies are enabled on `notifications` table
- Verify `audience_filter` includes the user
- Check notification `status` is `'sent'`

**Issue: Unread count wrong**
- Ensure migration created the RPC function correctly
- Check `user_notification_reads` table for duplicates

**Issue: Preferences not saving**
- Verify user has a row in `notification_preferences` table
- Check RLS policies allow user to update their own preferences

---

## API Reference

### `getUserNotifications(userId, limit, offset)`
Fetch paginated notifications with read status

### `markAsRead(userId, notificationId)`
Mark a single notification as read

### `markAllAsRead(userId)`
Mark all notifications as read for a user

### `getUnreadCount(userId)`
Get the number of unread notifications

### `getPreferences(userId)`
Get user notification preferences

### `updatePreferences(userId, preferences)`
Update user notification preferences

---

**✅ You're all set!** Your users can now view, manage, and customize their notification experience.
