import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/DesignSystem'

interface InnerPageHeaderProps {
  title: string
  onBack?: () => void
}

export function InnerPageHeader({ title, onBack }: InnerPageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#6D6D6D" />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 18,
    color: '#6D6D6D',
  },
})
