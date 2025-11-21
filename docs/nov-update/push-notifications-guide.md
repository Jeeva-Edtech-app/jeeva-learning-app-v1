# Push Notifications Integration Guide for Jeeva Learning Mobile App

## Overview

This guide provides complete instructions for integrating Expo Push Notifications into the Jeeva Learning mobile app. The admin portal can send both manual and automated push notifications to users through this system.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Setup & Installation](#setup--installation)
3. [Push Token Registration](#push-token-registration)
4. [Handling Notifications](#handling-notifications)
5. [Deep Linking](#deep-linking)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## System Architecture

### How It Works

```
┌────────────────────┐
│   Admin Portal     │
│                    │
│  1. Compose        │
│  2. Target Users   │
│  3. Schedule/Send  │
└──────────┬─────────┘
           │
           ▼
┌────────────────────┐
│  Supabase DB       │
│                    │
│  - notifications   │
│  - push_tokens     │
│  - targets         │
└──────────┬─────────┘
           │
           ▼
┌────────────────────┐
│  Edge Function     │
│                    │
│  Process Queue     │
│  Call Expo Push    │
└──────────┬─────────┘
           │
           ▼
┌────────────────────┐
│   Expo Push        │
│   Service          │
│                    │
│   FCM/APNs         │
└──────────┬─────────┘
           │
           ▼
┌────────────────────┐
│   Mobile App       │
│                    │
│   User's Device    │
└────────────────────┘
```

### Database Tables

- **push_tokens**: Stores user device tokens
- **notifications**: Campaign data and status
- **notification_targets**: Delivery tracking per user
- **notification_queue**: Scheduling and retry logic

---

## Setup & Installation

### 1. Install Dependencies

```bash
npx expo install expo-notifications expo-device expo-constants
```

### 2. Configure app.json

Add the following to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#007AFF",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#007AFF",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications"
    },
    "android": {
      "googleServicesFile": "./google-services.json",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSUserNotificationsUsageDescription": "This app uses notifications to keep you updated on your learning progress and important updates."
      }
    }
  }
}
```

### 3. Create Notification Service

Create `src/services/notificationService.ts`:

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  /**
   * Register for push notifications and save token to database
   */
  static async registerForPushNotifications(userId: string): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted for push notifications');
        return null;
      }

      // Get Expo Push Token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      const expoPushToken = token.data;

      // Get device info
      const deviceId = Constants.deviceId || Device.modelId || 'unknown';
      const platform = Platform.OS as 'ios' | 'android';

      // Save token to Supabase
      await this.saveTokenToDatabase(userId, expoPushToken, deviceId, platform);

      // Configure Android channel (required for Android 8.0+)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#007AFF',
        });
      }

      return expoPushToken;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Save push token to Supabase database
   */
  private static async saveTokenToDatabase(
    userId: string,
    expoPushToken: string,
    deviceId: string,
    platform: 'ios' | 'android'
  ) {
    try {
      // Check if token already exists
      const { data: existingToken } = await supabase
        .from('push_tokens')
        .select('id')
        .eq('user_id', userId)
        .eq('expo_push_token', expoPushToken)
        .maybeSingle();

      if (existingToken) {
        // Update existing token
        await supabase
          .from('push_tokens')
          .update({
            is_active: true,
            last_seen_at: new Date().toISOString(),
            device_id: deviceId,
            platform,
          })
          .eq('id', existingToken.id);
      } else {
        // Insert new token
        await supabase.from('push_tokens').insert({
          user_id: userId,
          expo_push_token: expoPushToken,
          device_id: deviceId,
          platform,
          is_active: true,
          last_seen_at: new Date().toISOString(),
        });
      }

      console.log('Push token saved to database');
    } catch (error) {
      console.error('Error saving push token to database:', error);
      throw error;
    }
  }

  /**
   * Unregister push notifications (e.g., on logout)
   */
  static async unregisterPushNotifications(userId: string) {
    try {
      await supabase
        .from('push_tokens')
        .update({ is_active: false })
        .eq('user_id', userId);
      
      console.log('Push token deactivated');
    } catch (error) {
      console.error('Error deactivating push token:', error);
    }
  }

  /**
   * Update last seen timestamp (call periodically when app is active)
   */
  static async updateLastSeen(userId: string) {
    try {
      await supabase
        .from('push_tokens')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_active', true);
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  }
}
```

