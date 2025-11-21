export interface UserProgress {
  userId: string
  overallCompletion: number
  examReadinessScore: number
  totalTimeSpent: number
  lastActivityDate: Date
}

export interface ModuleProgress {
  userId: string
  moduleId: 'practice' | 'learning' | 'mock_exam'
  completedSubtopics: number
  totalSubtopics: number
  completionPercentage: number
  averageScore: number
  lastUpdated: Date
}

export interface LearningProgress {
  userId: string
  subtopicId: string
  status: 'locked' | 'in_progress' | 'completed'
  lessonsWatched: boolean
  audioListened: boolean
  lessonRead: boolean
  assessmentAttempts: number
  bestScore: number
  passingScore: number
  isPassed: boolean
  completedAt?: Date
}

export interface PracticeProgress {
  userId: string
  topicId: string
  categoryId: string
  questionsAnswered: number
  correctAnswers: number
  totalAttempts: number
  averageScore: number
  timeSpent: number
}

export interface MockExamAttempt {
  id: string
  userId: string
  attemptNumber: number
  startTime: Date
  endTime: Date
  duration: number
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  scorePercentage: number
  passed: boolean
  topicWiseScores: TopicScore[]
}

export interface TopicScore {
  topicId: string
  topicName: string
  questionsAsked: number
  correct: number
  percentage: number
}

export interface SessionLog {
  id: string
  userId: string
  moduleId: string
  screenName: string
  startTime: Date
  endTime: Date
  durationMinutes: number
  action: 'view' | 'practice' | 'exam' | 'learning'
}

export interface AnalyticsPoint {
  date: Date
  completionPercentage: number
  examReadinessScore: number
  practiceScore: number
  learningScore: number
  mockExamScore: number
  totalMinutesSpent: number
}

export interface DashboardOverview {
  overallCompletion: number
  examReadinessScore: number
  totalTimeSpent: number
  lastActivityDate: Date
  moduleProgress: {
    practice: {
      completedSubtopics: number
      totalSubtopics: number
      completionPercentage: number
      averageScore: number
    }
    learning: {
      completedSubtopics: number
      totalSubtopics: number
      completionPercentage: number
      averageScore: number
    }
    mockExam: {
      attemptCount: number
      bestScore: number
      averageScore: number
    }
  }
  recentActivity: Array<{
    date: string
    action: string
    points: number
  }>
}

export const calculateExamReadinessScore = (
  learningCompletion: number,
  mockExamAverage: number,
  practiceAverage: number
): number => {
  const weights = {
    learning: 0.5,
    mockExam: 0.3,
    practice: 0.2,
  }

  const learningScore = learningCompletion
  const mockScore = mockExamAverage || 0
  const practiceScore = practiceAverage || 0

  const readiness =
    learningScore * weights.learning +
    mockScore * weights.mockExam +
    practiceScore * weights.practice

  return Math.round(readiness)
}

export const getReadinessLevel = (score: number): string => {
  if (score >= 80) return 'Exam Ready'
  if (score >= 60) return 'Nearly Ready'
  if (score >= 40) return 'On Track'
  return 'Getting Started'
}

export const getReadinessColor = (score: number): string => {
  if (score >= 80) return '#16A34A'
  if (score >= 60) return '#D97706'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}
