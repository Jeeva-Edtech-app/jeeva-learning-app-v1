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

---

## 5. Mobile UI Flow - Subscription

### Screen 1: Plans Display Screen

```
╔════════════════════════════════╗
║   UPGRADE YOUR PLAN            ║
╠════════════════════════════════╣
║                                ║
║  ┌────────────────────────┐    ║
║  │ 🎁 FREE TRIAL (7 days) │    ║
║  │ Free                   │    ║
║  │ All features included  │    ║
║  │ [START TRIAL]          │    ║
║  └────────────────────────┘    ║
║                                ║
║  ┌────────────────────────┐    ║
║  │ 📅 MONTHLY             │    ║
║  │ $9.99/month            │    ║
║  │ All features included  │    ║
║  │ [SUBSCRIBE]            │    ║
║  └────────────────────────┘    ║
║                                ║
║  ┌────────────────────────┐    ║
║  │ ⭐ YEARLY (BEST VALUE) │    ║
║  │ $99.99/year (Save 2mo) │    ║
║  │ All features included  │    ║
║  │ [SUBSCRIBE]            │    ║
║  └────────────────────────┘    ║
║                                ║
║  Terms | Privacy               ║
╚════════════════════════════════╝
```

### Screen 2: Payment Method Selection (for India Users)

```
╔════════════════════════════════╗
║   SELECT PAYMENT METHOD        ║
╠════════════════════════════════╣
║                                ║
║  Monthly Subscription: $9.99   ║
║                                ║
║  ☐ Credit/Debit Card          ║
║  ☑ UPI (Recommended)          ║
║    ├─ Google Pay              ║
║    ├─ PhonePe                 ║
║    └─ WhatsApp Pay            ║
║  ☐ Wallet                     ║
║  ☐ NetBanking                 ║
║                                ║
║  [PROCEED TO PAYMENT]          ║
║  [CANCEL]                      ║
╚════════════════════════════════╝
```

### Screen 3: Active Subscription

```
╔════════════════════════════════╗
║   YOUR SUBSCRIPTION            ║
╠════════════════════════════════╣
║                                ║
║  Status: ✅ ACTIVE            ║
║                                ║
║  Plan: Yearly                  ║
║  Price: $99.99/year            ║
║                                ║
║  Expires: 15 Dec 2025         ║
║  Days Remaining: 328 days      ║
║                                ║
║  ┌──────────────────────┐      ║
║  │ Usage This Month:    │      ║
║  │ AI Messages: 45/100  │      ║
║  │ Voice Sessions: 2/5  │      ║
║  └──────────────────────┘      ║
║                                ║
║  [RENEW]  [CANCEL]             ║
╚════════════════════════════════╝
```

---

## 6. Implementation Steps

### Step 1: Check Subscription on App Launch

```typescript
// App.tsx or RootNavigator
useEffect(() => {
  const checkSubscription = async () => {
    const user = await getCurrentUser()
    if (!user) {
      navigateTo('Login')
      return
    }
    
    try {
      // Fetch user subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (!subscription) {
        // New user - offer free trial
        navigateTo('SubscriptionPlans')
        return
      }
      
      // Check if subscription is active
      const isActive = new Date(subscription.end_date) > new Date()
      
      if (!isActive) {
        // Subscription expired
        navigateTo('SubscriptionPlans')
        return
      }
      
      // Subscription active - show dashboard
      navigateTo('Dashboard')
      
    } catch (error) {
      console.error('Error checking subscription:', error)
      navigateTo('Dashboard') // Show dashboard as fallback
    }
  }
  
  checkSubscription()
}, [])
```

### Step 2: Display Plans Screen

```typescript
// SubscriptionPlansScreen.tsx
function SubscriptionPlansScreen() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchPlans()
  }, [])
  
  async function fetchPlans() {
    try {
      const { data } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
      
      setPlans(data)
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleSelectPlan(planId) {
    navigation.navigate('PaymentScreen', { planId })
  }
  
  if (loading) return <LoadingSpinner />
  
  return (
    <ScrollView>
      <Text style={styles.title}>Choose Your Plan</Text>
      
      {plans.map(plan => (
        <PlanCard 
          key={plan.id}
          plan={plan}
          onSelect={() => handleSelectPlan(plan.id)}
        />
      ))}
    </ScrollView>
  )
}
```

