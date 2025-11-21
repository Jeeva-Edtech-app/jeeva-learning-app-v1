# 🔐 Jeeva Learning - Authentication Flow Documentation

## 📋 Overview

This document provides complete step-by-step implementation guide for authentication in the Jeeva Learning mobile app using **Supabase Auth**. The authentication system is shared with the admin portal, ensuring a unified user experience.

**Authentication Provider:** Supabase Auth  
**Storage:** AsyncStorage (React Native)  
**Session Management:** JWT tokens with auto-refresh  
**Supported Methods:** Email/Password, Google, Apple

---

## 🏗️ Authentication Architecture

### System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER AUTHENTICATION                       │
│                                                              │
│  ┌──────────────┐                                           │
│  │   Sign Up    │                                           │
│  │ (Email/Pass) │──────┐                                    │
│  └──────────────┘      │                                    │
│                        │                                    │
│  ┌──────────────┐      │      ┌────────────────────────┐   │
│  │   Sign In    │──────┼─────→│   Supabase Auth        │   │
│  │ (Email/Pass) │      │      │   - JWT Generation     │   │
│  └──────────────┘      │      │   - Session Storage    │   │
│                        │      │   - Token Refresh      │   │
│  ┌──────────────┐      │      └────────────────────────┘   │
│  │Social Login  │──────┘                │                   │
│  │(Google/Apple)│                       │                   │
│  └──────────────┘                       │                   │
│                                         │                   │
│                                         ↓                   │
│                              ┌──────────────────┐           │
│                              │  User Profile    │           │
│                              │  Creation        │           │
│                              └──────────────────┘           │
│                                         │                   │
│                                         ↓                   │
│                              ┌──────────────────┐           │
│                              │  App Dashboard   │           │
│                              └──────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Session Management

```
App Launch
    │
    ├─→ Check AsyncStorage for session
    │      │
    │      ├─→ Session exists & valid → Auto Login → Dashboard
    │      │
    │      └─→ Session expired → Refresh Token
    │             │
    │             ├─→ Refresh success → Dashboard
    │             │
    │             └─→ Refresh failed → Login Screen
    │
    └─→ No session → Login Screen
```

---

## 🚀 Implementation Steps

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

### Step 2: Configure Supabase Client

**File:** `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event)
  console.log('Session:', session)
  
  if (event === 'SIGNED_IN') {
    console.log('User signed in')
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out')
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed')
  }
})
```

### Step 3: Environment Configuration

**File:** `.env`

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**File:** `app.json`

```json
{
  "expo": {
    "scheme": "jeevalearning",
    "ios": {
      "bundleIdentifier": "com.jeeva.learning"
    },
    "android": {
      "package": "com.jeeva.learning"
    }
  }
}
```

---

## 📝 Authentication Flows

### 1. Sign Up Flow

**UI Flow:**
```
Sign Up Screen
    ↓
Enter: Full Name, Email, Password
    ↓
Validate Input
    ↓
Call Supabase signUp()
    ↓
Email Verification Sent
    ↓
Verification Screen
    ↓
User Clicks Email Link
    ↓
Profile Creation
    ↓
Dashboard
```

**Implementation:**

```typescript
// hooks/useAuth.ts
import { supabase } from '@/lib/supabase'

interface SignUpParams {
  email: string
  password: string
  fullName: string
}

export const useAuth = () => {
  const signUp = async ({ email, password, fullName }: SignUpParams) => {
    try {
      // 1. Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: 'jeevalearning://auth/callback',
        },
      })

      if (error) throw error

      // 2. Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            full_name: fullName,
          })

        if (profileError) throw profileError
      }

      return { success: true, data }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  return { signUp }
}
```

**Sign Up Screen Example:**

```typescript
// app/(auth)/signup.tsx
import { useState } from 'react'
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'expo-router'

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSignUp = async () => {
    // Validation
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await signUp({ email, password, fullName })
      Alert.alert(
        'Success',
        'Please check your email to verify your account',
        [
          {
            text: 'OK',
            onPress: () => router.push('/auth/verify-email'),
          },
        ]
      )
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Create Account</Text>
      
      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity onPress={handleSignUp} disabled={loading}>
        <Text>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
      </TouchableOpacity>
    </View>
  )
}
```

---

