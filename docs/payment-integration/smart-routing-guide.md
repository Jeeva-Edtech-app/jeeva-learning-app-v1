# Smart Payment Gateway Routing Guide

## Overview

The Jeeva Learning platform routes users to the optimal payment gateway based on their country, with support for both **automatic routing** (recommended) and **manual gateway selection** (user choice).

- **India (IN)**: Razorpay (0% fees on UPI, supports all Indian payment methods)
- **UK/International**: Stripe (global card processing, Apple Pay, Google Pay)

This guide explains how to implement smart routing in your React Native mobile app.

## Routing Options

### Option 1: Automatic Routing (Recommended)
System automatically selects the best gateway based on user's country:
- Simple user experience
- Optimizes for lowest fees
- No user decision needed

### Option 2: Manual Gateway Selection
User chooses their preferred gateway with smart defaults:
- Flexibility for power users
- Gateway pre-selected based on country
- User can switch if desired

See [Manual Gateway Selection Guide](./manual-gateway-selection.md) for implementation details.

## Architecture

```
User → Country Detection → Gateway Selection (Auto or Manual) → Payment Processing
```

## Implementation

### 1. Country Detection Service

Create a service to detect user's country:

```tsx
// services/countryDetectionService.ts
import * as Localization from 'expo-localization';

export const countryDetectionService = {
  // Method 1: From device locale (best for initial detection)
  getCountryFromDevice(): string {
    const locale = Localization.locale; // e.g., "en-IN", "en-GB"
    const region = Localization.region; // e.g., "IN", "GB"
    return region || 'US';
  },

  // Method 2: From user profile (best for confirmed users)
  async getCountryFromProfile(userId: string): Promise<string> {
    try {
      const response = await fetch(`YOUR_API_URL/api/users/${userId}/profile`);
      const profile = await response.json();
      return profile.countryCode || this.getCountryFromDevice();
    } catch (error) {
      console.error('Failed to get country from profile:', error);
      return this.getCountryFromDevice();
    }
  },

  // Method 3: From IP geolocation (backup method)
  async getCountryFromIP(): Promise<string> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return data.country_code || 'US';
    } catch (error) {
      console.error('Failed to get country from IP:', error);
      return this.getCountryFromDevice();
    }
  },

  // Recommended: Combined approach
  async getUserCountry(userId?: string): Promise<string> {
    // Priority 1: User profile (if logged in)
    if (userId) {
      const profileCountry = await this.getCountryFromProfile(userId);
      if (profileCountry) return profileCountry;
    }

    // Priority 2: Device locale
    const deviceCountry = this.getCountryFromDevice();
    if (deviceCountry !== 'US') return deviceCountry;

    // Priority 3: IP geolocation (fallback)
    return await this.getCountryFromIP();
  },
};
```

### 2. Unified Payment Service

Create a unified service that routes to the correct gateway:

```tsx
// services/paymentService.ts
import { countryDetectionService } from './countryDetectionService';
import { useStripePayment } from './stripePaymentService';
import { useRazorpayPayment } from './razorpayPaymentService';

export const useUnifiedPayment = () => {
  const stripePayment = useStripePayment();
  const razorpayPayment = useRazorpayPayment();

  const selectGateway = (countryCode: string): 'stripe' | 'razorpay' => {
    return countryCode === 'IN' ? 'razorpay' : 'stripe';
  };

  const createPayment = async (
    userId: string,
    subscriptionPlanId: string,
    userProfile: {
      email: string;
      phoneNumber: string;
      fullName: string;
    },
    discountCouponCode?: string
  ) => {
    try {
      // Detect user's country
      const countryCode = await countryDetectionService.getUserCountry(userId);
      const gateway = selectGateway(countryCode);

      console.log(`Routing payment to ${gateway} for country ${countryCode}`);

      // Route to appropriate gateway
      if (gateway === 'razorpay') {
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
      console.error('Unified payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  };

  return { createPayment, selectGateway };
};
```

### 3. Payment Screen with Smart Routing

Implement a subscription screen that uses smart routing:

