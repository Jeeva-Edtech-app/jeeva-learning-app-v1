import React, { useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Colors, DesignSystem } from '@/constants/DesignSystem'
import { useTheme } from '@/context/ThemeContext'

// Theme-aware color mappings
const getThemeColors = (colorScheme: 'light' | 'dark' | null) => {
  const isDark = colorScheme === 'dark'
  return {
    background: isDark ? '#111827' : '#F5F7FA',
    card: isDark ? '#1F2937' : '#FFFFFF',
    cardAlt: isDark ? '#111827' : '#F9FAFB',
    text: isDark ? '#F3F4F6' : '#111827',
    textSecondary: isDark ? '#D1D5DB' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    badgeBg: isDark ? '#1E293B' : '#EEF2FF',
  }
}

type PlanTier = 'starter' | 'growth' | 'pro' | 'enterprise'

interface Plan {
  id: PlanTier
  name: string
  price: number
  duration: string
  headline: string
  badge?: 'popular' | 'best_value'
  color: string
  cta: string
  features: string[]
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 599,
    duration: '30 days access',
    headline: 'Perfect for first-time takers beginning their journey.',
    color: '#DBEAFE',
    cta: 'Choose Starter',
    features: [
      'Guided learning modules',
      'Daily practice drills (10 topics)',
      '2 mock-exam samplers',
      'JeevaBot (30 prompts)',
      'Baseline analytics dashboard',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 999,
    duration: '60 days access',
    headline: 'Our most popular plan with room for iterative practice.',
    badge: 'popular',
    color: '#C7D2FE',
    cta: 'Upgrade to Growth',
    features: [
      'All learning modules unlocked',
      'Unlimited practice questions',
      '4 full-length mock exams',
      'JeevaBot (100 prompts)',
      'Adaptive analytics with topic insights',
      'Mentor nudges & study reminders',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 1299,
    duration: '90 days access',
    headline: 'For serious aspirants targeting a confident pass.',
    badge: 'best_value',
    color: '#BBF7D0',
    cta: 'Go Pro',
    features: [
      'Everything in Growth',
      '8 full-length mock exams',
      'Unlimited JeevaBot support',
      'Deep-dive analytics & AI recommendations',
      'Live cohort webinars',
      'Priority mentor feedback',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 1699,
    duration: '120 days access',
    headline: 'Extended runway with concierge-level mentoring.',
    color: '#FED7AA',
    cta: 'Talk to us',
    features: [
      'All Pro features',
      '10+ mock exams with timed review',
      'Career planning toolkit',
      'Dedicated mentor check-ins',
      'Interview readiness resources',
      'Exportable analytics reports',
    ],
  },
]

const benefitBlocks = [
  {
    icon: 'sparkles-outline' as const,
    title: 'Curriculum built with UK nurses',
    copy: 'Lesson pathways and mock exams mirror the latest CBT blueprint.',
  },
  {
    icon: 'flash-outline' as const,
    title: 'Adaptive learning engine',
    copy: 'Analytics, flashcards, and AI nudges help you focus on weak areas.',
  },
  {
    icon: 'chatbubbles-outline' as const,
    title: 'JeevaBot at your side',
    copy: '24/7 CBT-focused assistant for clinical and numeracy questions.',
  },
]

const faqs = [
  {
    question: 'Can I switch plans later?',
    answer:
      'Yes. Upgrade anytime and we’ll pro-rate based on unused access so you keep your progress.',
  },
  {
    question: 'Do plans auto-renew?',
    answer:
      'No. Your access expires at the end of the plan duration. We remind you before expiry.',
  },
  {
    question: 'Do you offer group enrolments?',
    answer:
      'Yes. Contact our support team for hospital batches or mentorship cohorts and we’ll tailor pricing.',
  },
]

export default function SubscriptionPlansScreen() {
  const systemColorScheme = useColorScheme()
  const { colorScheme } = useTheme()
  const activeColorScheme = colorScheme || systemColorScheme
  const themeColors = getThemeColors(activeColorScheme)
  
  const [loadingPlan, setLoadingPlan] = useState<PlanTier | null>(null)
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.question ?? null)

  const handleSelect = (plan: Plan) => {
    if (plan.id === 'enterprise') {
      Alert.alert(
        'Talk to us',
        'Our concierge team will reach out with a tailored enterprise package.',
        [{ text: 'OK', style: 'default' }],
      )
      return
    }

    setLoadingPlan(plan.id)
    setTimeout(() => {
      setLoadingPlan(null)
      Alert.alert(
        'Plan Selected',
        `You selected the ${plan.name} plan (${plan.duration}). Payment gateway coming soon.`,
        [{ text: 'OK', style: 'default' }],
      )
    }, 800)
  }

  const heroMetrics = useMemo(
    () => [
      { label: 'Pass goal', value: '90%' },
      { label: 'Mock exams', value: '10+' },
      { label: 'Nurses trained', value: '5k+' },
    ],
    [],
  )

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: themeColors.cardAlt }]} activeOpacity={0.85}>
          <Ionicons name='arrow-back' size={20} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Subscription plans</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroHeaderLeft}>
              <View style={[styles.heroBadge, { backgroundColor: themeColors.badgeBg }]}>
                <Ionicons name='ribbon-outline' size={16} color={Colors.primary.main} />
                <Text style={[styles.heroBadgeText, { color: Colors.primary.main }]}>Tailored for NMC CBT success</Text>
              </View>
              <Text style={[styles.heroTitle, { color: themeColors.text }]}>Choose the plan that matches your revision sprint</Text>
              <Text style={[styles.heroSubtitle, { color: themeColors.textSecondary }]}>
                Lessons, flashcards, mock exams, and JeevaBot support are included in every subscription. Scale up when you need deeper analytics or mentor guidance.
              </Text>
            </View>
            <View style={[styles.heroAside, { backgroundColor: themeColors.cardAlt, borderColor: themeColors.border }]}>
              <Text style={[styles.heroAsideHeading, { color: themeColors.text }]}>Every plan includes</Text>
              <View style={styles.heroAsideList}>
                <View style={styles.heroAsideItem}>
                  <Ionicons name='checkmark-circle' size={16} color={Colors.primary.main} />
                  <Text style={[styles.heroAsideText, { color: themeColors.textSecondary }]}>Structured learning pathways</Text>
                </View>
                <View style={styles.heroAsideItem}>
                  <Ionicons name='checkmark-circle' size={16} color={Colors.primary.main} />
                  <Text style={[styles.heroAsideText, { color: themeColors.textSecondary }]}>Unlimited flashcards & quizzes</Text>
                </View>
                <View style={styles.heroAsideItem}>
                  <Ionicons name='checkmark-circle' size={16} color={Colors.primary.main} />
                  <Text style={[styles.heroAsideText, { color: themeColors.textSecondary }]}>Progress analytics & reminders</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.heroMetricsRow}>
            {heroMetrics.map((metric) => (
              <View key={metric.label} style={styles.heroMetric}>
                <Text style={[styles.heroMetricValue, { color: themeColors.text }]}>{metric.value}</Text>
                <Text style={[styles.heroMetricLabel, { color: themeColors.textSecondary }]}>{metric.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.planStack}>
          {plans.map((plan) => (
            <View key={plan.id} style={[styles.planCard, { backgroundColor: themeColors.card, borderColor: plan.badge ? Colors.primary.main : themeColors.border }, plan.badge ? styles.planCardEmphasis : null]}>
              {plan.badge && (
                <View
                  style={[
                    styles.planBadge,
                    plan.badge === 'popular' ? styles.planBadgePopular : styles.planBadgeValue,
                  ]}
                >
                  <Ionicons
                    name={plan.badge === 'popular' ? 'flame' : 'sparkles'}
                    size={14}
                    color={Colors.text.inverse}
                  />
                  <Text style={styles.planBadgeLabel}>
                    {plan.badge === 'popular' ? 'Most popular' : 'Best value'}
                  </Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View style={styles.planTitleBlock}>
                  <Text style={[styles.planName, { color: themeColors.text }]}>{plan.name}</Text>
                  <Text style={[styles.planHeadline, { color: themeColors.textSecondary }]}>{plan.headline}</Text>
                </View>
                <View style={[styles.planPriceBadge, { backgroundColor: plan.color }]}>
                  <Text style={[styles.planPrice, { color: themeColors.text }]}>₹{plan.price}</Text>
                  <Text style={[styles.planDuration, { color: themeColors.text }]}>{plan.duration}</Text>
                </View>
              </View>

              <View style={styles.planFeatures}>
                {plan.features.map((feature) => (
                  <View key={feature} style={styles.featureRow}>
                    <Ionicons name='checkmark-circle' size={18} color={Colors.primary.main} />
                    <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.planButton}
                activeOpacity={0.9}
                onPress={() => handleSelect(plan)}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <ActivityIndicator size='small' color={Colors.text.inverse} />
                    <Text style={styles.planButtonText}>Preparing…</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.planButtonText}>{plan.cta}</Text>
                    <Ionicons name='arrow-forward' size={18} color={Colors.text.inverse} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.benefitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Why learners choose Jeeva</Text>
            <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>
              Everything is tuned for the UK NMC CBT—from lessons to AI support.
            </Text>
          </View>

          <View style={styles.benefitGrid}>
            {benefitBlocks.map((benefit) => (
              <View key={benefit.title} style={[styles.benefitCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <View style={[styles.benefitIcon, { backgroundColor: themeColors.badgeBg }]}>
                  <Ionicons name={benefit.icon} size={20} color={Colors.primary.main} />
                </View>
                <Text style={[styles.benefitTitle, { color: themeColors.text }]}>{benefit.title}</Text>
                <Text style={[styles.benefitCopy, { color: themeColors.textSecondary }]}>{benefit.copy}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Frequently asked questions</Text>
        </View>
        <View style={styles.faqStack}>
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.question
            return (
              <View key={faq.question} style={[styles.faqCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <Pressable style={styles.faqHeader} onPress={() => setOpenFaqId(isOpen ? null : faq.question)}>
                  <Text style={[styles.faqQuestion, { color: themeColors.text }]}>{faq.question}</Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={themeColors.textSecondary}
                  />
                </Pressable>
                {isOpen && <Text style={[styles.faqAnswer, { color: themeColors.textSecondary }]}>{faq.answer}</Text>}
              </View>
            )
          })}
        </View>

        <View style={[styles.supportCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.supportHeader}>
            <Ionicons name='help-buoy-outline' size={20} color={Colors.primary.main} />
            <View style={styles.supportHeaderCopy}>
              <Text style={[styles.supportTitle, { color: themeColors.text }]}>Need a custom plan?</Text>
              <Text style={[styles.supportSubtitle, { color: themeColors.textSecondary }]}>
                Chat with our support team for cohort pricing or mentor bundles.
              </Text>
            </View>
          </View>
          <Pressable style={styles.supportButton} onPress={() => Alert.alert('Support', 'We will connect you soon!')}>
            <Text style={[styles.supportButtonText, { color: Colors.primary.main }]}>Contact support</Text>
            <Ionicons name='arrow-forward' size={16} color={Colors.primary.main} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  headerPlaceholder: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 24,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 16,
    ...DesignSystem.platformShadows.sm,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  heroHeaderLeft: {
    flex: 2,
    gap: 12,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  heroAside: {
    flex: 1.2,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  heroAsideHeading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  heroAsideList: {
    gap: 8,
  },
  heroAsideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroAsideText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  heroTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 26,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroMetric: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  heroMetricValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
  },
  heroMetricLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  planStack: {
    gap: 16,
  },
  planCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    gap: 16,
    ...DesignSystem.platformShadows.sm,
  },
  planCardEmphasis: {
    borderColor: Colors.primary.main,
  },
  planBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  planBadgePopular: {
    backgroundColor: Colors.primary.main,
  },
  planBadgeValue: {
    backgroundColor: Colors.semantic.success,
  },
  planBadgeLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  planTitleBlock: {
    flex: 1,
    gap: 8,
  },
  planName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  planHeadline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  planPriceBadge: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 110,
  },
  planPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  planDuration: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    opacity: 0.75,
  },
  planFeatures: {
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
  },
  planButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.inverse,
  },
  benefitsSection: {
    gap: 16,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  sectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  benefitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefitCard: {
    flexBasis: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  benefitCopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  faqStack: {
    gap: 12,
  },
  faqCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  faqAnswer: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  supportCard: {
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    ...DesignSystem.platformShadows.sm,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  supportHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  supportTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  supportSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supportButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
})
