# Stripe Mobile Integration Guide

## Overview

This guide explains how to integrate Stripe payments into the Jeeva Learning React Native mobile app for UK/international users.

## Prerequisites

1. Admin portal backend running with payment API endpoints
2. Stripe account set up with API keys
3. React Native Expo app

## Installation

Install the Stripe React Native SDK:

```bash
npx expo install @stripe/stripe-react-native
```

## Configuration

### 1. Initialize Stripe Provider

Wrap your app with the Stripe Provider in your root component:

```tsx
// App.tsx
import { StripeProvider } from '@stripe/stripe-react-native';
import { useState, useEffect } from 'react';

export default function App() {
  const [publishableKey, setPublishableKey] = useState('');

  useEffect(() => {
    // Fetch publishable key from backend
    fetch('YOUR_API_URL/api/payments/config')
      .then(res => res.json())
      .then(data => setPublishableKey(data.stripe.publishableKey));
  }, []);

  if (!publishableKey) {
    return null; // Or loading screen
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      {/* Your app components */}
    </StripeProvider>
  );
}
```

### 2. Create Payment Service

Create a payment service to handle Stripe payments:

```tsx
// services/stripePaymentService.ts
import { useStripe } from '@stripe/stripe-react-native';

const API_URL = 'YOUR_API_URL';

export const useStripePayment = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const createPayment = async (
    userId: string,
    subscriptionPlanId: string,
    discountCouponCode?: string
  ) => {
    try {
      // Step 1: Create payment on backend
      const response = await fetch(`${API_URL}/api/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscriptionPlanId,
          discountCouponCode,
          countryCode: 'GB', // UK user
        }),
      });

      const { paymentId, clientSecret, amount, currency, gateway } = await response.json();

      if (gateway !== 'stripe') {
        throw new Error('Expected Stripe gateway for this user');
      }

      // Step 2: Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Jeeva Learning',
        returnURL: 'jeevalearning://payment-success',
        defaultBillingDetails: {
          // Can populate from user profile
        },
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Step 3: Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          return { success: false, canceled: true };
        }
        throw new Error(presentError.message);
      }

      // Step 4: Verify payment on backend
      const verifyResponse = await fetch(`${API_URL}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          gateway: 'stripe',
          stripePaymentIntentId: clientSecret.split('_secret_')[0],
        }),
      });

      const verifyResult = await verifyResponse.json();

      if (verifyResult.success) {
        return {
          success: true,
          payment: verifyResult.payment,
        };
      } else {
        throw new Error(verifyResult.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  };

  return { createPayment };
};
```

### 3. Implement Payment Screen

Create a subscription purchase screen with Stripe integration:

```tsx
// screens/SubscriptionScreen.tsx
import { View, Text, Button, Alert } from 'react-native';
import { useState } from 'react';
import { useStripePayment } from '../services/stripePaymentService';

export default function SubscriptionScreen({ userId, subscriptionPlanId }) {
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const { createPayment } = useStripePayment();

  const handlePurchase = async () => {
    setLoading(true);

    try {
      const result = await createPayment(userId, subscriptionPlanId, couponCode);

      if (result.success) {
        Alert.alert(
          'Success!',
          'Your subscription has been activated.',
          [{ text: 'OK', onPress: () => navigateToHome() }]
        );
      } else if (result.canceled) {
        Alert.alert('Canceled', 'Payment was canceled');
      } else {
        Alert.alert('Error', result.error || 'Payment failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Purchase Subscription</Text>
      <Button
        title={loading ? 'Processing...' : 'Pay with Card'}
        onPress={handlePurchase}
        disabled={loading}
      />
    </View>
  );
}
```

## Testing

### Test Cards

Use these test cards in development:

| Card Number         | Scenario        | Expected Result |
|---------------------|-----------------|-----------------|
| 4242 4242 4242 4242 | Success         | Payment succeeds |
| 4000 0025 0000 3155 | Requires Auth   | 3D Secure flow |
| 4000 0000 0000 9995 | Decline         | Card declined |

**CVV**: Any 3 digits  
**Expiry**: Any future date  
**ZIP**: Any valid code

## Payment Flow

```
1. User selects subscription plan
2. App calls backend /api/payments/create
3. Backend creates Stripe PaymentIntent
4. App initializes Stripe Payment Sheet
5. User completes payment in Stripe UI
6. App verifies payment with backend /api/payments/verify
7. Backend confirms payment and activates subscription
8. App shows success message
```

## Error Handling

Handle common errors:

```tsx
const handlePaymentError = (error: any) => {
  switch (error.code) {
    case 'Canceled':
      // User canceled payment
      showMessage('Payment canceled');
      break;
    case 'Failed':
      // Payment failed
      showMessage('Payment failed. Please try again.');
      break;
    case 'InvalidClientSecret':
      // Invalid setup
      showMessage('Payment setup error. Please contact support.');
      break;
    default:
      showMessage('An error occurred. Please try again.');
  }
};
```

## Security Best Practices

1. **Never** expose Stripe secret key in mobile app
2. Always create PaymentIntents on backend
3. Verify payments on backend before granting access
4. Use HTTPS for all API calls
5. Implement rate limiting on payment endpoints

## Webhook Handling

Stripe webhooks are handled by the backend at:
```
YOUR_API_URL/api/payments/webhooks/stripe
```

The backend automatically:
- Verifies webhook signatures
- Updates payment status
- Activates subscriptions
- Logs all events

## Apple Pay Integration (Optional)

To enable Apple Pay:

```tsx
const { error } = await initPaymentSheet({
  paymentIntentClientSecret: clientSecret,
  merchantDisplayName: 'Jeeva Learning',
  applePay: {
    merchantCountryCode: 'GB',
  },
});
```

## Google Pay Integration (Optional)

To enable Google Pay:

```tsx
const { error } = await initPaymentSheet({
  paymentIntentClientSecret: clientSecret,
  merchantDisplayName: 'Jeeva Learning',
  googlePay: {
    merchantCountryCode: 'GB',
    testEnv: __DEV__,
  },
});
```

## Troubleshooting

### Payment Sheet Not Showing

**Problem**: Payment sheet doesn't appear  
**Solution**: Ensure Stripe Provider is wrapping your app and publishable key is loaded

### Payment Fails Silently

**Problem**: Payment appears successful but doesn't activate subscription  
**Solution**: Check backend logs for webhook delivery and verification errors

### Invalid Client Secret

**Problem**: "Invalid client secret" error  
**Solution**: Ensure you're passing the full client secret from backend, not just payment intent ID

## Production Checklist

- [ ] Replace test publishable key with live key
- [ ] Configure Stripe webhooks in Stripe Dashboard
- [ ] Set webhook endpoint: `YOUR_PRODUCTION_URL/api/payments/webhooks/stripe`
- [ ] Test with real test cards in test mode first
- [ ] Enable Apple Pay/Google Pay (optional)
- [ ] Test end-to-end flow
- [ ] Monitor Stripe Dashboard for successful payments

## Support

For Stripe-specific issues, consult:
- [Stripe React Native Documentation](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
