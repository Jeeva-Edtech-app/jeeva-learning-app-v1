import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/DesignSystem';

export default function PaymentSuccessScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={60} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Payment Successful!</Text>

        <Text style={styles.message}>
          Your subscription has been activated. You now have full access to all Jeeva Learning features.
        </Text>

        <View style={styles.benefitsList}>
          <BenefitItem text="✓ Unlimited practice questions" />
          <BenefitItem text="✓ Full learning modules" />
          <BenefitItem text="✓ Unlimited mock exams" />
          <BenefitItem text="✓ Priority support" />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.buttonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function BenefitItem({ text }: { text: string }) {
  return <Text style={styles.benefitText}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.semantic.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  benefitsList: {
    alignSelf: 'stretch',
    marginVertical: 24,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginVertical: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  button: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
