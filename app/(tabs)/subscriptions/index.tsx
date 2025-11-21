import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import SubscriptionPlanCard from '@/components/SubscriptionPlanCard';
import { Colors, DesignSystem } from '@/constants/DesignSystem';

export default function SubscriptionPlansScreen() {
  const { data: plans, isLoading, error } = useSubscriptionPlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedPlanId) {
      Alert.alert('Please select a plan');
      return;
    }

    const selectedPlan = plans?.find((p) => p.id === selectedPlanId);
    if (selectedPlan) {
      router.push({
        pathname: '/subscriptions/checkout',
        params: { planId: selectedPlan.id, planName: selectedPlan.name, planPrice: selectedPlan.price_usd },
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loaderText}>Loading plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load subscription plans</Text>
          <TouchableOpacity style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade Plan</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.plansContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Unlock unlimited access</Text>
          <Text style={styles.heroSubtitle}>Get full access to all features and content</Text>
        </View>

        {plans?.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            name={plan.name}
            price={plan.price_usd}
            duration={`${plan.duration_days} days`}
            features={plan.features || []}
            isPopular={plan.duration_days === 365}
            isSelected={selectedPlanId === plan.id}
            onSelect={() => setSelectedPlanId(plan.id)}
          />
        ))}

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary.main} />
          <Text style={styles.infoText}>Secure payment · No hidden charges · Cancel anytime</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedPlanId && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedPlanId}
        >
          <Text style={styles.continueButtonText}>Continue to Payment</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  plansContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  infoCard: {
    marginHorizontal: 16,
    marginVertical: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  continueButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
