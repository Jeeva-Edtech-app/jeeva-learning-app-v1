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
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Colors, DesignSystem } from '@/constants/DesignSystem'

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.85}>
          <Ionicons name='arrow-back' size={20} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription plans</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroHeaderLeft}>
              <View style={styles.heroBadge}>
                <Ionicons name='ribbon-outline' size={16} color={Colors.primary.main} />
                <Text style={styles.heroBadgeText}>Tailored for NMC CBT success</Text>
              </View>
              <Text style={styles.heroTitle}>Choose the plan that matches your revision sprint</Text>
              <Text style={styles.heroSubtitle}>
                Lessons, flashcards, mock exams, and JeevaBot support are included in every subscription. Scale up when you need deeper analytics or mentor guidance.
              </Text>
            </View>
            <View style={styles.heroAside}>
              <Text style={styles.heroAsideHeading}>Every plan includes</Text>
              <View style={styles.heroAsideList}>
                <View style={styles.heroAsideItem}>
                  <Ionicons name='checkmark-circle' size={16} color={Colors.primary.main} />
                  <Text style={styles.heroAsideText}>Structured learning pathways</Text>
                </View>
                <View style={styles.heroAsideItem}>
                  <Ionicons name='checkmark-circle' size={16} color={Colors.primary.main} />
                  <Text style={styles.heroAsideText}>Unlimited flashcards & quizzes</Text>
                </View>
                <View style={styles.heroAsideItem}>
                  <Ionicons name='checkmark-circle' size={16} color={Colors.primary.main} />
                  <Text style={styles.heroAsideText}>Progress analytics & reminders</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.heroMetricsRow}>
            {heroMetrics.map((metric) => (
              <View key={metric.label} style={styles.heroMetric}>
                <Text style={styles.heroMetricValue}>{metric.value}</Text>
                <Text style={styles.heroMetricLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.planStack}>
          {plans.map((plan) => (
            <View key={plan.id} style={[styles.planCard, plan.badge ? styles.planCardEmphasis : null]}>
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
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planHeadline}>{plan.headline}</Text>
                </View>
                <View style={[styles.planPriceBadge, { backgroundColor: plan.color }]}>
                  <Text style={styles.planPrice}>₹{plan.price}</Text>
                  <Text style={styles.planDuration}>{plan.duration}</Text>
                </View>
              </View>

              <View style={styles.planFeatures}>
                {plan.features.map((feature) => (
                  <View key={feature} style={styles.featureRow}>
                    <Ionicons name='checkmark-circle' size={18} color={Colors.primary.main} />
                    <Text style={styles.featureText}>{feature}</Text>
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
            <Text style={styles.sectionTitle}>Why learners choose Jeeva</Text>
            <Text style={styles.sectionSubtitle}>
              Everything is tuned for the UK NMC CBT—from lessons to AI support.
            </Text>
          </View>

          <View style={styles.benefitGrid}>
            {benefitBlocks.map((benefit) => (
              <View key={benefit.title} style={styles.benefitCard}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={benefit.icon} size={20} color={Colors.primary.main} />
                </View>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitCopy}>{benefit.copy}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Frequently asked questions</Text>
        </View>
        <View style={styles.faqStack}>
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.question
            return (
              <View key={faq.question} style={styles.faqCard}>
                <Pressable style={styles.faqHeader} onPress={() => setOpenFaqId(isOpen ? null : faq.question)}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Colors.text.secondary}
                  />
                </Pressable>
                {isOpen && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
              </View>
            )
          })}
        </View>

        <View style={styles.supportCard}>
          <View style={styles.supportHeader}>
            <Ionicons name='help-buoy-outline' size={20} color={Colors.primary.main} />
            <View style={styles.supportHeaderCopy}>
              <Text style={styles.supportTitle}>Need a custom plan?</Text>
              <Text style={styles.supportSubtitle}>
                Chat with our support team for cohort pricing or mentor bundles.
              </Text>
            </View>
          </View>
          <Pressable style={styles.supportButton} onPress={() => Alert.alert('Support', 'We will connect you soon!')}>
            <Text style={styles.supportButtonText}>Contact support</Text>
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
    backgroundColor: Colors.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 24,
  },
  heroCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
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
    backgroundColor: '#EEF2FF',
  },
  heroBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.primary.main,
  },
  heroAside: {
    flex: 1.2,
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 16,
    gap: 10,
  },
  heroAsideHeading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
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
    color: Colors.text.secondary,
  },
  heroTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.text.primary,
    lineHeight: 26,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
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
    color: Colors.text.primary,
  },
  heroMetricLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  planStack: {
    gap: 16,
  },
  planCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
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
    color: Colors.text.primary,
  },
  planHeadline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
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
    color: Colors.text.primary,
  },
  planDuration: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.primary,
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
    color: Colors.text.secondary,
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
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  benefitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefitCard: {
    flexBasis: '48%',
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 16,
    gap: 8,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
  },
  benefitCopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  faqStack: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
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
    color: Colors.text.primary,
  },
  faqAnswer: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  supportCard: {
    marginTop: 8,
    backgroundColor: Colors.background.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.ui.border,
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
    color: Colors.text.primary,
  },
  supportSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supportButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary.main,
  },
})
