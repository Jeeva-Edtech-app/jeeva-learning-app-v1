# Mobile App - Progress Tracking & Analysis Implementation Guide

**Version:** 1.0  
**Date:** November 21, 2025  
**Status:** Complete Implementation Guide  
**Backend Status:** ✅ Ready (Database Schema & Tracking)

---

## Executive Summary

Complete progress tracking system for mobile app showing:
- Overall exam readiness score
- Module-wise progress (Practice, Learning, Mock)
- Topic/Subtopic completion status
- Performance analytics & trends
- Time spent tracking
- Exam readiness prediction

---

## 1. Data Architecture

### 1.1 Progress Data Models

```typescript
// Core Progress Tracking
interface UserProgress {
  userId: string
  overallCompletion: number // 0-100%
  examReadinessScore: number // 0-100% (weighted calculation)
  totalTimeSpent: number // minutes
  lastActivityDate: Date
}

// Module Progress
interface ModuleProgress {
  userId: string
  moduleId: 'practice' | 'learning' | 'mock_exam'
  completedSubtopics: number
  totalSubtopics: number
  completionPercentage: number
  averageScore: number
  lastUpdated: Date
}

// Learning Module Specific (Sequential Unlock)
interface LearningProgress {
  userId: string
  subtopicId: string // e.g., "2.1"
  status: 'locked' | 'in_progress' | 'completed'
  lessonsWatched: boolean // Video watched
  audioListened: boolean // Podcast listened
  lessonRead: boolean // Text read
  assessmentAttempts: number
  bestScore: number // Best attempt %
  passingScore: number // 80% required
  isPassed: boolean
  completedAt?: Date
}

// Practice Module Tracking
interface PracticeProgress {
  userId: string
  topicId: string
  categoryId: string
  questionsAnswered: number
  correctAnswers: number
  totalAttempts: number
  averageScore: number
  timeSpent: number // minutes
}

// Mock Exam Attempts
interface MockExamAttempt {
  id: string
  userId: string
  attemptNumber: number
  startTime: Date
  endTime: Date
  duration: number // minutes
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  scorePercentage: number
  passed: boolean
  topicWiseScores: TopicScore[]
}

interface TopicScore {
  topicId: string
  topicName: string
  questionsAsked: number
  correct: number
  percentage: number
}
```

---

## 2. API Endpoints for Progress Tracking

### 2.1 Get Dashboard Overview

```
GET /api/progress/dashboard/:userId

Response:
{
  overallCompletion: 75,
  examReadinessScore: 72,
  totalTimeSpent: 1250,
  lastActivityDate: "2025-11-20T10:30:00Z",
  moduleProgress: {
    practice: {
      completedSubtopics: 7,
      totalSubtopics: 9,
      completionPercentage: 78,
      averageScore: 82
    },
    learning: {
      completedSubtopics: 12,
      totalSubtopics: 21,
      completionPercentage: 57,
      averageScore: 85
    },
    mockExam: {
      attemptCount: 3,
      bestScore: 78,
      averageScore: 75
    }
  },
  recentActivity: [
    {
      date: "2025-11-20",
      action: "Completed Learning 2.1",
      points: 50
    }
  ]
}
```

---

## 3. Exam Readiness Score Calculation

```typescript
/**
 * Exam Readiness = Weighted Average of:
 * - Learning Module Completion: 50% weight
 * - Mock Exam Average Score: 30% weight
 * - Practice Module Score: 20% weight
 */
function calculateExamReadinessScore(
  learningCompletion: number,
  mockExamAverage: number,
  practiceAverage: number
): number {
  const weights = {
    learning: 0.5,
    mockExam: 0.3,
    practice: 0.2
  }

  // Normalize scores to 0-100
  const learningScore = learningCompletion
  const mockScore = mockExamAverage || 0
  const practiceScore = practiceAverage || 0

  const readiness = 
    (learningScore * weights.learning) +
    (mockScore * weights.mockExam) +
    (practiceScore * weights.practice)

  return Math.round(readiness)
}
```
