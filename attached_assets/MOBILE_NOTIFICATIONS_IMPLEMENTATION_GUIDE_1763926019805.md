# Mobile App - Notifications Implementation Guide

**Version:** 1.0  
**Date:** November 21, 2025  
**Status:** Complete Implementation Guide  
**Backend Status:** ✅ Fully Ready (Expo + In-App Notifications)

---

## Executive Summary

Two-layer notification system:
1. **Push Notifications** - Expo-based system for app-wide notifications (even when app is closed)
2. **In-App Notifications** - Database-backed inbox shown inside app (like email)

Both are managed from admin portal and work together seamlessly.

---

## 1. Architecture Overview

```
Admin Portal Creates Notification
    ↓
Backend sends to Expo Push Service
    ↓
Mobile receives push notification (even if app closed)
    ↓
├─ User taps notification → App launches/navigates
└─ Notification also stored in database as In-App notification
    ↓
User opens app
    ↓
Fetches in-app notifications from database
    ↓
Displays in notification inbox screen
    ↓
User can mark as read/delete
```

---

## 2. Push Notifications (Expo)

### 2.1 What Are Push Notifications?

- Sent to device by Expo Push Service
- Received even when app is closed
- Show as system alerts/badges
- User can tap to launch app or navigate

### 2.2 Setup (One Time)

#### Step 1: Install Expo Notifications Module

```bash
npx expo install expo-notifications
npx expo install expo-device
```

#### Step 2: Request Permissions

```typescript
// NotificationManager.ts
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'

export async function requestNotificationPermissions() {
  // Check if device supports notifications
  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices')
    return false
  }

  try {
    // Request permission from user
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission denied')
      return false
    }

    console.log('✅ Notification permission granted')
    return true

  } catch (error) {
    console.error('Error requesting permissions:', error)
    return false
  }
}
```

#### Step 3: Get Expo Push Token

```typescript
export async function getExpoPushToken() {
  try {
    // Get the Expo token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'YOUR_EXPO_PROJECT_ID' // From app.json
    })

    console.log('Expo Push Token:', token.data)
    return token.data

  } catch (error) {
    console.error('Error getting push token:', error)
    return null
  }
}
```

#### Step 4: Register Token with Backend

```typescript
export async function registerPushToken(userId: string) {
  try {
    // Get token
    const token = await getExpoPushToken()
    
    if (!token) {
      console.log('Could not get push token')
      return
    }

    // Send to backend
    const response = await fetch('https://your-api.com/api/push-tokens/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        expoPushToken: token,
        deviceName: Device.deviceName,
        osType: Device.osName,
        appVersion: '1.0.0'
      })
    })

    const result = await response.json()
    console.log('✅ Token registered:', result)
    return result

  } catch (error) {
    console.error('Error registering token:', error)
  }
}
```

### 2.3 Notification Handler Setup

```typescript
// NotificationHandler.ts
import * as Notifications from 'expo-notifications'

// Configure how notifications behave
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('Notification received:', notification)

    return {
      shouldShowAlert: true, // Show system alert
      shouldPlaySound: true, // Play sound
      shouldSetBadge: true   // Show badge count
    }
  }
})

// Listen for notifications when app is foreground
export function setupNotificationListeners(navigation) {
  // When notification arrives while app is open
  const subscription1 = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('📬 Notification received (foreground):', notification.request.content.title)
      // You can show a banner, toast, etc.
    }
  )

  // When user taps on notification
  const subscription2 = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const { notification } = response
      const data = notification.request.content.data

      console.log('👆 User tapped notification:', data)

      // Handle deep linking
      if (data.screen) {
        navigation.navigate(data.screen, data.params)
      }
    }
  )

  // Cleanup
  return () => {
    subscription1.remove()
    subscription2.remove()
  }
}
```

### 2.4 App Launch Integration

```typescript
// App.tsx or RootNavigator
import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'

export function App() {
  useEffect(() => {
    const initNotifications = async () => {
      // Request permissions
      const hasPermission = await requestNotificationPermissions()
      
      if (hasPermission) {
        // Register token after user logs in
        const user = await getCurrentUser()
        if (user) {
          await registerPushToken(user.id)
        }
      }

      // Setup notification handlers
      setupNotificationListeners(navigation)

      // Check if app was opened from notification
      const notification = await Notifications.getLastNotificationResponseAsync()
      if (notification) {
        // User tapped notification - handle deep link
        handleNotificationTap(notification)
      }
    }

    initNotifications()
  }, [])

  return <NavigationContainer>{/* ... */}</NavigationContainer>
}
```

### 2.5 Notification Payload Structure

**What admin sends:**

