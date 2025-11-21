import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { countryDetectionService } from '@/services/countryDetectionService';
import { paymentGatewaySelector } from '@/services/paymentGatewaySelector';
import { Colors } from '@/constants/DesignSystem';

export default function CheckoutScreen() {
  const route = useRoute();
  const { user } = useAuth();
  const { planId, planName, planPrice } = route.params as { planId: string; planName: string; planPrice: number };

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

  const handlePayment = () => {
    Alert.alert('Mobile Only', 'Payment processing is only available in the mobile app. Please download the Jeeva Learning app to complete your subscription.');
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

          <View style={styles.webNotice}>
            <Ionicons name="information-circle" size={24} color={Colors.primary} />
            <Text style={styles.webNoticeText}>
              Payment processing is only available in the Jeeva Learning mobile app. Download the app to complete your subscription.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Text style={styles.payButtonText}>Download App to Pay</Text>
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
    marginBottom: 24,
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
  webNotice: {
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  webNoticeText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    lineHeight: 20,
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
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
