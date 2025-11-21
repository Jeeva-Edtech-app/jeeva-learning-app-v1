# Manual Gateway Selection Guide

## Overview

This guide shows how to implement manual payment gateway selection in your React Native mobile app, with smart defaults based on user location.

## User Experience Flow

```
1. User selects subscription plan
2. App detects country and pre-selects recommended gateway:
   - India → Razorpay (0% UPI fees)
   - Others → Stripe (global cards)
3. User sees gateway selection with recommendation
4. User can switch gateway if desired
5. Payment processes with chosen gateway
```

## Implementation

### Payment Selection Screen

Create a screen that shows both gateways with smart defaults:

```tsx
// screens/PaymentGatewaySelectionScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { countryDetectionService } from '../services/countryDetectionService';

type PaymentGateway = 'stripe' | 'razorpay';

export default function PaymentGatewaySelectionScreen({
  userId,
  subscriptionPlanId,
  onProceed,
}) {
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [recommendedGateway, setRecommendedGateway] = useState<PaymentGateway | null>(null);
  const [countryCode, setCountryCode] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectCountryAndSetDefault();
  }, []);

  const detectCountryAndSetDefault = async () => {
    try {
      const detected = await countryDetectionService.getUserCountry(userId);
      setCountryCode(detected);

      // Smart default: India → Razorpay, Others → Stripe
      const recommended: PaymentGateway = detected === 'IN' ? 'razorpay' : 'stripe';
      setRecommendedGateway(recommended);
      setSelectedGateway(recommended);
    } catch (error) {
      console.error('Country detection failed:', error);
      // Default to Stripe if detection fails
      setRecommendedGateway('stripe');
      setSelectedGateway('stripe');
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (selectedGateway) {
      onProceed({
        gateway: selectedGateway,
        countryCode,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loadingText}>Detecting best payment option...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Payment Method</Text>
      <Text style={styles.subtitle}>
        {countryCode === 'IN'
          ? 'We recommend Razorpay for Indian users (0% UPI fees)'
          : 'We recommend Stripe for international payments'}
      </Text>

      {/* Razorpay Option */}
      <TouchableOpacity
        style={[
          styles.gatewayCard,
          selectedGateway === 'razorpay' && styles.gatewayCardSelected,
        ]}
        onPress={() => setSelectedGateway('razorpay')}
      >
        <View style={styles.gatewayHeader}>
          <View style={styles.radioButton}>
            {selectedGateway === 'razorpay' && <View style={styles.radioButtonInner} />}
          </View>
          <Text style={styles.gatewayName}>Razorpay</Text>
          {recommendedGateway === 'razorpay' && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Recommended</Text>
            </View>
          )}
        </View>

        <Text style={styles.gatewayDescription}>
          UPI, Cards, Net Banking, Wallets
        </Text>

        {countryCode === 'IN' && (
          <View style={styles.benefitTag}>
            <Text style={styles.benefitText}>✓ 0% fees on UPI</Text>
          </View>
        )}

        <View style={styles.paymentMethods}>
          <Text style={styles.methodTag}>UPI</Text>
          <Text style={styles.methodTag}>Cards</Text>
          <Text style={styles.methodTag}>Net Banking</Text>
          <Text style={styles.methodTag}>Wallets</Text>
        </View>
      </TouchableOpacity>

      {/* Stripe Option */}
      <TouchableOpacity
        style={[
          styles.gatewayCard,
          selectedGateway === 'stripe' && styles.gatewayCardSelected,
        ]}
        onPress={() => setSelectedGateway('stripe')}
      >
        <View style={styles.gatewayHeader}>
          <View style={styles.radioButton}>
            {selectedGateway === 'stripe' && <View style={styles.radioButtonInner} />}
          </View>
          <Text style={styles.gatewayName}>Stripe</Text>
          {recommendedGateway === 'stripe' && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Recommended</Text>
            </View>
          )}
        </View>

        <Text style={styles.gatewayDescription}>
          Credit/Debit Cards, Apple Pay, Google Pay
        </Text>

        <View style={styles.paymentMethods}>
          <Text style={styles.methodTag}>Cards</Text>
          <Text style={styles.methodTag}>Apple Pay</Text>
          <Text style={styles.methodTag}>Google Pay</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.proceedButton}
        onPress={handleProceed}
        disabled={!selectedGateway}
      >
        <Text style={styles.proceedButtonText}>
          Continue to Payment
        </Text>
      </TouchableOpacity>

      <Text style={styles.secureNote}>
        🔒 Secure payment processing
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  gatewayCard: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  gatewayCardSelected: {
    borderColor: '#007aff',
    backgroundColor: '#f0f7ff',
  },
  gatewayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007aff',
  },
  gatewayName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  recommendedBadge: {
    backgroundColor: '#007aff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  gatewayDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    marginLeft: 36,
  },
  benefitTag: {
    backgroundColor: '#e7f5e7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginLeft: 36,
    marginBottom: 12,
  },
  benefitText: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '600',
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 36,
  },
  methodTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
    fontSize: 12,
    color: '#666',
  },
  proceedButton: {
    backgroundColor: '#007aff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secureNote: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 16,
  },
});
```

