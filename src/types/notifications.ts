export interface InAppNotification {
  id: string
  user_id: string
  title: string
  body: string
  image_url?: string | null
  data?: Record<string, any> | null
  is_read: boolean
  created_at: string
  read_at?: string | null
}

export interface NotificationPreferences {
  id: string
  user_id: string
  push_enabled: boolean
  email_enabled: boolean
  in_app_enabled: boolean
  subscription_expiring_enabled?: boolean
  content_approved_enabled?: boolean
  marketing_enabled?: boolean
  quiet_hours?: {
    start?: string
    end?: string
  } | null
  created_at?: string
  updated_at?: string
}

export interface PushToken {
  id: string
  user_id: string
  expo_push_token: string
  device_id: string
  platform: string
  is_active: boolean
  last_seen_at?: string | null
  created_at?: string
}

export interface NotificationPayload {
  title: string
  body: string
  imageUrl?: string
  data?: {
    screen?: string
    params?: Record<string, any>
  }
  badge?: number
}

export interface NotificationResponse {
  success: boolean
  message?: string
  data?: any
}

export type NotificationFilterType = 'all' | 'unread' | 'read'
