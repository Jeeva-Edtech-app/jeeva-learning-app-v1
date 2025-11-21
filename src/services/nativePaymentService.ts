// Native payment service - only imported dynamically on native platforms
import { Platform } from 'react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://jeeva-admin-portal.replit.app'
const API_URL = `${BACKEND_URL}/api/payments`

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
      const stripeModule = (require as any)('@stripe/stripe-react-native');
      const useStripe = stripeModule.useStripe;
      const { initPaymentSheet, presentPaymentSheet } = useStripe();

      const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscriptionPlanId: planId, countryCode: country, discountCouponCode: coupon }),
      });

      if (!response.ok) throw new Error(`Backend error: ${response.status}`);
      const { paymentId, clientSecret } = await response.json();

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Jeeva Learning',
        returnURL: 'jeevalearning://payment-success',
      });

      if (initError) throw new Error(initError.message);
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code === 'Canceled') {
          return { success: false, canceled: true };
        }
        throw new Error(presentError.message);
      }

      const verifyResponse = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });

      if (!verifyResponse.ok) throw new Error('Verification failed');
      const result = await verifyResponse.json();
      if (result.success) return { success: true, transactionId: paymentId };
      throw new Error(result.error || 'Payment verification failed');
    } else {
      const RazorpayCheckout = (require as any)('react-native-razorpay').default;

      const configResponse = await fetch(`${API_URL}/config`);
      if (!configResponse.ok) throw new Error('Config fetch failed');
      const config = await configResponse.json();

      const createResponse = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscriptionPlanId: planId, countryCode: country, discountCouponCode: coupon }),
      });

      if (!createResponse.ok) throw new Error('Payment creation failed');
      const { paymentId, orderId, amount, currency } = await createResponse.json();

      const options = {
        description: 'Jeeva Learning Subscription',
        currency, key: config.razorpay.keyId, amount, name: 'Jeeva Learning', order_id: orderId,
        prefill: { email, contact: phoneNumber, name: userName },
        theme: { color: '#007aff' },
      };

      await RazorpayCheckout.open(options);

      const verifyResponse = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });

      if (!verifyResponse.ok) throw new Error('Verification failed');
      const result = await verifyResponse.json();
      if (result.success) return { success: true, transactionId: paymentId };
      throw new Error(result.error || 'Payment verification failed');
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    return { success: false, error: error.message || 'Payment failed' };
  }
}
