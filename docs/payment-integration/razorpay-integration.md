# Razorpay Mobile Integration Guide

## Overview

This guide explains how to integrate Razorpay payments into the Jeeva Learning React Native mobile app for Indian users. Razorpay offers UPI, cards, netbanking, and wallets with 0% fees on UPI.

## Prerequisites

1. Admin portal backend running with payment API endpoints
2. Razorpay account with API keys
3. React Native app (Expo or bare workflow)

## Installation

### For Expo (Recommended)

```bash
npx expo install react-native-razorpay
```

### For Bare React Native

```bash
npm install react-native-razorpay
cd ios && pod install
```

## Configuration

### Android Setup

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### iOS Setup

No additional configuration needed.

## Payment Service Implementation

Create a Razorpay payment service:

```tsx
// services/razorpayPaymentService.ts
import RazorpayCheckout from 'react-native-razorpay';

const API_URL = 'YOUR_API_URL';

export const useRazorpayPayment = () => {
  const createPayment = async (
    userId: string,
    subscriptionPlanId: string,
    userEmail: string,
    userPhone: string,
    userName: string,
    discountCouponCode?: string
  ) => {
    try {
      // Step 1: Fetch Razorpay key from backend
      const configResponse = await fetch(`${API_URL}/api/payments/config`);
      const config = await configResponse.json();
      const razorpayKeyId = config.razorpay.keyId;

      // Step 2: Create payment order on backend
      const createResponse = await fetch(`${API_URL}/api/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscriptionPlanId,
          discountCouponCode,
          countryCode: 'IN', // India user
        }),
      });

      const { paymentId, orderId, amount, currency, gateway } = await createResponse.json();

      if (gateway !== 'razorpay') {
        throw new Error('Expected Razorpay gateway for this user');
      }

      // Step 3: Open Razorpay checkout
      const options = {
        description: 'Jeeva Learning Subscription',
        image: 'https://your-app-logo-url.com/logo.png',
        currency: currency,
        key: razorpayKeyId,
        amount: amount * 100, // Amount in paise
        name: 'Jeeva Learning',
        order_id: orderId,
        prefill: {
          email: userEmail,
          contact: userPhone,
          name: userName,
        },
        theme: { color: '#007aff' },
      };

      const data = await RazorpayCheckout.open(options);

      // Step 4: Verify payment on backend
      const verifyResponse = await fetch(`${API_URL}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          gateway: 'razorpay',
          razorpayOrderId: data.razorpay_order_id,
          razorpayPaymentId: data.razorpay_payment_id,
          razorpaySignature: data.razorpay_signature,
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
    } catch (error: any) {
      console.error('Razorpay payment error:', error);
      
      if (error.code === RazorpayCheckout.PAYMENT_CANCELLED) {
        return {
          success: false,
          canceled: true,
        };
      }

      return {
        success: false,
        error: error.description || error.message || 'Payment failed',
      };
    }
  };

  return { createPayment };
};
```

## Payment Screen Implementation

```tsx
// screens/SubscriptionScreen.tsx
import { View, Text, Button, Alert } from 'react-native';
import { useState } from 'react';
import { useRazorpayPayment } from '../services/razorpayPaymentService';

export default function SubscriptionScreen({ 
  userId, 
  subscriptionPlanId,
  userProfile 
}) {
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const { createPayment } = useRazorpayPayment();

  const handlePurchase = async () => {
    setLoading(true);

    try {
      const result = await createPayment(
        userId,
        subscriptionPlanId,
        userProfile.email,
        userProfile.phoneNumber,
        userProfile.fullName,
        couponCode
      );

      if (result.success) {
        Alert.alert(
          'Payment Successful!',
          'Your subscription has been activated.',
          [{ text: 'OK', onPress: () => navigateToHome() }]
        );
      } else if (result.canceled) {
        Alert.alert('Payment Canceled', 'You canceled the payment');
      } else {
        Alert.alert('Payment Failed', result.error || 'Please try again');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Purchase Subscription
      </Text>
      
      <Text style={{ marginBottom: 10 }}>
        Payment Methods: UPI, Cards, Net Banking, Wallets
      </Text>

      <Button
        title={loading ? 'Processing...' : 'Pay Now'}
        onPress={handlePurchase}
        disabled={loading}
      />
    </View>
  );
}
```

## Payment Methods

Razorpay automatically shows all enabled payment methods:

### UPI (Recommended - 0% fees)
- Google Pay
- PhonePe
- Paytm
- BHIM
- Any UPI app

### Cards
- Debit Cards
- Credit Cards
- All major card networks

### Net Banking
- All major Indian banks

### Wallets
- Paytm
- Mobikwik
- Freecharge
- And more

## Testing

### Test Credentials

**Test Cards:**

| Card Number         | Type         | CVV | Expiry |
|---------------------|--------------|-----|--------|
| 4111 1111 1111 1111 | Visa         | Any | Future |
| 5555 5555 5555 4444 | Mastercard   | Any | Future |

**Test UPI:**
- UPI ID: `success@razorpay`
- Status: Payment succeeds

**Test Net Banking:**
- Select any bank
- Use test credentials provided by Razorpay

### Test Mode

Enable test mode in Razorpay Dashboard:
1. Go to Settings → API Keys
2. Use Test Key ID for development
3. Switch to Live Key ID for production

## Payment Flow

```
1. User selects subscription plan
2. App calls backend /api/payments/create
3. Backend creates Razorpay order
4. App opens Razorpay checkout UI
5. User selects payment method (UPI/Card/etc.)
6. User completes payment
7. App receives payment response
8. App verifies payment with backend /api/payments/verify
9. Backend verifies signature and activates subscription
10. App shows success message
```

## Error Handling

```tsx
const handleRazorpayError = (error: any) => {
  switch (error.code) {
    case RazorpayCheckout.PAYMENT_CANCELLED:
      showMessage('Payment was canceled');
      break;
    case RazorpayCheckout.NETWORK_ERROR:
      showMessage('Network error. Please check your connection.');
      break;
    case RazorpayCheckout.INVALID_OPTIONS:
      showMessage('Payment setup error. Please contact support.');
      break;
    case RazorpayCheckout.PAYMENT_ERROR:
      showMessage(`Payment failed: ${error.description}`);
      break;
    default:
      showMessage('An error occurred. Please try again.');
  }
};
```

## Security Best Practices

1. **Never** expose Razorpay secret key in mobile app
2. Always create orders on backend
3. **Always** verify payment signature on backend (critical!)
4. Use HTTPS for all API calls
5. Implement rate limiting on payment endpoints
6. Store webhook secret securely on backend

## Webhook Handling

Razorpay webhooks are handled by the backend at:
```
YOUR_API_URL/api/payments/webhooks/razorpay
```

The backend automatically:
- Verifies webhook signatures
- Updates payment status
- Activates subscriptions
- Logs all events

Configure webhooks in Razorpay Dashboard:
1. Go to Settings → Webhooks
2. Add webhook URL
3. Select events: `payment.authorized`, `payment.captured`, `payment.failed`
4. Save webhook secret to environment variable `RAZORPAY_WEBHOOK_SECRET`

## Signature Verification

**CRITICAL**: Always verify payment signature on backend to prevent fraud.

The backend automatically verifies using:
```
generated_signature = hmac_sha256(order_id + "|" + payment_id, secret)
```

Never skip this step!

## Common Issues

### Checkout Not Opening

**Problem**: Razorpay checkout doesn't open  
**Solution**: Ensure react-native-razorpay is properly installed and linked

### Payment Succeeds But Subscription Not Activated

**Problem**: Payment completes but backend doesn't activate subscription  
**Solution**: Check backend logs for webhook delivery and signature verification

### Invalid Signature Error

**Problem**: Payment verification fails with invalid signature  
**Solution**: Ensure you're passing all three values: order_id, payment_id, signature

## UPI Deep Linking (Advanced)

For direct UPI payment without Razorpay UI:

```tsx
import { Linking } from 'react-native';

const initiateUPIPayment = (orderId: string, amount: number) => {
  const upiUrl = `upi://pay?pa=your@upi&pn=Jeeva Learning&tr=${orderId}&am=${amount}&cu=INR`;
  Linking.openURL(upiUrl);
};
```

## Production Checklist

- [ ] Replace test key ID with live key ID
- [ ] Configure Razorpay webhooks in Dashboard
- [ ] Set webhook endpoint: `YOUR_PRODUCTION_URL/api/payments/webhooks/razorpay`
- [ ] Add webhook secret to environment variables
- [ ] Test with real payment methods in live mode
- [ ] Enable required payment methods in Dashboard
- [ ] Set up email notifications in Dashboard
- [ ] Test end-to-end flow
- [ ] Monitor Razorpay Dashboard for payments

## Compliance

- PCI DSS compliant (handled by Razorpay)
- RBI guidelines compliant
- GST applicable on international cards
- No GST on UPI/domestic transactions

## Support

For Razorpay-specific issues, consult:
- [Razorpay React Native Documentation](https://razorpay.com/docs/payment-gateway/react-native/)
- [Razorpay Testing Guide](https://razorpay.com/docs/payment-gateway/test-card-details/)
- [Razorpay Support](https://razorpay.com/support/)
