# Mobile App - Subscriptions Implementation Guide

**Version:** 1.0  
**Date:** November 21, 2025  
**Status:** Complete Implementation Guide

---

## Executive Summary

Mobile app subscription system with smart payment routing (Stripe for international, Razorpay for India), flexible billing periods, content gating, and automated renewal management.

---

## 1. Subscription Architecture

### Subscription Types

```typescript
interface SubscriptionPlan {
  id: string
  name: string // "Free Trial", "Monthly", "Yearly"
  price: number // In USD
  billingPeriod: 'trial' | 'monthly' | 'yearly'
  durationDays: number // 7 for trial, 30 for monthly, 365 for yearly
  features: {
    unlimitedPractice: boolean
    learningModule: boolean
    mockExams: boolean
    aiChat: boolean
    personalisedRecommendations: boolean
    voiceTutoring: boolean
  }
  isActive: boolean
}
```

### User Subscription Status

```typescript
interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: 'active' | 'trial' | 'expired' | 'cancelled'
  startDate: Date
  endDate: Date
  paymentMethod: 'stripe' | 'razorpay' | 'free_trial'
  stripePaymentId?: string
  razorpayPaymentId?: string
}
```

### Subscription Plans Available

**1. Free Trial**
- Duration: 7 days
- Price: $0
- Features: All features included
- Purpose: User testing before upgrade

**2. Monthly Subscription**
- Duration: 30 days
- Price: $9.99 (or ₹799 in INR)
- Auto-renews monthly
- Features: All features included

**3. Yearly Subscription**
- Duration: 365 days
- Price: $99.99 (or ₹7999 in INR)
- Best value (2 months free)
- Auto-renews yearly
- Features: All features included

---

## 2. Subscription Flow - High Level

```
User Launch App
    ↓
Check Authentication
    ↓
Check Subscription Status
    ├─ Active → Show Dashboard
    ├─ Trial → Show Dashboard + "Trial Ending" Banner
    ├─ Expired → Show Upgrade Screen
    └─ Not Subscribed → Show Free Trial Offer
```

---

## 3. API Endpoints Required

### Backend Endpoints (Already Ready ✅)

```
GET /api/subscriptions/plans
├─ Response: Array of subscription plans
└─ Usage: Display available plans to user

GET /api/subscriptions/user/:userId
├─ Response: Current user subscription details
└─ Usage: Check subscription status on app launch

POST /api/subscriptions/start-trial
├─ Body: { userId }
├─ Response: { subscription_id, trial_end_date }
└─ Usage: Start free trial for new user

POST /api/payments/create
├─ Body: { userId, planId, paymentMethod }
├─ Response: { clientSecret/orderId, amount }
└─ Usage: Initiate payment (Stripe/Razorpay)

POST /api/payments/verify
├─ Body: { paymentId, signature }
├─ Response: { success, subscriptionId }
└─ Usage: Verify payment completion

POST /api/subscriptions/cancel
├─ Body: { userId }
├─ Response: { cancelled: true }
└─ Usage: Cancel active subscription

GET /api/subscriptions/validate
├─ Response: { isValid, daysRemaining }
└─ Usage: Check if current subscription is still valid
```

---

## 4. Country Detection & Payment Routing

### Implementation Logic

```typescript
// Step 1: Detect user's country
async function detectUserCountry() {
  try {
    // Method 1: Device location (if permission granted)
    const location = await getCurrentLocation()
    return location.country
  } catch {
    // Method 2: IP geolocation
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    return data.country_code
  }
}

// Step 2: Store country in user profile
async function updateUserCountry(userId, countryCode) {
  await supabase
    .from('user_profiles')
    .update({ current_country: countryCode })
    .eq('id', userId)
}

// Step 3: Determine payment provider
function getPaymentProvider(countryCode) {
  const indiaCountries = ['IN']
  const razorpayCountries = indiaCountries
  
  if (razorpayCountries.includes(countryCode)) {
    return 'razorpay'
  }
  return 'stripe' // Default for all other countries
}

// Step 4: Convert currency if needed
function convertCurrency(usdAmount, countryCode) {
  const exchangeRates = {
    'IN': 83.5, // INR to USD
    'US': 1,
    'GB': 0.79,
    // ... more countries
  }
  
  const rate = exchangeRates[countryCode] || 1
  return usdAmount * rate
}
```
