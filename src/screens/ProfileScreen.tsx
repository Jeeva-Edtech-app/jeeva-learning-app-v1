import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/hooks/useProfile';
import { useSubscriptionStatus } from '@/hooks/useSubscription';
import { usePerformanceStats } from '@/hooks/usePerformance';
import { InnerPageHeader } from '@/components/ui/InnerPageHeader';
import { Colors } from '@/constants/DesignSystem';
import { useState, useEffect, useRef } from 'react';
import PerformanceDashboardScreen from '@/screens/PerformanceDashboardScreen';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id || '');
  const { data: subscription, isLoading: subLoading } = useSubscriptionStatus(user?.id);
  const { isLoading: perfLoading } = usePerformanceStats(user?.id);

  const [activeTab, setActiveTab] = useState(0);
  const pulseAnimation = useRef(new Animated.Value(0)).current;

  const tabs = [
    { id: 0, label: 'Learning', icon: 'trending-up' },
    { id: 1, label: 'Account', icon: 'card' },
    { id: 2, label: 'Profile', icon: 'person' },
    { id: 3, label: 'Settings', icon: 'settings' },
  ];

  // Pulse animation for progress indicator border
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnimation]);

  const getUserInitials = () => {
    if (!profile?.full_name) return 'U';
    const names = profile.full_name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const getOAuthBadge = () => {
    if (!profile?.auth_provider || profile.auth_provider === 'email') {
      return { icon: 'mail-outline' as const, label: 'Email Account' };
    }
    if (profile.auth_provider === 'google') {
      return { icon: 'logo-google' as const, label: 'Google Account' };
    }
    if (profile.auth_provider === 'apple') {
      return { icon: 'logo-apple' as const, label: 'Apple Account' };
    }
    return { icon: 'mail-outline' as const, label: 'Email Account' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', color: '#10B981', bg: '#D1FAE5' };
      case 'trial':
        return { label: 'Trial', color: '#F59E0B', bg: '#FEF3C7' };
      case 'expired':
        return { label: 'Expired', color: '#EF4444', bg: '#FEE2E2' };
      default:
        return { label: 'Inactive', color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (profileLoading || subLoading || perfLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <InnerPageHeader title="Profile" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const oauthBadge = getOAuthBadge();

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab
          ]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Text
            style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Progress & Learning Tab
        return <PerformanceDashboardScreen />;

      case 1: // Subscription & Account Tab
        return (
          <View>
            {/* Subscription Status Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subscription Status</Text>
              <View style={styles.card}>
                {subscription?.hasActiveSubscription && subscription.subscription ? (
                  <>
                    <Text style={styles.planName}>
                      {subscription.subscription.plan?.name || 'Premium Plan'}
                    </Text>

                    <View style={styles.statusBadgeContainer}>
                      {(() => {
                        const badge = getStatusBadge(subscription.subscription.status);
                        return (
                          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                            <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                              {badge.label}
                            </Text>
                          </View>
                        );
                      })()}
                    </View>

                    <Text style={styles.daysRemaining}>
                      {subscription.daysRemaining} days left
                    </Text>

                    <Text style={styles.expiryDate}>
                      Expires on: {formatDate(subscription.subscription.end_date)}
                    </Text>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${subscription.progressPercentage}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {subscription.daysUsed}/{subscription.totalDays} days used
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.trialEmoji}>🎁</Text>
                    <Text style={styles.trialTitle}>Free Trial Mode</Text>
                    <Text style={styles.trialSubtitle}>Upgrade to unlock full access</Text>
                    <Pressable style={styles.upgradeButton}>
                      <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>

            {/* Account Menu Group */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.card}>
                {/* Subscription Plans */}
                <Pressable
                  style={[styles.menuItem, styles.menuItemBorder]}
                  onPress={() => router.push('/subscriptions')}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconContainer}>
                      <Ionicons name="card-outline" size={20} color="#3B82F6" />
                    </View>
                    <Text style={styles.menuItemText}>Subscription Plans</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </Pressable>

                {/* Discount Coupons */}
                <Pressable style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconContainer}>
                      <Ionicons name="pricetag-outline" size={20} color="#3B82F6" />
                    </View>
                    <Text style={styles.menuItemText}>Discount Coupons</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </Pressable>
              </View>
            </View>
          </View>
        );

      case 2: // Edit Profile Tab
        return (
          <View>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getUserInitials()}</Text>
              </View>
              <Text style={styles.userName}>{profile?.full_name || user?.user_metadata?.full_name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || profile?.email || 'Loading...'}</Text>

              <View style={styles.oauthBadge}>
                <Ionicons name={oauthBadge.icon} size={14} color="#6B7280" />
                <Text style={styles.oauthText}>{oauthBadge.label}</Text>
              </View>

              <Pressable style={styles.editButton} onPress={() => router.push('/complete-profile')}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </Pressable>
            </View>
          </View>
        );

      case 3: // Settings & Support Tab
        return (
          <View>
            {/* Settings and Support Menu Group */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings & Support</Text>
              <View style={styles.card}>
                {/* Settings */}
                <Pressable
                  style={[styles.menuItem, styles.menuItemBorder]}
                  onPress={() => router.push('/(tabs)/settings')}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconContainer}>
                      <Ionicons name="settings-outline" size={20} color="#3B82F6" />
                    </View>
                    <Text style={styles.menuItemText}>Settings</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </Pressable>

                {/* Support & Help */}
                <Pressable style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconContainer}>
                      <Ionicons name="call-outline" size={20} color="#3B82F6" />
                    </View>
                    <Text style={styles.menuItemText}>Support & Help</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </Pressable>
              </View>
            </View>

            {/* Additional Settings Section - App Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>App Information</Text>
              <View style={styles.card}>
                <Text style={styles.appVersionText}>Jeeva Learning app V: 1.01</Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <InnerPageHeader title="Profile" />
      {renderTabBar()}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderTabContent()}

        {/* Common logout button at bottom for all tabs */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    marginBottom: 12,
  },
  oauthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginBottom: 16,
  },
  oauthText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter_500Medium',
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    fontFamily: 'Inter_500Medium',
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter_700Bold',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 1,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Modern Progress Indicator
  modernCircularProgress: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    borderColor: '#E2E8F0',
  },
  progressCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modernReadinessScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    fontFamily: 'Inter_700Bold',
  },
  modernReadinessLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Inter_600SemiBold',
    marginTop: 8,
    textAlign: 'center',
  },

  // Animated pulsing border
  animatedBorder: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 170,
    height: 170,
    borderRadius: 85,
    transform: [{ translateX: -85 }, { translateY: -85 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 4,
    borderColor: '#3B82F6',
    backgroundColor: 'transparent',
  },

  // Subscription
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  daysRemaining: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  expiryDate: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
  },
  trialEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  trialTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  trialSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  upgradeButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },

  // Performance
          readinessContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  circularProgress: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: '#E5E7EB',
  },
  progressRingFill: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: '#3B82F6',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-135deg' }],
    opacity: 0.8,
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  readinessScore: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter_700Bold',
  },
  readinessLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter_600SemiBold',
    marginTop: 4,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
  },
  analyticsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    fontFamily: 'Inter_500Medium',
  },

  // Menu
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily: 'Inter_500Medium',
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    fontFamily: 'Inter_600SemiBold',
  },
  appVersionText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },

  activeTab: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 20,
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  activeTabLabel: {
    fontSize: 11,
    color: '#3B82F6',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
});
