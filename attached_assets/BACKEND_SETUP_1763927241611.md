# Backend Payment Gateway Setup

---

## Environment Variables

Create `.env` in your backend root:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51234567890abc...
STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abc...
STRIPE_WEBHOOK_SECRET=whsec_1234567890abc...

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_abc123...
RAZORPAY_KEY_SECRET=abc123def456...
RAZORPAY_WEBHOOK_SECRET=whsec_abc123...

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Server
PORT=3001
NODE_ENV=development
```

---

## API Endpoints

### GET /api/subscription/plans

**Fetch subscription plans**

```typescript
router.get('/plans', async (req, res) => {
  try {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true);

    res.json({ plans: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### POST /api/payments/create

**Create payment session (Intent or Order)**

Request body:
```json
{
  "user_id": "uuid",
  "subscription_plan_id": "plan_id",
  "country_code": "IN"
}
```

Response:
```json
{
  "gateway": "razorpay",
  "order_id": "order_xyz",
  "amount": 799,
  "currency": "INR"
}
```

Implementation:
```typescript
router.post('/create', async (req, res) => {
  try {
    const { user_id, subscription_plan_id, country_code } = req.body;

    // Validation
    if (!user_id || !subscription_plan_id || !country_code) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    // Get plan
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', subscription_plan_id)
      .single();

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Create payment record
    const { data: payment } = await supabase
      .from('payments')
      .insert({
        user_id,
        subscription_plan_id,
        amount: country_code === 'IN' ? plan.price_inr : plan.price_usd,
        currency: country_code === 'IN' ? 'INR' : 'USD',
        gateway: country_code === 'IN' ? 'razorpay' : 'stripe',
        status: 'pending',
      })
      .select()
      .single();

    // Create gateway order/intent
    if (country_code === 'IN') {
      const razorpay = require('razorpay');
      const instance = new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const order = await instance.orders.create({
        amount: plan.price_inr * 100,
        currency: 'INR',
        receipt: payment.id,
      });

      await supabase
        .from('payments')
        .update({ razorpay_order_id: order.id })
        .eq('id', payment.id);

      return res.json({
        gateway: 'razorpay',
        order_id: order.id,
        amount: plan.price_inr,
        currency: 'INR',
      });
    } else {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

      const intent = await stripe.paymentIntents.create({
        amount: Math.round(plan.price_usd * 100),
        currency: 'usd',
        metadata: {
          user_id,
          plan_id: subscription_plan_id,
        },
      });

      await supabase
        .from('payments')
        .update({ stripe_payment_intent_id: intent.id })
        .eq('id', payment.id);

      return res.json({
        gateway: 'stripe',
        client_secret: intent.client_secret,
        amount: plan.price_usd,
        currency: 'USD',
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### POST /api/payments/verify

**Verify payment and activate subscription**

Request:
```json
{
  "payment_id": "uuid",
  "gateway": "razorpay",
  "razorpay_order_id": "order_xyz",
  "razorpay_payment_id": "pay_xyz",
  "razorpay_signature": "sig_xyz"
}
```

Response:
```json
{
  "success": true,
  "subscription_id": "sub_uuid"
}
```

Implementation:
```typescript
router.post('/verify', async (req, res) => {
  try {
    const {
      payment_id,
      gateway,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!payment_id || !gateway) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    // Verify Razorpay signature
    if (gateway === 'razorpay') {
      const crypto = require('crypto');
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(req.body.razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (expected !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    // Update payment
    const { data: payment } = await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        razorpay_payment_id,
      })
      .eq('id', payment_id)
      .select()
      .single();

    // Activate subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: payment.user_id,
        subscription_plan_id: payment.subscription_plan_id,
        status: 'active',
        start_date: new Date(),
      })
      .select()
      .single();

    res.json({
      success: true,
      subscription_id: subscription.id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Database Tables

### subscription_plans

```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price_usd DECIMAL(10, 2),
  price_inr DECIMAL(10, 2),
  duration_days INT,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);
```

### payments

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription_plan_id UUID NOT NULL,
  amount DECIMAL(10, 2),
  currency VARCHAR(3),
  gateway VARCHAR(50),
  status VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### user_subscriptions

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription_plan_id UUID NOT NULL,
  status VARCHAR(50),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

---

## Webhook Handlers

### Stripe Webhook

```typescript
app.post('/api/payments/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      const { id, metadata } = event.data.object;

      const { data: payment } = await supabase
        .from('payments')
        .update({ status: 'succeeded' })
        .eq('stripe_payment_intent_id', id)
        .select()
        .single();

      if (payment) {
        await supabase
          .from('user_subscriptions')
          .insert({
            user_id: metadata.user_id,
            subscription_plan_id: metadata.plan_id,
            status: 'active',
          });
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
```

### Razorpay Webhook

```typescript
app.post('/api/payments/webhooks/razorpay', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  try {
    const body = JSON.stringify(req.body);
    const crypto = require('crypto');

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    if (req.body.event === 'payment.authorized') {
      const { order_id, id: payment_id } = req.body.payload.payment.entity;

      const { data: payment } = await supabase
        .from('payments')
        .update({ status: 'succeeded' })
        .eq('razorpay_order_id', order_id)
        .select()
        .single();

      if (payment) {
        await supabase
          .from('user_subscriptions')
          .insert({
            user_id: payment.user_id,
            subscription_plan_id: payment.subscription_plan_id,
            status: 'active',
          });
      }
    }

    res.json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Testing

### Check Environment

```bash
node -e "console.log('Stripe:', !!process.env.STRIPE_SECRET_KEY)"
node -e "console.log('Razorpay:', !!process.env.RAZORPAY_KEY_ID)"
```

### Test Plan Endpoint

```bash
curl http://localhost:3001/api/subscription/plans
```

### Test Payment Creation

```bash
curl -X POST http://localhost:3001/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "subscription_plan_id": "plan_1",
    "country_code": "IN"
  }'
```

---

**Version:** 2.0  
**Date:** November 23, 2025
