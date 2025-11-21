# Subscription Implementation Plan

**Date**: November 21, 2025  
**Status**: Ready for Implementation  
**Reference**: `docs/MOBILE_SUBSCRIPTIONS_IMPLEMENTATION_GUIDE.md`

---

## Overview

This document outlines the step-by-step implementation of the mobile subscriptions system. The backend database, APIs, and admin setup are already complete in the admin app. This plan focuses on mobile client implementation.

---

## Phase 1: Foundation & Data Fetching (Turn 1)

### 1.1 Create Subscription Hook (`src/hooks/useSubscription.ts`)
**Responsibility**: Handle all subscription-related data fetching and state management

```typescript
// Core Functions:
- getPlans(): Fetch all active subscription plans
- getUserSubscription(userId): Get current user's subscription
- checkSubscriptionStatus(userId): Validate if subscription is active
- getDaysRemaining(userId): Calculate days until expiration
- isSubscriptionExpiringSoon(userId): Check if expiring within 5 days
- trackFeatureUsage(userId, feature): Log feature usage
- getRemainingUsage(userId, feature): Get remaining quota
```

**Uses**: TanStack React Query for caching, Supabase client

**Location**: `src/hooks/useSubscription.ts`

---

### 1.2 Create Subscription API Module (`src/api/subscriptions.ts`)
**Responsibility**: All Supabase queries for subscriptions

```typescript
// Core Functions:
- fetchSubscriptionPlans()
- fetchUserSubscription(userId)
- createFreeTrial(userId)
- updateSubscriptionStatus(userId, status)
- trackUsage(userId, feature, amount)
- getUsageStats(userId, feature)
- validateSubscription(userId)
- renewSubscription(userId, planId)
```

**Location**: `src/api/subscriptions.ts`

---

### 1.3 Create Country Detection Hook (`src/hooks/useCountryDetection.ts`)
**Responsibility**: Detect user country and determine payment provider

```typescript
// Core Functions:
- detectCountry(): Promise<country_code>
- getPaymentProvider(countryCode): 'stripe' | 'razorpay'
- getLocalCurrency(countryCode): 'usd' | 'inr' etc
- convertPrice(usdPrice, countryCode): localPrice
```

**Location**: `src/hooks/useCountryDetection.ts`

---

## Phase 2: Payment Integration (Turn 1-2)

### 2.1 Create Payment Gateway Hook (`src/hooks/usePaymentGateway.ts`)
**Responsibility**: Route payments to Stripe or Razorpay based on country

```typescript
// Core Functions:
- initializePayment(planId, paymentMethod): Promise<paymentSession>
- processStripePayment(planId): Promise<result>
- processRazorpayPayment(planId): Promise<result>
- verifyPayment(paymentId): Promise<verified>
- handlePaymentError(error): handle gracefully
```

**Location**: `src/hooks/usePaymentGateway.ts`

---

### 2.2 Create Subscription Status Types (`src/types/subscription.ts`)
**Responsibility**: TypeScript interfaces for subscription domain

```typescript
interface SubscriptionPlan {
  id: string
  name: string
  price_usd: number
  duration_days: number
  features: FeatureSet
  is_active: boolean
}

interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'trial' | 'expired' | 'cancelled'
  start_date: Date
  end_date: Date
  payment_method: 'stripe' | 'razorpay' | 'free_trial'
}

interface SubscriptionUsage {
  feature: string
  used_this_month: number
  limit_this_month: number
  reset_date: Date
}
```

**Location**: `src/types/subscription.ts`

---

## Phase 3: UI Screens (Turn 2)

### 3.1 Create Plans Screen (`app/(tabs)/plans.tsx`)
**Responsibility**: Display subscription plans and initiate purchase

```typescript
// Screens:
1. Plans display (Free Trial, Monthly, Yearly)
2. Plan comparison
3. Select plan → Payment method selection
4. Payment processing UI (loading states)
```

**Location**: `app/(tabs)/plans.tsx`

---

### 3.2 Fix Subscriptions Screen (`app/subscriptions.tsx`)
**Responsibility**: Display current subscription details and renewal

```typescript
// Screens:
1. Active subscription details
2. Days remaining / expiration banner
3. Usage stats (AI messages, voice sessions, etc.)
4. Renew button
5. Cancel button
```

**Location**: `app/subscriptions.tsx` (Fix timeout issue)

---

### 3.3 Create Payment Method Selection Screen (`app/payments/payment-method.tsx`)
**Responsibility**: Allow users to select payment method (for India)

```typescript
// For Razorpay users:
- UPI (Google Pay, PhonePe, WhatsApp Pay)
- Credit/Debit Card
- Wallet
- NetBanking
```

**Location**: `app/payments/payment-method.tsx`

---

### 3.4 Create Payment Processing Screen (`app/payments/processing.tsx`)
**Responsibility**: Handle payment processing UI and flow