### 2. Sign In Flow

**UI Flow:**
```
Login Screen
    ↓
Enter: Email, Password
    ↓
Validate Input
    ↓
Call Supabase signInWithPassword()
    ↓
Success → Dashboard
    ↓
Failure → Show Error
```

**Implementation:**

```typescript
// hooks/useAuth.ts (continued)
export const useAuth = () => {
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  return { signIn, signUp }
}
```

**Login Screen Example:**

```typescript
// app/(auth)/login.tsx
import { useState } from 'react'
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'expo-router'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
      router.replace('/(tabs)/home')
    } catch (error: any) {
      Alert.alert('Login Failed', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome Back</Text>
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity onPress={handleLogin} disabled={loading}>
        <Text>{loading ? 'Signing In...' : 'Sign In'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
        <Text>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  )
}
```

---

### 3. Email Verification Flow

**Flow:**
```
User Signs Up
    ↓
Supabase Sends Verification Email
    ↓
User Clicks Link in Email
    ↓
Deep Link Opens App: jeevalearning://auth/callback
    ↓
Extract Token from URL
    ↓
Verify Token with Supabase
    ↓
Email Verified → Dashboard
```

**Implementation:**

```typescript
// app/(auth)/verify-email.tsx
import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { supabase } from '@/lib/supabase'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'

export default function VerifyEmailScreen() {
  const [verifying, setVerifying] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Listen for deep link
    const subscription = Linking.addEventListener('url', handleDeepLink)

    return () => subscription.remove()
  }, [])

  const handleDeepLink = async ({ url }: { url: string }) => {
    const { queryParams } = Linking.parse(url)
    
    if (queryParams?.token_hash && queryParams?.type === 'signup') {
      setVerifying(true)
      
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: queryParams.token_hash as string,
          type: 'signup',
        })

        if (error) throw error

        router.replace('/(tabs)/home')
      } catch (error: any) {
        Alert.alert('Verification Failed', error.message)
      } finally {
        setVerifying(false)
      }
    }
  }

  const resendVerification = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
      })

      if (error) {
        Alert.alert('Error', error.message)
      } else {
        Alert.alert('Success', 'Verification email sent!')
      }
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Verify Your Email</Text>
      <Text style={{ marginBottom: 20 }}>
        We've sent a verification link to your email. Please check your inbox.
      </Text>
      
      {verifying && <Text>Verifying...</Text>}
      
      <TouchableOpacity onPress={resendVerification}>
        <Text>Resend Verification Email</Text>
      </TouchableOpacity>
    </View>
  )
}
```

---

### 4. Password Reset Flow

**Flow:**
```
Forgot Password Screen
    ↓
Enter Email
    ↓
Call resetPasswordForEmail()
    ↓
Supabase Sends Reset Email
    ↓
User Clicks Link in Email
    ↓
Deep Link Opens App: jeevalearning://auth/reset-password
    ↓
New Password Screen
    ↓
Update Password
    ↓
Success → Login Screen
```

**Implementation:**

```typescript
// app/(auth)/forgot-password.tsx
import { useState } from 'react'
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'expo-router'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'jeevalearning://auth/reset-password',
      })

      if (error) throw error

      Alert.alert(
        'Success',
        'Password reset link sent to your email',
        [{ text: 'OK', onPress: () => router.back() }]
      )
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Reset Password</Text>
      
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TouchableOpacity onPress={handleResetPassword} disabled={loading}>
        <Text>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
      </TouchableOpacity>
    </View>
  )
}
```

**Reset Password Screen:**

```typescript
// app/(auth)/reset-password.tsx
import { useState, useEffect } from 'react'
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'expo-router'

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      Alert.alert(
        'Success',
        'Password updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      )
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>New Password</Text>
      
      <TextInput
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity onPress={handleUpdatePassword} disabled={loading}>
        <Text>{loading ? 'Updating...' : 'Update Password'}</Text>
      </TouchableOpacity>
    </View>
  )
}
```

---

### 5. Social Authentication (Google & Apple)

**Flow:**
```
Login Screen
    ↓
Click "Sign in with Google/Apple"
    ↓
Open OAuth Provider
    ↓
User Authenticates
    ↓
Redirect to App with Token
    ↓
Create/Update User Profile
    ↓
Dashboard
```

