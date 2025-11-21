import { useEffect, useState } from 'react'
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useAuth } from '@/context/AuthContext'
import { getProfile } from '@/api/profile'
import { preloadHeroBanners } from '@/api/hero'
import { queryClient } from '@/providers/QueryProvider'

SplashScreen.preventAutoHideAsync()

export default function SplashScreenComponent() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        await preloadHeroBanners(queryClient)
      } catch (error) {
        console.warn('Error during app initialization:', error)
      } finally {
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      if (!loading && appIsReady) {
        if (user) {
          try {
            // Wait for profile with retries (similar to callback)
            let profile = null
            for (let i = 0; i < 3; i++) {
              try {
                profile = await getProfile(user.id)
                if (profile) break
              } catch (error) {
                console.log(`Profile check attempt ${i + 1}/3 - not found yet`)
              }
              if (i < 2) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
              }
            }

            if (!profile || !profile.profile_completed) {
              router.replace('/complete-profile')
              return
            }
            router.replace('/(tabs)')
          } catch (error) {
            console.error('Profile check error:', error)
            router.replace('/complete-profile')
          }
        } else {
          router.replace('/(auth)/login')
        }
        await SplashScreen.hideAsync()
      }
    }

    checkProfileAndRedirect()
  }, [user, loading, router, appIsReady])

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo-large.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  loader: {
    marginTop: 24,
  },
})
