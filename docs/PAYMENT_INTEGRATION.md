# 💳 Payment Integration - Jeeva Learning

## Overview

Jeeva Learning implements a dual payment gateway system to optimize payment processing for nursing students globally preparing for the NMC CBT exam.

**Payment Gateways:**
- **Stripe** - International students (outside India)
- **Razorpay** - Indian students

**Subscription Model:**
- Duration-based plans (30/60/90/120 days)
- Non-recurring (expires after duration)
- USD pricing (auto-converted by gateways)
- Trial mode for user acquisition

---

## 🌍 Payment Gateway Routing

### Country-Based Selection

**Logic:**
```javascript
function selectPaymentGateway(userCountry) {
  return userCountry === 'India' ? 'razorpay' : 'stripe';
}
```

**Data Source:**
- `user_profiles.current_country` - Set during profile completion
- Used to automatically show appropriate payment gateway

**Routing Table:**

| User Location | Payment Gateway | Supported Methods |
|---------------|----------------|-------------------|
| India | Razorpay | UPI, Cards, Net Banking, Wallets |
| International | Stripe | Credit/Debit Cards, Apple Pay, Google Pay |

---

## 📅 Subscription Plans

### Duration-Based Plans

All plans provide **full access** to:
- ✅ All 3 modules (Practice, Learning, Mock Exams)
- ✅ AI JeevaBot chatbot
- ✅ Performance analytics
- ✅ Unlimited content access
- ✅ Mock exam attempts

**Plan Options:**

| Plan | Duration | Price (USD) | Best For |
|------|----------|-------------|----------|
| **30 Days** | 30 days | $49 | Quick revision before exam |
| **60 Days** | 60 days | $89 | Short-term focused prep |
| **90 Days** | 90 days | $119 | **Most Popular** - Standard prep |
| **120 Days** | 120 days | $149 | Extended prep with flexibility |

**Pricing Strategy:**
- Longer plans offer better value per day
- All prices in USD (converted by payment gateways)
- Razorpay auto-converts to INR at current exchange rate
- Prices can be customized in admin portal

---

## 🎁 Trial Mode

### Free Trial Features

**What's Included:**
- ✅ 1 complete Learning Module (all lessons, videos, podcasts)
- ✅ 1 Practice Module (topic-specific MCQ practice)
- ❌ Mock Exams (locked - premium only)
- ❌ Full content library (locked)
- 🔒 Limited AI JeevaBot (10 messages/day or locked)

**Purpose:**
- Let nurses experience teaching quality
- Build trust before payment
- Convert free users to paid subscribers

**Database Implementation:**
```sql
-- Trial user subscription
INSERT INTO subscriptions (
  user_id, 
  plan_id, 
  status, 
  start_date, 
  end_date, 
  amount_paid_usd
) VALUES (
  'user-uuid',
  'trial-plan-uuid',
  'trial',
  NOW(),
  NOW() + INTERVAL '365 days', -- Trial doesn't expire
  0.00
);
```

**Content Gating:**
```javascript
function hasAccessToContent(subscription, contentType) {
  if (subscription.status === 'trial') {
    return contentType === 'learning_module_1' || 
           contentType === 'practice_module_1';
  }
  return subscription.status === 'active' && 
         subscription.end_date > new Date();
}
```

---

## 🎟️ Discount & Coupon System

### Coupon Types

**1. Percentage Discount**
```json
{
  "code": "FIRST20",
  "discount_type": "percentage",
  "discount_value": 20,
  "description": "20% off for first-time users"
}
```

**2. Fixed Amount Discount**
```json
{
  "code": "SAVE10",
  "discount_type": "fixed_amount",
  "discount_value": 10,
  "description": "$10 off any plan"
}
```

### Coupon Validation Logic

**Validation Steps:**
1. ✅ Coupon code exists
2. ✅ Coupon is active (`is_active = true`)
3. ✅ Current date is between `valid_from` and `valid_until`
4. ✅ Usage limit not exceeded (`usage_count < usage_limit`)
5. ✅ Applicable to selected plan (if `applicable_plans` specified)

