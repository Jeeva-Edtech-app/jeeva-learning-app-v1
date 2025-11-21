import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<{ granted: boolean }> {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return { granted: false };
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const granted = finalStatus === 'granted';

      if (!granted) {
        console.log('Permission not granted for push notifications');
      }

      return { granted };
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return { granted: false };
    }
  }

  static async registerForPushNotifications(userId: string): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    try {
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

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      const expoPushToken = token.data;
      const deviceId = Constants.deviceId || Device.modelId || 'unknown';
      const platform = Platform.OS as 'ios' | 'android';

      await this.saveTokenToDatabase(userId, expoPushToken, deviceId, platform);

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

  private static async saveTokenToDatabase(
    userId: string,
    expoPushToken: string,
    deviceId: string,
    platform: 'ios' | 'android'
  ) {
    try {
      const { data: existingToken } = await supabase
        .from('push_tokens')
        .select('id')
        .eq('user_id', userId)
        .eq('expo_push_token', expoPushToken)
        .maybeSingle();

      if (existingToken) {
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

  static async scheduleStudyReminder(hour: number, minute: number): Promise<string | null> {
    try {
      // Use a loosely-typed trigger to avoid SDK type compatibility issues
      const trigger = {
        hour,
        minute,
        repeats: true,
      } as any;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Study Reminder',
          body: 'Time to continue your Jeeva learning!',
          sound: true,
        },
        trigger,
      });

      return id;
    } catch (error) {
      console.error('Error scheduling study reminder:', error);
      return null;
    }
  }

  static async scheduleExamReminder(daysBeforeExam: number): Promise<string | null> {
    try {
      const triggerDate = new Date();
      triggerDate.setDate(triggerDate.getDate() + daysBeforeExam);

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Exam Reminder',
          body: 'Your exam is coming up soon. Open Jeeva to revise key topics.',
          sound: true,
        },
        trigger: triggerDate as any,
      });

      return id;
    } catch (error) {
      console.error('Error scheduling exam reminder:', error);
      return null;
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }
}
