import { Platform } from 'react-native';

export async function processPayment(
  gateway: 'stripe' | 'razorpay',
  userId: string,
  planId: string,
  email: string,
  country: string,
  coupon?: string,
  phoneNumber?: string,
  userName?: string
) {
  if (Platform.OS === 'web') {
    return { success: false, error: 'Payment processing not available on web' };
  }

  try {
    if (gateway === 'stripe') {
      const { useStripePayment } = require('@/services/stripePaymentService');
      const stripePayment = useStripePayment();
      return await stripePayment.createPayment(userId, planId, country, coupon);
    } else {
      const { useRazorpayPayment } = require('@/services/razorpayPaymentService');
      const razorpayPayment = useRazorpayPayment();
      return await razorpayPayment.createPayment(userId, planId, email, phoneNumber || '', userName || 'User', country, coupon);
    }
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return { success: false, error: error.message || 'Payment failed' };
  }
}
