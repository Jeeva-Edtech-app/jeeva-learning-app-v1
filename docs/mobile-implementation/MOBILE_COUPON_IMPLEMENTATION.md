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
