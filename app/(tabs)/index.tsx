import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Modal,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { useState, useCallback, useEffect } from 'react'
import { useHeroSections } from '@/hooks/useHeroSections'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Skeleton } from '@/components/ui/Skeleton'
import { notificationAPI } from '@/api/notifications'
import { showToast } from '@/utils/toast'

export default function HomeScreen() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { data: heroSections, isLoading: heroLoading, error: heroError } = useHeroSections()
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(30)

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0]
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  const getInitial = () => {
    const name = getUserName()
    return name[0].toUpperCase()
  }

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (user?.id) {
        const count = await notificationAPI.getUnreadCount(user.id)
        setUnreadCount(count)
      }
    }
    loadUnreadCount()
  }, [user?.id])

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        Alert.alert('Do you want to exit?', '', [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', style: 'destructive', onPress: () => BackHandler.exitApp() },
        ])
        return true
      }

      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress)
      
      const refreshUnreadCount = async () => {
        if (user?.id) {
          const count = await notificationAPI.getUnreadCount(user.id)
          setUnreadCount(count)
        }
      }
      refreshUnreadCount()
      
      return () => subscription.remove()
    }, [user?.id]),
  )

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App Bar / Header */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/jeeva-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.rightHeaderGroup}>
            <Pressable 
              style={styles.notificationIcon}
              onPress={() => router.push('/notifications' as any)}
            >
              <Ionicons name="notifications-outline" size={24} color="#111827" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable style={styles.avatar} onPress={() => setShowProfileMenu(!showProfileMenu)}>
              <Text style={styles.avatarText}>{getInitial()}</Text>
            </Pressable>
          </View>

          {/* Full Height Sidebar Menu */}
          {showProfileMenu && (
            <Modal
              transparent={true}
              animationType="none"
              onRequestClose={() => setShowProfileMenu(false)}
            >
              <View style={styles.sidebarOverlay}>
                <TouchableOpacity
                  style={styles.sidebarBackdrop}
                  onPress={() => setShowProfileMenu(false)}
                />

                <View style={styles.sidebarContainer}>
                  {/* Header with Logo and Close Button */}
                  <View style={styles.sidebarHeader}>
                    <Image
                      source={require('@/assets/images/jeeva-logo.png')}
                      style={styles.sidebarLogo}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowProfileMenu(false)}
                    >
                      <Ionicons name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                  </View>

                  {/* User Profile Section */}
                  <View style={styles.sidebarProfile}>
                    <View style={styles.sidebarAvatar}>
                      <Text style={styles.sidebarAvatarText}>{getInitial()}</Text>
                    </View>
                    <View style={styles.sidebarUserInfo}>
                      <Text style={styles.sidebarUserName}>
                        {user?.user_metadata?.full_name || getUserName()}
                      </Text>
                      <Text style={styles.sidebarUserEmail}>{user?.email}</Text>
                    </View>
                  </View>

                  <View style={styles.sidebarDivider} />

                  {/* Navigation Items */}
                  <View style={styles.sidebarNav}>
                    <TouchableOpacity
                      style={styles.sidebarNavItem}
                      onPress={() => {
                        router.push('/profile')
                        setShowProfileMenu(false)
                      }}
                    >
                      <View style={styles.navIconContainer}>
                        <Ionicons name="person-outline" size={22} color="#4F46E5" />
                      </View>
                      <Text style={styles.navItemText}>Profile</Text>
                      <Ionicons name="chevron-forward-outline" size={18} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.sidebarNavItem}
                      onPress={() => {
                        router.push('/subscriptions')
                        setShowProfileMenu(false)
                      }}
                    >
                      <View style={styles.navIconContainer}>
                        <Ionicons name="card-outline" size={22} color="#059669" />
                      </View>
                      <Text style={styles.navItemText}>Subscriptions</Text>
                      <Ionicons name="chevron-forward-outline" size={18} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.sidebarNavItem}
                      onPress={() => {
                        router.push('/(tabs)/settings')
                        setShowProfileMenu(false)
                      }}
                    >
                      <View style={styles.navIconContainer}>
                        <Ionicons name="settings-outline" size={22} color="#D97706" />
                      </View>
                      <Text style={styles.navItemText}>Settings</Text>
                      <Ionicons name="chevron-forward-outline" size={18} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.sidebarNavItem}
                      onPress={() => {
                    router.push('/(tabs)/ai-assistant')
                        setShowProfileMenu(false)
                      }}
                    >
                      <View style={styles.navIconContainer}>
                        <Ionicons name="help-circle-outline" size={22} color="#7C3AED" />
                      </View>
                      <Text style={styles.navItemText}>Help & Support</Text>
                      <Ionicons name="chevron-forward-outline" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>

                  {/* Spacer */}
                  <View style={styles.sidebarSpacer} />

                  {/* Logout Button */}
                  <TouchableOpacity
                    style={styles.sidebarLogout}
                    onPress={() => {
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
                                await signOut()
                                setShowProfileMenu(false)
                                router.replace('/')
                              } catch (error) {
                                console.error('Logout error:', error)
                                showToast.error('Failed to logout. Please try again.')
                              }
                            },
                          },
                        ]
                      )
                    }}
                  >
                    <View style={styles.logoutIconContainer}>
                      <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                    </View>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Hi, {getUserName()}</Text>
          <Text style={styles.subtitle}>Find your lessons today!</Text>
        </View>

        {/* Hero Banner Section - Dynamic from Database */}
        <View style={styles.heroSection}>
          {heroLoading ? (
            <View style={styles.heroCard}>
              <Skeleton height={160} borderRadius={20} />
              <View style={styles.heroSkeletonContent}>
                <Skeleton width="70%" height={22} />
                <Skeleton width="55%" height={16} />
                <Skeleton width={120} height={40} borderRadius={12} />
              </View>
            </View>
          ) : heroSections && heroSections.length > 0 && heroSections[0] ? (
            <View style={styles.heroCard}>
              {heroSections[0].image_url && (
                <Image
                  source={{ uri: heroSections[0].image_url }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>
                  {heroSections[0].title || 'NO TITLE'}
                </Text>
                {heroSections[0].subtitle && (
                  <Text style={styles.heroSubtitle}>{heroSections[0].subtitle}</Text>
                )}
                {heroSections[0].cta_text && (
                  <Pressable
                    style={styles.heroButton}
                    onPress={() => router.push('/courses')}
                  >
                    <Text style={styles.heroButtonText}>{heroSections[0].cta_text}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ) : (
            <Text style={{ padding: 24, color: '#666' }}>
              Debug: Loading={String(heroLoading)}, Count={heroSections?.length || 0}, Error={heroError?.message || 'none'}
            </Text>
          )}
        </View>

        {/* Analytics Overview */}
        {analyticsLoading ? (
          <View style={styles.analyticsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bar-chart-outline" size={16} color="#111827" style={styles.sectionIcon} />
              <Text style={styles.sectionTitleSmall}>Analytics Overview</Text>
            </View>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCardContainer}>
                <View style={styles.modernAnalyticsCard}>
                  <Skeleton width="55%" height={18} />
                  <Skeleton width="40%" height={30} style={styles.skeletonSpacing} />
                  <Skeleton width="100%" height={8} borderRadius={4} />
                </View>
              </View>
              <View style={styles.analyticsCardContainer}>
                <View style={styles.modernAnalyticsCard}>
                  <Skeleton width="50%" height={18} />
                  <Skeleton width="35%" height={30} style={styles.skeletonSpacing} />
                  <Skeleton width="100%" height={8} borderRadius={4} />
                </View>
              </View>
            </View>
          </View>
        ) : analytics ? (
          <View style={styles.analyticsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bar-chart-outline" size={16} color="#111827" style={styles.sectionIcon} />
              <Text style={styles.sectionTitleSmall}>Analytics Overview</Text>
            </View>
            <View style={styles.analyticsGrid}>
              {/* Completion Card */}
              <View style={styles.analyticsCardContainer}>
                <View style={styles.modernAnalyticsCard}>
                  <View style={styles.iconRow}>
                    <View style={[styles.iconBadge, styles.completionIconBg]}>
                      <Ionicons name={analytics.completionRate > 20 ? "checkmark-circle" : "checkmark"} size={24} color="#16A34A" />
                    </View>
                    <View style={styles.metricColumn}>
                      <Text style={styles.metricLabel}>Completion</Text>
                      <Text style={styles.metricNumber}>{analytics.completionRate}%</Text>
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${analytics.completionRate}%`, backgroundColor: '#16A34A' }]} />
                  </View>
                </View>
              </View>

              {/* Premium Card */}
              <View style={styles.analyticsCardContainer}>
                <View style={styles.modernAnalyticsCard}>
                  <View style={styles.iconRow}>
                    <View style={[styles.iconBadge, styles.premiumIconBg]}>
                      <Ionicons name="star" size={24} color="#D97706" />
                    </View>
                    <View style={styles.metricColumn}>
                      <Text style={styles.metricLabel}>Subscriptions</Text>
                      <Text style={styles.metricNumber}>{analytics.subscriptionRate}%</Text>
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${analytics.subscriptionRate}%`, backgroundColor: '#D97706' }]} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <View style={styles.quickActionsGrid}>
            <Pressable style={styles.quickActionCard}>
              <View style={styles.quickActionIconCourses}>
                <Ionicons name="book-outline" size={24} color="#2563EB" />
              </View>
              <Text style={styles.quickActionLabel}>Courses</Text>
            </Pressable>

            <View style={styles.separator} />

            <Pressable style={styles.quickActionCard}>
              <View style={styles.quickActionIconPackages}>
                <Ionicons name="cube-outline" size={24} color="#059669" />
              </View>
              <Text style={styles.quickActionLabel}>Packages</Text>
            </Pressable>

            <View style={styles.separator} />

            <Pressable style={styles.quickActionCard}>
              <View style={styles.quickActionIconFeatures}>
                <Ionicons name="sparkles-outline" size={24} color="#7C3AED" />
              </View>
              <Text style={styles.quickActionLabel}>AI Features</Text>
            </Pressable>

            <View style={styles.separator} />

            <Pressable style={styles.quickActionCard}>
              <View style={styles.quickActionIconQueries}>
                <Ionicons name="help-circle-outline" size={24} color="#D97706" />
              </View>
              <Text style={styles.quickActionLabel}>Queries</Text>
            </Pressable>
          </View>
        </View>

        {/* Offer Card - "Welcome offer on paid plans" */}
        <View style={styles.offerSection}>
          <View style={styles.offerCard}>
            <Image
              source={{ uri: 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Jeeva%20Learning%20App/subscribe.png' }}
              style={styles.offerImage}
              resizeMode="cover"
            />
            <View style={styles.offerContent}>
              <Text style={styles.offerTitle}>
                Welcome {'\n'}Offers on paid{'\n'}plan
              </Text>
              <Pressable style={styles.offerButton} onPress={() => router.push('/subscriptions')}>
                <Text style={styles.offerButtonText}>Get offer</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Jeeva Learning app V: 1.01</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Header / App Bar
  header: {
    height: 80,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  logo: {
    width: 110,
    height: 80,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#F5F7FA',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  rightHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Greeting Section
  greetingSection: {
    paddingHorizontal: 18,
    marginTop: 40,
    marginBottom: 20,
  },
  greeting: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#8C8C8C',
  },

  // Hero/Promotion Card
  heroSection: {
    paddingHorizontal: 18,
    marginBottom: 14,
  },

  // Full Height Sidebar Menu
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarBackdrop: {
    flex: 1,
  },
  sidebarContainer: {
    width: 320,
    backgroundColor: '#FFFFFF',
    height: '100%',
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'column',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  sidebarLogo: {
    width: 90,
    height: 60,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  sidebarAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  sidebarUserInfo: {
    marginLeft: 20,
  },
  sidebarUserName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sidebarUserEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
  },
  sidebarNav: {
    flex: 1,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  navIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  sidebarSpacer: {
    flex: 1,
  },
  sidebarLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  logoutIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  logoutButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },

  // Analytics Overview
  analyticsSection: {
    paddingLeft: 28,
    paddingRight: 18,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 7,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  analyticsCardContainer: {
    flex: 1,
    width: '48%',
    minWidth: 160,
  },
  analyticsCardBackground: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  analyticsCardBackground2: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  customAnalyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  analyticsRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  skeletonSpacing: {
    marginTop: 12,
  },
  iconContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 18,
    padding: 10,
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  analyticsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.0,
    opacity: 0.8,
  },
  analyticsGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  titleSpacing: {
    width: 8,
  },
  analyticsTitleInline: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  heroCard: {
    height: 162,
    backgroundColor: 'transparent',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroContent: {
    width: '60%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 20,
    zIndex: 1,
    alignSelf: 'flex-start',
  },
  heroSkeletonContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 80,
    gap: 14,
  },
  heroTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 15,
    marginTop: 4,
    maxWidth: '90%',
  },
  heroButton: {
    height: 36,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: -4,
    marginBottom: 0,
    backgroundColor: 'rgba(217, 217, 217, 0.25)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  sectionTitleSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  quickActionCard: {
    flex: 1,
    padding: 12,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    width: 1,
    height: 60,
    backgroundColor: '#E5E7EB',
  },
  quickActionIconCourses: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIconPackages: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIconFeatures: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIconQueries: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#111827',
    marginTop: 8,
    textAlign: 'center',
  },

  // Offer Card
  offerSection: {
    paddingHorizontal: 18,
    marginTop: 7,
    marginBottom: 24,
  },
  offerCard: {
    height: 135,
    backgroundColor: 'transparent',
    borderRadius: 16,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  offerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  offerContent: {
    width: '60%',
    padding: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1,
    alignSelf: 'flex-end',
  },
  offerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 22,
    color: '#FFFFFF',
    textAlign: 'right',
    marginBottom: 16,
  },
  offerButton: {
    height: 36,
    backgroundColor: '#F36C6F',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // Version Text
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 24,
  },

  // Modern Analytics Cards
  modernAnalyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  modernGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    justifyContent: 'space-between',
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricColumn: {
    flex: 1,
    marginLeft: 12,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    letterSpacing: 0.0,
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  modernCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
  },
  completionIconBg: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  premiumIconBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },

  // Modern Profile Menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 120,
    paddingHorizontal: 18,
  },
  menuContainer: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
  },
  menuUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  menuUserDetails: {
    marginLeft: 16,
  },
  menuUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  menuUserEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#EF4444',
  },
})
