import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { Colors, DesignSystem } from '@/constants/DesignSystem'

type PaymentStatus = 'processing' | 'success' | 'failed'

export default function PaymentProcessingScreen() {
  const { planId } = useLocalSearchParams()
  const [status, setStatus] = useState<PaymentStatus>('processing')
  const [message, setMessage] = useState('Processing your payment...')

  React.useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      // In real implementation, this would verify with payment gateway
      setStatus('success')
      setMessage('Payment successful!')
      
      const successTimer = setTimeout(() => {
        router.replace('/(tabs)' as any)
      }, 2000)
      
      return () => clearTimeout(successTimer)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleRetry = () => {
    setStatus('processing')
    setMessage('Processing your payment...')
  }

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: () => router.back()
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name='close' size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.container}>
        {status === 'processing' && (
          <>
            <View style={styles.processingIcon}>
              <ActivityIndicator size='large' color={Colors.primary.main} />
            </View>
            <Text style={styles.title}>Processing Payment</Text>
            <Text style={styles.message}>{message}</Text>
            <Text style={styles.subtitle}>Please don't close this screen</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View style={styles.successIcon}>
              <Ionicons name='checkmark-circle' size={80} color={Colors.semantic.success} />
            </View>
            <Text style={styles.title}>Payment Successful!</Text>
            <Text style={styles.message}>{message}</Text>
            <Text style={styles.subtitle}>Your subscription has been activated</Text>
          </>
        )}

        {status === 'failed' && (
          <>
            <View style={styles.failedIcon}>
              <Ionicons name='close-circle' size={80} color={Colors.semantic.error} />
            </View>
            <Text style={styles.title}>Payment Failed</Text>
            <Text style={styles.message}>Unable to process your payment. Please try again.</Text>
            
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Ionicons name='reload' size={18} color={Colors.text.inverse} />
              <Text style={styles.retryButtonText}>Retry Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  processingIcon: {
    marginBottom: 32,
  },
  successIcon: {
    marginBottom: 24,
  },
  failedIcon: {
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary.main,
    borderRadius: DesignSystem.borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 32,
    width: '100%',
  },
  retryButtonText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
  },
  cancelButtonText: {
    color: Colors.text.secondary,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
})
