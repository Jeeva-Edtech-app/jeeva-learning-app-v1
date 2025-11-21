# Mobile App - Coupon Code Implementation Guide

**Version:** 1.0  
**Date:** November 21, 2025  
**Status:** Complete Implementation Guide  
**Backend Status:** ✅ Fully Ready

---

## Executive Summary

Coupon/discount code system allowing users to enter promo codes during subscription purchase. Backend validates, calculates discount, and applies to payment.

---

## 1. Coupon Architecture

### 1.1 Coupon Data Model

```typescript
interface Coupon {
  id: string
  code: string // e.g., "SAVE20", "FRIEND50"
  discountType: 'percentage' | 'fixed' // % off or $ off
  discountValue: number // e.g., 20 (for 20%) or 10 (for $10)
  maxUses: number // How many times can be used
  currentUses: number // Times already used
  expiryDate: Date
  minPurchaseAmount: number // Minimum purchase to apply
  applicablePlans: string[] // Which plans: ['monthly', 'yearly']
  isActive: boolean
}

interface AppliedCoupon {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  originalPrice: number
  discountAmount: number
  finalPrice: number
}
```

### 1.2 Coupon Workflow

```
User enters coupon code
    ↓
Mobile sends to backend for validation
    ↓
Backend checks:
├─ Code exists?
├─ Not expired?
├─ Uses remaining?
├─ Applicable to this plan?
├─ Minimum purchase met?
└─ Not already used by this user?
    ↓
Backend returns:
├─ Valid → Return discount amount
└─ Invalid → Return error reason
    ↓
Mobile calculates new price
    ↓
User sees discount breakdown
    ↓
User confirms payment
    ↓
Backend applies coupon to subscription
```

---

## 2. API Endpoints

### 2.1 Validate Coupon Code

```
POST /api/subscriptions/validate-coupon

Request:
{
  code: "SAVE20",
  planId: "monthly",
  amount: 9.99
}

Response - Success:
{
  valid: true,
  code: "SAVE20",
  discountType: "percentage",
  discountValue: 20,
  originalPrice: 9.99,
  discountAmount: 2.00,
  finalPrice: 7.99,
  message: "Coupon applied! You save $2.00"
}

Response - Error:
{
  valid: false,
  code: "INVALID20",
  error: "COUPON_NOT_FOUND" | "COUPON_EXPIRED" | 
         "COUPON_EXHAUSTED" | "MINIMUM_NOT_MET" |
         "NOT_APPLICABLE_TO_PLAN" | "ALREADY_USED",
  message: "This coupon code is invalid"
}
```

### 2.2 Apply Coupon During Payment

```
POST /api/payments/create

Request:
{
  userId: "user_123",
  planId: "monthly",
  couponCode: "SAVE20", // Optional
  paymentMethod: "stripe"
}

Response:
{
  paymentId: "pay_123",
  originalAmount: 9.99,
  discountAmount: 2.00,
  finalAmount: 7.99,
  clientSecret: "pi_...",
  couponApplied: true
}
```

---

## 3. Mobile Implementation - Coupon Input Screen

### 3.1 Coupon Input Component