```json
{
  "to": "ExponentPushToken[abc123def456...]",
  "sound": "default",
  "title": "New Message",
  "body": "You have a new message from instructor",
  "data": {
    "screen": "Messages",
    "messageId": "msg_123",
    "senderId": "user_456"
  },
  "badge": 1
}
```

**Mobile receives & handles:**

```typescript
// In notification handler
{
  request: {
    content: {
      title: "New Message",
      body: "You have a new message from instructor",
      data: {
        screen: "Messages",
        messageId: "msg_123",
        senderId: "user_456"
      }
    }
  }
}

// Mobile app navigates to: Messages screen with messageId=msg_123
```

---

## 3. In-App Notifications (Database-Backed)

### 3.1 What Are In-App Notifications?

- Stored in database
- Visible in app's notification inbox
- User can mark as read/unread
- Persist even after app closes
- Like email inbox but for app alerts

### 3.2 In-App Notification Data Model

```typescript
interface InAppNotification {
  id: string
  userId: string
  title: string
  body: string
  imageUrl?: string
  data: {
    screen?: string
    params?: Record<string, any>
  }
  isRead: boolean
  createdAt: Date
  readAt?: Date
}

interface NotificationPreferences {
  id: string
  userId: string
  pushEnabled: boolean
  emailEnabled: boolean
  inAppEnabled: boolean
  quietHoursStart: string // "22:00"
  quietHoursEnd: string   // "08:00"
}
```

### 3.3 Fetching In-App Notifications

```typescript
// NotificationService.ts
import { supabase } from '@/lib/supabase'

export const notificationService = {
  // Get unread notifications
  async getUnreadNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  },

  // Get all notifications (with pagination)
  async getNotifications(userId: string, limit = 50, offset = 0) {
    try {
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { data: data || [], total: count || 0 }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return { data: [], total: 0 }
    }
  },

  // Get unread count
  async getUnreadCount(userId: string) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error marking as read:', error)
      return false
    }
  },

  // Mark all as read
  async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error marking all as read:', error)
      return false
    }
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting notification:', error)
      return false
    }
  }
}
```

### 3.4 In-App Notification Inbox Screen

```typescript
// NotificationInboxScreen.tsx
import { useState, useEffect, useCallback } from 'react'
import {
  View,
  ScrollView,
  FlatList,
  RefreshControl,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import { notificationService } from '@/services/notificationService'
import { useAuth } from '@/contexts/AuthContext'

export function NotificationInboxScreen() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch notifications on mount
  useEffect(() => {
    if (user?.id) {
      loadNotifications()
      // Refresh every 30 seconds
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.id])

  async function loadNotifications() {
    if (!user?.id) return

    setLoading(true)
    try {
      const [notifications, unread] = await Promise.all([
        notificationService.getNotifications(user.id, 50),
        notificationService.getUnreadCount(user.id)
      ])
      
      setNotifications(notifications.data)
      setUnreadCount(unread)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadNotifications()
    setRefreshing(false)
  }, [])

  async function handleMarkAsRead(notificationId: string) {
    await notificationService.markAsRead(notificationId)
    // Update local state
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    )
  }

  async function handleMarkAllAsRead() {
    if (!user?.id) return
    await notificationService.markAllAsRead(user.id)
    loadNotifications()
  }

  async function handleDelete(notificationId: string) {
    await notificationService.deleteNotification(notificationId)
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Loading notifications...</Text>
      </View>
    )
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No notifications yet</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header with unread count */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Mark all as read button */}
      {unreadCount > 0 && (
        <TouchableOpacity 
          style={styles.markAllButton}
          onPress={handleMarkAllAsRead}
        >
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      {/* Notifications list */}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onMarkAsRead={() => handleMarkAsRead(item.id)}
            onDelete={() => handleDelete(item.id)}
            onTap={() => handleNotificationTap(item)}
          />
        )}
      />
    </View>
  )
}

// Notification Card Component
function NotificationCard({ notification, onMarkAsRead, onDelete, onTap }) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        !notification.is_read && styles.unreadCard
      ]}
      onPress={onTap}
    >
      {notification.image_url && (
        <Image 
          source={{ uri: notification.image_url }}
          style={styles.image}
        />
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {notification.title}
        </Text>
        <Text style={styles.body} numberOfLines={3}>
          {notification.body}
        </Text>
        <Text style={styles.time}>
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </Text>
      </View>

      {!notification.is_read && (
        <TouchableOpacity
          style={styles.readButton}
          onPress={onMarkAsRead}
        >
          <Text style={styles.readIcon}>●</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
      >
        <Text style={styles.deleteIcon}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  unreadBadge: {
    backgroundColor: '#007aff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  markAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  markAllText: {
    color: '#007aff',
    fontSize: 14,
    fontWeight: '600'
  },
  card: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  unreadCard: {
    backgroundColor: '#f8f9ff'
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12
  },
  content: {
    flex: 1
  },
  body: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
  },
  readButton: {
    padding: 8,
    marginLeft: 8
  },
  readIcon: {
    color: '#007aff',
    fontSize: 12
  },
  deleteButton: {
    padding: 8
  },
  deleteIcon: {
    fontSize: 24,
    color: '#ccc'
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40
  }
})
```

