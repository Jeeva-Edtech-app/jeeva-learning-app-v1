import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/context/AuthContext'
import { Colors } from '@/constants/DesignSystem'
import { getUserProfile } from '@/api/profile'
import { showToast } from '@/utils/toast'

export default function LoginScreen() {
  const router = useRouter()
  const { signIn, signInWithGoogle, signInWithApple } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      showToast.error('Please enter email and password')
      return
    }

    setLoading(true)
    try {
      const result = await signIn({ email, password })
      if (!result.success) {
        showToast.error(result.error?.message || 'Invalid credentials')
      } else {
        // Check if profile is completed
        const userId = result.data?.user?.id
        try {
          if (userId) {
            const profile = await getUserProfile(userId)
            if (!profile?.profile_completed) {
              router.replace('/complete-profile')
              return
            }
          }
        } catch (profileError) {
          console.log('Profile check error:', profileError)
          // If profile doesn't exist or error, redirect to complete-profile
          router.replace('/complete-profile')
          return
        }
        
        router.replace('/(tabs)')
      }
    } catch (err) {
      console.error('Unexpected login error:', err)
      showToast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle()
      if (result.error) {
        showToast.error(result.error.message)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('Google sign-in error:', error)
      showToast.error(message)
    }
  }

  const handleAppleLogin = async () => {
    try {
      const result = await signInWithApple()
      if (result.error) {
        showToast.error(result.error.message)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('Apple sign-in error:', error)
      showToast.error(message)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo with Text - Outside Card */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/jeeva-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Header - Outside Card */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Hi, welcome back</Text>
            <Text style={styles.subtitle}>sign in now</Text>
          </View>

          {/* White Card Container */}
          <View style={styles.card}>
            {/* Form Container */}
            <View style={styles.formContainer}>
              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#AAAAAA"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    placeholderTextColor="#AAAAAA"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color="#999999" 
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.hintText}>
                  mix password with uppercase, lowercase, numbers & special characters
                </Text>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity 
                style={[styles.signInButton, loading && styles.signInButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.signInButtonText}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Social Sign In */}
            <View style={styles.socialContainer}>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.socialText}>or sign in with</Text>
                <View style={styles.divider} />
              </View>
              <View style={styles.socialIconsContainer}>
                <TouchableOpacity onPress={handleGoogleLogin}>
                  <Ionicons name="logo-google" size={32} color="#DB4437" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAppleLogin}>
                  <Ionicons name="logo-apple" size={32} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => console.log('Forgot password')}
            >
              <Text style={styles.forgotPasswordText}>forgot password</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link - Outside Card */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logoImage: {
    width: 150,
    height: 50,
    marginBottom: 16,
  },
  headerContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '400',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    boxShadow: Platform.select({
      web: '0px 2px 12px rgba(0, 0, 0, 0.08)',
      default: undefined,
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingRight: 45,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  hintText: {
    fontSize: 11,
    color: '#999999',
    marginTop: 6,
  },
  signInButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  socialContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  socialText: {
    fontSize: 13,
    color: '#999999',
    paddingHorizontal: 12,
  },
  socialIconsContainer: {
    flexDirection: 'row',
    gap: 32,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  footerLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
})
