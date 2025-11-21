import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors, DesignSystem } from '@/constants/DesignSystem'

interface TrialBlockedScreenProps {
  moduleType: 'mock_exam'
  title?: string
  message?: string
}

export default function TrialBlockedScreen({
  moduleType,
  title = 'Mock Exams Locked',
  message = 'Mock exams are only available with a paid subscription. Upgrade now to practice full exam simulations!',
}: TrialBlockedScreenProps) {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={80} color="#EF4444" />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>Subscribe to unlock all modules</Text>
        </View>

        <View style={styles.benefitsList}>
          <BenefitItem text="✓ Unlimited mock exams" />
          <BenefitItem text="✓ Unlimited practice questions" />
          <BenefitItem text="✓ Full learning modules" />
          <BenefitItem text="✓ AI recommendations" />
        </View>

        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => router.push('/subscriptions')}
        >
          <Text style={styles.upgradeButtonText}>Subscribe Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function BenefitItem({ text }: { text: string }) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: DesignSystem.borderRadius.lg,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
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
    marginBottom: 20,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: '#E0E7FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  benefitsList: {
    width: '100%',
    marginBottom: 24,
  },
  benefitItem: {
    paddingVertical: 8,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    fontWeight: '500',
  },
  upgradeButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: DesignSystem.borderRadius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
})