### Updated Payment Service

Modify your payment service to pass the gateway override:

```tsx
// services/paymentService.ts
import { useStripePayment } from './stripePaymentService';
import { useRazorpayPayment } from './razorpayPaymentService';

export const useUnifiedPayment = () => {
  const stripePayment = useStripePayment();
  const razorpayPayment = useRazorpayPayment();

  const createPayment = async (
    userId: string,
    subscriptionPlanId: string,
    userProfile: {
      email: string;
      phoneNumber: string;
      fullName: string;
    },
    countryCode: string,
    selectedGateway: 'stripe' | 'razorpay',  // User's choice
    discountCouponCode?: string
  ) => {
    try {
      console.log(`Processing payment via ${selectedGateway} for country ${countryCode}`);

      // Route to selected gateway
      if (selectedGateway === 'razorpay') {
        return await razorpayPayment.createPayment(
          userId,
          subscriptionPlanId,
          userProfile.email,
          userProfile.phoneNumber,
          userProfile.fullName,
          discountCouponCode
        );
      } else {
        return await stripePayment.createPayment(
          userId,
          subscriptionPlanId,
          discountCouponCode
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  };

  return { createPayment };
};
```

### Backend API Call

When calling the backend API, include the `gatewayOverride` field:

```tsx
// Example API call in payment service
const response = await fetch(`${API_URL}/api/payments/create`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    subscriptionPlanId,
    discountCouponCode,
    countryCode,
    gatewayOverride: selectedGateway,  // User's manual selection
  }),
});
```

## Benefits of This Approach

### Smart Defaults
- Users see the best option for their region automatically selected
- Reduces decision fatigue
- Optimizes for lowest fees

### User Freedom
- Power users can choose alternative gateway
- Useful if one gateway is down
- Some users may prefer specific payment methods

### Clear Messaging
- "Recommended" badges guide users
- Benefit callouts (like "0% UPI fees")
- Shows available payment methods per gateway

## Alternative: Simple Toggle

If you want a simpler UI, use a toggle switch:

```tsx
<View style={styles.gatewayToggle}>
  <Text style={styles.toggleLabel}>Payment Gateway:</Text>
  <View style={styles.toggleOptions}>
    <TouchableOpacity
      style={[
        styles.toggleButton,
        selectedGateway === 'razorpay' && styles.toggleButtonActive,
      ]}
      onPress={() => setSelectedGateway('razorpay')}
    >
      <Text
        style={[
          styles.toggleButtonText,
          selectedGateway === 'razorpay' && styles.toggleButtonTextActive,
        ]}
      >
        Razorpay
      </Text>
      {countryCode === 'IN' && (
        <Text style={styles.toggleHint}>0% UPI fees</Text>
      )}
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.toggleButton,
        selectedGateway === 'stripe' && styles.toggleButtonActive,
      ]}
      onPress={() => setSelectedGateway('stripe')}
    >
      <Text
        style={[
          styles.toggleButtonText,
          selectedGateway === 'stripe' && styles.toggleButtonTextActive,
        ]}
      >
        Stripe
      </Text>
    </TouchableOpacity>
  </View>
</View>
```

## Testing

Test both gateways with different scenarios:

1. **Indian user selects Razorpay** (recommended)
   - Should show UPI, cards, wallets
   - 0% UPI fees message
   - Payment succeeds

2. **Indian user switches to Stripe**
   - Should work despite not recommended
   - Shows card payment options
   - Payment succeeds

3. **UK user selects Stripe** (recommended)
   - Shows card, Apple Pay, Google Pay
   - Payment succeeds

4. **UK user switches to Razorpay**
   - Should work
   - Shows card payment options (no UPI for UK users)
   - Payment succeeds

## Coupon Codes

Coupon codes work with both gateways automatically:
- Discount is calculated on backend before payment creation
- Same discount applies regardless of gateway selected
- No special handling needed

## Production Tips

1. **Track Gateway Selection**
   - Log which gateway users choose
   - Monitor if users override recommendations
   - Helps optimize default selection logic

2. **A/B Testing**
   - Test different default selection strategies
   - Compare conversion rates
   - Optimize based on data

3. **Fallback Handling**
   - If one gateway fails, offer to try the other
   - Improves payment success rate
   - Better user experience

## Summary

Manual gateway selection gives users:
- ✅ Best gateway pre-selected (optimized fees)
- ✅ Freedom to choose alternative
- ✅ Clear understanding of payment options
- ✅ Same coupon codes work for both
- ✅ Seamless payment experience

The backend automatically handles routing based on user's choice, while maintaining security and subscription integration.
