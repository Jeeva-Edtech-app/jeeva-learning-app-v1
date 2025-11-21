import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  DashboardOverview,
  calculateExamReadinessScore,
  MockExamAttempt,
} from '@/data/progressData'

export function useProgress() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simulated dashboard data
        const data: DashboardOverview = {
          overallCompletion: 65,
          examReadinessScore: calculateExamReadinessScore(70, 72, 68),
          totalTimeSpent: 1250,
          lastActivityDate: new Date(),
          moduleProgress: {
            practice: {
              completedSubtopics: 7,
              totalSubtopics: 9,
              completionPercentage: 78,
              averageScore: 82,
            },
            learning: {
              completedSubtopics: 12,
              totalSubtopics: 21,
              completionPercentage: 57,
              averageScore: 85,
            },
            mockExam: {
              attemptCount: 3,
              bestScore: 78,
              averageScore: 75,
            },
          },
          recentActivity: [
            {
              date: '2025-11-21',
              action: 'Completed Practice Topic 7.1',
              points: 50,
            },
            {
              date: '2025-11-20',
              action: 'Completed Learning Module 2.1',
              points: 100,
            },
            {
              date: '2025-11-19',
              action: 'Attempted Mock Exam #3',
              points: 200,
            },
          ],
        }

        setDashboardData(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch progress'))
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [user?.id])

  return {
    dashboardData,
    loading,
    error,
  }
}

export function useMockExamProgress() {
  const { user } = useAuth()
  const [attempts, setAttempts] = useState<MockExamAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const fetchMockExams = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simulated mock exam attempts
        const mockAttempts: MockExamAttempt[] = [
          {
            id: '3',
            userId: user.id,
            attemptNumber: 3,
            startTime: new Date('2025-11-20T09:00:00'),
            endTime: new Date('2025-11-20T12:45:00'),
            duration: 225,
            totalQuestions: 200,
            answeredQuestions: 195,
            correctAnswers: 156,
            scorePercentage: 78,
            passed: true,
            topicWiseScores: [
              {
                topicId: 'numeracy',
                topicName: 'Numeracy',
                questionsAsked: 50,
                correct: 45,
                percentage: 90,
              },
              {
                topicId: 'clinical',
                topicName: 'Clinical Knowledge',
                questionsAsked: 150,
                correct: 111,
                percentage: 74,
              },
            ],
          },
        ]

        setAttempts(mockAttempts)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch mock exams'))
      } finally {
        setLoading(false)
      }
    }

    fetchMockExams()
  }, [user?.id])

  return {
    attempts,
    loading,
    error,
  }
}