```typescript
// CouponInputComponent.tsx
import { useState } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet
} from 'react-native'

interface Props {
  planId: string
  originalPrice: number
  onCouponApplied: (coupon: AppliedCoupon) => void
  onError: (error: string) => void
}

export function CouponInputComponent({
  planId,
  originalPrice,
  onCouponApplied,
  onError
}: Props) {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [error, setError] = useState('')

  async function handleValidateCoupon() {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'https://your-api.com/api/subscriptions/validate-coupon',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: couponCode.toUpperCase(),
            planId: planId,
            amount: originalPrice
          })
        }
      )

      const result = await response.json()

      if (result.valid) {
        // Coupon is valid
        const coupon: AppliedCoupon = {
          code: result.code,
          discountType: result.discountType,
          discountValue: result.discountValue,
          originalPrice: result.originalPrice,
          discountAmount: result.discountAmount,
          finalPrice: result.finalPrice
        }

        setAppliedCoupon(coupon)
        setCouponCode('') // Clear input
        onCouponApplied(coupon)
      } else {
        // Coupon is invalid
        const errorMessage = getErrorMessage(result.error)
        setError(errorMessage)
        onError(errorMessage)
      }
    } catch (error) {
      console.error('Coupon validation error:', error)
      setError('Error validating coupon. Please try again.')
      onError('Network error')
    } finally {
      setLoading(false)
    }
  }

  function getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      COUPON_NOT_FOUND: 'Coupon code not found',
      COUPON_EXPIRED: 'This coupon has expired',
      COUPON_EXHAUSTED: 'This coupon has reached its usage limit',
      MINIMUM_NOT_MET: 'Minimum purchase amount not met',
      NOT_APPLICABLE_TO_PLAN: 'This coupon is not applicable to this plan',
      ALREADY_USED: 'You have already used this coupon',
      INVALID_CODE: 'Invalid coupon code'
    }
    return errorMessages[errorCode] || 'Invalid coupon code'
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null)
    setCouponCode('')
    setError('')
    onCouponApplied(null)
  }

  if (appliedCoupon) {
    // Show applied coupon
    return (
      <View style={styles.appliedContainer}>
        <View style={styles.appliedContent}>
          <Text style={styles.appliedLabel}>✓ Coupon Applied</Text>
          <Text style={styles.couponCode}>{appliedCoupon.code}</Text>
          <Text style={styles.discount}>
            {appliedCoupon.discountType === 'percentage'
              ? `-${appliedCoupon.discountValue}%`
              : `-$${appliedCoupon.discountAmount.toFixed(2)}`}
          </Text>
          <Text style={styles.savings}>
            You save ${appliedCoupon.discountAmount.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemoveCoupon}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Have a coupon code?</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter coupon code"
          placeholderTextColor="#999"
          value={couponCode}
          onChangeText={setCouponCode}
          editable={!loading}
          autoCapitalize="characters"
          maxLength={20}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleValidateCoupon}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Apply</Text>
          )}
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333'
  },
  button: {
    backgroundColor: '#007aff',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },
  error: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 8
  },
  appliedContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#00b300',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    marginHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  appliedContent: {
    flex: 1
  },
  appliedLabel: {
    fontSize: 12,
    color: '#00b300',
    fontWeight: '600'
  },
  couponCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4
  },
  discount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00b300',
    marginTop: 4
  },
  savings: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  removeButtonText: {
    color: '#ff3b30',
    fontSize: 12,
    fontWeight: '600'
  }
})
```

---

## 4. Price Breakdown Display

### 4.1 Payment Summary Component

```typescript
// PaymentSummaryComponent.tsx
import { View, Text, StyleSheet } from 'react-native'

interface Props {
  plan: SubscriptionPlan
  appliedCoupon?: AppliedCoupon
}

export function PaymentSummaryComponent({ plan, appliedCoupon }: Props) {
  const originalPrice = plan.price
  const discountAmount = appliedCoupon?.discountAmount || 0
  const finalPrice = appliedCoupon?.finalPrice || originalPrice

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>

      {/* Plan details */}
      <View style={styles.row}>
        <Text style={styles.label}>{plan.name} Subscription</Text>
        <Text style={styles.value}>${originalPrice.toFixed(2)}</Text>
      </View>

      {/* Discount if applied */}
      {appliedCoupon && (
        <View style={[styles.row, styles.discountRow]}>
          <Text style={styles.discountLabel}>
            {appliedCoupon.code} Discount
          </Text>
          <Text style={styles.discountValue}>
            -${discountAmount.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${finalPrice.toFixed(2)}</Text>
      </View>

      {/* Savings badge */}
      {appliedCoupon && (
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsText}>
            You save ${discountAmount.toFixed(2)}! 🎉
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#eee'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  label: {
    fontSize: 14,
    color: '#666'
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  discountRow: {
    marginBottom: 12
  },
  discountLabel: {
    fontSize: 14,
    color: '#00b300',
    fontWeight: '600'
  },
  discountValue: {
    fontSize: 14,
    color: '#00b300',
    fontWeight: 'bold'
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007aff'
  },
  savingsBadge: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#00b300'
  },
  savingsText: {
    fontSize: 13,
    color: '#00b300',
    fontWeight: '600'
  }
})
```

