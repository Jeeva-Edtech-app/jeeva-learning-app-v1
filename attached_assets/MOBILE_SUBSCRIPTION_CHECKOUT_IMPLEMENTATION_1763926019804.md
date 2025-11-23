# Mobile Subscription Checkout Implementation Guide

**Jeeva Learning Platform - Mobile Application**

**Date:** November 21, 2025  
**Version:** 1.0  
**Target:** React Native (iOS & Android)

---

## 1. Overview

This guide provides complete step-by-step instructions for implementing subscription purchase flow in your React Native mobile app. Users will be able to:

- View available subscription plans
- Select a plan (Monthly, Quarterly, Annual, Lifetime)
- Enter payment details
- Complete purchase with Stripe (International) or Razorpay (India)
- Receive confirmation and activate subscription

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         Mobile App - Subscription Flow                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  1. Fetch Available Plans        │
        │  GET /api/subscription-plans     │
        └──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  2. User Selects Plan            │
        │  Plan ID, Country Detection      │
        └──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  3. Detect Payment Gateway       │
        │  Country → Stripe or Razorpay    │
        └──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  4. Create Payment Intent        │
        │  POST /api/payments/create       │
        └──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  5. Present Payment Sheet        │
        │  Stripe or Razorpay Checkout UI  │
        └──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  6. Verify Payment               │
        │  POST /api/payments/verify       │
        └──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  7. Update User Subscription     │
        │  Create subscription record      │
        └──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  8. Show Success & Navigate      │
        │  Dashboard with full access      │
        └──────────────────────────────────┘
```

---

## 3. Prerequisites

### 3.1 Dependencies

Install required packages:

```bash
# Stripe integration
npm install @stripe/stripe-react-native

# Razorpay integration
npm install react-native-razorpay

# Payment utilities
npm install axios react-query

# UI components
npm install react-native-elements

# Utilities
npm install expo-localization
```

### 3.2 Environment Setup

Add to your `.env.local`:

```
# API Configuration
REACT_NATIVE_API_URL=https://your-api.com

# Stripe Keys (from Replit secrets)
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Razorpay Keys (from Replit secrets)
RAZORPAY_KEY_ID=rzp_test_xxx

# App Configuration
APP_NAME=Jeeva Learning
CURRENCY_USD=USD
CURRENCY_INR=INR
```

---

## 4. Setup Payment Providers

### 4.1 Stripe Setup

**Step 1: Initialize Stripe**

```typescript
// src/services/stripeSetup.ts
import { initStripe } from '@stripe/stripe-react-native';

export async function setupStripe() {
  await initStripe({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    merchantIdentifier: 'merchant.com.jeeva.learning',
    threeDSecureParams: {
      timeout: 5 * 60 * 1000, // 5 minutes
    },
  });
}
```

**Step 2: Initialize in App.tsx**

```typescript
import { useEffect } from 'react';
import { setupStripe } from './services/stripeSetup';

export default function App() {
  useEffect(() => {
    setupStripe();
  }, []);

  return (
    // Your app components
  );
}
```

### 4.2 Razorpay Setup

**Step 1: No explicit initialization needed**

Razorpay SDK initializes automatically when imported.

**Step 2: Configure in package.json**

```json
{
  "react-native-razorpay": {
    "linked": true
  }
}
```

---

## 5. Fetch and Display Subscription Plans

### 5.1 API Hook to Fetch Plans

```typescript
// src/hooks/useSubscriptionPlans.ts
import { useQuery } from 'react-query';
import axios from 'axios';

interface SubscriptionPlan {
  id: string;
  name: string;
  duration_days: number;
  price_usd: number;
  price_inr?: number;
  features: string[];
  config?: {
    ai_messages_per_day?: number;
    voice_tutoring_sessions?: number;
  };
}

export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlan[]>(
    'subscriptionPlans',
    async () => {
      const { data } = await axios.get(
        `${process.env.REACT_NATIVE_API_URL}/api/subscription-plans`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return data;
    },
    {
      staleTime: 60 * 60 * 1000, // 1 hour
      cacheTime: 2 * 60 * 60 * 1000, // 2 hours
    }
  );
}
```

### 5.2 Subscription Plan Card Component

```typescript
// src/components/SubscriptionPlanCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PlanCardProps {
  name: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
}

