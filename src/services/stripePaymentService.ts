import { Platform } from 'react-native'

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://jeeva-admin-portal.replit.app'
const API_URL = `${BACKEND_URL}/api/payments`

let useStripe: any = () => ({ initPaymentSheet: async () => ({}), presentPaymentSheet: async () => ({}) })

if (Platform.OS !== 'web') {
  const stripeModule = require('@stripe/stripe-react-native')
  useStripe = stripeModule.useStripe
}

export const useStripePayment = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe()

  const createPayment = async (
    userId: string,
    subscriptionPlanId: string,
    countryCode: string,
    discountCouponCode?: string
  ) => {
    try {
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
        body: JSON.stringify({
          paymentId,
          gateway: 'stripe',
          stripePaymentIntentId: clientSecret.split('_secret_')[0],
        }),
      })

      const verifyResult = await verifyResponse.json()

      if (verifyResult.success) {
        return {
          success: true,
          payment: verifyResult.payment,
        }
      } else {
        throw new Error(verifyResult.error || 'Payment verification failed')
      }
    } catch (error) {
      console.error('Stripe payment error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      }
    }
  }

  return { createPayment }
}
