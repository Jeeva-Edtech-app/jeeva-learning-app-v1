import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

interface CourseCardProps {
  title: string
  subtitle: string
  imageUrl: string
  onPress: () => void
}

export function CourseCard({ title, subtitle, imageUrl, onPress }: CourseCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      {/* Image Section with 15px padding */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
      </View>

      {/* Details and Button Section - 280px x 88px */}
      <View style={styles.detailsSection}>
        <View style={styles.textContainer}>
          <Text style={styles.courseLabel}>course</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Arrow Button - 33.33px x 33.33px */}
        <View style={styles.arrowButton}>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: Platform.select({
      web: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      default: undefined,
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  imageContainer: {
    padding: 15,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  detailsSection: {
    height: 88,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  textContainer: {
    flex: 1,
  },
  courseLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  arrowButton: {
    width: 33.33,
    height: 33.33,
    borderRadius: 16.665,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
})