**Example Validation:**
```javascript
async function validateCoupon(code, planId) {
  const coupon = await db
    .select()
    .from(discount_coupons)
    .where(eq(discount_coupons.code, code))
    .limit(1);

  if (!coupon) return { valid: false, error: 'Invalid coupon code' };
  
  if (!coupon.is_active) {
    return { valid: false, error: 'Coupon is inactive' };
  }
  
  const now = new Date();
  if (now < coupon.valid_from || now > coupon.valid_until) {
    return { valid: false, error: 'Coupon expired' };
  }
  
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }
  
  if (coupon.applicable_plans && !coupon.applicable_plans.includes(planId)) {
    return { valid: false, error: 'Coupon not valid for this plan' };
  }
  
  return { valid: true, coupon };
}
```

### Discount Calculation

```javascript
function calculateFinalPrice(planPrice, coupon) {
  if (!coupon) return planPrice;
  
  let discount = 0;
  
  if (coupon.discount_type === 'percentage') {
    discount = (planPrice * coupon.discount_value) / 100;
  } else if (coupon.discount_type === 'fixed_amount') {
    discount = coupon.discount_value;
  }
  
  return Math.max(0, planPrice - discount); // Ensure non-negative
}
```

---

## 🔐 Stripe Integration

### Setup Requirements

**Environment Variables:**
```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Installation:**
```bash
npm install stripe @stripe/stripe-js
```

### Payment Flow

**1. Frontend - Create Checkout Session**
```javascript
import { loadStripe } from '@stripe/stripe-js';

async function initiateStripePayment(planId, couponCode) {
  const response = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, couponCode })
  });
  
  const { sessionId } = await response.json();
  
  const stripe = await loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);
  await stripe.redirectToCheckout({ sessionId });
}
```

**2. Backend - Create Checkout Session**
```javascript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/stripe/create-checkout', async (req, res) => {
  const { planId, couponCode } = req.body;
  const user = req.user; // From auth middleware
  
  // Get plan details
  const plan = await db.query.subscription_plans.findFirst({
    where: eq(subscription_plans.id, planId)
  });
  
  // Validate and apply coupon
  let finalPrice = plan.price_usd;
  let coupon = null;
  
  if (couponCode) {
    const validation = await validateCoupon(couponCode, planId);
    if (validation.valid) {
      coupon = validation.coupon;
      finalPrice = calculateFinalPrice(plan.price_usd, coupon);
    }
  }
  
  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: plan.name,
          description: plan.description,
        },
        unit_amount: Math.round(finalPrice * 100), // Stripe uses cents
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/payment/cancel`,
    metadata: {
      userId: user.id,
      planId: plan.id,
      couponCode: couponCode || '',
      durationDays: plan.duration_days,
    },
  });
  
  res.json({ sessionId: session.id });
});
```

**3. Webhook Handler - Confirm Payment**
```javascript
app.post('/api/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, planId, couponCode, durationDays } = session.metadata;
    
    // Create subscription record
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(durationDays));
    
    await db.insert(subscriptions).values({
      user_id: userId,
      plan_id: planId,
      status: 'active',
      start_date: startDate,
      end_date: endDate,
      payment_gateway: 'stripe',
      payment_method: 'card',
      amount_paid_usd: session.amount_total / 100,
      coupon_code: couponCode || null,
      transaction_id: session.payment_intent,
    });
    
    // Increment coupon usage
    if (couponCode) {
      await db
        .update(discount_coupons)
        .set({ usage_count: sql`${discount_coupons.usage_count} + 1` })
        .where(eq(discount_coupons.code, couponCode));
    }
  }
  
  res.json({ received: true });
});
```

---

## 🇮🇳 Razorpay Integration

### Setup Requirements

**Environment Variables:**
```env
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
```

**Installation:**
```bash
npm install razorpay
```

### Payment Flow

