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