```typescript
// States:
- Initiating payment
- Awaiting payment completion
- Payment success
- Payment failure with retry
```

**Location**: `app/payments/processing.tsx`

---

## Phase 4: App Launch Flow & Content Gating (Turn 2)

### 4.1 Create Subscription Check Hook (`src/hooks/useSubscriptionCheck.ts`)
**Responsibility**: Check subscription on app launch

```typescript
// Logic:
if user not authenticated:
  → Navigate to Login
else if no subscription:
  → Navigate to Plans (offer free trial)
else if subscription expired:
  → Navigate to Plans (upgrade prompt)
else if subscription active:
  → Navigate to Dashboard
else if trial expiring soon (5 days):
  → Show "Trial Ending" banner in Dashboard
```

**Location**: `src/hooks/useSubscriptionCheck.ts`

---

### 4.2 Create Feature Gate Component (`src/components/FeatureGate.tsx`)
**Responsibility**: Control access to features based on subscription

```typescript
// Props:
- feature: 'practice' | 'learning' | 'mock_exams' | 'ai_chat' | 'voice'
- children: ReactNode
- fallback: ReactNode (upgrade prompt)

// Logic:
if user has access:
  → Render children
else:
  → Render fallback (upgrade prompt)
```

**Location**: `src/components/FeatureGate.tsx`

---

### 4.3 Update Feature Modules with Gating
**Responsibility**: Integrate FeatureGate into existing screens

```typescript
// Files to update:
- src/screens/PracticeScreen.tsx
- src/screens/LearningScreen.tsx
- src/screens/MockExamScreen.tsx
- src/screens/JeevaBotScreen.tsx

// Pattern:
<FeatureGate 
  feature="ai_chat"
  fallback={<UpgradePrompt />}
>
  <ChatInterface />
</FeatureGate>
```

---

## Phase 5: Usage Tracking (Turn 2)

### 5.1 Create Usage Tracking Hook (`src/hooks/useUsageTracking.ts`)
**Responsibility**: Track feature usage and enforce limits

```typescript
// Functions:
- trackAiMessage(userId)
- trackVoiceSession(userId)
- trackMockExam(userId)
- getRemainingQuota(userId, feature)
```

**Location**: `src/hooks/useUsageTracking.ts`

---

## Implementation Checklist

### Turn 1 (High Priority)
- [ ] Create `src/hooks/useSubscription.ts`
- [ ] Create `src/api/subscriptions.ts`
- [ ] Create `src/hooks/useCountryDetection.ts`
- [ ] Create `src/types/subscription.ts`
- [ ] Create `src/hooks/usePaymentGateway.ts`
- [ ] Test data fetching with real API

### Turn 2 (UI & Integration)
- [ ] Fix `app/subscriptions.tsx` (resolve timeout)
- [ ] Create `app/(tabs)/plans.tsx` with plan selection
- [ ] Create `app/payments/payment-method.tsx`
- [ ] Create `app/payments/processing.tsx`
- [ ] Create `src/components/FeatureGate.tsx`
- [ ] Integrate subscription check in app entry
- [ ] Add FeatureGate to feature screens
- [ ] Create `src/hooks/useUsageTracking.ts`
- [ ] Test full subscription flow

### Turn 3+ (Testing & Polish)
- [ ] End-to-end testing with test payment keys
- [ ] Handle all error scenarios
- [ ] Implement renewal flow
- [ ] Add analytics tracking
- [ ] Performance optimization

---

## API Endpoints Used

All endpoints available in admin app (backend ready):

```
GET /api/subscriptions/plans
GET /api/subscriptions/user/:userId
POST /api/subscriptions/start-trial
POST /api/payments/create
POST /api/payments/verify
POST /api/subscriptions/cancel
GET /api/subscriptions/validate
```

---

## Environment Variables Needed

```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...
RAZORPAY_KEY_ID=rzp_test_...
```

These should be stored in `.env.local` and accessed via `process.env` in the mobile client.

---

## Design System Integration

**Colors & Spacing**: Use existing `src/constants/DesignSystem.ts`
- Background: `Colors.background.main` (#F5F7FA)
- Cards: `Colors.background.card` (#FFFFFF)
- Primary: `Colors.primary.main` (#3B82F6)
- Text: `Colors.text.primary` (#111827)

---

## Success Criteria

✅ Users can start free trial  
✅ Users can view subscription plans  
✅ Users can upgrade with Stripe or Razorpay (based on location)  
✅ Subscription status shows on app launch  
✅ Content is gated based on subscription  
✅ Usage limits are enforced  
✅ Renewal flow works  
✅ Trial expiration warnings show  

---

## Notes

- Database schema already created in admin app
- All backend APIs ready and tested
- Payment providers (Stripe, Razorpay) pre-configured
- Mobile implementation needed for client-side logic
- Focus on smooth UX and clear error messaging
