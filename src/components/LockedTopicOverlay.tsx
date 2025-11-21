import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, DesignSystem } from '@/constants/DesignSystem'

interface LockedTopicOverlayProps {
  onSubscribe: () => void
  onClose: () => void
  moduleType?: 'practice' | 'learning' | 'mock_exam'
}

export function LockedTopicOverlay({
  onSubscribe,
  onClose,
  moduleType = 'practice',
}: LockedTopicOverlayProps) {
  const getLockedMessage = () => {
    switch (moduleType) {
      case 'mock_exam':
        return 'Mock exams are only available with a subscription. Upgrade to practice full exam simulations!'
      case 'learning':
        return 'This learning topic requires a subscription. Upgrade to unlock all learning modules!'
      case 'practice':
      default:
        return 'This practice topic is locked. Subscribe to unlock all practice questions!'
    }
  }

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Lock Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="lock-closed"
              size={64}
              color="#EF4444"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>This Content is Locked</Text>

          {/* Message */}
          <Text style={styles.message}>{getLockedMessage()}</Text>

          {/* Trial Info */}
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle"
              size={20}
              color="#3B82F6"
            />
            <Text style={styles.infoText}>
              You're in trial mode. Subscribe to unlock all features!
            </Text>
          </View>

          {/* Benefits List */}
          <View style={styles.benefitsList}>
            <BenefitItem text="✓ Unlimited practice questions" />
            <BenefitItem text="✓ Full learning modules" />
            <BenefitItem text="✓ Unlimited mock exams" />
            <BenefitItem text="✓ AI-powered recommendations" />
            <BenefitItem text="✓ Priority support" />
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={onSubscribe}
          >
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: DesignSystem.borderRadius.xl,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: '#E0E7FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#3B82F6',
    flex: 1,
    fontWeight: '500',
  },
  benefitsList: {
    width: '100%',
    marginBottom: 20,
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
  subscribeButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: DesignSystem.borderRadius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
})
