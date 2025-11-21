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
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { countryDetectionService } from '@/services/countryDetectionService';
import { paymentGatewaySelector } from '@/services/paymentGatewaySelector';
import { processPayment } from '@/services/paymentWrapper';
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

    setLoading(true);
    try {
      const result = await processPayment(
        gateway,
        user.id,
        planId,
        user.email || '',
        country,
        couponCode,
        (user as any).phone,
        (user as any).user_metadata?.name
      );

      if (result.success) {
        router.push('/subscriptions/success');
      } else if (!result.canceled) {
        Alert.alert('Error', result.error || 'Payment failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const gatewayInfo = paymentGatewaySelector.getGatewayInfo(gateway);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Details</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{planName}</Text>
              <Text style={styles.summaryValue}>${planPrice.toFixed(2)}</Text>
            </View>

            {discountedPrice < planPrice && (
              <>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={styles.discountValue}>-${(planPrice - discountedPrice).toFixed(2)}</Text>
                </View>
              </>
            )}

            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${discountedPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.gatewayBox}>
            <Text style={styles.gatewayName}>{gatewayInfo.name}</Text>
            <Text style={styles.gatewayDescription}>{gatewayInfo.description}</Text>
            <View style={styles.methodsContainer}>
              {gatewayInfo.methods.map((method, index) => (
                <View key={index} style={styles.methodTag}>
                  <Text style={styles.methodText}>{method}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Billing Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Details</Text>
          <View style={styles.billingBox}>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Email:</Text>
              <Text style={styles.billingValue}>{user?.email}</Text>
            </View>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Country:</Text>
              <Text style={styles.billingValue}>{country}</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By proceeding, you agree to our Terms & Conditions and Refund Policy. Your subscription will be set to manual renewal.
          </Text>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.payButtonText}>Pay ${discountedPrice.toFixed(2)}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  summaryBox: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.semantic.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.ui.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary.main,
  },
  gatewayBox: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.primary.main,
  },
  gatewayName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  gatewayDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  methodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  methodText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  billingBox: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  billingLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  billingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  termsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  termsText: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  payButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