**Google Sign In:**

```typescript
// hooks/useAuth.ts (continued)
export const useAuth = () => {
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'jeevalearning://auth/callback',
        },
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signInWithApple = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'jeevalearning://auth/callback',
        },
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Apple sign in error:', error)
      throw error
    }
  }

  return { signIn, signUp, signInWithGoogle, signInWithApple }
}
```

**Login Screen with Social Auth:**

```typescript
// app/(auth)/login.tsx (updated)
export default function LoginScreen() {
  const { signIn, signInWithGoogle, signInWithApple } = useAuth()

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error: any) {
      Alert.alert('Google Sign In Failed', error.message)
    }
  }

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple()
    } catch (error: any) {
      Alert.alert('Apple Sign In Failed', error.message)
    }
  }

  return (
    <View>
      {/* Email/Password fields */}
      
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity onPress={handleGoogleSignIn}>
          <Text>Sign in with Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleAppleSignIn}>
          <Text>Sign in with Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
```

---

### 6. Sign Out Flow

**Implementation:**

```typescript
// hooks/useAuth.ts (continued)
export const useAuth = () => {
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  return { signIn, signUp, signOut }
}
```

**Usage Example:**

```typescript
// app/(tabs)/profile.tsx
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'expo-router'

export default function ProfileScreen() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut()
            router.replace('/auth/login')
          },
        },
      ]
    )
  }

  return (
    <View>
      <TouchableOpacity onPress={handleSignOut}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}
```

---

## 🔄 Session Management

### Auto Session Check on App Launch

```typescript
// app/_layout.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSegments } from 'expo-router'

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (session && inAuthGroup) {
      // User is signed in but viewing auth screens, redirect to app
      router.replace('/(tabs)/home')
    } else if (!session && !inAuthGroup) {
      // User is not signed in but viewing app screens, redirect to login
      router.replace('/auth/login')
    }
  }, [session, segments, loading])

  if (loading) {
    return <SplashScreen />
  }

  return <Stack />
}
```

### Token Refresh

Supabase automatically refreshes tokens, but you can manually trigger:

```typescript
const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession()
  
  if (error) {
    console.error('Session refresh failed:', error)
    // Redirect to login
    router.replace('/auth/login')
  }
  
  return data.session
}
```

---

## 🔒 Security Best Practices

### 1. Password Validation

```typescript
const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase letter' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain lowercase letter' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain a number' }
  }
  
  return { valid: true }
}
```

### 2. Email Validation

```typescript
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

### 3. Secure Storage

```typescript
import * as SecureStore from 'expo-secure-store'

// Store sensitive data
await SecureStore.setItemAsync('user_token', token)

// Retrieve sensitive data
const token = await SecureStore.getItemAsync('user_token')

// Delete sensitive data
await SecureStore.deleteItemAsync('user_token')
```

### 4. Rate Limiting

Implement client-side rate limiting for auth attempts:

```typescript
const [loginAttempts, setLoginAttempts] = useState(0)
const [lockoutTime, setLockoutTime] = useState<Date | null>(null)

const handleLogin = async () => {
  if (lockoutTime && new Date() < lockoutTime) {
    Alert.alert('Too many attempts', 'Please wait before trying again')
    return
  }

  try {
    await signIn(email, password)
    setLoginAttempts(0)
  } catch (error) {
    const attempts = loginAttempts + 1
    setLoginAttempts(attempts)
    
    if (attempts >= 5) {
      const lockout = new Date(Date.now() + 15 * 60 * 1000) // 15 min lockout
      setLockoutTime(lockout)
      Alert.alert('Account locked', 'Too many failed attempts. Try again in 15 minutes.')
    }
  }
}
```

---

## 🧪 Testing Guide

### Unit Tests

```typescript
// __tests__/auth.test.ts
import { supabase } from '@/lib/supabase'