**1. Frontend - Razorpay Checkout**
```javascript
async function initiateRazorpayPayment(planId, couponCode) {
  // Create order on backend
  const response = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, couponCode })
  });
  
  const { orderId, amount, currency } = await response.json();
  
  // Open Razorpay checkout
  const options = {
    key: process.env.RAZORPAY_KEY_ID,
    amount: amount, // Amount in paise
    currency: currency,
    name: 'Jeeva Learning',
    description: 'NMC CBT Exam Preparation',
    order_id: orderId,
    handler: async function (response) {
      // Verify payment on backend
      await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        })
      });
    },
    prefill: {
      name: user.full_name,
      email: user.email,
      contact: user.phone_number
    },
    theme: {
      color: '#007aff'
    }
  };
  
  const razorpay = new Razorpay(options);
  razorpay.open();
}
```

**2. Backend - Create Order**
```javascript
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post('/api/razorpay/create-order', async (req, res) => {
  const { planId, couponCode } = req.body;
  const user = req.user;
  
  // Get plan
  const plan = await db.query.subscription_plans.findFirst({
    where: eq(subscription_plans.id, planId)
  });
  
  // Apply coupon
  let finalPrice = plan.price_usd;
  let coupon = null;
  
  if (couponCode) {
    const validation = await validateCoupon(couponCode, planId);
    if (validation.valid) {
      coupon = validation.coupon;
      finalPrice = calculateFinalPrice(plan.price_usd, coupon);
    }
  }
  
  // Convert USD to INR (Razorpay handles this, or use exchange rate API)
  const exchangeRate = 83; // Example: 1 USD = 83 INR
  const amountInINR = Math.round(finalPrice * exchangeRate * 100); // Paise
  
  // Create Razorpay order
  const order = await razorpay.orders.create({
    amount: amountInINR,
    currency: 'INR',
    receipt: `order_${Date.now()}`,
    notes: {
      userId: user.id,
      planId: plan.id,
      couponCode: couponCode || '',
      durationDays: plan.duration_days,
    }
  });
  
  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
  });
});
```

**3. Backend - Verify Payment**
```javascript
import crypto from 'crypto';

app.post('/api/razorpay/verify-payment', async (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  
  // Verify signature
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  
  if (expectedSignature !== signature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  // Get order details
  const order = await razorpay.orders.fetch(orderId);
  const { userId, planId, couponCode, durationDays } = order.notes;
  
  // Create subscription
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + parseInt(durationDays));
  
  await db.insert(subscriptions).values({
    user_id: userId,
    plan_id: planId,
    status: 'active',
    start_date: startDate,
    end_date: endDate,
    payment_gateway: 'razorpay',
    payment_method: 'razorpay', // Could be UPI, card, etc.
    amount_paid_usd: order.amount / (83 * 100), // Convert back to USD
    coupon_code: couponCode || null,
    transaction_id: paymentId,
  });
  
  // Increment coupon usage
  if (couponCode) {
    await db
      .update(discount_coupons)
      .set({ usage_count: sql`${discount_coupons.usage_count} + 1` })
      .where(eq(discount_coupons.code, couponCode));
  }
  
  res.json({ success: true });
});
```

---

## 📱 Mobile App Integration

### Payment Gateway Selection UI

```javascript
// Display appropriate gateway based on country
function PaymentScreen({ planId }) {
  const user = useUser();
  const gateway = user.current_country === 'India' ? 'razorpay' : 'stripe';
  
  return (
    <View>
      <PlanCard plan={selectedPlan} />
      
      <CouponInput onApply={(code) => setCouponCode(code)} />
      
      {gateway === 'stripe' ? (
        <StripeCheckoutButton 
          planId={planId} 
          couponCode={couponCode} 
        />
      ) : (
        <RazorpayCheckoutButton 
          planId={planId} 
          couponCode={couponCode} 
        />
      )}
    </View>
  );
}
```

### Subscription Status Check

