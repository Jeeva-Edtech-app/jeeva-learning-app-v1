import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useUserProfile } from '@/hooks/useProfile';
import { InnerPageHeader } from '@/components/ui/InnerPageHeader';
import { Colors, DesignSystem } from '@/constants/DesignSystem';
import { supabase } from '@/lib/supabase';
import Constants from 'expo-constants';
import { NotificationService } from '@/services/notificationService';
import { showToast } from '@/utils/toast';

interface NotificationSettings {
  pushNotifications: boolean;
  studyReminders: boolean;
  examUpdates: boolean;
  aiRecommendations: boolean;
}

interface AppPreferences {
  language: 'english' | 'hindi';
  theme: 'light' | 'dark' | 'system';
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user?.id || '');
  const { themeMode, setThemeMode } = useTheme();

  const [notifications, setNotifications] = useState<NotificationSettings>({
    pushNotifications: true,
    studyReminders: true,
    examUpdates: true,
    aiRecommendations: true,
  });

  const [preferences, setPreferences] = useState<AppPreferences>({
    language: 'english',
    theme: themeMode,
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const isEmailUser = profile?.auth_provider === 'email';
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const fullName = profile?.full_name?.trim() || 'Nurse';
  const userEmail = profile?.email || user?.email || 'support@jeevalearning.com';
  const initials = fullName
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Load saved preferences
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [notifData, prefData] = await Promise.all([
        AsyncStorage.getItem('notification_settings'),
        AsyncStorage.getItem('app_preferences'),
      ]);

      if (notifData) setNotifications(JSON.parse(notifData));
      if (prefData) setPreferences(JSON.parse(prefData));
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveNotificationSetting = async (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(updated));
      
      if (key === 'pushNotifications' && value) {
        const result = await NotificationService.requestPermissions();
        if (!result.granted) {
          showToast.error('Please enable notifications in your device settings to receive updates.');
          updated[key] = false;
          setNotifications(updated);
          return;
        }
      }
      
      if (key === 'studyReminders') {
        const studyReminderIdKey = 'study_reminder_notification_id';
        if (value) {
          const notificationId = await NotificationService.scheduleStudyReminder(9, 0);
          if (notificationId) {
            await AsyncStorage.setItem(studyReminderIdKey, notificationId);
          }
        } else {
          const notificationId = await AsyncStorage.getItem(studyReminderIdKey);
          if (notificationId) {
            await NotificationService.cancelNotification(notificationId);
            await AsyncStorage.removeItem(studyReminderIdKey);
          }
        }
      }
      
      if (key === 'examUpdates') {
        const examReminderIdKey = 'exam_reminder_notification_id';
        if (value) {
          const notificationId = await NotificationService.scheduleExamReminder(7);
          if (notificationId) {
            await AsyncStorage.setItem(examReminderIdKey, notificationId);
          }
        } else {
          const notificationId = await AsyncStorage.getItem(examReminderIdKey);
          if (notificationId) {
            await NotificationService.cancelNotification(notificationId);
            await AsyncStorage.removeItem(examReminderIdKey);
          }
        }
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const savePreference = async (key: keyof AppPreferences, value: string) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    try {
      if (key === 'theme') {
        setThemeMode(value as 'light' | 'dark' | 'system');
      }
      await AsyncStorage.setItem('app_preferences', JSON.stringify(updated));
      showToast.success('Preference saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      showToast.error('Failed to save preference');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showToast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      showToast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast.error('Passwords do not match');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      showToast.success('Password updated successfully!');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showToast.error(error.message || 'Failed to update password');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => setShowDeleteModal(true),
        },
      ]
    );
  };

  const handleConfirmDelete = async () => {
    if (!deletePassword) {
      showToast.error('Password required to confirm deletion');
      return;
    }

    // Here you would verify password and delete account
    // For now, just show the contact support message
    setShowDeleteModal(false);
    setDeletePassword('');
    
    showToast.info('Account deletion is pending. Please contact support@jeevalearning.com to complete the process.');
  };

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Link open error:', error);
      showToast.error('Could not open link');
    }
  };

  const sendEmail = async () => {
    try {
      await Linking.openURL('mailto:support@jeevalearning.com?subject=Support Request');
    } catch (error) {
      console.error('Email client open error:', error);
      showToast.error('Could not open email client');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <InnerPageHeader title="Settings" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>{initials}</Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{fullName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileAction}
              onPress={() => router.push('/complete-profile')}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={18} color={Colors.primary.main} />
              <Text style={styles.profileActionText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ACCOUNT SETTINGS */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Account settings</Text>
          <View style={styles.card}>
            {/* Edit Profile */}
            <Pressable
              style={[styles.row, styles.rowBorder]}
              onPress={() => router.push('/complete-profile')}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="person-outline" size={20} color={Colors.text.primary} />
                <Text style={styles.rowText}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            {/* Change Password (email only) */}
            {isEmailUser && (
              <Pressable
                style={[styles.row, styles.rowBorder]}
                onPress={() => setShowPasswordModal(true)}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.text.primary} />
                  <Text style={styles.rowText}>Change Password</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            )}

            {/* Delete Account */}
            <Pressable style={styles.row} onPress={handleDeleteAccount}>
              <View style={styles.rowLeft}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text style={[styles.rowText, styles.dangerText]}>Delete Account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </Pressable>
          </View>
        </View>

        {/* NOTIFICATION SETTINGS */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Notifications</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowBorder]}>
              <View style={styles.rowLeft}>
                <Ionicons name="notifications-outline" size={20} color={Colors.text.primary} />
                <Text style={styles.rowText}>Push Notifications</Text>
              </View>
              <Switch
                value={notifications.pushNotifications}
                onValueChange={(value) =>
                  saveNotificationSetting('pushNotifications', value)
                }
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.row, styles.rowBorder]}>
              <View style={styles.rowLeft}>
                <Ionicons name="alarm-outline" size={20} color={Colors.text.primary} />
                <Text style={styles.rowText}>Study Reminders</Text>
              </View>
              <Switch
                value={notifications.studyReminders}
                onValueChange={(value) => saveNotificationSetting('studyReminders', value)}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.row, styles.rowBorder]}>
              <View style={styles.rowLeft}>
                <Ionicons name="school-outline" size={20} color={Colors.text.primary} />
                <Text style={styles.rowText}>Exam Updates</Text>
              </View>
              <Switch
                value={notifications.examUpdates}
                onValueChange={(value) => saveNotificationSetting('examUpdates', value)}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="bulb-outline" size={20} color={Colors.text.primary} />
                <Text style={styles.rowText}>AI Recommendations</Text>
              </View>
              <Switch
                value={notifications.aiRecommendations}
                onValueChange={(value) =>
                  saveNotificationSetting('aiRecommendations', value)
                }
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* APP PREFERENCES */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>App preferences</Text>
          <View style={styles.card}>
            <Pressable
              style={[styles.row, styles.rowBorder]}
              onPress={() => {
                Alert.alert(
                  'Language',
                  'Choose your preferred language',
                  [
                    {
                      text: 'English',
                      onPress: () => savePreference('language', 'english'),
                    },
                    {
                      text: 'Hindi (Coming Soon)',
                      onPress: () =>
                        Alert.alert('Coming Soon', 'Hindi language support will be added soon!'),
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="language-outline" size={20} color={Colors.text.primary} />
                <Text style={styles.rowText}>Language</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.valueText}>
                  {preferences.language === 'english' ? 'English' : 'Hindi'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </Pressable>

            <Pressable
              style={styles.row}
              onPress={() => {
                Alert.alert(
                  'Theme',
                  'Choose your preferred theme',
                  [
                    {
                      text: 'Light',
                      onPress: () => savePreference('theme', 'light'),
                    },
                    {
                      text: 'Dark (Coming Soon)',
                      onPress: () =>
                        Alert.alert('Coming Soon', 'Dark mode will be added soon!'),
                    },
                    {
                      text: 'System',
                      onPress: () => savePreference('theme', 'system'),
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="contrast-outline" size={20} color={Colors.text.primary} />
                <Text style={styles.rowText}>Theme</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.valueText}>
                  {preferences.theme.charAt(0).toUpperCase() + preferences.theme.slice(1)}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* LEGAL & SUPPORT */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Legal & support</Text>
          <View style={styles.card}>
            <Pressable
              style={[styles.row, styles.rowBorder]}
              onPress={() => openLink('https://jeevalearning.com/terms')}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="document-text-outline" size={20} color={Colors.text.primary} />
                <Text style={styles.rowText}>Terms & Conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable
              style={[styles.row, styles.rowBorder]}
              onPress={() => openLink('https://jeevalearning.com/privacy')}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.text.primary} />
                <Text style={styles.rowText}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable style={styles.row} onPress={sendEmail}>
              <View style={styles.rowLeft}>
                <Ionicons name="mail-outline" size={20} color={Colors.text.primary} />
                <Text style={styles.rowText}>Contact Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version {appVersion}</Text>
          <Text style={styles.versionSubtext}>Jeeva Learning © 2025</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <Pressable onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter new password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />

              <Pressable style={styles.modalButton} onPress={handleChangePassword}>
                <Text style={styles.modalButtonText}>Update Password</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: '#EF4444' }]}>Confirm Deletion</Text>
              <Pressable
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
              >
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.warningText}>
                ⚠️ This action cannot be undone. Please enter your password to confirm account deletion.
              </Text>

              <Text style={styles.inputLabel}>Your Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                secureTextEntry
                value={deletePassword}
                onChangeText={setDeletePassword}
                autoCapitalize="none"
              />

              <Pressable style={[styles.modalButton, styles.dangerButton]} onPress={handleConfirmDelete}>
                <Text style={styles.modalButtonText}>Delete Forever</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    gap: 28,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    ...DesignSystem.platformShadows.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontSize: 22,
    color: '#1D4ED8',
    fontFamily: 'Inter_700Bold',
  },
  profileDetails: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontFamily: 'Inter_400Regular',
  },
  profileAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
  },
  profileActionText: {
    fontSize: 13,
    color: Colors.primary.main,
    fontFamily: 'Inter_600SemiBold',
  },
  section: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    ...DesignSystem.platformShadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontFamily: 'Inter_400Regular',
  },
  valueText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
  },
  dangerText: {
    color: '#EF4444',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
  },
  versionSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Inter_700Bold',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    marginTop: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  modalButton: {
    height: 48,
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  warningText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
});
