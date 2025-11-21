const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://jeeva-admin-portal.replit.app'
const API_URL = `${BACKEND_URL}/api/payments`

export const useStripePayment = () => {
  const createPayment = async (
    userId: string,
    subscriptionPlanId: string,
    countryCode: string,
    discountCouponCode?: string
  ) => {
    try {
      const { Platform } = require('react-native')
      
      if (Platform.OS === 'web') {
        return { success: false, error: 'Payment processing not available on web' }
      }

      let useStripe: any
      try {
        const stripeModule = require('@stripe/stripe-react-native')
        useStripe = stripeModule.useStripe
      } catch (e) {
        console.warn('Stripe not available:', e)
        return { success: false, error: 'Stripe not available' }
      }

      const { initPaymentSheet, presentPaymentSheet } = useStripe()

      const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscriptionPlanId,
          discountCouponCode,
          countryCode,
        }),
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`)
      }

      const { paymentId, clientSecret, amount, currency, gateway } = await response.json()

      if (gateway !== 'stripe') {
        throw new Error('Expected Stripe gateway for this user')
      }

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Jeeva Learning',
        returnURL: 'jeevalearning://payment-success',
      })

      if (initError) {
        throw new Error(initError.message)
      }

      const { error: presentError } = await presentPaymentSheet()

      if (presentError) {
        if (presentError.code === 'Canceled') {
          return { success: false, canceled: true }
        }
        throw new Error(presentError.message)
      }

      const verifyResponse = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      })

      if (!verifyResponse.ok) {
        throw new Error(`Verification failed: ${verifyResponse.status}`)
      }

      const verifyResult = await verifyResponse.json()

      if (verifyResult.success) {
        return {
          success: true,
          transactionId: paymentId,
        }
      } else {
        throw new Error(verifyResult.error || 'Payment verification failed')
      }
    } catch (error: any) {
      console.error('Stripe payment error:', error)
      return {
        success: false,
        error: error.message || 'Payment failed',
      }
    }
  }

  return { createPayment }
}
