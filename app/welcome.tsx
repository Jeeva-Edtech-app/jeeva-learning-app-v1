import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { useRouter, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { getProfile } from '@/api/profile'

export default function WelcomeScreen() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Redirect authenticated users away from welcome screen
  useFocusEffect(
    useCallback(() => {
      const checkAuthAndRedirect = async () => {
        if (!loading && user) {
          try {
            const profile = await getProfile(user.id)
            if (!profile || !profile.profile_completed) {
              router.replace('/complete-profile')
            } else {
              router.replace('/(tabs)')
            }
          } catch (error) {
            console.error('Profile check error:', error)
            router.replace('/complete-profile')
          }
        }
      }

      checkAuthAndRedirect()
    }, [user, loading, router])
  )

  // Don't show welcome screen if user is authenticated
  if (user && !loading) {
    return null
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/images/jeeva-learning-app-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to Jeeva Learning</Text>
          <Text style={styles.subtitle}>
            Your personalized learning journey starts here. Master new skills at your own pace.
          </Text>
        </View>

        <View style={styles.illustration}>
          <Image
            source='https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/jeeva%20expo/welcome_page.png'
            style={styles.welcomeImage}
            contentFit="contain"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Create Account"
            onPress={() => router.push('/(auth)/register')}
            variant="primary"
            style={styles.primaryButton}
          />
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/login')}
            variant="outline"
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
  },
  textContainer: {
    marginTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  illustration: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
  },
  welcomeImage: {
    width: '100%',
    height: 300,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
})