### Step 3: Payment Processing (Stripe - International)

```typescript
// PaymentProcessing.tsx - For International Users
async function processStripePayment(planId) {
  try {
    // Step 1: Create Stripe Payment Intent
    const response = await fetch('https://your-api.com/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        planId: planId,
        paymentMethod: 'stripe',
        currency: 'usd'
      })
    })
    
    const { clientSecret, amount } = await response.json()
    
    // Step 2: Initialize Stripe
    const cardFieldRef = useRef(null)
    
    // Step 3: Confirm Payment
    const result = await stripe.confirmPayment(
      {
        paymentIntentClientSecret: clientSecret,
        paymentMethodType: 'Card',
        paymentMethodData: {
          // Card details from UI
        }
      },
      { handleActions: false }
    )
    
    if (result.paymentIntent.status === 'succeeded') {
      // Payment successful
      await verifyPayment(result.paymentIntent.id)
      navigation.navigate('SuccessScreen')
    }
    
  } catch (error) {
    console.error('Payment error:', error)
    showError('Payment failed: ' + error.message)
  }
}
```

### Step 4: Payment Processing (Razorpay - India)

```typescript
// PaymentProcessing.tsx - For India Users
async function processRazorpayPayment(planId) {
  try {
    // Step 1: Create Razorpay Order
    const response = await fetch('https://your-api.com/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        planId: planId,
        paymentMethod: 'razorpay',
        currency: 'inr'
      })
    })
    
    const { orderId, amount, currency } = await response.json()
    
    // Step 2: Open Razorpay Checkout
    const options = {
      key: 'RAZORPAY_KEY_ID', // From env
      order_id: orderId,
      amount: amount,
      currency: currency,
      name: 'Jeeva Learning',
      description: 'Subscription Payment',
      prefill: {
        email: currentUser.email,
        contact: currentUser.phone
      },
      theme: {
        color: '#007aff'
      }
    }
    
    RazorpayCheckout.open(options)
      .then(data => {
        // Payment successful
        verifyPayment(data.razorpay_payment_id)
        navigation.navigate('SuccessScreen')
      })
      .catch(error => {
        showError('Payment failed: ' + error.message)
      })
    
  } catch (error) {
    console.error('Payment error:', error)
  }
}
```

### Step 5: Verify Payment & Activate Subscription

```typescript
// PaymentVerification.ts
async function verifyPayment(paymentId) {
  try {
    const response = await fetch('https://your-api.com/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: paymentId,
        userId: currentUser.id
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      // Subscription activated
      await updateLocalSubscription(result.subscription)
      
      // Refresh app state
      await refreshUserData()
      
      // Show success
      showSuccess('Subscription activated!')
      return true
    } else {
      showError('Payment verification failed')
      return false
    }
  } catch (error) {
    console.error('Verification error:', error)
    showError('Could not verify payment')
    return false
  }
}
```

---

## 7. Content Gating Logic

### Feature Access Control

```typescript
// FeatureGate.ts
export const FEATURE_ACCESS = {
  practice: {
    free_trial: true,
    monthly: true,
    yearly: true
  },
  learning_module: {
    free_trial: true,
    monthly: true,
    yearly: true
  },
  mock_exams: {
    free_trial: true,
    monthly: true,
    yearly: true,
    limit_free_trial: 2 // Max 2 mock exams in free trial
  },
  ai_chat: {
    free_trial: true,
    monthly: true,
    yearly: true,
    messages_free_trial: 50,
    messages_monthly: 100,
    messages_yearly: 'unlimited'
  },
  voice_tutoring: {
    free_trial: false,
    monthly: true,
    yearly: true,
    sessions_monthly: 5,
    sessions_yearly: 50
  }
}

// Check if user has access
async function hasFeatureAccess(feature, userId) {
  const subscription = await getUserSubscription(userId)
  const plan = subscription.plan_id // 'free_trial', 'monthly', 'yearly'
  
  const allowed = FEATURE_ACCESS[feature]?.[plan] ?? false
  
  return allowed
}

// Get feature limit
async function getFeatureLimit(feature, userId) {
  const subscription = await getUserSubscription(userId)
  const plan = subscription.plan_id
  
  const limit = FEATURE_ACCESS[feature]?.[plan] ?? null
  
  return limit
}
```

