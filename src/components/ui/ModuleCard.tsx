import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ModuleCardProps {
  title: string
  description: string
  thumbnailUrl?: string
  onPress?: () => void
}

export function ModuleCard({ title, description, thumbnailUrl, onPress }: ModuleCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      {thumbnailUrl && (
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.category}>course</Text>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        </View>
        
        <View style={styles.iconContainer}>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    boxShadow: Platform.select({
      web: '0px 2px 8px rgba(0, 0, 0, 0.06)',
      default: undefined,
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.1,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    textTransform: 'lowercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#9E9E9E',
    lineHeight: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
