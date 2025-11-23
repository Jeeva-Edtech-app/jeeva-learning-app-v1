# Complete Mobile Payment Implementation Guide

**Jeeva Learning Platform - React Native App**

---

## Overview

Your mobile app payment system:
1. **Fetches subscription plans** from backend
2. **Displays plans** with pricing and features
3. **Collects payment** via Stripe (International) or Razorpay (India)
4. **Verifies payment** and activates subscription
5. **Shows success** confirmation

---

## Architecture

```
Mobile App (React Native)
    ↓
[Subscription Plans Screen]
    ↓
[Payment Checkout Screen]
    ↓
Your Backend (Express.js)
    ↓
Stripe OR Razorpay API
    ↓
Payment Webhook
    ↓
Supabase (Update Subscription)
```

---

## Backend API Endpoints Required

### 1. GET /api/subscription-plans

Fetch all available subscription plans.

**Response:**
```json
{
  "plans": [
    {
      "id": "plan_monthly_01",
      "name": "Monthly Plan",
      "price_usd": 9.99,
      "price_inr": 799,
      "duration_days": 30,
      "features": ["Unlimited practice", "AI assistant"]
    },
    {
      "id": "plan_annual_01",
      "name": "Annual Plan",
      "price_usd": 99.99,
      "price_inr": 7999,
      "duration_days": 365,
      "features": ["Unlimited practice", "AI assistant", "Priority support"]
    }
  ]
}
```

### 2. POST /api/payments/create

Create a payment session (Stripe PaymentIntent or Razorpay Order).

**Request:**
```json
{
  "user_id": "uuid-of-user",
  "subscription_plan_id": "plan_monthly_01",
  "country_code": "IN"
}
```

**Response (Razorpay - India):**
```json
{
  "gateway": "razorpay",
  "order_id": "order_12345",
  "amount": 799,
  "currency": "INR"
}
```

**Response (Stripe - International):**
```json
{
  "gateway": "stripe",
  "client_secret": "pi_xxx_secret_xxx",
  "amount": 999,
  "currency": "USD"
}
```

### 3. POST /api/payments/verify

Verify payment and activate subscription.

**Request:**
```json
{
  "payment_id": "payment_uuid",
  "gateway": "razorpay",
  "razorpay_order_id": "order_12345",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "sig_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "subscription_id": "sub_uuid",
  "message": "Subscription activated"
}
```

---

## Backend Implementation

### Environment Variables

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=secret_xxxxx

# Database
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### Subscription Plans Endpoint

```typescript
// server/routes/subscriptions.ts
import express from 'express';
import { supabase } from '../lib/supabase';

const router = express.Router();

router.get('/plans', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    res.json({
      plans: data || [],
    });
  } catch (error: any) {
    console.error('Fetch plans error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

Register in server/index.ts:
```typescript
import subscriptionRoutes from './routes/subscriptions';
app.use('/api/subscription', subscriptionRoutes);
```

### Payment Create Endpoint

```typescript
// server/routes/payments.ts - POST /create
router.post('/create', async (req, res) => {
  try {
    const { user_id, subscription_plan_id, country_code } = req.body;

    if (!user_id || !subscription_plan_id || !country_code) {
      return res.status(400).json({
        error: 'Missing: user_id, subscription_plan_id, country_code',
      });
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', subscription_plan_id)
      .single();

    if (planError || !plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Determine gateway by country
    const gateway = country_code === 'IN' ? 'razorpay' : 'stripe';

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id,
        subscription_plan_id,
        amount: gateway === 'razorpay' ? plan.price_inr : plan.price_usd,
        currency: gateway === 'razorpay' ? 'INR' : 'USD',
        gateway,
        status: 'pending',
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    let response = {};

    if (gateway === 'razorpay') {
      const razorpay = require('razorpay');
      const instance = new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const order = await instance.orders.create({
        amount: plan.price_inr * 100, // Convert to paise
        currency: 'INR',
        receipt: payment.id,
      });

      response = {
        gateway: 'razorpay',
        order_id: order.id,
        amount: plan.price_inr,
        currency: 'INR',
      };

      // Update payment with order ID
      await supabase
        .from('payments')
        .update({ razorpay_order_id: order.id })
        .eq('id', payment.id);
    } else {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(plan.price_usd * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          user_id,
          plan_id: subscription_plan_id,
        },
      });

      response = {
        gateway: 'stripe',
        client_secret: paymentIntent.client_secret,
        amount: plan.price_usd,
        currency: 'USD',
      };

      // Update payment with intent ID
      await supabase
        .from('payments')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('id', payment.id);
    }

    res.json(response);
  } catch (error: any) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Payment Verify Endpoint

```typescript
// server/routes/payments.ts - POST /verify
router.post('/verify', async (req, res) => {
  try {
    const {
      payment_id,
      gateway,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_order_id,
    } = req.body;

    if (!payment_id || !gateway) {
      return res.status(400).json({
        error: 'Missing: payment_id, gateway',
      });
    }

    // Verify signature if Razorpay
    if (gateway === 'razorpay') {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    // Update payment status
    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        razorpay_payment_id,
      })
      .eq('id', payment_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Activate subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: payment.user_id,
        subscription_plan_id: payment.subscription_plan_id,
        status: 'active',
        start_date: new Date(),
      })
      .select()
      .single();

    if (subError) throw subError;

    res.json({
      success: true,
      subscription_id: subscription.id,
      message: 'Payment verified and subscription activated',
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## Mobile App Implementation

### Dependencies

```bash
npm install \
  @stripe/stripe-react-native \
  react-native-razorpay \
  axios \
  react-native-device-info
```

### Environment Setup

Create `.env.local`:
```
REACT_NATIVE_API_URL=https://your-backend.com
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
RAZORPAY_KEY_ID=rzp_test_xxxxx
```

---

**Version:** 2.0 (Complete)  
**Date:** November 23, 2025