### Usage Tracking

```typescript
// UsageTracking.ts
async function trackFeatureUsage(userId, feature, amount = 1) {
  // Update usage in database
  await supabase
    .from('subscription_usage')
    .upsert({
      user_id: userId,
      feature: feature,
      used_this_month: amount,
      updated_at: new Date()
    })
}

async function getRemainingUsage(userId, feature) {
  const subscription = await getUserSubscription(userId)
  const limit = getFeatureLimit(feature, subscription.plan_id)
  
  if (limit === 'unlimited') return 999999
  
  const { data } = await supabase
    .from('subscription_usage')
    .select('used_this_month')
    .eq('user_id', userId)
    .eq('feature', feature)
    .single()
  
  const used = data?.used_this_month || 0
  return limit - used
}
```

### Feature Availability UI

```typescript
// PracticeModuleScreen.tsx
function PracticeModuleScreen() {
  const [hasAccess, setHasAccess] = useState(false)
  const [remaining, setRemaining] = useState(0)
  
  useEffect(() => {
    checkAccess()
  }, [])
  
  async function checkAccess() {
    const access = await hasFeatureAccess('practice', userId)
    setHasAccess(access)
    
    if (access) {
      const rem = await getRemainingUsage(userId, 'practice')
      setRemaining(rem)
    }
  }
  
  if (!hasAccess) {
    return (
      <UpgradePrompt 
        feature="Practice Module"
        message="Upgrade to access unlimited practice questions"
      />
    )
  }
  
  return (
    <View>
      <PracticeContent />
      {remaining !== 'unlimited' && (
        <Text>Remaining: {remaining}</Text>
      )}
    </View>
  )
}
```

---

## 8. Expiration & Manual Renewal Logic

### Check Subscription Validity

```typescript
// SubscriptionManager.ts
async function isSubscriptionValid(userId) {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) return false
  
  const endDate = new Date(subscription.end_date)
  const today = new Date()
  
  return endDate > today
}

async function getDaysRemaining(userId) {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) return 0
  
  const endDate = new Date(subscription.end_date)
  const today = new Date()
  
  const daysRemaining = Math.ceil(
    (endDate - today) / (1000 * 60 * 60 * 24)
  )
  
  return Math.max(0, daysRemaining)
}

async function isSubscriptionExpiringSoon(userId) {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) return false
  
  // Show renewal prompt 5 days before expiration
  const daysRemaining = await getDaysRemaining(userId)
  
  return daysRemaining <= 5 && daysRemaining > 0
}
```

### Manual Renewal Process

```typescript
// ManualRenewal.ts
async function renewSubscription(userId, planId) {
  try {
    // Step 1: Get the plan details
    const plan = await getPlan(planId)
    
    // Step 2: Process payment (user chooses to renew)
    const paymentResult = await processPayment(userId, plan.price)
    
    if (!paymentResult.success) {
      throw new Error('Payment failed')
    }
    
    // Step 3: Update subscription with new end date
    const currentSub = await getUserSubscription(userId)
    const newEndDate = addDays(new Date(), plan.duration_days)
    
    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        end_date: newEndDate,
        plan_id: planId
      })
      .eq('id', currentSub.id)
    
    // Step 4: Send success notification
    await sendNotification(
      userId,
      `Subscription renewed! Expires ${formatDate(newEndDate)}`
    )
    
    return { success: true, newEndDate }
    
  } catch (error) {
    console.error('Renewal error:', error)
    throw error
  }
}
```

### Trial Expiration Logic

```typescript
// TrialManager.ts
async function startFreeTrial(userId) {
  const trialEndDate = addDays(new Date(), 7)
  
  await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: 'free_trial',
      status: 'trial',
      start_date: new Date(),
      end_date: trialEndDate,
      auto_renew: false
    })
  
  // Schedule expiration notification
  scheduleNotification(
    userId,
    'Your trial expires in 1 day!',
    trialEndDate - 1000 * 60 * 60 * 24
  )
}

async function handleTrialExpiration(userId) {
  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({ status: 'expired' })
    .eq('user_id', userId)
  
  // Show upgrade screen on next app launch
  await markUserForUpgradePrompt(userId)
  
  // Send notification
  await sendNotification(userId, 'Trial expired. Upgrade now to continue!')
}
```