---

## 5. Integration in Subscription Flow

### 5.1 Complete Payment Screen

```typescript
// PaymentScreen.tsx
import { useState } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert
} from 'react-native'
import { CouponInputComponent } from '@/components/CouponInputComponent'
import { PaymentSummaryComponent } from '@/components/PaymentSummaryComponent'

export function PaymentScreen({ route, navigation }) {
  const { planId } = route.params
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadPlan()
  }, [planId])

  async function loadPlan() {
    try {
      const { data } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single()

      setPlan(data)
    } catch (error) {
      console.error('Error loading plan:', error)
      Alert.alert('Error', 'Could not load subscription plan')
    }
  }

  async function handlePayment() {
    if (!plan) return

    setProcessing(true)

    try {
      // Prepare payment data
      const paymentData = {
        userId: currentUser.id,
        planId: planId,
        couponCode: appliedCoupon?.code,
        finalAmount: appliedCoupon?.finalPrice || plan.price,
        paymentMethod: getPaymentProvider() // 'stripe' or 'razorpay'
      }

      // Create payment
      const paymentResult = await processPayment(paymentData)

      if (paymentResult.success) {
        // Navigate to success screen
        navigation.navigate('SubscriptionSuccessScreen', {
          planId: planId,
          couponApplied: !!appliedCoupon
        })
      } else {
        Alert.alert('Payment Failed', paymentResult.error)
      }
    } catch (error) {
      console.error('Payment error:', error)
      Alert.alert('Error', 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (!plan) {
    return <LoadingSpinner />
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Subscribe to {plan.name}</Text>

      {/* Coupon Input */}
      <CouponInputComponent
        planId={planId}
        originalPrice={plan.price}
        onCouponApplied={setAppliedCoupon}
        onError={(error) => Alert.alert('Coupon Error', error)}
      />

      {/* Price Summary */}
      <PaymentSummaryComponent plan={plan} appliedCoupon={appliedCoupon} />

      {/* Payment Button */}
      <TouchableOpacity
        style={[styles.payButton, processing && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={processing}
      >
        <Text style={styles.payButtonText}>
          {processing
            ? 'Processing...'
            : `Pay $${(appliedCoupon?.finalPrice || plan.price).toFixed(2)}`}
        </Text>
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 24
  },
  payButton: {
    backgroundColor: '#007aff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    alignItems: 'center'
  },
  payButtonDisabled: {
    backgroundColor: '#ccc'
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#007aff',
    fontSize: 16,
    fontWeight: '600'
  }
})
```

---

## 6. Success Screen with Coupon Info

```typescript
// SubscriptionSuccessScreen.tsx
export function SubscriptionSuccessScreen({ route }) {
  const { planId, couponApplied } = route.params

  return (
    <View style={styles.container}>
      <LottieView
        source={require('@/assets/success.json')}
        autoPlay
        loop={false}
      />

      <Text style={styles.title}>Subscription Activated!</Text>
      <Text style={styles.message}>
        Your subscription is now active. All features unlocked.
      </Text>

      {couponApplied && (
        <View style={styles.couponBanner}>
          <Text style={styles.couponText}>
            🎉 Coupon discount applied successfully!
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  )
}
```

---

## 7. Error Handling

### 7.1 Coupon Error Codes