---

## Push Token Registration

### Register on Login

In your authentication flow, register for push notifications after successful login:

```typescript
// src/screens/LoginScreen.tsx or AuthContext.tsx

import { NotificationService } from '@/services/notificationService';

const handleLogin = async (email: string, password: string) => {
  try {
    // 1. Authenticate user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const userId = data.user.id;

    // 2. Register for push notifications
    const token = await NotificationService.registerForPushNotifications(userId);
    
    if (token) {
      console.log('Push notifications enabled');
    } else {
      console.log('Push notifications not available');
    }

    // 3. Navigate to app
    navigation.navigate('Home');
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

### Unregister on Logout

```typescript
const handleLogout = async () => {
  try {
    const userId = user?.id;

    if (userId) {
      await NotificationService.unregisterPushNotifications(userId);
    }

    await supabase.auth.signOut();
    navigation.navigate('Login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

---

## Handling Notifications

### Setup Notification Listeners

Create a custom hook to handle notifications:

```typescript
// src/hooks/useNotificationHandlers.ts

import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

export const useNotificationHandlers = () => {
  const navigation = useNavigation();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        // You can show a custom in-app notification here
      }
    );

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);

        // Extract data from notification
        const data = response.notification.request.content.data;

        // Handle deep linking based on notification data
        handleNotificationNavigation(data, navigation);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [navigation]);
};

/**
 * Navigate to appropriate screen based on notification data
 */
function handleNotificationNavigation(data: any, navigation: any) {
  if (!data) return;

  // Navigate based on screen type
  switch (data.screen) {
    case 'LessonDetails':
      navigation.navigate('LessonDetails', { lessonId: data.lessonId });
      break;

    case 'Practice':
      navigation.navigate('Practice', { moduleId: data.moduleId });
      break;

    case 'MockExam':
      navigation.navigate('MockExam', { examId: data.examId });
      break;

    case 'Subscription':
      navigation.navigate('Subscription');
      break;

    default:
      navigation.navigate('Home');
      break;
  }
}
```

### Use in App Component

```typescript
// App.tsx or Main Navigation Component

import { useNotificationHandlers } from '@/hooks/useNotificationHandlers';

function App() {
  useNotificationHandlers();

  return (
    <NavigationContainer>
      {/* Your navigation stack */}
    </NavigationContainer>
  );
}
```

---

## Deep Linking

### Notification Data Structure

When creating notifications in the admin portal, use this data structure for deep linking:

```json
{
  "screen": "LessonDetails",
  "lessonId": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Supported Deep Link Screens

| Screen | Data Fields | Description |
|--------|-------------|-------------|
| `LessonDetails` | `lessonId` | Opens specific lesson |
| `Practice` | `moduleId`, `topicId` | Opens practice mode |
| `MockExam` | `examId` | Opens mock exam |
| `Subscription` | - | Opens subscription page |
| `Home` | - | Opens home screen (default) |

### Example: Admin Portal Notification Creation

When composing notifications in the admin portal:

```typescript
// Admin Portal - Compose Tab Example
const notificationData = {
  screen: 'LessonDetails',
  lessonId: lesson.id,
  // Add any other contextual data
};

const notification = {
  title: 'New Lesson Available!',
  body: 'Check out the new lesson on Patient Safety',
  imageUrl: 'https://example.com/lesson-image.jpg',
  data: notificationData,
  audienceFilter: { type: 'all' },
};
```

---

## Testing

### Test on Physical Device

1. **Build Development Client:**
   ```bash
   eas build --profile development --platform ios
   # or
   eas build --profile development --platform android
   ```

2. **Install on Device:**
   - Install the development build on your physical device
   - Push notifications don't work in Expo Go

3. **Test Push Tokens:**
   ```typescript
   // Add this temporarily to test token registration
   const testTokenRegistration = async () => {
     const token = await NotificationService.registerForPushNotifications('test-user-id');
     console.log('Expo Push Token:', token);
     // Copy this token to test with Expo's push notification tool
   };
   ```

4. **Test Using Expo Push Tool:**
   - Visit: https://expo.dev/notifications
   - Paste your Expo Push Token
   - Send a test notification

### Test Notification Handling

```typescript
// Test different notification types
const testNotifications = [
  {
    title: 'Test: Lesson Link',
    body: 'Tap to open lesson',
    data: { screen: 'LessonDetails', lessonId: 'test-123' },
  },
  {
    title: 'Test: Practice Link',
    body: 'Tap to start practice',
    data: { screen: 'Practice', moduleId: 'module-123' },
  },
  {
    title: 'Test: Subscription',
    body: 'Your subscription expires soon',
    data: { screen: 'Subscription' },
  },
];
```

---

## Troubleshooting

### Common Issues

#### 1. "Push notifications only work on physical devices"

**Solution:** Use a real device, not a simulator/emulator.

---

#### 2. "Permission not granted for push notifications"

**Solution:** 
- Check device settings
- On iOS: Settings → Your App → Notifications
- On Android: Settings → Apps → Your App → Notifications

---

#### 3. "Token not being saved to database"

**Solution:**
- Verify Supabase connection
- Check RLS policies on `push_tokens` table
- Ensure user is authenticated before calling `registerForPushNotifications`

---

#### 4. "Notifications not received"

**Checklist:**
- [ ] Using physical device (not simulator)
- [ ] Permissions granted
- [ ] Token saved to database successfully
- [ ] App is running or in background (not force-closed)
- [ ] Notification sent from admin portal shows "sent" status

---

#### 5. "Deep linking not working"

**Solution:**
- Verify `data` field structure in notification
- Check navigation stack includes the target screen
- Add console logs to `handleNotificationNavigation` function

---

## Best Practices

### 1. Request Permissions at Right Time

Don't request notification permissions immediately on app launch. Ask when:
- User completes onboarding
- User subscribes to a plan
- User enables a feature that needs notifications

### 2. Handle Token Refresh

Expo Push Tokens can change. Update the token periodically:

```typescript
// In your app's useEffect or during active sessions
useEffect(() => {
  const interval = setInterval(async () => {
    if (userId) {
      await NotificationService.updateLastSeen(userId);
    }
  }, 24 * 60 * 60 * 1000); // Once per day

  return () => clearInterval(interval);
}, [userId]);
```

### 3. Test on Multiple Devices

Test push notifications on:
- iOS (different iOS versions)
- Android (different Android versions)
- Different device sizes

### 4. Monitor Delivery Rates

Check the admin portal's Campaigns tab to monitor:
- Delivery success rate
- Failed notifications
- User engagement (open rates)

---

## Integration Checklist

- [ ] Install `expo-notifications` and dependencies
- [ ] Configure `app.json` with notification settings
- [ ] Create `NotificationService` class
- [ ] Register for push notifications on login
- [ ] Unregister on logout
- [ ] Set up notification listeners
- [ ] Implement deep linking navigation
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Verify tokens are saved to database
- [ ] Test all deep link screens
- [ ] Add error handling and logging
- [ ] Update token periodically

---

## Additional Resources

- [Expo Notifications Documentation](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking/)

---

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review Expo's notification documentation
3. Test with Expo's push notification tool
4. Contact the backend team for database/Edge Function issues

---

**Last Updated:** January 2025  
**Version:** 1.0
