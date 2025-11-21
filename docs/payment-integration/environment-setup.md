# Payment Gateway Environment Setup

## Overview

This guide explains how to set up environment variables and secrets for Stripe and Razorpay payment gateways in the Jeeva Learning platform.

## Required Environment Variables

### Stripe Configuration

```bash
# Stripe Secret Key (backend only)
STRIPE_SECRET_KEY=sk_test_...  # Test mode
# or
STRIPE_SECRET_KEY=sk_live_...  # Production mode

# Stripe Publishable Key (can be public)
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Test mode
# or
STRIPE_PUBLISHABLE_KEY=pk_live_...  # Production mode

# Stripe Webhook Secret (backend only)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Razorpay Configuration

```bash
# Razorpay Key ID (can be public)
RAZORPAY_KEY_ID=rzp_test_...  # Test mode
# or
RAZORPAY_KEY_ID=rzp_live_...  # Production mode

# Razorpay Key Secret (backend only - NEVER expose)
RAZORPAY_KEY_SECRET=...  # Keep this secret!

# Razorpay Webhook Secret (backend only)
RAZORPAY_WEBHOOK_SECRET=...
```

### Existing Environment Variables

The following environment variables should already be set up:

```bash
# Supabase (required for database)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Resend (required for emails)
RESEND_API_KEY=...
```

## How to Get API Keys

### Stripe API Keys

1. **Sign up for Stripe**
   - Go to [stripe.com](https://stripe.com)
   - Create account (free)

2. **Get Test Keys**
   - Go to Dashboard → Developers → API Keys
   - Copy "Publishable key" (pk_test_...)
   - Copy "Secret key" (sk_test_...)

3. **Get Webhook Secret**
   - Go to Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - URL: `YOUR_API_URL/api/payments/webhooks/stripe`
   - Events: Select "payment_intent.succeeded", "payment_intent.payment_failed"
   - Copy "Signing secret" (whsec_...)

4. **Get Live Keys (Production)**
   - Activate your Stripe account (requires business verification)
   - Go to Dashboard → switch to "Live mode"
   - Repeat steps 2-3 for live keys

### Razorpay API Keys

1. **Sign up for Razorpay**
   - Go to [razorpay.com](https://razorpay.com)
   - Create account (free for testing)

2. **Get Test Keys**
   - Go to Settings → API Keys
   - Enable "Test Mode"
   - Generate API keys
   - Copy "Key ID" (rzp_test_...)
   - Copy "Key Secret" (keep this secret!)

3. **Get Webhook Secret**
   - Go to Settings → Webhooks
   - Click "Add New Webhook"
   - URL: `YOUR_API_URL/api/payments/webhooks/razorpay`
   - Events: Select "payment.authorized", "payment.captured", "payment.failed"
   - Copy "Secret" from webhook settings

4. **Get Live Keys (Production)**
   - Complete KYC verification
   - Go to Settings → toggle "Live Mode"
   - Repeat steps 2-3 for live keys

## Setting Up Environment Variables

### Development (Local)

Create a `.env` file in the root directory:

```bash
# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Existing variables
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
```

**Important**: Add `.env` to your `.gitignore` file!

### Production (Replit)

1. **Open Replit Secrets**
   - Go to Tools → Secrets
   - Or use the lock icon 🔒 in sidebar

2. **Add Payment Gateway Secrets**

   Add each secret individually:
   
   | Key                      | Value              |
   |--------------------------|-------------------|
   | `STRIPE_SECRET_KEY`      | sk_live_...       |
   | `STRIPE_PUBLISHABLE_KEY` | pk_live_...       |
   | `STRIPE_WEBHOOK_SECRET`  | whsec_...         |
   | `RAZORPAY_KEY_ID`        | rzp_live_...      |
   | `RAZORPAY_KEY_SECRET`    | (your secret)     |
   | `RAZORPAY_WEBHOOK_SECRET`| (your secret)     |

3. **Verify Secrets**

   Test that secrets are accessible:
   ```bash
   node -e "console.log('Stripe:', !!process.env.STRIPE_SECRET_KEY)"
   node -e "console.log('Razorpay:', !!process.env.RAZORPAY_KEY_ID)"
   ```

## Webhook Configuration

### Stripe Webhooks

1. **Development (Local Testing)**
   
   Use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3001/api/payments/webhooks/stripe
   ```

2. **Production**

   Add webhook in Stripe Dashboard:
   - URL: `https://your-domain.com/api/payments/webhooks/stripe`
   - Events to select:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
     - `charge.refunded`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Razorpay Webhooks

