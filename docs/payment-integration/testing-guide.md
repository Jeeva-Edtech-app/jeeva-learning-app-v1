# Payment Gateway Testing Guide

## Overview

This guide covers testing both Stripe and Razorpay payment integrations in development and production environments.

## Test Environment Setup

### Stripe Test Mode

1. **Get Test API Keys**
   - Go to Stripe Dashboard → Developers → API Keys
   - Copy "Publishable key" (starts with `pk_test_`)
   - Copy "Secret key" (starts with `sk_test_`)

2. **Configure in Backend**
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Configure Webhook Secret**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Razorpay Test Mode

1. **Get Test API Keys**
   - Go to Razorpay Dashboard → Settings → API Keys
   - Enable "Test Mode"
   - Copy "Key ID" (starts with `rzp_test_`)
   - Copy "Key Secret"

2. **Configure in Backend**
   ```bash
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```

3. **Configure Webhook Secret**
   ```bash
   RAZORPAY_WEBHOOK_SECRET=...
   ```

## Test Cards

### Stripe Test Cards

| Card Number         | Brand      | Scenario              |
|---------------------|------------|-----------------------|
| 4242 4242 4242 4242 | Visa       | Success               |
| 4000 0025 0000 3155 | Visa       | 3D Secure Required    |
| 4000 0000 0000 9995 | Visa       | Declined              |
| 4000 0000 0000 0002 | Visa       | Declined (generic)    |
| 5555 5555 5555 4444 | Mastercard | Success               |
| 2223 0031 2200 3222 | Mastercard | 3D Secure Required    |

**Additional Info:**
- CVV: Any 3 digits (e.g., 123)
- Expiry: Any future date (e.g., 12/25)
- ZIP: Any valid code (e.g., 12345)

### Razorpay Test Cards

| Card Number         | Brand      | Scenario  |
|---------------------|------------|-----------|
| 4111 1111 1111 1111 | Visa       | Success   |
| 5555 5555 5555 4444 | Mastercard | Success   |
| 3566 0020 2036 0505 | JCB        | Success   |

**Additional Info:**
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

### Razorpay Test UPI

- **UPI ID**: `success@razorpay`
- **Outcome**: Payment succeeds

### Razorpay Test Net Banking

- Select any bank
- Will show test payment page
- Click "Success" to complete payment

## Test Scenarios

### Scenario 1: Successful Payment (Stripe)

**Test Flow:**
1. Select subscription plan
2. Country: GB (UK)
3. Enter coupon code (optional)
4. Click "Pay with Card"
5. Enter test card: 4242 4242 4242 4242
6. CVV: 123, Expiry: 12/25
7. Complete payment

**Expected Result:**
- ✅ Payment sheet opens
- ✅ Payment processes successfully
- ✅ Subscription activates
- ✅ Success message displayed
- ✅ Webhook received and processed

### Scenario 2: Successful Payment (Razorpay)

**Test Flow:**
1. Select subscription plan
2. Country: IN (India)
3. Enter coupon code (optional)
4. Click "Pay Now"
5. Select UPI
6. Enter: `success@razorpay`
7. Complete payment

**Expected Result:**
- ✅ Razorpay checkout opens
- ✅ UPI payment succeeds
- ✅ Subscription activates
- ✅ Success message displayed
- ✅ Webhook received and processed

### Scenario 3: Payment Declined

**Test Flow:**
1. Select subscription plan
2. Country: GB
3. Click "Pay with Card"
4. Enter card: 4000 0000 0000 9995
5. Complete payment

**Expected Result:**
- ✅ Payment sheet opens
- ✅ Card declined error shown
- ✅ User can retry with different card
- ✅ Payment status remains "pending"

### Scenario 4: User Cancels Payment (Stripe)

**Test Flow:**
1. Start payment flow
2. Open Stripe payment sheet
3. Press "X" or back button

**Expected Result:**
- ✅ Payment sheet closes
- ✅ "Payment canceled" message shown
- ✅ User can retry payment
- ✅ No webhook sent

### Scenario 5: User Cancels Payment (Razorpay)

**Test Flow:**
1. Start payment flow
2. Open Razorpay checkout
3. Press back button

**Expected Result:**
- ✅ Razorpay closes
- ✅ "Payment canceled" message shown
- ✅ User can retry payment
- ✅ No webhook sent

### Scenario 6: 3D Secure Authentication (Stripe)

**Test Flow:**
1. Select subscription plan
2. Enter card: 4000 0025 0000 3155
3. Complete payment
4. Complete 3D Secure authentication

**Expected Result:**
- ✅ 3D Secure modal appears
- ✅ Complete authentication
- ✅ Payment succeeds
- ✅ Subscription activates

### Scenario 7: Discount Coupon Applied

**Test Flow:**
1. Select subscription plan
2. Enter valid coupon code
3. Verify discounted price shown
4. Complete payment

**Expected Result:**
- ✅ Original price crossed out
- ✅ Discount amount shown
- ✅ Final price calculated correctly
- ✅ Payment charged at discounted price
- ✅ Coupon recorded in payment

### Scenario 8: Invalid Coupon Code

**Test Flow:**
1. Select subscription plan
2. Enter invalid coupon code
3. Attempt payment

**Expected Result:**
- ✅ Error message: "Invalid coupon code"
- ✅ Full price charged
- ✅ Payment still processes

### Scenario 9: Gateway Routing (India)

**Test Flow:**
1. Set device locale to India (IN)
2. Create account
3. Select subscription plan

**Expected Result:**
- ✅ Razorpay selected automatically
- ✅ UPI/Card/Net Banking options shown
- ✅ "0% fees on UPI" message displayed

### Scenario 10: Gateway Routing (International)

