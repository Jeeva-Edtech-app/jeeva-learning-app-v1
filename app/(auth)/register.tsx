import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Colors } from '@/constants/DesignSystem'
import { showToast } from '@/utils/toast'

export default function RegisterScreen() {
  console.log('=== RegisterScreen loaded ===')
  const router = useRouter()
  const { signUp, signInWithGoogle, signInWithApple } = useAuth()
  console.log('useAuth loaded:', { signUp: typeof signUp, signInWithGoogle: typeof signInWithGoogle })
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ 
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string 
  }>({})

  const validateForm = () => {
    const newErrors: { 
      fullName?: string
      email?: string
      password?: string
      confirmPassword?: string 
    } = {}

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async () => {
    console.log('handleRegister called!')
    console.log('Form values:', { fullName, email, password, confirmPassword })
    
    if (!validateForm()) {
      console.log('Validation failed')
      return
    }

    console.log('Validation passed, starting signup...')
    setLoading(true)
    try {
      const result = await signUp({ email, password, fullName })
      
      if (!result.success) {
        console.error('SignUp returned error:', result.error)
        showToast.error(result.error?.message || 'An error occurred during registration')
      } else {
        console.log('SignUp successful! Redirecting to login...')
        
        // Show success message and redirect
        showToast.success('Account created successfully! Please check your email to verify your account.')
        setTimeout(() => {
          router.replace('/(auth)/login')
        }, 2000)
      }
    } catch (err) {
      console.error('Caught unexpected error in handleRegister:', err)
      showToast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithGoogle()
      if (result.error) {
        showToast.error(result.error.message)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('Google signup error:', error)
      showToast.error(message)
    }
  }

  const handleAppleSignup = async () => {
    try {
      const result = await signInWithApple()
      if (result.error) {
        showToast.error(result.error.message)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('Apple signup error:', error)
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
        >
          <Image
            source={require('@/assets/images/jeeva-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Jeeva Learning and start your journey</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text)
                setErrors({ ...errors, fullName: undefined })
              }}
              error={errors.fullName}
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text)
                setErrors({ ...errors, email: undefined })
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text)
                setErrors({ ...errors, password: undefined })
              }}
              error={errors.password}
              isPassword
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text)
                setErrors({ ...errors, confirmPassword: undefined })
              }}
              error={errors.confirmPassword}
              isPassword
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or sign up with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignup}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignup}>
              <Ionicons name="logo-apple" size={24} color="#000000" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  logo: {
    width: 150,
    height: 50,
    alignSelf: 'center',
    marginBottom: 32,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  formContainer: {
    marginBottom: 24,
  },
  registerButton: {
    width: '100%',
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    fontSize: 14,
    color: '#9E9E9E',
    marginHorizontal: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
