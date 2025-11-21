# Notification Implementation Plan

**Date**: November 21, 2025  
**Status**: Ready for Implementation  
**Reference**: `docs/MOBILE_NOTIFICATIONS_IMPLEMENTATION_GUIDE.md`

---

## Overview

Two-layer notification system:
1. **Push Notifications** - Expo-based for app-wide alerts (even when closed)
2. **In-App Notifications** - Database-backed inbox (like email)

---

## Phase 1: Foundation & Permission Setup (Turn 1)

### 1.1 Create Notification Types (`src/types/notifications.ts`)
**Responsibility**: TypeScript interfaces for notifications

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
  quietHoursStart?: string
  quietHoursEnd?: string
}

interface PushToken {
  id: string
  userId: string
  expoPushToken: string
  deviceId: string
  platform: string
  isActive: boolean
}
```

### 1.2 Create Notification Service (`src/api/notifications.ts`)
**Responsibility**: All Supabase queries for notifications

```typescript
// Functions:
- getUnreadNotifications(userId)
- getAllNotifications(userId, limit, offset)
- getUnreadCount(userId)
- markAsRead(notificationId)
- markAllAsRead(userId)
- deleteNotification(notificationId)
- getNotificationPreferences(userId)
- updateNotificationPreferences(userId, prefs)
```

### 1.3 Create Notification Hooks (`src/hooks/useNotifications.ts`)
**Responsibility**: React Query hooks for notification management

```typescript
// Functions:
- useNotifications() - Main hook for fetching notifications
- useUnreadCount() - Get count of unread notifications
- useNotificationPreferences() - Fetch user preferences
- useMarkAsRead() - Mark single notification read
- useMarkAllAsRead() - Mark all as read
- useDeleteNotification() - Delete notification
```

### 1.4 Create Push Token Manager (`src/lib/PushTokenManager.ts`)
**Responsibility**: Get and manage Expo push tokens

```typescript
// Functions:
- requestNotificationPermissions()
- getExpoPushToken()
- registerPushToken(userId)
- savePushTokenLocally(token)
- getPushTokenLocally()
```

---

## Phase 2: Notification Handlers & Setup (Turn 1-2)

### 2.1 Create Notification Handler (`src/lib/NotificationHandler.ts`)
**Responsibility**: Setup Expo notification listeners

```typescript
// Functions:
- setupNotificationHandler()
- setupNotificationListeners(navigation)
- handleNotificationResponse(notification)
- handleDeepLink(data)
```

### 2.2 Create Badge Count Hook (`src/hooks/useBadgeCount.ts`)
**Responsibility**: Real-time badge count with Supabase subscriptions

```typescript
// Functions:
- useBadgeCount() - Get real-time unread count
- setupBadgeSubscription(userId)
- updateBadgeCount()
```

---

## Phase 3: UI Screens (Turn 2)

### 3.1 Create Notification Inbox Screen (`app/(tabs)/notifications.tsx`)
**Responsibility**: Display in-app notifications

```typescript
// Features:
- List all notifications
- Mark as read/unread
- Delete notifications
- Real-time updates
- Pull-to-refresh
- Empty state
- Loading state
```

### 3.2 Create Notification Card Component (`src/components/NotificationCard.tsx`)
**Responsibility**: Individual notification display

```typescript
// Features:
- Title and body
- Image support
- Timestamp
- Read indicator
- Delete button
- Mark as read button
```

### 3.3 Create Notification Preferences Screen (`app/(tabs)/notification-settings.tsx`)
**Responsibility**: User notification preferences

```typescript
// Features:
- Toggle push notifications
- Toggle in-app notifications
- Toggle email notifications
- Quiet hours settings
```

---

## Phase 4: Integration with App (Turn 2)

### 4.1 Add Push Token Registration on Login
**Location**: `app/auth/signin.tsx` or `context/AuthContext.ts`

```typescript
// When user signs in:
- Request notification permissions
- Get Expo push token
- Register token with backend
- Save locally
```

### 4.2 Setup Notification Listeners in App Root
**Location**: `app/_layout.tsx` or root navigator

```typescript
// On app launch:
- Setup notification handlers
- Setup badge count subscription
- Check for notification that opened app
- Handle deep linking
```

### 4.3 Add Badge Count to Tab Navigator
**Location**: Bottom tab navigation

```typescript
// For Notifications tab:
- Show unread count badge
- Real-time updates
- Hide when count is 0
```

---

## Implementation Checklist

### ✅ Phase 1 (This Turn)
- [ ] Create `src/types/notifications.ts`
- [ ] Create `src/api/notifications.ts`
- [ ] Create `src/hooks/useNotifications.ts`
- [ ] Create `src/lib/PushTokenManager.ts`
- [ ] Install expo-notifications and expo-device

### ✅ Phase 2 (Next Turn)
- [ ] Create `src/lib/NotificationHandler.ts`
- [ ] Create `src/hooks/useBadgeCount.ts`
- [ ] Setup notification listeners in app root
- [ ] Test permission requests

### ✅ Phase 3-4 (Future Turns)
- [ ] Create notification inbox screen
- [ ] Create notification card component
- [ ] Create notification preferences screen
- [ ] Add badge count to tabs
- [ ] Integrate with auth flow
- [ ] End-to-end testing

---

## Database Tables Used

All tables already exist in Supabase:

```
✅ notifications - In-app notifications
  id, user_id, title, body, image_url, data (JSONB),
  is_read, created_at, read_at