**Test Flow:**
1. Set device locale to UK (GB)
2. Create account
3. Select subscription plan

**Expected Result:**
- ✅ Stripe selected automatically
- ✅ Card payment options shown
- ✅ Apple Pay/Google Pay available

## Webhook Testing

### Test Webhooks Locally

#### Using Stripe CLI

1. **Install Stripe CLI**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login**
   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost**
   ```bash
   stripe listen --forward-to localhost:3001/api/payments/webhooks/stripe
   ```

4. **Trigger test webhook**
   ```bash
   stripe trigger payment_intent.succeeded
   ```

#### Using ngrok for Razorpay

1. **Install ngrok**
   ```bash
   brew install ngrok
   ```

2. **Start tunnel**
   ```bash
   ngrok http 3001
   ```

3. **Configure webhook in Razorpay Dashboard**
   - URL: `https://your-ngrok-url.ngrok.io/api/payments/webhooks/razorpay`
   - Events: `payment.authorized`, `payment.captured`, `payment.failed`

4. **Make test payment**
   - Webhook automatically sent to your local server

### Verify Webhook Processing

Check backend logs for:
```
✅ Webhook received: payment.succeeded
✅ Signature verified
✅ Payment updated: succeeded
✅ Subscription activated
```

## End-to-End Testing Checklist

### Before Testing

- [ ] Backend server running
- [ ] Mobile app running
- [ ] Test API keys configured
- [ ] Webhook endpoints configured
- [ ] Database accessible

### Test Cases

#### Payment Success
- [ ] Stripe card payment succeeds
- [ ] Razorpay UPI payment succeeds
- [ ] Razorpay card payment succeeds
- [ ] Subscription activates correctly
- [ ] Webhook processed
- [ ] Email confirmation sent (if configured)

#### Payment Failure
- [ ] Stripe card declined handled
- [ ] Razorpay payment failure handled
- [ ] Error messages clear
- [ ] User can retry payment
- [ ] Failed payment logged

#### User Experience
- [ ] Loading states shown
- [ ] Success message displayed
- [ ] Error messages clear
- [ ] Navigation works after payment
- [ ] Can cancel payment
- [ ] Can retry failed payment

#### Gateway Routing
- [ ] Indian users → Razorpay
- [ ] UK users → Stripe
- [ ] US users → Stripe
- [ ] Can override country selection
- [ ] Routing matches backend

#### Coupons
- [ ] Valid coupon applies discount
- [ ] Invalid coupon shows error
- [ ] Expired coupon rejected
- [ ] Discount calculated correctly
- [ ] Coupon recorded in payment

## Debugging

### Payment Not Creating

**Check:**
1. Backend API running?
2. API URL correct in mobile app?
3. User ID valid?
4. Subscription plan ID exists?

**Logs to check:**
```
POST /api/payments/create
Request: { userId, subscriptionPlanId, countryCode }
Response: { paymentId, clientSecret/orderId, gateway }
```

### Payment Not Verifying

**Check:**
1. Payment ID correct?
2. Gateway matches?
3. Signature valid (Razorpay)?
4. Payment Intent ID correct (Stripe)?

**Logs to check:**
```
POST /api/payments/verify
Request: { paymentId, gateway, ... }
Response: { success: true/false }
```

### Webhook Not Processing

**Check:**
1. Webhook URL accessible?
2. Signature verification passing?
3. Event type supported?
4. Database update failing?

**Logs to check:**
```
POST /api/payments/webhooks/stripe
Signature: verified ✓
Event: payment_intent.succeeded
Payment ID: pi_xxx
Status updated: succeeded ✓
```

## Production Testing

### Before Going Live

1. **Switch to Live Keys**
   - Stripe: `pk_live_...` and `sk_live_...`
   - Razorpay: `rzp_live_...`

2. **Test with Small Amount**
   - Use smallest subscription plan
   - Test real payment
   - Verify subscription activates
   - Verify webhook received
   - Issue refund if needed

3. **Test Refunds**
   - Create test payment
   - Issue refund via admin portal
   - Verify refund completes
   - Verify subscription deactivates (if applicable)

4. **Monitor First Week**
   - Check Stripe/Razorpay dashboards daily
   - Monitor webhook delivery rates
   - Check for failed payments
   - Verify subscription activations

### Production Monitoring

**Key Metrics:**
- Payment success rate (target: >95%)
- Webhook delivery rate (target: 100%)
- Average payment time
- Gateway distribution (Stripe vs Razorpay)
- Refund rate

**Alerts:**
- Payment success rate drops below 90%
- Webhook delivery fails
- Multiple payment failures for same user
- Unusual refund activity

## Support

### Stripe Issues

- [Stripe Testing Docs](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Dashboard](https://dashboard.stripe.com)

### Razorpay Issues

- [Razorpay Testing Docs](https://razorpay.com/docs/payment-gateway/test-card-details/)
- [Razorpay Webhooks Guide](https://razorpay.com/docs/webhooks/)
- [Razorpay Dashboard](https://dashboard.razorpay.com)

## Common Test Issues

### Issue: "Invalid client secret"

**Solution**: Ensure you're passing the full client secret from backend, not just the payment intent ID.

### Issue: "Invalid signature" (Razorpay)

**Solution**: Verify you're passing all three values: `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`

### Issue: Webhook not received

**Solution**: 
1. Check webhook URL is accessible
2. Verify webhook secret is correct
3. Check Stripe/Razorpay dashboard for delivery attempts
4. Look for signature verification errors in logs

### Issue: Payment succeeds but subscription not activated

**Solution**:
1. Check webhook processing logs
2. Verify subscription ID is correct
3. Check database for subscription status
4. Manual activation may be needed
