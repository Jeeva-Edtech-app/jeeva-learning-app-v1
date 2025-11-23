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