✅ notification_preferences - User settings
  id, user_id, push_enabled, email_enabled, in_app_enabled,
  quiet_hours_start, quiet_hours_end

✅ push_tokens - Device tokens
  id, user_id, expo_push_token, device_id, platform, is_active
```

---

## API Integration Points

All backend endpoints ready:

```
Backend Ready:
✅ GET /api/notifications/user/:userId
✅ GET /api/notifications/unread/count/:userId
✅ POST /api/notifications/:id/read
✅ POST /api/notifications/mark-all-read/:userId
✅ DELETE /api/notifications/:id
✅ GET /api/notification-preferences/:userId
✅ PUT /api/notification-preferences/:userId
✅ POST /api/push-tokens/register
```

---

## Environment Setup

### 1. Expo Project ID
Get from `app.json`:
```json
{
  "expo": {
    "plugins": [
      ["expo-notifications"]
    ],
    "extra": {
      "projectId": "YOUR_EXPO_PROJECT_ID"
    }
  }
}
```

### 2. Permissions (Already in app.json)
```json
{
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/notification-icon.png",
        "color": "#ffffff"
      }
    ]
  ]
}
```

---

## Key Integration Points

### On User Sign In
```typescript
const user = await signIn(email, password)
if (user) {
  const hasPermission = await requestNotificationPermissions()
  if (hasPermission) {
    await registerPushToken(user.id)
  }
}
```

### In App Root Layout
```typescript
useEffect(() => {
  setupNotificationHandler()
  setupNotificationListeners(navigation)
  setupBadgeSubscription(userId)
}, [userId])
```

### On Notification Tab Tap
```typescript
<Tab.Navigator>
  <Tab.Screen
    name="Notifications"
    component={NotificationInboxScreen}
    options={{
      tabBarBadge: unreadCount > 0 ? unreadCount : null,
    }}
  />
</Tab.Navigator>
```

---

## Success Criteria

✅ User receives push notifications even when app is closed  
✅ Unread count badge appears on Notifications tab  
✅ In-app notification inbox displays all notifications  
✅ Users can mark notifications as read/unread  
✅ Users can delete notifications  
✅ Real-time updates when new notification arrives  
✅ Deep linking works when user taps notification  
✅ Notification preferences can be toggled  
✅ Quiet hours respected (no notifications during set times)  

---

## Notes

- All push tokens stored in Supabase `push_tokens` table
- In-app notifications synced via Supabase real-time subscriptions
- Badge count updates in real-time using Supabase subscriptions
- Notifications persist in database - not deleted when read
- Two-layer system ensures no notification is missed
