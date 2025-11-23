# Mobile Subscription System - Complete Implementation Guide

**Jeeva Learning Platform - React Native App**

**Date:** November 23, 2025  
**Version:** 2.0 (Fresh - Error-Free Implementation)  
**Target:** iOS & Android (React Native + Expo)

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Backend Setup](#3-backend-setup)
4. [Mobile App Setup](#4-mobile-app-setup)
5. [Payment Providers](#5-payment-providers)
6. [Implementation Flow](#6-implementation-flow)
7. [Code Examples](#7-code-examples)
8. [Testing](#8-testing)
9. [Troubleshooting](#9-troubleshooting)
10. [Deployment](#10-deployment)

---

## 1. Overview

Your mobile app needs to:
- **Fetch subscription plans** from your backend
- **Display plans** with pricing and features
- **Collect payment** via Stripe (International) or Razorpay (India)
- **Verify payment** and activate subscription
- **Show success/error** messages

**Key Principle:** All payment amounts and customer data flow through your backend - the mobile app never handles sensitive payment information directly.

---

## 2. Architecture

```
Mobile App (React Native)
        ↓
   [Subscription Plans Screen]
        ↓
   [Payment Checkout Screen]
        ↓
   Your Backend (Express.js)
        ↓
   [Stripe API OR Razorpay API]
        ↓
   Payment Success ← Webhook ← Gateway
        ↓
   Update Supabase User Subscription
```

### Data Flow:
1. Mobile app requests subscription plans from backend
2. User selects a plan
3. Mobile app calls backend to create payment intent
4. Backend returns payment intent/order ID to mobile
5. Mobile opens Stripe or Razorpay checkout
6. User completes payment in gateway UI
7. Gateway sends webhook to backend
8. Backend verifies payment and activates subscription
9. Mobile navigates to success screen

---

## 3. Backend Setup

### 3.1 Required API Endpoints

Your backend needs these endpoints:

**GET /api/subscription-plans**
```json
Response:
{
  "plans": [
    {
      "id": "plan_monthly_01",
      "name": "Monthly Plan",
      "price_usd": 9.99,
      "price_inr": 799,
      "duration_days": 30,
      "features": ["Unlimited practice", "AI assistant"]
    }
  ]
}
```

**POST /api/payments/create**
```json
Request:
{
  "user_id": "user_uuid",
  "subscription_plan_id": "plan_monthly_01",
  "country_code": "IN"
}

Response (Razorpay):
{
  "order_id": "order_12345",
  "amount": 799,
  "currency": "INR",
  "gateway": "razorpay"
}

Response (Stripe):
{
  "client_secret": "pi_xxx_secret_xxx",
  "amount": 999,
  "currency": "USD",
  "gateway": "stripe"
}
```

**POST /api/payments/verify**
```json
Request:
{
  "payment_id": "payment_uuid",
  "gateway": "razorpay",
  "razorpay_order_id": "order_12345",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "sig_xxx"
}

Response:
{
  "success": true,
  "subscription_id": "sub_uuid",
  "message": "Payment verified"
}
```

### 3.2 Backend Environment Variables

Add these to your `.env`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=secret_xxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx

# Database
DATABASE_URL=postgresql://...

# API
API_PORT=3001
```

### 3.3 Payment Create Endpoint Code

```typescript
// server/routes/payments.ts
router.post('/create', async (req, res) => {
  try {
    const { user_id, subscription_plan_id, country_code } = req.body;

    // Validate required fields
    if (!user_id || !subscription_plan_id || !country_code) {
      return res.status(400).json({
        error: 'Missing fields: user_id, subscription_plan_id, country_code',
      });
    }

    // Get subscription plan from database
    const plan = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', subscription_plan_id)
      .single();

    if (!plan.data) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Determine gateway based on country
    const gateway = country_code === 'IN' ? 'razorpay' : 'stripe';

    // Create payment record
    const payment = await supabase.from('payments').insert({
      user_id,
      subscription_plan_id,
      amount: gateway === 'razorpay' ? plan.data.price_inr : plan.data.price_usd,
      currency: gateway === 'razorpay' ? 'INR' : 'USD',
      gateway,
      status: 'pending',
    }).single();

    let response = {};

    if (gateway === 'razorpay') {
      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: plan.data.price_inr * 100, // Convert to paise
        currency: 'INR',
        receipt: payment.data.id,
        notes: {
          user_id,
          plan_id: subscription_plan_id,
        },
      });

      response = {
        gateway: 'razorpay',
        order_id: order.id,
        amount: plan.data.price_inr,
        currency: 'INR',
      };

      // Update payment with order ID
      await supabase
        .from('payments')
        .update({ razorpay_order_id: order.id })
        .eq('id', payment.data.id);
    } else {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(plan.data.price_usd * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          user_id,
          plan_id: subscription_plan_id,
        },
      });

      response = {
        gateway: 'stripe',
        client_secret: paymentIntent.client_secret,
        amount: plan.data.price_usd,
        currency: 'USD',
      };

      // Update payment with intent ID
      await supabase
        .from('payments')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('id', payment.data.id);
    }

    res.json(response);
  } catch (error: any) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## 4. Mobile App Setup

### 4.1 Install Dependencies

```bash
npm install \
  @stripe/stripe-react-native \
  react-native-razorpay \
  axios \
  @react-navigation/native \
  @react-navigation/bottom-tabs \
  @react-navigation/stack
```

### 4.2 Environment Configuration

Create `.env.local` in your mobile app root:

```
REACT_NATIVE_API_URL=https://your-app.com
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
RAZORPAY_KEY_ID=rzp_test_xxxxx
APP_NAME=Jeeva Learning
```

---

## 5. Payment Providers

### 5.1 Stripe Setup (International)

```typescript
// services/stripeService.ts
import { initStripe, usePaymentSheet } from '@stripe/stripe-react-native';

export async function initializeStripe() {
  const { error } = await initStripe({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    merchantIdentifier: 'merchant.com.jeeva.learning',
  });

  if (error) {
    console.error('Stripe init error:', error);
    throw error;
  }
}

export async function processStripePayment(clientSecret: string, email: string) {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  // Initialize payment sheet
  const initError = await initPaymentSheet({
    paymentIntentClientSecret: clientSecret,
    merchantDisplayName: 'Jeeva Learning',
    customerId: email,
    applePay: { enabled: true },
    googlePay: { enabled: true },
  });

  if (initError) throw initError;

  // Present payment sheet
  const paymentError = await presentPaymentSheet();

  if (paymentError) {
    return {
      success: false,
      error: paymentError.message,
    };
  }

  return { success: true };
}
```

### 5.2 Razorpay Setup (India)

```typescript
// services/razorpayService.ts
import RazorpayCheckout from 'react-native-razorpay';

export async function processRazorpayPayment(
  orderId: string,
  amount: number,
  email: string,
  userName: string
) {
  return new Promise((resolve) => {
    const options = {
      description: 'Jeeva Learning Subscription',
      image: 'https://your-logo-url.com/logo.png',
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
      amount: amount * 100, // Convert to paise
      order_id: orderId,
      name: 'Jeeva Learning',
      prefill: {
        email,
        name: userName,
      },
      theme: { color: '#007aff' },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        resolve({
          success: true,
          payment_id: data.razorpay_payment_id,
          signature: data.razorpay_signature,
        });
      })
      .catch((error) => {
        resolve({
          success: false,
          error: error.description || 'Payment cancelled',
        });
      });
  });
}
```

---

## 6. Implementation Flow

### 6.1 Subscription Plans Screen

```typescript
// screens/SubscriptionPlansScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

interface Plan {
  id: string;
  name: string;
  price_usd: number;
  price_inr?: number;
  duration_days: number;
  features: string[];
}

export default function SubscriptionPlansScreen({ navigation }: any) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_NATIVE_API_URL}/api/subscription-plans`
      );
      setPlans(response.data.plans || []);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load plans');
      console.error('Fetch plans error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plans.find(p => p.id === planId);
    
    if (plan) {
      navigation.navigate('PaymentCheckout', { plan });
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={{ marginTop: 12 }}>Loading plans...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
          Upgrade Your Plan
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
          Unlock full access to all features
        </Text>

        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={{
              backgroundColor: selectedPlanId === plan.id ? '#F0F8FF' : '#FFF',
              borderWidth: 2,
              borderColor: selectedPlanId === plan.id ? '#007aff' : '#E5E7EB',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
            onPress={() => handleSelectPlan(plan.id)}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>{plan.name}</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#007aff' }}>
                ${plan.price_usd.toFixed(2)}
              </Text>
            </View>
            
            <Text style={{ fontSize: 12, color: '#666', marginVertical: 8 }}>
              Duration: {plan.duration_days} days
            </Text>

            <View>
              {plan.features.map((feature, index) => (
                <Text key={index} style={{ fontSize: 13, color: '#374151', marginVertical: 4 }}>
                  ✓ {feature}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
```