```tsx
// screens/SubscriptionPurchaseScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import { useUnifiedPayment } from '../services/paymentService';
import { countryDetectionService } from '../services/countryDetectionService';

export default function SubscriptionPurchaseScreen({
  userId,
  subscriptionPlanId,
  userProfile,
  navigation,
}) {
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<string>('');
  const [gateway, setGateway] = useState<'stripe' | 'razorpay'>('stripe');
  const [couponCode, setCouponCode] = useState('');

  const { createPayment, selectGateway } = useUnifiedPayment();

  useEffect(() => {
    // Detect country and gateway on mount
    const detectCountry = async () => {
      const detected = await countryDetectionService.getUserCountry(userId);
      setCountryCode(detected);
      setGateway(selectGateway(detected));
    };

    detectCountry();
  }, [userId]);

  const handlePurchase = async () => {
    setLoading(true);

    try {
      const result = await createPayment(
        userId,
        subscriptionPlanId,
        userProfile,
        couponCode
      );

      if (result.success) {
        Alert.alert(
          'Success!',
          'Your subscription has been activated.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home'),
            },
          ]
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

  if (!countryCode) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Detecting payment options...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Purchase Subscription
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: '#666' }}>
          Payment Gateway: {gateway === 'razorpay' ? 'Razorpay' : 'Stripe'}
        </Text>
        <Text style={{ color: '#666' }}>
          Region: {countryCode}
        </Text>
        {gateway === 'razorpay' && (
          <Text style={{ color: '#007aff', marginTop: 5 }}>
            ✓ 0% fees on UPI payments
          </Text>
        )}
      </View>

      <Button
        title={
          loading
            ? 'Processing...'
            : gateway === 'razorpay'
            ? 'Pay with UPI/Card/Net Banking'
            : 'Pay with Card'
        }
        onPress={handlePurchase}
        disabled={loading}
      />

      {gateway === 'razorpay' && (
        <Text style={{ marginTop: 10, color: '#666', fontSize: 12 }}>
          Supports: UPI, Cards, Net Banking, Wallets
        </Text>
      )}
      {gateway === 'stripe' && (
        <Text style={{ marginTop: 10, color: '#666', fontSize: 12 }}>
          Supports: Credit/Debit Cards, Apple Pay, Google Pay
        </Text>
      )}
    </View>
  );
}
```

## Country Override

Allow users to manually change their country if needed:

```tsx
// components/CountrySelector.tsx
import { useState } from 'react';
import { View, Text, Picker } from 'react-native';

const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  // Add more countries as needed
];

export function CountrySelector({ value, onChange }) {
  return (
    <View>
      <Text>Select Your Country:</Text>
      <Picker
        selectedValue={value}
        onValueChange={onChange}
      >
        {COUNTRIES.map(country => (
          <Picker.Item
            key={country.code}
            label={country.name}
            value={country.code}
          />
        ))}
      </Picker>
    </View>
  );
}
```

## Gateway Selection Logic

The backend also validates and enforces gateway selection:

```typescript
// Backend logic (already implemented)
function selectGateway(countryCode: string): 'stripe' | 'razorpay' {
  return countryCode === 'IN' ? 'razorpay' : 'stripe';
}
```

This ensures:
- Frontend routing matches backend routing
- No gateway mismatch errors
- Optimal fees for all users

## Testing Gateway Routing

### Test Scenarios

1. **Indian User**
   - Set country to 'IN'
   - Expect Razorpay gateway
   - Test UPI payment

2. **UK User**
   - Set country to 'GB'
   - Expect Stripe gateway
   - Test card payment

3. **US User**
   - Set country to 'US'
   - Expect Stripe gateway
   - Test card payment

### Test Code

```tsx
// __tests__/paymentRouting.test.ts
import { countryDetectionService } from '../services/countryDetectionService';

describe('Payment Gateway Routing', () => {
  it('should route Indian users to Razorpay', () => {
    const gateway = selectGateway('IN');
    expect(gateway).toBe('razorpay');
  });

  it('should route UK users to Stripe', () => {
    const gateway = selectGateway('GB');
    expect(gateway).toBe('stripe');
  });

  it('should route US users to Stripe', () => {
    const gateway = selectGateway('US');
    expect(gateway).toBe('stripe');
  });

  it('should default to Stripe for unknown countries', () => {
    const gateway = selectGateway('XX');
    expect(gateway).toBe('stripe');
  });
});
```

## Edge Cases

### 1. Country Detection Fails

```tsx
const countryCode = await countryDetectionService.getUserCountry(userId) || 'GB';
// Default to UK/Stripe if detection fails
```

### 2. User Changes Country

```tsx
// Re-detect country before each payment
const currentCountry = await countryDetectionService.getUserCountry(userId);
```

### 3. VPN Users

If a user is using VPN:
- Device locale still returns correct country
- User profile country is most reliable
- Allow manual country selection as backup

## Benefits of Smart Routing

### For Indian Users (Razorpay)
- ✅ **0% fees on UPI** (saves 2-3% vs cards)
- ✅ UPI, cards, net banking, wallets
- ✅ Instant payment confirmation
- ✅ Familiar payment UI
- ✅ RBI compliant

### For International Users (Stripe)
- ✅ Global card processing
- ✅ Apple Pay / Google Pay
- ✅ Multi-currency support
- ✅ Strong fraud protection
- ✅ PCI DSS compliant

## Production Checklist

- [ ] Test country detection in all regions
- [ ] Verify Razorpay works for Indian users
- [ ] Verify Stripe works for international users
- [ ] Test country override functionality
- [ ] Monitor gateway routing in analytics
- [ ] Set up alerts for gateway mismatch errors
- [ ] Document supported countries for each gateway

## Monitoring

Track gateway usage:

```tsx
// Analytics tracking
analytics.track('payment_gateway_selected', {
  userId,
  countryCode,
  gateway,
  timestamp: new Date().toISOString(),
});
```

Monitor:
- Gateway distribution (Stripe vs Razorpay)
- Country distribution
- Payment success rates by gateway
- Average transaction value by gateway

## Support

If gateway routing issues occur:
- Check user's country code
- Verify backend /api/payments/create response
- Check gateway field in payment response
- Ensure frontend and backend routing logic match