describe('Authentication', () => {
  it('should sign up new user', async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123',
    })
    
    expect(error).toBeNull()
    expect(data.user).toBeDefined()
  })

  it('should sign in existing user', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123',
    })
    
    expect(error).toBeNull()
    expect(data.session).toBeDefined()
  })

  it('should sign out user', async () => {
    const { error } = await supabase.auth.signOut()
    expect(error).toBeNull()
  })
})
```

### Manual Testing Checklist

- [ ] Sign up with valid credentials
- [ ] Sign up with invalid email
- [ ] Sign up with weak password
- [ ] Sign up with existing email
- [ ] Sign in with correct credentials
- [ ] Sign in with wrong password
- [ ] Email verification flow
- [ ] Resend verification email
- [ ] Password reset flow
- [ ] Google sign in
- [ ] Apple sign in
- [ ] Auto login on app restart
- [ ] Token refresh
- [ ] Sign out
- [ ] Deep link handling

---

## 🐛 Error Handling

### Common Errors & Solutions

**1. "User already registered"**
```typescript
if (error.message.includes('already registered')) {
  Alert.alert('Account Exists', 'This email is already registered. Please sign in.')
  router.push('/auth/login')
}
```

**2. "Invalid login credentials"**
```typescript
if (error.message.includes('Invalid login')) {
  Alert.alert('Login Failed', 'Incorrect email or password')
}
```

**3. "Email not confirmed"**
```typescript
if (error.message.includes('Email not confirmed')) {
  Alert.alert(
    'Verify Email',
    'Please verify your email before signing in',
    [
      { text: 'Resend', onPress: resendVerification },
      { text: 'OK' }
    ]
  )
}
```

**4. Network errors**
```typescript
if (error.message.includes('network')) {
  Alert.alert('Network Error', 'Please check your internet connection')
}
```

### Global Error Handler

```typescript
// utils/errorHandler.ts
export const handleAuthError = (error: any) => {
  if (error.message.includes('already registered')) {
    return 'This email is already registered'
  } else if (error.message.includes('Invalid login')) {
    return 'Incorrect email or password'
  } else if (error.message.includes('Email not confirmed')) {
    return 'Please verify your email first'
  } else if (error.message.includes('network')) {
    return 'Network error. Check your connection'
  } else {
    return error.message || 'An error occurred'
  }
}
```

---

## 📱 Deep Linking Setup

### iOS Configuration

**File:** `ios/jeevalearning/Info.plist`

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>jeevalearning</string>
    </array>
  </dict>
</array>
```

### Android Configuration

**File:** `android/app/src/main/AndroidManifest.xml`

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="jeevalearning" />
</intent-filter>
```

### Handle Deep Links

```typescript
// app/(auth)/callback.tsx
import { useEffect } from 'react'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'

export default function AuthCallbackScreen() {
  const router = useRouter()

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleAuthCallback(url)
      }
    })
  }, [])

  const handleAuthCallback = (url: string) => {
    const { queryParams } = Linking.parse(url)
    
    // Handle email verification
    if (queryParams?.type === 'signup') {
      router.replace('/(tabs)/home')
    }
    
    // Handle password reset
    if (queryParams?.type === 'recovery') {
      router.replace('/auth/reset-password')
    }
  }

  return <LoadingScreen />
}
```

---

## 📊 User Context Provider

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
```

**Usage:**

```typescript
// app/_layout.tsx
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  )
}

// In any component:
import { useAuthContext } from '@/contexts/AuthContext'

const { user, session, loading } = useAuthContext()
```

---

## ✅ Authentication Checklist

### Setup
- [ ] Install Supabase SDK
- [ ] Configure AsyncStorage
- [ ] Set environment variables
- [ ] Configure deep linking

### Implementation
- [ ] Sign up flow
- [ ] Sign in flow
- [ ] Email verification
- [ ] Password reset
- [ ] Social authentication (Google/Apple)
- [ ] Sign out

### Security
- [ ] Password validation
- [ ] Email validation
- [ ] Secure token storage
- [ ] Rate limiting
- [ ] Error handling

### Session Management
- [ ] Auto login on app start
- [ ] Token refresh
- [ ] Auth state listener
- [ ] Protected routes

### Testing
- [ ] Unit tests
- [ ] Manual testing
- [ ] Edge cases
- [ ] Error scenarios

---

## 🔗 Related Documentation

- [Mobile App Overview](./MOBILE_APP_OVERVIEW.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Feature Specifications](./FEATURE_SPECIFICATIONS.md) (Next to create)

---

## 📚 Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

---

**Version:** 1.0  
**Last Updated:** October 11, 2025  
**Author:** vollstek@gmail.com
