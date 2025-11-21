// @ts-ignore - react-native and dynamic requires work at runtime despite TypeScript warnings
import { Platform } from 'react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://jeeva-admin-portal.replit.app'
const API_URL = `${BACKEND_URL}/api/payments`

async function createStripePayment(
  userId: string,
  planId: string,
  country: string,
  coupon?: string
) {
  try {
    const RNPlatform = Platform;
    if (RNPlatform.OS === 'web') {
      return { success: false, error: 'Stripe not available on web' };
    }

    const stripeModule = (require as any)('@stripe/stripe-react-native');
    const useStripe = stripeModule.useStripe;
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const response = await fetch(`${API_URL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subscriptionPlanId: planId, countryCode: country, discountCouponCode: coupon }),
    });

    if (!response.ok) throw new Error(`Backend error: ${response.status}`);
    const { paymentId, clientSecret, gateway } = await response.json();

    if (gateway !== 'stripe') throw new Error('Expected Stripe gateway');

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
    const verifyResult = await verifyResponse.json();

    if (verifyResult.success) {
      return { success: true, transactionId: paymentId };
    } else {
      throw new Error(verifyResult.error || 'Payment verification failed');
    }
  } catch (error: any) {
    console.error('Stripe payment error:', error);
    return { success: false, error: error.message || 'Payment failed' };
  }
}

async function createRazorpayPayment(
  userId: string,
  planId: string,
  email: string,
  phoneNumber: string,
  userName: string,
  country: string,
  coupon?: string
) {
  try {
    const RNPlatform = Platform;
    if (RNPlatform.OS === 'web') {
      return { success: false, error: 'Razorpay not available on web' };
    }

    const RazorpayCheckout = (require as any)('react-native-razorpay').default;

    const configResponse = await fetch(`${API_URL}/config`);
    if (!configResponse.ok) throw new Error('Config fetch failed');
    const config = await configResponse.json();
    const razorpayKeyId = config.razorpay.keyId;

    const createResponse = await fetch(`${API_URL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subscriptionPlanId: planId, countryCode: country, discountCouponCode: coupon }),
    });

    if (!createResponse.ok) throw new Error('Payment creation failed');
    const { paymentId, orderId, amount, currency, gateway } = await createResponse.json();

    if (gateway !== 'razorpay') throw new Error('Expected Razorpay gateway');

    const options = {
      description: 'Jeeva Learning Subscription',
      image: 'https://your-app-logo-url.com/logo.png',
      currency,
      key: razorpayKeyId,
      amount,
      name: 'Jeeva Learning',
      order_id: orderId,
      prefill: { email, contact: phoneNumber, name: userName },
      theme: { color: '#007aff' },
    };

    const data = await RazorpayCheckout.open(options);

    const verifyResponse = await fetch(`${API_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId }),
    });

    if (!verifyResponse.ok) throw new Error('Verification failed');
    const verifyResult = await verifyResponse.json();

    if (verifyResult.success) {
      return { success: true, transactionId: paymentId };
    } else {
      throw new Error(verifyResult.error || 'Payment verification failed');
    }
  } catch (error: any) {
    console.error('Razorpay payment error:', error);
    if (error.message === 'Payment Cancelled' || error.code === 'PAYMENT_CANCELLED') {
      return { success: false, canceled: true };
    }
    return { success: false, error: error.message || 'Payment failed' };
  }
}

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
      return await createStripePayment(userId, planId, country, coupon);
    } else {
      return await createRazorpayPayment(userId, planId, email, phoneNumber || '', userName || 'User', country, coupon);
    }
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return { success: false, error: error.message || 'Payment failed' };
  }
}
