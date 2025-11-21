import React, { useState } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, DesignSystem } from '@/constants/DesignSystem'

export interface AppliedCoupon {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  originalPrice: number
  discountAmount: number
  finalPrice: number
}

interface Props {
  planId: string
  originalPrice: number
  onCouponApplied: (coupon: AppliedCoupon | null) => void
  onError?: (error: string) => void
}

export function CouponInputComponent({
  planId,
  originalPrice,
  onCouponApplied,
  onError,
}: Props) {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [error, setError] = useState('')

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Simulated API call - replace with actual endpoint
      const response = await fetch('https://your-api.com/api/subscriptions/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          planId: planId,
          amount: originalPrice,
        }),
      })

      if (!response.ok) throw new Error('Failed to validate coupon')

      const result = await response.json()

      if (result.valid) {
        const coupon: AppliedCoupon = {
          code: result.code,
          discountType: result.discountType,
          discountValue: result.discountValue,
          originalPrice: result.originalPrice,
          discountAmount: result.discountAmount,
          finalPrice: result.finalPrice,
        }
        setAppliedCoupon(coupon)
        setCouponCode('')
        onCouponApplied(coupon)
      } else {
        const errorMessage = getErrorMessage(result.error)
        setError(errorMessage)
        onError?.(errorMessage)
      }
    } catch (error) {
      console.error('Coupon validation error:', error)
      const msg = 'Error validating coupon. Please try again.'
      setError(msg)
      onError?.(msg)
    } finally {
      setLoading(false)
    }
  }

  const getErrorMessage = (errorCode: string): string => {
    const messages: Record<string, string> = {
      COUPON_NOT_FOUND: 'Coupon code not found',
      COUPON_EXPIRED: 'This coupon has expired',
      COUPON_EXHAUSTED: 'This coupon has reached its usage limit',
      MINIMUM_NOT_MET: 'Minimum purchase amount not met',
      NOT_APPLICABLE_TO_PLAN: 'This coupon is not applicable to this plan',
      ALREADY_USED: 'You have already used this coupon',
      INVALID_CODE: 'Invalid coupon code',
    }
    return messages[errorCode] || 'Invalid coupon code'
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setError('')
    onCouponApplied(null)
  }

  if (appliedCoupon) {
    return (
      <View style={styles.appliedContainer}>
        <View style={styles.appliedContent}>
          <View style={styles.appliedHeader}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.semantic.success} />
            <Text style={styles.appliedLabel}>Coupon Applied</Text>
          </View>
          <Text style={styles.couponCode}>{appliedCoupon.code}</Text>
          <Text style={styles.discount}>
            {appliedCoupon.discountType === 'percentage'
              ? `-${appliedCoupon.discountValue}%`
              : `-$${appliedCoupon.discountAmount.toFixed(2)}`}
          </Text>
          <Text style={styles.savings}>You save ${appliedCoupon.discountAmount.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.removeButton} onPress={handleRemoveCoupon}>
          <Ionicons name="close" size={18} color={Colors.semantic.error} />
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
          placeholderTextColor="#9CA3AF"
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
            <ActivityIndicator color={Colors.text.inverse} size="small" />
          ) : (
            <Text style={styles.buttonText}>Apply</Text>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={Colors.semantic.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 16,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text.primary,
  },
  button: {
    backgroundColor: Colors.primary.main,
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.ui.border,
  },
  buttonText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  error: {
    color: Colors.semantic.error,
    fontSize: 12,
    flex: 1,
  },
  appliedContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.accent.lightGreen || '#f0fdf4',
    borderWidth: 1,
    borderColor: Colors.semantic.success,
    borderRadius: DesignSystem.borderRadius.md,
    padding: 12,
    marginVertical: 16,
    marginHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedContent: {
    flex: 1,
    gap: 4,
  },
  appliedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appliedLabel: {
    fontSize: 12,
    color: Colors.semantic.success,
    fontWeight: '600',
  },
  couponCode: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  discount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.semantic.success,
  },
  savings: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  removeButton: {
    padding: 8,
  },
})
