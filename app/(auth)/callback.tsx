import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { getUserProfile } from '@/api/profile'
import { showToast } from '@/utils/toast'

export default function AuthCallbackScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ type?: string }>()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    handleAuthCallback()
  }, [])

  const waitForProfile = async (userId: string, maxRetries = 5, delay = 1000): Promise<any> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const profile = await getUserProfile(userId)
        if (profile) {
          return profile
        }
      } catch (error) {
        // Profile doesn't exist yet, continue retrying
        console.log(`Profile check attempt ${i + 1}/${maxRetries} - not found yet`)
      }
      
      if (i < maxRetries - 1) {
        // Wait before next retry, with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
    return null
  }

  const handleAuthCallback = async () => {
    try {
      setStatus('loading')
      
      // Wait for Supabase to process the OAuth callback and auth state to update
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Listen for auth state changes to ensure we have the latest session
      let sessionFound = false
      let currentSession: any = null

      // First, try to get session directly
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Error getting session:', sessionError)
        setErrorMessage(sessionError.message || 'Failed to authenticate')
        setStatus('error')
        setTimeout(() => {
          router.replace('/(auth)/login')
        }, 2000)
        return
      }

      if (session?.user) {
        sessionFound = true
        currentSession = session
      } else {
        // If no session yet, wait a bit more and listen to auth state changes
        console.log('No session yet, waiting for auth state change...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const { data: { session: retrySession } } = await supabase.auth.getSession()
        if (retrySession?.user) {
          sessionFound = true
          currentSession = retrySession
        }
      }

      if (!sessionFound || !currentSession?.user) {
        console.error('No session found after OAuth callback')
        setErrorMessage('Authentication failed. Please try again.')
        setStatus('error')
        setTimeout(() => {
          router.replace('/(auth)/login')
        }, 2000)
        return
      }

      console.log('OAuth callback successful, user:', currentSession.user.id)

      // Wait for profile to be created by database triggers (with retries)
      console.log('Waiting for profile to be created...')
      const profile = await waitForProfile(currentSession.user.id, 5, 1000)

      if (!profile) {
        console.log('Profile not found after retries, redirecting to complete-profile')
        // Profile doesn't exist - redirect to complete-profile where it will be created
        router.replace('/complete-profile')
        return
      }

      // Profile exists, check if it's completed
      if (!profile.profile_completed) {
        console.log('Profile not completed, redirecting to complete-profile')
        router.replace('/complete-profile')
        return
      }

      // Profile is complete, navigate to home
      console.log('Profile completed, redirecting to home')
      router.replace('/(tabs)')
    } catch (error) {
      console.error('Auth callback error:', error)
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      setErrorMessage(message)
      setStatus('error')
      showToast.error('Authentication failed. Please try again.')
      setTimeout(() => {
        router.replace('/(auth)/login')
      }, 2000)
    }
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <Text style={styles.redirectText}>Redirecting to login...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter_400Regular',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter_500Medium',
  },
  redirectText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
})

