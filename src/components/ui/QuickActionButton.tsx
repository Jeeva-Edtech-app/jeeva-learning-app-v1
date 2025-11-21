import { Pressable, Text, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface QuickActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress?: () => void
}

export function QuickActionButton({ icon, label, onPress }: QuickActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color="#3B82F6" />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '23%',
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#1A1A1A',
    textAlign: 'center',
    fontWeight: '500',
  },
})
