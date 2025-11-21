import { supabase } from '@/lib/supabase'

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
  async getUserNotifications(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<UserNotification[]> {
    try {
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
    } catch (error) {
      console.error('Failed to fetch user notifications:', error)
      return []
    }
  },

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      const { error } = await supabase.from('user_notification_reads').insert({
        user_id: userId,
        notification_id: notificationId,
      })

      if (error && !error.message.includes('duplicate key')) {
        console.error('Error marking notification as read:', error)
        throw error
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
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
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    try {
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
    } catch (error) {
      console.error('Failed to fetch unread notification count:', error)
      return 0
    }
  },

  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
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
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error)
      return null
    }
  },

  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update(preferences)
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating preferences:', error)
        throw error
      }
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
      throw error
    }
  },

  async deleteReadNotifications(userId: string): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId, 1000, 0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const toDelete = notifications.filter((n) => {
        if (!n.is_read || !n.read_at) return false
        
        const readDate = new Date(n.read_at)
        readDate.setHours(0, 0, 0, 0)
        
        return readDate.getTime() === today.getTime()
      })

      if (toDelete.length === 0) return

      const deletePromises = toDelete.map((n) =>
        supabase.from('user_notification_reads').delete().eq('notification_id', n.id).eq('user_id', userId)
      )

      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Failed to delete read notifications:', error)
    }
  },
}
