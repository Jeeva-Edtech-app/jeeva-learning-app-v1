import { Session, User } from '@supabase/supabase-js'

export interface SignUpParams {
  email: string
  password: string
  fullName: string
}

export interface SignInParams {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: User | null
    session: Session | null
  }
  error?: Error
}

export interface OAuthResponse {
  success: boolean
  data?: {
    provider: string
    url: string
  }
  error?: Error
}

export interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signUp: (params: SignUpParams) => Promise<AuthResponse>
  signIn: (params: SignInParams) => Promise<AuthResponse>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<OAuthResponse>
  signInWithApple: () => Promise<OAuthResponse>
  resetPassword: (email: string) => Promise<void>
}

export interface PasswordResetParams {
  email: string
}

export interface UpdatePasswordParams {
  newPassword: string
}

export interface EmailVerificationParams {
  token_hash: string
  type: 'signup' | 'recovery'
}

export type OAuthProvider = 'google' | 'apple'

export interface AuthError {
  message: string
  status?: number
  code?: string
}

export interface DeepLinkParams {
  url: string
  queryParams?: {
    token_hash?: string
    type?: string
    access_token?: string
    refresh_token?: string
    [key: string]: string | undefined
  }
}

export { Session, User }