export default function SubscriptionPlanCard({
  name,
  price,
  currency,
  duration,
  features,
  isPopular = false,
  isSelected = false,
  onSelect,
}: PlanCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isPopular && styles.cardPopular,
      ]}
      onPress={onSelect}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>⭐ RECOMMENDED</Text>
        </View>
      )}

      <View style={styles.headerContainer}>
        <Text style={styles.planName}>{name}</Text>
        {isSelected && (
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color="#007aff"
          />
        )}
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>{currency} {price.toFixed(2)}</Text>
        <Text style={styles.billingPeriod}>per {duration}</Text>
      </View>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <MaterialCommunityIcons
              name="check"
              size={20}
              color="#34C759"
              style={styles.checkIcon}
            />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.selectButton,
          isSelected && styles.selectButtonActive,
        ]}
        onPress={onSelect}
      >
        <Text
          style={[
            styles.selectButtonText,
            isSelected && styles.selectButtonTextActive,
          ]}
        >
          {isSelected ? 'SELECTED' : 'SELECT PLAN'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSelected: {
    borderColor: '#007aff',
    backgroundColor: '#F0F8FF',
  },
  cardPopular: {
    borderColor: '#FFE0B2',
    backgroundColor: '#FFFAF0',
  },
  popularBadge: {
    backgroundColor: '#FFE0B2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E65100',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  priceContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007aff',
  },
  billingPeriod: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  featuresContainer: {
    marginVertical: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  selectButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonActive: {
    backgroundColor: '#007aff',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectButtonTextActive: {
    color: '#FFFFFF',
  },
});
```

### 5.3 Subscription Plans Screen

```typescript
// src/screens/SubscriptionPlansScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSubscriptionPlans } from '../hooks/useSubscriptionPlans';
import SubscriptionPlanCard from '../components/SubscriptionPlanCard';

export default function SubscriptionPlansScreen({ navigation }: any) {
  const { data: plans, isLoading, error } = useSubscriptionPlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const getCurrency = (plan: any) => {
    // Determine currency based on plan or user location
    return 'USD'; // TODO: detect based on user country
  };

  const handleContinue = () => {
    if (!selectedPlanId) {
      Alert.alert('Please select a plan');
      return;
    }

    const selectedPlan = plans?.find((p) => p.id === selectedPlanId);
    if (selectedPlan) {
      navigation.navigate('PaymentCheckout', {
        plan: selectedPlan,
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loaderText}>Loading plans...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load subscription plans</Text>
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upgrade Your Plan</Text>
        <Text style={styles.subtitle}>
          Unlock unlimited access to all features
        </Text>
      </View>

      <ScrollView
        style={styles.plansContainer}
        showsVerticalScrollIndicator={false}
      >
        {plans?.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            name={plan.name}
            price={plan.price_usd}
            currency={getCurrency(plan)}
            duration={`${plan.duration_days} days`}
            features={[
              '✓ Unlimited practice questions',
              '✓ Full learning modules',
              '✓ Unlimited mock exams',
              plan.config?.ai_messages_per_day &&
                `✓ ${plan.config.ai_messages_per_day} AI messages/day`,
              plan.config?.voice_tutoring_sessions &&
                `✓ ${plan.config.voice_tutoring_sessions} voice sessions/month`,
            ].filter(Boolean) as string[]}
            isPopular={plan.duration_days === 365} // Annual is popular
            isSelected={selectedPlanId === plan.id}
            onSelect={() => setSelectedPlanId(plan.id)}
          />
        ))}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Fixed Footer with Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedPlanId && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedPlanId}
        >
          <Text style={styles.continueButtonText}>Continue to Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
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
    backgroundColor: '#007aff',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  plansContainer: {
    flex: 1,
    marginBottom: 100,
  },
  spacer: {
    height: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
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
```

---

## 6. Country Detection & Gateway Selection

### 6.1 Country Detection Service

```typescript
// src/services/countryDetectionService.ts
import * as Localization from 'expo-localization';
import axios from 'axios';

export const countryDetectionService = {
  // Method 1: From device locale
  getCountryFromLocale(): string {
    const region = Localization.region;
    return region || 'US';
  },

  // Method 2: From user profile
  async getCountryFromProfile(userId: string): Promise<string> {
    try {
      const response = await axios.get(
        `${process.env.REACT_NATIVE_API_URL}/api/users/${userId}/profile`,
        {
          headers: { Authorization: `Bearer ${await getAuthToken()}` },
        }
      );
      return response.data.country_code || this.getCountryFromLocale();
    } catch (error) {
      console.error('Failed to get country from profile:', error);
      return this.getCountryFromLocale();
    }
  },

  // Method 3: From IP geolocation (fallback)
  async getCountryFromIP(): Promise<string> {
    try {
      const response = await axios.get('https://ipapi.co/json/');
      return response.data.country_code || 'US';
    } catch (error) {
      console.error('Failed to get country from IP:', error);
      return 'US';
    }
  },

  // Combined detection (recommended)
  async detectUserCountry(userId?: string): Promise<string> {
    try {
      if (userId) {
        return await this.getCountryFromProfile(userId);
      }
    } catch (error) {
      console.log('Profile detection failed, trying locale...');
    }

    return this.getCountryFromLocale();
  },
};
```

### 6.2 Payment Gateway Selection

```typescript
// src/services/paymentGatewaySelector.ts
export const paymentGatewaySelector = {
  selectGateway(countryCode: string): 'stripe' | 'razorpay' {
    if (countryCode === 'IN') {
      return 'razorpay';
    }
    return 'stripe';
  },

  getGatewayInfo(gateway: 'stripe' | 'razorpay') {
    if (gateway === 'razorpay') {
      return {
        name: 'Razorpay',
        methods: ['UPI', 'Cards', 'Net Banking', 'Wallets'],
        description: 'UPI, Cards, Net Banking, Digital Wallets',
        icon: 'razorpay',
      };
    }

    return {
      name: 'Stripe',
      methods: ['Cards', 'Apple Pay', 'Google Pay'],
      description: 'Credit/Debit Cards, Apple Pay, Google Pay',
      icon: 'stripe',
    };
  },
};
```

---

## 7. Payment Processing Implementation

### 7.1 Stripe Payment Service

```typescript
// src/services/stripePaymentService.ts
import { useStripe, usePaymentSheet } from '@stripe/stripe-react-native';
import axios from 'axios';

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

export function useStripePayment() {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const { confirmPaymentSheetPayment } = useStripe();

  const createPaymentIntent = async (
    planId: string,
    userId: string,
    couponCode?: string
  ): Promise<{ clientSecret: string; amount: number }> => {
    try {
      const response = await axios.post(
        `${process.env.REACT_NATIVE_API_URL}/api/payments/create`,
        {
          subscription_plan_id: planId,
          user_id: userId,
          gateway: 'stripe',
          coupon_code: couponCode,
        }
      );

      return {
        clientSecret: response.data.client_secret,
        amount: response.data.amount,
      };
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  };

  const initializePaymentSheet = async (
    clientSecret: string,
    userEmail: string
  ): Promise<boolean> => {
    const { error } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'Jeeva Learning',
      customFlow: false,
      customerId: userEmail,
      applePay: { enabled: true },
      googlePay: { enabled: true },
    });

    return !error;
  };

  const presentPayment = async (): Promise<PaymentResult> => {
    const { error } = await presentPaymentSheet();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  };

  return {
    createPaymentIntent,
    initializePaymentSheet,
    presentPayment,
  };
}
```

### 7.2 Razorpay Payment Service

```typescript
// src/services/razorpayPaymentService.ts
import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

export const razorpayPaymentService = {
  async createOrder(
    planId: string,
    userId: string,
    couponCode?: string
  ): Promise<{ order_id: string; amount: number; currency: string }> => {
    try {
      const response = await axios.post(
        `${process.env.REACT_NATIVE_API_URL}/api/payments/create`,
        {
          subscription_plan_id: planId,
          user_id: userId,
          gateway: 'razorpay',
          coupon_code: couponCode,
        }
      );

      return {
        order_id: response.data.order_id,
        amount: response.data.amount,
        currency: response.data.currency,
      };
    } catch (error) {
      console.error('Failed to create Razorpay order:', error);
      throw error;
    }
  },

  async presentPayment(
    orderId: string,
    amount: number,
    userEmail: string,
    userName: string
  ): Promise<PaymentResult> => {
    return new Promise((resolve) => {
      const options = {
        description: 'Jeeva Learning Subscription',
        image: 'https://your-app.com/logo.png',
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID,
        amount: amount * 100, // Convert to paise
        order_id: orderId,
        name: 'Jeeva Learning',
        prefill: {
          email: userEmail,
          contact: '9999999999', // Get from user if available
          name: userName,
        },
        theme: { color: '#007aff' },
      };

      RazorpayCheckout.open(options)
        .then((data) => {
          resolve({
            success: true,
            paymentId: data.razorpay_payment_id,
          });
        })
        .catch((error) => {
          resolve({
            success: false,
            error: error.description || 'Payment failed',
          });
        });
    });
  },
};
```

---

## 8. Payment Checkout Screen

### 8.1 Complete Checkout Flow

```typescript
// src/screens/PaymentCheckoutScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useStripePayment } from '../services/stripePaymentService';
import { razorpayPaymentService } from '../services/razorpayPaymentService';
import { countryDetectionService } from '../services/countryDetectionService';
import { paymentGatewaySelector } from '../services/paymentGatewaySelector';
import { useAuthStore } from '../stores/authStore';

interface PaymentCheckoutScreenProps {
  navigation: any;
  route: any;
}

export default function PaymentCheckoutScreen({
  navigation,
  route,
}: PaymentCheckoutScreenProps) {
  const { plan } = route.params;
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState('US');
  const [gateway, setGateway] = useState<'stripe' | 'razorpay'>('stripe');
  const [couponCode, setCouponCode] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState(plan.price_usd);

  const stripePayment = useStripePayment();

  useEffect(() => {
    detectCountryAndGateway();
  }, []);

  const detectCountryAndGateway = async () => {
    try {
      const detectedCountry = await countryDetectionService.detectUserCountry(
        user?.id
      );
      setCountry(detectedCountry);

      const selectedGateway =
        paymentGatewaySelector.selectGateway(detectedCountry);
      setGateway(selectedGateway);
    } catch (error) {
      console.error('Failed to detect country:', error);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Please enter a coupon code');
      return;
    }

    // Validate coupon and calculate discount
    try {
      const response = await fetch(
        `${process.env.REACT_NATIVE_API_URL}/api/coupons/validate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: couponCode,
            plan_id: plan.id,
          }),
        }
      );

      if (!response.ok) throw new Error('Invalid coupon code');

      const data = await response.json();
      const discountAmount =
        (plan.price_usd * data.discount_percentage) / 100;
      setDiscountedPrice(plan.price_usd - discountAmount);

      Alert.alert('Success', `Discount applied: ${data.discount_percentage}%`);
    } catch (error) {
      Alert.alert('Error', 'Invalid or expired coupon code');
    }
  };

  const handleStripePayment = async () => {
    if (!user) {
      Alert.alert('Please log in first');
      return;
    }

    setLoading(true);
    try {
      const { clientSecret, amount } =
        await stripePayment.createPaymentIntent(
          plan.id,
          user.id,
          couponCode
        );

      const initialized =
        await stripePayment.initializePaymentSheet(
          clientSecret,
          user.email
        );

      if (!initialized) {
        throw new Error('Failed to initialize payment sheet');
      }

      const result = await stripePayment.presentPayment();

      if (result.success) {
        Alert.alert('Success', 'Payment successful! Subscription activated.');
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Error', result.error || 'Payment failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!user) {
      Alert.alert('Please log in first');
      return;
    }

    setLoading(true);
    try {
      const { order_id, amount } =
        await razorpayPaymentService.createOrder(
          plan.id,
          user.id,
          couponCode
        );

      const result = await razorpayPaymentService.presentPayment(
        order_id,
        amount,
        user.email,
        user.name || 'User'
      );

      if (result.success) {
        Alert.alert('Success', 'Payment successful! Subscription activated.');
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Error', result.error || 'Payment failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (gateway === 'stripe') {
      handleStripePayment();
    } else {
      handleRazorpayPayment();
    }
  };

  const gatewayInfo = paymentGatewaySelector.getGatewayInfo(gateway);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{plan.name} Plan</Text>
              <Text style={styles.summaryValue}>
                ${plan.price_usd.toFixed(2)}
              </Text>
            </View>

            {couponCode && discountedPrice < plan.price_usd && (
              <>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={styles.discountValue}>
                    -${(plan.price_usd - discountedPrice).toFixed(2)}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${discountedPrice.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Coupon Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Have a Coupon?</Text>
          <View style={styles.couponContainer}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              value={couponCode}
              onChangeText={setCouponCode}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.couponButton}
              onPress={applyCoupon}
              disabled={loading}
            >
              <Text style={styles.couponButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.gatewayBox}>
            <Text style={styles.gatewayName}>{gatewayInfo.name}</Text>
            <Text style={styles.gatewayDescription}>
              {gatewayInfo.description}
            </Text>
            <View style={styles.methodsContainer}>
              {gatewayInfo.methods.map((method, index) => (
                <View key={index} style={styles.methodTag}>
                  <Text style={styles.methodText}>{method}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Billing Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Details</Text>
          <View style={styles.billingBox}>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Email:</Text>
              <Text style={styles.billingValue}>{user?.email}</Text>
            </View>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Plan Duration:</Text>
              <Text style={styles.billingValue}>{plan.duration_days} days</Text>
            </View>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Currency:</Text>
              <Text style={styles.billingValue}>USD</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By proceeding, you agree to our{' '}
            <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
            <Text style={styles.termsLink}>Refund Policy</Text>. Your
            subscription will be set to manual renewal - you'll be notified
            before expiry.
          </Text>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay ${discountedPrice.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingBottom: 100,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007aff',
  },
  couponContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
  },
  couponButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  couponButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  gatewayBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#007aff',
  },
  gatewayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  gatewayDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  methodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  methodText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  billingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  billingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  billingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  termsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  termsLink: {
    color: '#007aff',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  payButton: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## 9. Success & Error Handling

### 9.1 Payment Success Screen

```typescript
// src/screens/PaymentSuccessScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PaymentSuccessScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <MaterialCommunityIcons
          name="check-circle"
          size={80}
          color="#34C759"
          style={styles.icon}
        />

        <Text style={styles.title}>Payment Successful!</Text>

        <Text style={styles.message}>
          Your subscription has been activated. You now have full access to all
          Jeeva Learning features.
        </Text>

        <View style={styles.benefitsList}>
          <BenefitItem text="✓ Unlimited practice questions" />
          <BenefitItem text="✓ Full learning modules" />
          <BenefitItem text="✓ Unlimited mock exams" />
          <BenefitItem text="✓ JeevaBot AI assistant" />
          <BenefitItem text="✓ Priority support" />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.buttonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BenefitItem({ text }: { text: string }) {
  return <Text style={styles.benefitText}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  benefitsList: {
    alignSelf: 'stretch',
    marginVertical: 24,
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
    marginVertical: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## 10. Navigation Setup

### 10.1 Update Navigation Stack

```typescript
// src/navigation/SubscriptionNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SubscriptionPlansScreen from '../screens/SubscriptionPlansScreen';
import PaymentCheckoutScreen from '../screens/PaymentCheckoutScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';

const Stack = createNativeStackNavigator();

export function SubscriptionNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="SubscriptionPlans"
        component={SubscriptionPlansScreen}
        options={{
          title: 'Upgrade Plan',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="PaymentCheckout"
        component={PaymentCheckoutScreen}
        options={{
          title: 'Payment',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
```

---

## 11. Testing & Validation

### 11.1 Test Payment Cards

**Stripe Test Cards:**

| Card Number | Status | CVC | Expiry |
|-------------|--------|-----|--------|
| 4242424242424242 | Success | Any | Future |
| 4000002500003155 | 3D Secure | Any | Future |
| 5555555555554444 | Decline | Any | Future |

**Razorpay Test Credentials:**

| Type | Value |
|------|-------|
| Test UPI | success@razorpay |
| Test Cards | 4111111111111111 |
| Test Mode | Enabled in Settings |

### 11.2 Testing Checklist

- [ ] Stripe payment flow end-to-end
- [ ] Razorpay payment flow end-to-end
- [ ] Country detection works
- [ ] Gateway selection automatic
- [ ] Coupon code validation
- [ ] Discount calculation correct
- [ ] Payment success updates user subscription
- [ ] Error messages display properly
- [ ] Trial users can subscribe
- [ ] Expired trial users redirected
- [ ] Multiple payment attempts work
- [ ] Network error handling
- [ ] Payment cancellation handled

---

## 12. Deployment Checklist

- [ ] Stripe publishable key configured in secrets
- [ ] Razorpay key ID configured in secrets
- [ ] Payment API endpoints tested
- [ ] Country detection service tested
- [ ] All screens integrated into navigation
- [ ] Payment success/failure flows verified
- [ ] Coupon system tested
- [ ] Error messages user-friendly
- [ ] Loading states implemented
- [ ] Accessibility features added
- [ ] Performance optimized
- [ ] Analytics events tracked

---

© 2025 Jeeva Learning. All Rights Reserved.

**Ready for mobile team implementation!** 🚀
