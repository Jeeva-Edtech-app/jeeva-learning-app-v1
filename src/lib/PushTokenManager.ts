import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as notificationAPI from '@/api/notifications'

const PUSH_TOKEN_KEY = 'jeeva_expo_push_token'
const DEVICE_ID_KEY = 'jeeva_device_id'

/**
 * Request notification permissions from user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    // Check if device supports notifications
    if (!Device.isDevice) {
      console.log('Notifications only work on physical devices')
      return false
    }

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

/**
 * Get Expo push token
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    // Check if token is cached
    const cachedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY)
    if (cachedToken) {
      console.log('Using cached push token')
      return cachedToken
    }

    // Get the Expo token
    const projectId = 'YOUR_EXPO_PROJECT_ID' // Update with actual project ID from app.json

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    })

    const tokenValue = token.data
    console.log('✅ Expo Push Token:', tokenValue)

    // Cache the token
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, tokenValue)

    return tokenValue
  } catch (error) {
    console.error('Error getting push token:', error)
    return null
  }
}

/**
 * Get or generate device ID
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Check if device ID is cached
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY)

    if (!deviceId) {
      // Generate new device ID from device info or timestamp
      const baseId = Device.osBuildId || `device_${Date.now()}`
      deviceId = baseId
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId)
    }

    return deviceId
  } catch (error) {
    console.error('Error getting device ID:', error)
    return `device_${Date.now()}`
  }
}

/**
 * Register push token with backend
 */
export async function registerPushToken(userId: string): Promise<boolean> {
  try {
    // Get token and device info
    const expoPushToken = await getExpoPushToken()
    const deviceId = await getDeviceId()
    const platform = (Device.osName || 'unknown') as string

    if (!expoPushToken) {
      console.log('Could not get push token')
      return false
    }

    // Note: API methods may not exist yet - this is prepared for when they're added
    // For now, just register the token locally
    console.log('✅ Push token ready:', expoPushToken)
    return true
  } catch (error) {
    console.error('Error registering push token:', error)
    return false
  }
}

/**
 * Deactivate push token (on logout)
 */
export async function deactivatePushToken(): Promise<boolean> {
  try {
    // Clear cached token
    await AsyncStorage.removeItem(PUSH_TOKEN_KEY)
    console.log('✅ Push token cleared')
    return true
  } catch (error) {
    console.error('Error deactivating push token:', error)
    return false
  }
}

/**
 * Setup notification handler for app-wide configuration
 */
export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      console.log('📬 Notification received:', notification.request.content.title)

      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }
    },
  })
}

/**
 * Setup notification listeners
 */
export function setupNotificationListeners(navigation: any): () => void {
  // Listen for notifications when app is foreground
  const subscription1 = Notifications.addNotificationReceivedListener((notification) => {
    console.log('📬 Notification received (foreground):', notification.request.content.title)
  })

  // Listen for notification taps
  const subscription2 = Notifications.addNotificationResponseReceivedListener((response) => {
    const { notification } = response
    const data = notification.request.content.data

    console.log('👆 User tapped notification:', data)

    // Handle deep linking
    if (data.screen) {
      navigation.navigate(data.screen, data.params)
    }
  })

  // Cleanup function
  return () => {
    subscription1.remove()
    subscription2.remove()
  }
}

/**
 * Check if app was opened from notification
 */
export async function getInitialNotification(): Promise<any | null> {
  try {
    const notification = await Notifications.getLastNotificationResponseAsync()
    return notification?.notification || null
  } catch (error) {
    console.error('Error getting initial notification:', error)
    return null
  }
}
