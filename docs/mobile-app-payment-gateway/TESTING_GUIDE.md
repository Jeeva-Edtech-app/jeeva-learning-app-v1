# Payment Integration Testing Guide

---

## Test Credentials

### Stripe Test Mode

**Keys:**
```
Publishable: pk_test_51234567890abc...
Secret: sk_test_51234567890abc...
```

**Test Cards:**

| Card Number | Result | CVC | Expiry |
|---|---|---|---|
| 4242 4242 4242 4242 | Success | Any | Future |
| 4000 0025 0000 3155 | 3D Secure | Any | Future |
| 5555 5555 5555 4444 | Decline | Any | Future |
| 4000 0000 0000 0002 | Declined Card | Any | Future |

**Test Customer:**
- Email: test@example.com
- Any valid expiry date

---

### Razorpay Test Mode

**Keys:**
```
Key ID: rzp_test_abc123...
Key Secret: secret_abc123...
```

**Test Credentials:**

| Method | Credential |
|--------|-----------|
| UPI (Success) | success@razorpay |
| UPI (Decline) | failure@razorpay |
| Card (Test) | 4111 1111 1111 1111 |
| Card OTP | Any 6 digits |

---

## Testing Checklist

### 1. Backend Setup ✓

- [ ] Environment variables set in `.env`
- [ ] Stripe keys configured
- [ ] Razorpay keys configured
- [ ] Backend server running on port 3001

### 2. Endpoints Test ✓

Test subscription plans endpoint:
```bash
curl http://localhost:3001/api/subscription/plans
```

Expected response:
```json
{
  "plans": [
    {
      "id": "plan_monthly_01",
      "name": "Monthly Plan",
      "price_usd": 9.99,
      "duration_days": 30
    }
  ]
}
```

---

### 3. Razorpay Flow (India)

**Step 1: Create Payment**
```bash
curl -X POST http://localhost:3001/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "subscription_plan_id": "plan_monthly_01",
    "country_code": "IN"
  }'
```

Expected response:
```json
{
  "gateway": "razorpay",
  "order_id": "order_9A33XWu590gUtm",
  "amount": 799,
  "currency": "INR"
}
```

**Step 2: Process Payment in Mobile**
- Use order_id to open Razorpay checkout
- Select UPI and enter: `success@razorpay`
- Complete payment

**Step 3: Verify Payment**
```bash
curl -X POST http://localhost:3001/api/payments/verify \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "payment_uuid",
    "gateway": "razorpay",
    "razorpay_order_id": "order_9A33XWu590gUtm",
    "razorpay_payment_id": "pay_9A33XWu590gUtm",
    "razorpay_signature": "sig_abc123xyz"
  }'
```

Expected response:
```json
{
  "success": true,
  "subscription_id": "sub_uuid"
}
```

---

### 4. Stripe Flow (International)

**Step 1: Create Payment**
```bash
curl -X POST http://localhost:3001/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "subscription_plan_id": "plan_monthly_01",
    "country_code": "US"
  }'
```

Expected response:
```json
{
  "gateway": "stripe",
  "client_secret": "pi_1234567890abc_secret_xyz",
  "amount": 999,
  "currency": "USD"
}
```

**Step 2: Process Payment in Mobile**
- Use client_secret to initialize payment sheet
- Enter test card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits
- Complete payment

**Step 3: Verify Payment**
```bash
curl -X POST http://localhost:3001/api/payments/verify \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "payment_uuid",
    "gateway": "stripe",
    "stripe_payment_intent_id": "pi_1234567890abc"
  }'
```

Expected response:
```json
{
  "success": true,
  "subscription_id": "sub_uuid"
}
```

---

## Common Errors & Solutions

### Error: "Payment failed"

**Check:**
1. Backend running? `curl http://localhost:3001/api/subscription/plans`
2. Keys valid? Check `.env` file
3. Network connection? Ping the backend
4. Test mode enabled? Verify using test keys

---

### Error: "Invalid signature"

**Check:**
1. RAZORPAY_KEY_SECRET correct?
2. Order ID matches?
3. Payment ID correct?

---

### Error: "Plan not found"

**Check:**
1. Plan exists in database?
2. Plan ID correct?
3. Plan is_active = true?

---

### Error: "Missing required fields"

**Check:**
1. Sending user_id?
2. Sending subscription_plan_id?
3. Sending country_code?

---

## Production Testing

Before going live:

- [ ] Test with live payment methods (small amount)
- [ ] Verify webhook endpoints (use ngrok for local testing)
- [ ] Test error scenarios (decline card, timeout)
- [ ] Check database records after payment
- [ ] Verify subscription activated
- [ ] Test refund flow
- [ ] Monitor logs for errors

---

## Webhook Testing (Local)

Use ngrok to expose local backend:

```bash
ngrok http 3001
```

Configure in payment provider:
- Stripe Dashboard → Developers → Webhooks
- Razorpay Dashboard → Settings → Webhooks

Add webhook URL:
```
https://your-ngrok-url.ngrok.io/api/payments/webhooks/stripe
https://your-ngrok-url.ngrok.io/api/payments/webhooks/razorpay
```

---

**Version:** 2.0  
**Date:** November 23, 2025
