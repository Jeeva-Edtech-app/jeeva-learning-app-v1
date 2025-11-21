import * as Notifications from 'expo-notifications'
import { setupNotificationHandler, setupNotificationListeners, getInitialNotification } from '@/lib/PushTokenManager'

/**
 * Initialize notification system for the app
 */
export async function initializeNotifications(navigation: any): Promise<void> {
  try {
    // Setup notification handler
    setupNotificationHandler()

    // Setup notification listeners
    const cleanup = setupNotificationListeners(navigation)

    // Check if app was opened from notification
    const initialNotification = await getInitialNotification()
    if (initialNotification) {
      handleNotificationTap(initialNotification, navigation)
    }

    // Store cleanup for later
    ;(global as any).notificationCleanup = cleanup
  } catch (error) {
    console.error('Error initializing notifications:', error)
  }
}

/**
 * Handle notification tap
 */
export function handleNotificationTap(notification: any, navigation: any): void {
  const data = notification.request?.content?.data

  if (!data) return

  // Handle deep linking
  if (data.screen) {
    navigation.navigate(data.screen, data.params)
  }
}

/**
 * Cleanup notification system
 */
export function cleanupNotifications(): void {
  const cleanup = (global as any).notificationCleanup
  if (cleanup && typeof cleanup === 'function') {
    cleanup()
  }
}