---

## 9. Upgrade/Downgrade Flow

### Upgrade Process

```typescript
// UpgradeFlow.ts
async function upgradeSubscription(userId, newPlanId) {
  const currentSub = await getUserSubscription(userId)
  const newPlan = await getPlan(newPlanId)
  
  // Calculate prorated amount
  const daysRemaining = await getDaysRemaining(userId)
  const creditAmount = calculateProration(
    currentSub.amount,
    daysRemaining
  )
  
  // Charge difference
  const chargeAmount = (newPlan.price * daysRemaining / 30) - creditAmount
  
  if (chargeAmount > 0) {
    const result = await processPayment(userId, chargeAmount)
    if (!result.success) throw new Error('Payment failed')
  }
  
  // Update subscription
  await supabase
    .from('subscriptions')
    .update({
      plan_id: newPlanId,
      amount: newPlan.price,
      end_date: addDays(new Date(), newPlan.duration_days)
    })
    .eq('id', currentSub.id)
  
  // Notify user
  await sendNotification(userId, 'Subscription upgraded successfully!')
}
```

### Downgrade Process

```typescript
// DowngradeFlow.ts
async function downgradeSubscription(userId, newPlanId) {
  const currentSub = await getUserSubscription(userId)
  const newPlan = await getPlan(newPlanId)
  
  // Calculate credit for remaining days
  const daysRemaining = await getDaysRemaining(userId)
  const creditAmount = calculateProration(
    currentSub.amount,
    daysRemaining,
    newPlan.price
  )
  
  // Apply credit (issue refund or store as account credit)
  if (creditAmount > 0) {
    await issueRefund(userId, creditAmount)
  }
  
  // Update subscription (takes effect after current billing period)
  await supabase
    .from('subscriptions')
    .update({
      plan_id_pending: newPlanId,
      next_plan_id: newPlanId
    })
    .eq('id', currentSub.id)
  
  // Notify user
  await sendNotification(
    userId,
    `You will be downgraded to ${newPlan.name} on ${currentSub.end_date}`
  )
}
```

---

## 10. Notifications & Alerts

### Subscription-Related Notifications

```
1. Trial Starting
   - "Welcome! Your 7-day free trial has started"
   - Send immediately
   
2. Trial Ending Soon (1 day before)
   - "Your trial expires tomorrow. Subscribe now to continue"
   - Include 'Subscribe' button
   
3. Subscription Active
   - "Subscription activated! All features unlocked"
   - Send on activation
   
4. Subscription Expiring Soon (5 days before)
   - "Your subscription expires in 5 days. Renew now?"
   - Include 'Renew Subscription' button
   
5. Subscription Expired
   - "Your subscription has expired. Features are limited"
   - Include 'Renew' or 'New Subscription' button
   
6. Renewal Successful
   - "Subscription renewed! Expires on [date]"
   - Send after manual renewal
```

---

## 11. Error Handling

```typescript
// ErrorHandling.ts
export const SUBSCRIPTION_ERRORS = {
  PAYMENT_FAILED: {
    code: 'PAYMENT_001',
    message: 'Payment processing failed. Please try again.',
    action: 'retry_payment'
  },
  PAYMENT_DECLINED: {
    code: 'PAYMENT_002',
    message: 'Card declined. Please use another payment method.',
    action: 'change_payment_method'
  },
  PAYMENT_TIMEOUT: {
    code: 'PAYMENT_003',
    message: 'Payment timed out. Please try again.',
    action: 'retry_payment'
  },
  RENEWAL_FAILED: {
    code: 'RENEWAL_001',
    message: 'Auto-renewal failed. Update your payment method.',
    action: 'update_payment_method'
  },
  INVALID_COUPON: {
    code: 'COUPON_001',
    message: 'Coupon code is invalid or expired.',
    action: 'try_another_coupon'
  },
  SUBSCRIPTION_NOT_FOUND: {
    code: 'SUB_001',
    message: 'Subscription not found.',
    action: 'contact_support'
  }
}

async function handleSubscriptionError(error, context) {
  const errorDef = SUBSCRIPTION_ERRORS[error.code]
  
  if (!errorDef) {
    // Unknown error - contact support
    showError('Something went wrong. Please contact support.')
    return
  }
  
  showError(errorDef.message)
  
  // Take action based on error
  switch (errorDef.action) {
    case 'retry_payment':
      navigation.navigate('PaymentScreen', { context })
      break
    case 'change_payment_method':
      navigation.navigate('UpdatePaymentScreen')
      break
    case 'update_payment_method':
      navigation.navigate('UpdatePaymentScreen')
      break
    case 'contact_support':
      openSupport()
      break
  }
}
```