### 3.5 Badge Count for Unread Notifications

```typescript
// TabNavigator.tsx
import { useEffect, useState } from 'react'
import { notificationService } from '@/services/notificationService'
import { useAuth } from '@/contexts/AuthContext'

export function TabNavigator() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user?.id) return

    // Get initial count
    updateUnreadCount()

    // Subscribe to real-time changes
    const subscription = supabase
      .from('notifications')
      .on('INSERT', (payload) => {
        if (payload.new.user_id === user.id && !payload.new.is_read) {
          setUnreadCount(prev => prev + 1)
        }
      })
      .on('UPDATE', (payload) => {
        if (payload.new.user_id === user.id) {
          // If marked as read
          if (payload.new.is_read && !payload.old.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id])

  async function updateUnreadCount() {
    if (!user?.id) return
    const count = await notificationService.getUnreadCount(user.id)
    setUnreadCount(count)
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarBadge:
          route.name === 'Notifications' && unreadCount > 0 ? unreadCount : null,
      })}
    >
      {/* ... tabs ... */}
    </Tab.Navigator>
  )
}
```

---

## 4. Integration: Push + In-App Together

### Flow Diagram

```
Admin sends notification
    ↓
Backend processes (Expo + Database)
    ↓
├─ Sends to Expo Push Service
│   └─ Mobile receives (even if closed)
│       └─ User taps → App navigates
│
└─ Stores in notifications table
    └─ Mobile fetches in next sync
        └─ Shows in inbox
```

### Implementation

```typescript
// Combined notification handler
export function setupCompleteNotificationSystem(navigation) {
  // 1. Setup Expo push notification listener
  setupNotificationListeners(navigation)

  // 2. Periodically sync in-app notifications
  const syncInterval = setInterval(async () => {
    const user = await getCurrentUser()
    if (user?.id) {
      const notifications = await notificationService.getNotifications(user.id)
      // Update UI with latest notifications
      updateNotificationStore(notifications)
    }
  }, 30000) // Every 30 seconds

  // 3. Listen for real-time changes (Supabase)
  const subscription = supabase
    .from('notifications')
    .on('INSERT', async (payload) => {
      const user = await getCurrentUser()
      if (payload.new.user_id === user?.id) {
        // Show banner/toast
        showNotificationBanner(payload.new)
      }
    })
    .subscribe()

  return () => {
    clearInterval(syncInterval)
    subscription.unsubscribe()
  }
}
```

---

## 5. Notification Types & Examples

### Type 1: Subscription Notifications

```json
{
  "title": "Trial Ending Soon",
  "body": "Your 7-day trial expires tomorrow",
  "data": {
    "screen": "Subscriptions",
    "type": "trial_ending"
  }
}
```

### Type 2: Content Notifications

```json
{
  "title": "New Learning Content",
  "body": "Module 2.1 is now available",
  "data": {
    "screen": "Learning",
    "moduleId": "2.1",
    "type": "content_available"
  }
}
```

### Type 3: Progress Notifications

```json
{
  "title": "Great Progress!",
  "body": "You've completed 50% of this month's goals",
  "data": {
    "screen": "Dashboard",
    "type": "milestone"
  }
}
```

### Type 4: Instructor Notifications

```json
{
  "title": "Message from Instructor",
  "body": "Your instructor responded to your question",
  "data": {
    "screen": "Messages",
    "messageId": "msg_123",
    "senderId": "instructor_456",
    "type": "instructor_message"
  }
}
```

---

## 6. Deep Linking Handling

```typescript
// DeepLinkHandler.ts
interface NotificationData {
  screen: string
  params?: Record<string, any>
}

export function handleDeepLink(data: NotificationData, navigation) {
  // Validate screen exists
  const validScreens = [
    'Dashboard',
    'Learning',
    'Practice',
    'MockExams',
    'Messages',
    'Subscriptions',
    'Profile'
  ]

  if (!validScreens.includes(data.screen)) {
    console.warn('Invalid screen:', data.screen)
    return
  }

  // Navigate with params
  navigation.navigate(data.screen, data.params || {})
}
```

---

## 7. Error Handling