```javascript
async function checkSubscriptionStatus(userId) {
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.user_id, userId),
    orderBy: desc(subscriptions.created_at),
  });
  
  if (!subscription) {
    return { status: 'no_subscription', accessLevel: 'trial' };
  }
  
  // Check if expired
  const now = new Date();
  if (subscription.end_date < now) {
    // Update status to expired
    await db
      .update(subscriptions)
      .set({ status: 'expired' })
      .where(eq(subscriptions.id, subscription.id));
    
    return { status: 'expired', accessLevel: 'trial', daysRemaining: 0 };
  }
  
  // Calculate days remaining
  const daysRemaining = Math.ceil(
    (subscription.end_date - now) / (1000 * 60 * 60 * 24)
  );
  
  return {
    status: subscription.status,
    accessLevel: 'full',
    daysRemaining,
    endDate: subscription.end_date,
  };
}
```

---

## 🔄 Subscription Lifecycle

### Status Flow

```
Trial → (Payment) → Active → (Time expires) → Expired
  ↓                    ↓
  └─────────────────→ (Manual) → Cancelled
```

**Status Definitions:**
- **trial** - Free trial access (limited features)
- **active** - Paid subscription, full access
- **expired** - Subscription ended (end_date passed)
- **cancelled** - User manually cancelled

### Expiry Handling

**Cron Job (Daily):**
```javascript
// Run daily to mark expired subscriptions
async function checkExpiredSubscriptions() {
  const now = new Date();
  
  await db
    .update(subscriptions)
    .set({ status: 'expired' })
    .where(
      and(
        eq(subscriptions.status, 'active'),
        lt(subscriptions.end_date, now)
      )
    );
}
```

**User Notification:**
- 7 days before expiry: "Your subscription expires in 7 days"
- 1 day before: "Last day of access! Renew now"
- On expiry: "Your subscription has expired. Upgrade to continue"

---

## 📊 Admin Portal Features

### Discount/Coupon Management

**CRUD Operations:**
- ✅ Create new coupon codes
- ✅ Edit coupon details
- ✅ Activate/deactivate coupons
- ✅ View usage statistics
- ✅ Delete unused coupons

**Analytics:**
- Total coupons created
- Active vs inactive coupons
- Most used coupons
- Revenue impact of discounts

### Subscription Analytics

**Metrics:**
- Total active subscriptions
- New subscriptions (this month)
- Expiring soon (next 7 days)
- Revenue by plan (30/60/90/120 days)
- Payment gateway breakdown (Stripe vs Razorpay)
- Conversion rate (trial → paid)

---

## 🔒 Security Considerations

**Best Practices:**
1. ✅ Never expose secret keys in frontend code
2. ✅ Validate all payments on backend via webhooks
3. ✅ Use HTTPS for all payment-related requests
4. ✅ Implement rate limiting on payment endpoints
5. ✅ Log all payment transactions for audit
6. ✅ Store minimal payment data (never store card details)
7. ✅ Verify webhook signatures (Stripe & Razorpay)

**PCI Compliance:**
- Stripe and Razorpay handle PCI compliance
- Never collect or store card data directly
- Use hosted payment pages (Stripe Checkout, Razorpay Standard)

---

## 🧪 Testing

### Test Mode

**Stripe Test Cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```

**Razorpay Test Cards:**
```
Success: 4111 1111 1111 1111
Failure: 4000 0000 0000 0002
```

**Test Coupons:**
```json
{
  "code": "TEST50",
  "discount_type": "percentage",
  "discount_value": 50,
  "valid_until": "2099-12-31"
}
```

---

## 📚 Related Documentation

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Subscription and coupon tables
- [MOBILE_SETUP_GUIDE.md](./MOBILE_SETUP_GUIDE.md) - Mobile payment implementation
- [FEATURE_SPECIFICATIONS.md](./FEATURE_SPECIFICATIONS.md) - Subscription features

---

**Version:** 1.0  
**Last Updated:** October 18, 2025  
**Maintained by:** vollstek@gmail.com
