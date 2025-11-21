import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSubscription } from '@/hooks/useSubscription'
import { Colors, DesignSystem } from '@/constants/DesignSystem'
import { router } from 'expo-router'

interface FeatureGateProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const [hasAccess, setHasAccess] = React.useState(true)
  const [loading, setLoading] = React.useState(true)
  const { checkFeatureAccess, isValid } = useSubscription()

  React.useEffect(() => {
    const check = async () => {
      setLoading(true)
      const result = await checkFeatureAccess(feature)
      setHasAccess(result.hasAccess)
      setLoading(false)
    }
    check()
  }, [feature, isValid])

  if (loading) {
    return <Text style={{ color: Colors.text.secondary }}>Loading...</Text>
  }

  if (!hasAccess) {
    return (
      fallback || (
        <View style={upgradePromptStyles.container}>
          <View style={upgradePromptStyles.iconContainer}>
            <Ionicons name='lock-closed' size={48} color={Colors.primary.main} />
          </View>
          <Text style={upgradePromptStyles.title}>Feature Locked</Text>
          <Text style={upgradePromptStyles.message}>
            Upgrade your subscription to access {feature}
          </Text>
          <TouchableOpacity
            style={upgradePromptStyles.button}
            onPress={() => router.push('/subscriptions' as any)}
          >
            <Text style={upgradePromptStyles.buttonText}>Upgrade Now</Text>
            <Ionicons name='arrow-forward' size={16} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>
      )
    )
  }

  return <>{children}</>
}

const upgradePromptStyles = {
  container: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: DesignSystem.spacing.xl,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  iconContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  title: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.bold as any,
    color: Colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center' as const,
  },
  message: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: Colors.text.secondary,
    marginBottom: DesignSystem.spacing.lg,
    textAlign: 'center' as const,
  },
  button: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: DesignSystem.spacing.md,
    backgroundColor: Colors.primary.main,
    borderRadius: DesignSystem.borderRadius.lg,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  buttonText: {
    color: Colors.text.inverse,
    fontWeight: DesignSystem.typography.fontWeight.semibold as any,
    fontSize: DesignSystem.typography.fontSize.base,
  },
}