```typescript
// NotificationErrorHandler.ts
export const NOTIFICATION_ERRORS = {
  PERMISSION_DENIED: {
    message: 'Notifications are disabled. Enable in settings.',
    action: 'openSettings'
  },
  TOKEN_FAILED: {
    message: 'Could not get device token',
    action: 'retry'
  },
  NETWORK_ERROR: {
    message: 'Could not sync notifications',
    action: 'retry'
  },
  DATABASE_ERROR: {
    message: 'Error loading notifications',
    action: 'retry'
  }
}

async function handleNotificationError(error, action) {
  console.error('Notification error:', error)

  switch (action) {
    case 'openSettings':
      // Open device notification settings
      openSettings('notification')
      break
    case 'retry':
      // Retry after delay
      setTimeout(() => retryNotificationSync(), 5000)
      break
  }
}
```

---

## 8. Testing & Debugging

### Manual Testing - Push Notifications

```typescript
// Test sending notification manually
async function testPushNotification() {
  try {
    const token = await getExpoPushToken()
    
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Host': 'exp.host',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title: 'Test Notification',
        body: 'This is a test push notification',
        data: { screen: 'Dashboard' }
      })
    })

    const result = await response.json()
    console.log('Test push result:', result)
  } catch (error) {
    console.error('Test failed:', error)
  }
}
```

### Debugging Checklist

- [ ] Permissions granted (`Settings` → `Notifications` → enable)
- [ ] Device has internet connection
- [ ] Expo Push Token successfully obtained
- [ ] Token registered with backend
- [ ] Admin sent notification (check in admin panel)
- [ ] Notification handler setup correctly
- [ ] Deep linking parameters valid
- [ ] App not in doze/battery saver mode

---

## 9. Implementation Checklist

### Phase 1: Setup & Permissions
- [ ] Install expo-notifications
- [ ] Request notification permissions
- [ ] Get Expo push token
- [ ] Register token with backend on login
- [ ] Update token on logout

### Phase 2: Push Notifications
- [ ] Setup notification handler
- [ ] Setup foreground listener (app open)
- [ ] Setup tap handler (user clicked)
- [ ] Implement deep linking
- [ ] Handle notification when app closed
- [ ] Test receiving notifications

### Phase 3: In-App Notifications
- [ ] Create NotificationInbox screen
- [ ] Implement notification fetching
- [ ] Implement mark as read
- [ ] Implement delete notification
- [ ] Add unread badge to tab
- [ ] Real-time sync with Supabase

### Phase 4: Integration
- [ ] Push + In-App work together
- [ ] Notification center shows all types
- [ ] Deep links navigate correctly
- [ ] Error handling implemented
- [ ] Permissions denied handled gracefully

### Phase 5: Testing
- [ ] Send test notifications from admin
- [ ] Test on real device
- [ ] Test with app closed
- [ ] Test with app open
- [ ] Test deep linking
- [ ] Test offline behavior

---

## 10. API Endpoints (Already Ready ✅)

```
GET /api/notifications/user/:userId
├─ Get all notifications for user
└─ Response: [{ id, title, body, is_read, created_at }, ...]

PUT /api/notifications/:notificationId/read
├─ Mark notification as read
└─ Response: { success: true }

DELETE /api/notifications/:notificationId
├─ Delete notification
└─ Response: { success: true }

POST /api/push-tokens/register
├─ Register device push token
└─ Body: { userId, expoPushToken, deviceName, osType }

GET /api/notifications/unread-count/:userId
├─ Get unread notification count
└─ Response: { unreadCount: 5 }
```

---

## 11. Best Practices

✅ **DO:**
- Request permissions on first app launch
- Show badge count on tab icon
- Test on real device (not simulator)
- Handle permission denial gracefully
- Validate deep link parameters
- Sync notifications periodically
- Handle offline gracefully

❌ **DON'T:**
- Send notifications too frequently (spam)
- Require notifications (let users disable)
- Send large images (use small icons)
- Store sensitive data in notification data
- Use notifications for non-critical alerts
- Ignore permission denials

---

## 12. Summary

| Feature | Push | In-App |
|---------|------|--------|
| **Works when app closed** | ✅ | ❌ |
| **System alert** | ✅ | ❌ |
| **Stored in database** | ❌ | ✅ |
| **Persistent** | ❌ | ✅ |
| **Searchable** | ❌ | ✅ |
| **Mark as read** | ❌ | ✅ |
| **Delete** | ❌ | ✅ |
| **Admin panel** | ✅ | ✅ |

---

**Backend:** ✅ Production Ready  
**Mobile Implementation:** Complete Guide Above  
**Testing:** Use admin panel to send test notifications
