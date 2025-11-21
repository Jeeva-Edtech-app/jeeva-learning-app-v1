import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthContextType, SignUpParams, SignInParams, AuthResponse, OAuthResponse } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const notificationRequestedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      if (event === 'SIGNED_IN' && session?.user) {
        const userId = session.user.id
        if (!notificationRequestedRef.current.has(userId)) {
          notificationRequestedRef.current.add(userId)
          const { NotificationService } = await import('@/services/notificationService')
          NotificationService.requestPermissions().catch((err: any) =>
            console.log('Push notification registration skipped:', err)
          )
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async ({ email, password, fullName }: SignUpParams): Promise<AuthResponse> => {
    console.log('SignUp called with:', { email, fullName })
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: 'jeevalearning://auth/callback?type=signup',
      },
    })

    if (error) {
      console.error('Supabase Auth Error:', error)
      return { success: false, error }
    }

    console.log('Auth signup successful, user:', data.user?.id)
    console.log('Note: User profile will be created automatically by database trigger')

    return { success: true, data }
  }

  const signIn = async ({ email, password }: SignInParams): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase signIn error:', error)
      return { success: false, error }
    }

    console.log('SignIn successful, user:', data.user?.id)
    return { success: true, data }
  }

  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Supabase signOut error:', error)
      throw error
    }
    console.log('SignOut successful')
  }

  const signInWithGoogle = async (): Promise<OAuthResponse> => {
    try {
      console.log('Initiating Google OAuth flow...')
      const redirectUrl = 'jeevalearning://auth/callback?type=oauth'
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Google OAuth error:', error)
        return { success: false, error }
      }

      console.log('Google OAuth flow initiated successfully')
      return { success: true, data }
    } catch (error) {
      console.error('Unexpected error in signInWithGoogle:', error)
      const authError = error instanceof Error 
        ? { message: error.message, status: 500 }
        : { message: 'An unexpected error occurred during Google sign-in', status: 500 }
      return { success: false, error: authError }
    }
  }

  const signInWithApple = async (): Promise<OAuthResponse> => {
    try {
      console.log('Initiating Apple OAuth flow...')
      const redirectUrl = 'jeevalearning://auth/callback?type=oauth'
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl,
        },
      })

      if (error) {
        console.error('Apple OAuth error:', error)
        return { success: false, error }
      }

      console.log('Apple OAuth flow initiated successfully')
      return { success: true, data }
    } catch (error) {
      console.error('Unexpected error in signInWithApple:', error)
      const authError = error instanceof Error 
        ? { message: error.message, status: 500 }
        : { message: 'An unexpected error occurred during Apple sign-in', status: 500 }
      return { success: false, error: authError }
    }
  }

  const resetPassword = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'jeevalearning://auth/reset-password?type=recovery',
    })

    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUp,
        signIn,
        signOut,
        signInWithGoogle,
        signInWithApple,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
