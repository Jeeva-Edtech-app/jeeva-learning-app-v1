import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

interface TrialContextType {
  isTrialUser: boolean
  trialStatus: 'active' | 'expired' | 'converted' | 'skipped'
  freeTopicIdPractice: string | null
  freeTopicIdLearning: string | null
  canAccessModule: (moduleType: string, topicId: string) => boolean
  isContentLocked: (moduleType: string, topicId: string) => boolean
  getRemainingTrialDays: () => number
  skipTrial: () => Promise<void>
}

const TrialContext = createContext<TrialContextType | undefined>(undefined)

export function TrialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [isTrialUser, setIsTrialUser] = useState(false)
  const [trialStatus, setTrialStatus] = useState<'active' | 'expired' | 'converted' | 'skipped'>('active')
  const [freeTopicIdPractice, setFreeTopicIdPractice] = useState<string | null>(null)
  const [freeTopicIdLearning, setFreeTopicIdLearning] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchTrialStatus()
    }
  }, [user?.id])

  const fetchTrialStatus = async () => {
    try {
      // Simulated trial data
      // In production, fetch from Supabase
      const trialData = {
        isTrialUser: true,
        trialStatus: 'active' as const,
        freeTopicIdPractice: 'practice_1',
        freeTopicIdLearning: 'learning_1',
      }

      setIsTrialUser(trialData.isTrialUser)
      setTrialStatus(trialData.trialStatus)
      setFreeTopicIdPractice(trialData.freeTopicIdPractice)
      setFreeTopicIdLearning(trialData.freeTopicIdLearning)
    } catch (error) {
      console.error('Error fetching trial status:', error)
    }
  }

  const canAccessModule = (moduleType: string, topicId: string): boolean => {
    // If trial is not active, deny access
    if (!isTrialUser) return true

    // If trial expired, deny access
    if (trialStatus === 'expired') return false

    // Trial user access rules
    switch (moduleType) {
      case 'practice':
        return topicId === freeTopicIdPractice
      case 'learning':
        return topicId === freeTopicIdLearning
      case 'mock_exam':
        return false // Never allowed in trial
      default:
        return false
    }
  }

  const isContentLocked = (moduleType: string, topicId: string): boolean => {
    if (!isTrialUser) return false
    return !canAccessModule(moduleType, topicId)
  }

  const getRemainingTrialDays = (): number => {
    if (!isTrialUser) return 0
    // 7 days trial
    const endDate = new Date().getTime() + 7 * 24 * 60 * 60 * 1000
    const today = new Date().getTime()
    return Math.max(0, Math.ceil((endDate - today) / (24 * 60 * 60 * 1000)))
  }

  const skipTrial = async () => {
    try {
      // In production, update Supabase
      setTrialStatus('skipped')
      setIsTrialUser(false)
    } catch (error) {
      console.error('Error skipping trial:', error)
    }
  }

  return (
    <TrialContext.Provider
      value={{
        isTrialUser,
        trialStatus,
        freeTopicIdPractice,
        freeTopicIdLearning,
        canAccessModule,
        isContentLocked,
        getRemainingTrialDays,
        skipTrial,
      }}
    >
      {children}
    </TrialContext.Provider>
  )
}

export function useTrialMode() {
  const context = useContext(TrialContext)
  if (!context) {
    throw new Error('useTrialMode must be used within TrialProvider')
  }
  return context
}