---

## 12. Testing Checklist

### Unit Tests
- [ ] Trial start validation
- [ ] Payment routing (India vs International)
- [ ] Proration calculation
- [ ] Content gating logic
- [ ] Usage tracking

### Integration Tests
- [ ] Full subscription flow (Stripe)
- [ ] Full subscription flow (Razorpay)
- [ ] Trial to paid upgrade
- [ ] Renewal process
- [ ] Cancellation flow
- [ ] Downgrade process

### Manual Testing (Real Device)
- [ ] Start free trial
- [ ] Subscribe to monthly plan
- [ ] Check content gating
- [ ] Auto-renewal trigger
- [ ] Trial expiration
- [ ] Upgrade to yearly
- [ ] Downgrade to monthly

---

## 13. Implementation Checklist for Mobile Team

### Phase 1: Setup
- [ ] Create SubscriptionManager service
- [ ] Set up API client for subscription endpoints
- [ ] Configure Stripe SDK for React Native
- [ ] Configure Razorpay SDK for React Native
- [ ] Set up error handling utilities

### Phase 2: UI Components
- [ ] Create SubscriptionPlansScreen
- [ ] Create PaymentMethodSelectionScreen
- [ ] Create PaymentProcessingScreen
- [ ] Create ActiveSubscriptionScreen
- [ ] Create UpgradePromptModal
- [ ] Create TrialExpirationAlert

### Phase 3: Core Logic
- [ ] Implement subscription status checking
- [ ] Implement content gating
- [ ] Implement usage tracking
- [ ] Implement manual renewal logic (no auto-renewal)
- [ ] Implement trial management
- [ ] Implement expiration alerts

### Phase 4: Payment Integration
- [ ] Integrate Stripe checkout
- [ ] Integrate Razorpay checkout
- [ ] Implement payment verification
- [ ] Implement error handling

### Phase 5: Notifications & Alerts
- [ ] Schedule trial expiration notifications
- [ ] Schedule renewal reminders
- [ ] Send upgrade prompts
- [ ] Send success confirmations

### Phase 6: Testing & QA
- [ ] Unit test all logic
- [ ] Integration test payment flows
- [ ] Manual testing on real devices
- [ ] Test edge cases

---

## 14. Database Tables Needed (Already Created ✅)

```
✅ subscription_plans
   - id, name, price, billing_period, duration_days, features, is_active

✅ subscriptions
   - id, user_id, plan_id, status, start_date, end_date, payment_method
   - NO auto_renew field - manual renewal only

✅ subscription_usage
   - id, user_id, feature, used_this_month, updated_at

✅ payments
   - id, user_id, amount, currency, status, gateway, gateway_transaction_id

✅ user_profiles
   - id, user_id, current_country, subscription_status
```

---

## 15. API Response Examples

### Get Subscription Plans
```json
{
  "plans": [
    {
      "id": "trial_7d",
      "name": "Free Trial",
      "price": 0,
      "billingPeriod": "trial",
      "durationDays": 7,
      "features": {
        "practice": true,
        "learning": true,
        "mockExams": true,
        "aiChat": true
      }
    },
    {
      "id": "monthly",
      "name": "Monthly",
      "price": 9.99,
      "billingPeriod": "monthly",
      "durationDays": 30
    }
  ]
}
```

### Get User Subscription
```json
{
  "subscription": {
    "id": "sub_123",
    "userId": "user_456",
    "planId": "monthly",
    "status": "active",
    "startDate": "2025-01-01",
    "endDate": "2025-02-01",
    "renewalDate": "2025-02-02",
    "autoRenew": true,
    "daysRemaining": 28
  }
}
```

---

**Implementation is straightforward and follows standard patterns for mobile subscription management. All backend APIs are production-ready!**
