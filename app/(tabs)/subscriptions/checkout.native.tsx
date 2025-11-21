import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  SafeAreaView,
  TextInput,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { countryDetectionService } from '@/services/countryDetectionService';
import { paymentGatewaySelector } from '@/services/paymentGatewaySelector';
import { Colors, DesignSystem } from '@/constants/DesignSystem';

export default function CheckoutScreen() {
  const route = useRoute();
  const { user } = useAuth();
  const { planId, planName, planPrice } = route.params as { planId: string; planName: string; planPrice: number };

  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState('US');
  const [gateway, setGateway] = useState<'stripe' | 'razorpay'>('stripe');
  const [couponCode, setCouponCode] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState(planPrice);

  useEffect(() => {
    detectCountryAndGateway();
  }, []);

  const detectCountryAndGateway = async () => {
    try {
      const detectedCountry = await countryDetectionService.detectUserCountry();
      setCountry(detectedCountry);
      const selectedGateway = paymentGatewaySelector.selectGateway(detectedCountry);
      setGateway(selectedGateway);
    } catch (error) {
      console.error('Failed to detect country:', error);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      Alert.alert('Please log in first');
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert('Payment processing is not available on web. Please use the mobile app.');
      return;
    }

    setLoading(true);
    try {
      // Dynamic native-only payment processing
      let result: any;
      
      if (gateway === 'stripe') {
        const stripeModule = (require as any)('@stripe/stripe-react-native');
        const useStripe = stripeModule.useStripe;
        const { initPaymentSheet, presentPaymentSheet } = useStripe();

        const response = await fetch(`${API_URL}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, subscriptionPlanId: planId, countryCode: country, discountCouponCode: couponCode }),
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
            result = { success: false, canceled: true };
          } else {
            throw new Error(presentError.message);
          }
        } else {
          const verifyResponse = await fetch(`${API_URL}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });

          if (!verifyResponse.ok) throw new Error('Verification failed');
          const verifyResult = await verifyResponse.json();
          result = verifyResult.success ? { success: true, transactionId: paymentId } : { success: false, error: verifyResult.error || 'Payment verification failed' };
        }
      } else {
        const RazorpayCheckout = (require as any)('react-native-razorpay').default;

        const configResponse = await fetch(`${API_URL}/config`);
        if (!configResponse.ok) throw new Error('Config fetch failed');
        const config = await configResponse.json();

        const createResponse = await fetch(`${API_URL}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, subscriptionPlanId: planId, countryCode: country, discountCouponCode: couponCode }),
        });

        if (!createResponse.ok) throw new Error('Payment creation failed');
        const { paymentId, orderId, amount, currency } = await createResponse.json();

        const options = {
          description: 'Jeeva Learning Subscription',
          currency, key: config.razorpay.keyId, amount, name: 'Jeeva Learning', order_id: orderId,
          prefill: { email: user.email, contact: (user as any).phone, name: (user as any).user_metadata?.name },
          theme: { color: '#007aff' },
        };

        await RazorpayCheckout.open(options);

        const verifyResponse = await fetch(`${API_URL}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });

        if (!verifyResponse.ok) throw new Error('Verification failed');
        const verifyResult = await verifyResponse.json();
        result = verifyResult.success ? { success: true, transactionId: paymentId } : { success: false, error: verifyResult.error || 'Payment verification failed' };
      }

      if (finalResult.success) {
        router.push('/subscriptions/success');
      } else if (!finalResult.canceled) {
        Alert.alert('Error', finalResult.error || 'Payment failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const gatewayInfo = paymentGatewaySelector.getGatewayInfo(gateway);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Order Summary</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.planCard}>
            <Text style={styles.planName}>{planName}</Text>
            <Text style={styles.planPrice}>₹{discountedPrice.toFixed(2)}</Text>
          </View>

          <View style={styles.couponSection}>
            <Text style={styles.sectionTitle}>Have a coupon?</Text>
            <View style={styles.couponInput}>
              <TextInput
                placeholder="Enter coupon code"
                value={couponCode}
                onChangeText={setCouponCode}
                style={styles.input}
              />
              <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.paymentMethodSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.methodCard}>
              <Ionicons name={gatewayInfo.icon as any} size={32} color={Colors.primary} />
              <Text style={styles.methodName}>{gatewayInfo.name}</Text>
              <Text style={styles.methodDescription}>{gatewayInfo.description}</Text>
            </View>
          </View>

          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{planPrice.toFixed(2)}</Text>
            </View>
            {couponCode && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>-₹{(planPrice - discountedPrice).toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{discountedPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Pay ₹{discountedPrice.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    padding: 20,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  couponSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  couponInput: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  paymentMethodSection: {
    marginBottom: 24,
  },
  methodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
  },
  methodDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  summarySection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTopView: 12,
    marginTop: 12,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