1. **Development (Local Testing)**
   
   Use ngrok:
   ```bash
   ngrok http 3001
   ```
   
   Add webhook in Razorpay Dashboard:
   - URL: `https://your-ngrok-url.ngrok.io/api/payments/webhooks/razorpay`

2. **Production**

   Add webhook in Razorpay Dashboard:
   - URL: `https://your-domain.com/api/payments/webhooks/razorpay`
   - Events to select:
     - `payment.authorized`
     - `payment.captured`
     - `payment.failed`
     - `refund.processed`
   - Copy webhook secret to `RAZORPAY_WEBHOOK_SECRET`

## Security Best Practices

### Secret Management

1. **Never commit secrets to Git**
   - Always use `.env` for local development
   - Add `.env` to `.gitignore`
   - Use Replit Secrets for production

2. **Use different keys for test and production**
   - Test keys: `sk_test_...`, `rzp_test_...`
   - Live keys: `sk_live_...`, `rzp_live_...`

3. **Rotate secrets regularly**
   - Rotate API keys every 6 months
   - Rotate webhook secrets annually
   - Update immediately if compromised

4. **Restrict API key permissions**
   - Use restricted keys when possible
   - Limit to specific operations
   - Monitor key usage in dashboards

### Access Control

1. **Backend Only**
   - Secret keys (SK, Key Secret) must NEVER be in frontend
   - Only publishable keys (PK, Key ID) can be public

2. **Environment Separation**
   - Use test keys in development
   - Use live keys only in production
   - Never mix test and live keys

3. **Team Access**
   - Limit who can access production secrets
   - Use role-based access in Stripe/Razorpay dashboards
   - Audit access logs regularly

## Validation

### Check Environment Variables

Add to your backend startup:

```typescript
// server/index.ts or similar
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'VITE_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars);
  process.exit(1);
}

console.log('✅ All required environment variables are set');
```

### Test API Keys

Test that keys are valid:

```bash
# Test Stripe key
curl https://api.stripe.com/v1/charges \
  -u sk_test_YOUR_KEY:

# Test Razorpay key
curl -u rzp_test_YOUR_KEY:YOUR_SECRET \
  https://api.razorpay.com/v1/payments
```

## Troubleshooting

### "API key not found" error

**Problem**: Environment variable not loaded  
**Solution**: 
1. Check `.env` file exists
2. Restart server after adding variables
3. Verify variable name is correct

### "Invalid API key" error

**Problem**: Wrong API key or expired  
**Solution**:
1. Verify you're using correct key (test vs live)
2. Check key hasn't been deleted in dashboard
3. Generate new key if needed

### Webhook signature verification fails

**Problem**: Wrong webhook secret  
**Solution**:
1. Copy secret from webhook settings in dashboard
2. Update `STRIPE_WEBHOOK_SECRET` or `RAZORPAY_WEBHOOK_SECRET`
3. Restart server

### Payment works in test mode but not production

**Problem**: Still using test keys in production  
**Solution**:
1. Switch to live keys
2. Update all environment variables
3. Restart application
4. Test with small real payment

## Environment Variables Checklist

### Development Setup
- [ ] Created `.env` file
- [ ] Added `.env` to `.gitignore`
- [ ] Set Stripe test keys
- [ ] Set Razorpay test keys
- [ ] Set webhook secrets
- [ ] Tested payment creation
- [ ] Tested webhook delivery

### Production Setup
- [ ] Added all secrets to Replit Secrets
- [ ] Using live Stripe keys
- [ ] Using live Razorpay keys
- [ ] Configured production webhook URLs
- [ ] Updated webhook secrets
- [ ] Tested with real small payment
- [ ] Verified subscription activation
- [ ] Monitored first payments

## Support Resources

### Stripe
- [API Keys Documentation](https://stripe.com/docs/keys)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Dashboard](https://dashboard.stripe.com)

### Razorpay
- [API Keys Documentation](https://razorpay.com/docs/api/)
- [Webhooks Guide](https://razorpay.com/docs/webhooks/)
- [Dashboard](https://dashboard.razorpay.com)

## Next Steps

After setting up environment variables:

1. ✅ Test payment creation endpoint
2. ✅ Test payment verification
3. ✅ Test webhook delivery
4. ✅ Integrate mobile app
5. ✅ Test end-to-end flows
6. ✅ Monitor in production
