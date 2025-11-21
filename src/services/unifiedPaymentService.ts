import { countryDetectionService } from './countryDetectionService'
import { useStripePayment } from './stripePaymentService'
import { useRazorpayPayment } from './razorpayPaymentService'

type PaymentGateway = 'stripe' | 'razorpay'

export const useUnifiedPayment = () => {
  const stripePayment = useStripePayment()
  const razorpayPayment = useRazorpayPayment()

  const selectGateway = (countryCode: string): PaymentGateway => {
    return countryCode === 'IN' ? 'razorpay' : 'stripe'
  }

  const createPayment = async (
    userId: string,
    subscriptionPlanId: string,
    userProfile: {
      email: string
      phoneNumber: string
      fullName: string
    },
    discountCouponCode?: string,
    gatewayOverride?: PaymentGateway
  ) => {
    try {
      const countryCode = await countryDetectionService.getUserCountry(userId)
      const gateway = gatewayOverride || selectGateway(countryCode)

      console.log(`Routing payment to ${gateway} for country ${countryCode}`)

      if (gateway === 'razorpay') {
        return await razorpayPayment.createPayment(
          userId,
          subscriptionPlanId,
          userProfile.email,
          userProfile.phoneNumber,
          userProfile.fullName,
          countryCode,
          discountCouponCode
        )
      } else {
        return await stripePayment.createPayment(
          userId,
          subscriptionPlanId,
          countryCode,
          discountCouponCode
        )
      }
    } catch (error) {
      console.error('Unified payment error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      }
    }
  }

  return { createPayment, selectGateway }
}