```typescript
const COUPON_ERROR_CODES = {
  COUPON_NOT_FOUND: {
    message: 'Coupon code not found',
    actionable: true
  },
  COUPON_EXPIRED: {
    message: 'This coupon has expired',
    actionable: false
  },
  COUPON_EXHAUSTED: {
    message: 'This coupon has reached its limit',
    actionable: false
  },
  MINIMUM_NOT_MET: {
    message: 'Minimum purchase amount not met for this coupon',
    actionable: true
  },
  NOT_APPLICABLE_TO_PLAN: {
    message: 'This coupon is not applicable to this plan',
    actionable: false
  },
  ALREADY_USED: {
    message: 'You have already used this coupon',
    actionable: false
  },
  NETWORK_ERROR: {
    message: 'Could not validate coupon. Try again.',
    actionable: true
  }
}
```

---

## 8. Implementation Checklist

### Phase 1: Setup
- [ ] Create CouponInputComponent
- [ ] Create PaymentSummaryComponent
- [ ] Set up API client for coupon validation
- [ ] Create error handling utilities

### Phase 2: Integration
- [ ] Integrate CouponInputComponent in PaymentScreen
- [ ] Integrate PaymentSummaryComponent
- [ ] Handle coupon application state
- [ ] Pass coupon code to payment processing

### Phase 3: Display
- [ ] Show original price
- [ ] Show discount amount
- [ ] Show final price
- [ ] Show savings badge
- [ ] Show coupon code label

### Phase 4: Error Handling
- [ ] Handle invalid coupons
- [ ] Handle expired coupons
- [ ] Handle exhausted coupons
- [ ] Handle network errors
- [ ] Show user-friendly error messages

### Phase 5: Testing
- [ ] Test valid coupon
- [ ] Test invalid coupon
- [ ] Test expired coupon
- [ ] Test exhausted coupon
- [ ] Test payment with coupon
- [ ] Test coupon removal

---

## 9. Backend Integration Verified ✅

**Already implemented in admin panel:**
- ✅ Coupon CRUD (Create, Read, Update, Delete)
- ✅ Coupon validation API endpoint
- ✅ Discount calculation
- ✅ Usage tracking
- ✅ Expiry management
- ✅ Plan applicability rules

**API Endpoints Ready:**
- ✅ POST /api/subscriptions/validate-coupon
- ✅ POST /api/payments/create (with couponCode parameter)

---

## 10. UX Best Practices

✅ **DO:**
- Show "optional" field label (not required)
- Display original price clearly
- Highlight savings prominently
- Show discount breakdown
- Allow coupon removal
- Give feedback immediately
- Show error messages in plain language

❌ **DON'T:**
- Make coupon mandatory
- Hide the original price
- Confuse discount calculation
- Show cryptic error codes
- Spam with validation calls
- Apply multiple coupons

---

## 11. Testing Scenarios

### Test Case 1: Valid Coupon - Percentage Discount
```
Input: "SAVE20", Monthly Plan ($9.99)
Expected: 20% off → $7.99
Verify: Discount shown as "$2.00 off" and "You save $2.00"
```

### Test Case 2: Valid Coupon - Fixed Discount
```
Input: "SAVE5", Monthly Plan ($9.99)
Expected: $5 off → $4.99
Verify: Discount shown as "-$5.00" and "You save $5.00"
```

### Test Case 3: Invalid Coupon
```
Input: "INVALID", Monthly Plan
Expected: Error message "Coupon code not found"
Verify: Error displayed, coupon not applied
```

### Test Case 4: Expired Coupon
```
Input: "EXPIRED20", Monthly Plan
Expected: Error message "This coupon has expired"
Verify: Error displayed, original price shown
```

### Test Case 5: Coupon Already Used
```
Input: "USED20", Monthly Plan (user already used once)
Expected: Error message "You have already used this coupon"
Verify: Error displayed, cannot reuse
```

---

## 12. Summary

| Feature | Status |
|---------|--------|
| Input coupon code | ✅ UI Component |
| Validate coupon | ✅ API Ready |
| Calculate discount | ✅ Backend |
| Apply to payment | ✅ Backend |
| Display breakdown | ✅ UI Component |
| Error handling | ✅ Documented |
| Admin management | ✅ Complete |

**File:** `MOBILE_COUPON_IMPLEMENTATION_GUIDE.md`  
**Status:** Complete  
**Ready for Mobile Team:** Yes
