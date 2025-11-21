import React from 'react'
import { View, Text, ScrollView, Switch, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNotificationPreferences } from '@/hooks/useNotifications'
import { Colors, DesignSystem } from '@/constants/DesignSystem'

export default function NotificationSettingsScreen() {
  const { preferences, loading, updatePreferences, updating } = useNotificationPreferences()

  const handleToggle = (key: keyof typeof preferences) => {
    if (!preferences) return
    updatePreferences({
      ...preferences,
      [key]: !preferences[key],
    })
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notification Settings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>

          <SettingRow
            label="Push Notifications"
            description="Receive alerts on your device"
            value={preferences?.push_enabled || false}
            onValueChange={() => handleToggle('push_enabled')}
            disabled={updating}
          />

          <SettingRow
            label="In-App Notifications"
            description="See notifications in the app"
            value={preferences?.in_app_enabled || false}
            onValueChange={() => handleToggle('in_app_enabled')}
            disabled={updating}
          />

          <SettingRow
            label="Email Notifications"
            description="Receive updates via email"
            value={preferences?.email_enabled || false}
            onValueChange={() => handleToggle('email_enabled')}
            disabled={updating}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Preferences</Text>

          <SettingRow
            label="Subscription Alerts"
            description="Expiring subscriptions & renewals"
            value={preferences?.subscription_expiring_enabled || false}
            onValueChange={() => handleToggle('subscription_expiring_enabled')}
            disabled={updating}
          />

          <SettingRow
            label="Content Approved"
            description="When content is approved"
            value={preferences?.content_approved_enabled || false}
            onValueChange={() => handleToggle('content_approved_enabled')}
            disabled={updating}
          />

          <SettingRow
            label="Marketing & Promotions"
            description="Special offers & announcements"
            value={preferences?.marketing_enabled || false}
            onValueChange={() => handleToggle('marketing_enabled')}
            disabled={updating}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Manage which types of notifications you want to receive. You can change these
            settings anytime.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function SettingRow({
  label,
  description,
  value,
  onValueChange,
  disabled,
}: {
  label: string
  description: string
  value: boolean
  onValueChange: () => void
  disabled: boolean
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#d1d5db', true: Colors.primary.light }}
        thumbColor={value ? Colors.primary.main : '#9ca3af'}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 24,
  },
  section: {
    gap: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.text.tertiary,
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: Colors.accent.lightBlue,
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
})
