import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useSubscription } from '@/hooks/useSubscription'
import { useCountryDetection } from '@/hooks/useCountryDetection'
import { Colors, DesignSystem } from '@/constants/DesignSystem'

export default function PlansScreen() {
  const { plans, plansLoading, startTrial, startTrialLoading } = useSubscription()
  const { formatPrice, country } = useCountryDetection()
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null)

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    
    if (planId === 'free_trial') {
      Alert.alert(
        'Start Free Trial',
        'Enjoy 7 days of unlimited access to all features',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Trial',
            onPress: () => {
              startTrial()
              setTimeout(() => router.push('/(tabs)' as any), 1000)
            },
          },
        ],
      )
    } else {
      router.push(`/payments/processing?planId=${planId}` as any)
    }
    
    setTimeout(() => setSelectedPlan(null), 1000)
  }

  const getPlanBadge = (planId: string) => {
    if (planId === 'monthly') return 'Most Popular'
    if (planId === 'yearly') return 'Best Value'
    return null
  }

  if (plansLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={Colors.primary.main} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name='arrow-back' size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Unlock Your Potential</Text>
          <Text style={styles.heroSubtitle}>
            Choose a plan that works for your NMC CBT preparation journey
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            const badge = getPlanBadge(plan.id)
            const isSelected = selectedPlan === plan.id

            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  badge && styles.planCardHighlighted,
                  isSelected && styles.planCardSelected,
                ]}
                onPress={() => handleSelectPlan(plan.id)}
                activeOpacity={0.8}
              >
                {badge && (
                  <View style={styles.badgeContainer}>
                    <Ionicons
                      name={badge === 'Best Value' ? 'star' : 'flame'}
                      size={14}
                      color={Colors.text.inverse}
                    />
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                )}

                <Text style={styles.planName}>{plan.name}</Text>

                <View style={styles.priceSection}>
                  <Text style={styles.price}>{formatPrice(plan.price_usd)}</Text>
                  <Text style={styles.duration}>/{plan.billingPeriod === 'monthly' ? 'month' : 'year'}</Text>
                </View>

                <Text style={styles.description}>{plan.features.unlimitedPractice ? 'All features included' : 'Limited features'}</Text>

                <View style={styles.featuresContainer}>
                  {plan.features.learningModule && (
                    <View style={styles.featureItem}>
                      <Ionicons name='checkmark-circle' size={16} color={Colors.primary.main} />
                      <Text style={styles.featureText}>Learning Modules</Text>
                    </View>
                  )}
                  {plan.features.mockExams && (
                    <View style={styles.featureItem}>
                      <Ionicons name='checkmark-circle' size={16} color={Colors.primary.main} />
                      <Text style={styles.featureText}>Mock Exams</Text>
                    </View>
                  )}
                  {plan.features.aiChat && (
                    <View style={styles.featureItem}>
                      <Ionicons name='checkmark-circle' size={16} color={Colors.primary.main} />
                      <Text style={styles.featureText}>JeevaBot AI</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.selectButton, badge && styles.selectButtonPrimary]}
                  disabled={isSelected || startTrialLoading}
                >
                  {isSelected ? (
                    <>
                      <ActivityIndicator size='small' color={Colors.text.inverse} />
                      <Text style={styles.selectButtonText}>Processing...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.selectButtonText}>
                        {plan.id === 'free_trial' ? 'Start Free Trial' : 'Choose Plan'}
                      </Text>
                      <Ionicons name='arrow-forward' size={16} color={Colors.text.inverse} />
                    </>
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why Jeeva?</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name='shield-checkmark' size={20} color={Colors.primary.main} />
              <Text style={styles.infoText}>Secure & private with encrypted data</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name='flash' size={20} color={Colors.primary.main} />
              <Text style={styles.infoText}>Fast learning with AI-powered recommendations</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name='heart' size={20} color={Colors.primary.main} />
              <Text style={styles.infoText}>Trusted by 5000+ nurses</Text>
            </View>
          </View>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By selecting a plan, you agree to our Terms of Service and Privacy Policy
          </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 24,
  },
  heroSection: {
    gap: 8,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    backgroundColor: Colors.background.card,
    borderRadius: DesignSystem.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 16,
    gap: 12,
  },
  planCardHighlighted: {
    borderColor: Colors.primary.main,
    borderWidth: 2,
  },
  planCardSelected: {
    opacity: 0.7,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    fontSize: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary.main,
  },
  duration: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary.light,
    borderRadius: DesignSystem.borderRadius.md,
    paddingVertical: 12,
  },
  selectButtonPrimary: {
    backgroundColor: Colors.primary.main,
  },
  selectButtonText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
  },
  infoSection: {
    gap: 12,
    marginTop: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.accent.lightBlue,
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoText: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  termsSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
})
