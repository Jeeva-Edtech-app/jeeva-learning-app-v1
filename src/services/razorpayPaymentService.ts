const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://jeeva-admin-portal.replit.app'
const API_URL = `${BACKEND_URL}/api/payments`

export const useRazorpayPayment = () => {
  const createPayment = async (
    userId: string,
    subscriptionPlanId: string,
    userEmail: string,
    userPhone: string,
    userName: string,
    countryCode: string,
    discountCouponCode?: string
  ) => {
    try {
      const { Platform } = require('react-native')

      if (Platform.OS === 'web') {
        return { success: false, error: 'Payment processing not available on web' }
      }

      let RazorpayCheckout: any
      try {
        RazorpayCheckout = require('react-native-razorpay').default
      } catch (e) {
        console.warn('Razorpay not available:', e)
        return { success: false, error: 'Razorpay not available' }
      }

      const configResponse = await fetch(`${API_URL}/config`)
      if (!configResponse.ok) {
        throw new Error(`Config fetch failed: ${configResponse.status}`)
      }
      const config = await configResponse.json()
      const razorpayKeyId = config.razorpay.keyId

      const createResponse = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscriptionPlanId,
          discountCouponCode,
          countryCode,
        }),
      })

      if (!createResponse.ok) {
        throw new Error(`Payment creation failed: ${createResponse.status}`)
      }

      const { paymentId, orderId, amount, currency, gateway } = await createResponse.json()

      if (gateway !== 'razorpay') {
        throw new Error('Expected Razorpay gateway for this user')
      }

      const options = {
        description: 'Jeeva Learning Subscription',
        image: 'https://your-app-logo-url.com/logo.png',
        currency: currency,
        key: razorpayKeyId,
        amount: amount,
        name: 'Jeeva Learning',
        order_id: orderId,
        prefill: {
          email: userEmail,
          contact: userPhone,
          name: userName,
        },
        theme: { color: '#007aff' },
      }

      const data = await RazorpayCheckout.open(options)

      const verifyResponse = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
        }),
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
      console.error('Razorpay payment error:', error)

      if (error.code === 'PAYMENT_CANCELLED' || error.message === 'Payment Cancelled') {
        return {
          success: false,
          canceled: true,
        }
      }

      return {
        success: false,
        error: error.message || 'Payment failed',
      }
    }
  }

  return { createPayment }
}
