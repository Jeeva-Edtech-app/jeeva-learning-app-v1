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

// Time Tracking
interface SessionLog {
  id: string
  userId: string
  moduleId: string
  screenName: string
  startTime: Date
  endTime: Date
  durationMinutes: number
  action: 'view' | 'practice' | 'exam' | 'learning'
}

// Analytics Point
interface AnalyticsPoint {
  date: Date
  completionPercentage: number
  examReadinessScore: number
  practiceScore: number
  learningScore: number
  mockExamScore: number
  totalMinutesSpent: number
}
```

### 1.2 Exam Readiness Score Calculation

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

### 2.2 Get Learning Progress Details

```
GET /api/progress/learning/:userId

Response:
{
  completedTopics: [
    {
      topicId: "1.1",
      topicName: "Numeracy - Dosage",
      status: "completed",
      bestScore: 92,
      completedAt: "2025-11-15T14:20:00Z"
    }
  ],
  currentTopic: {
    topicId: "1.2",
    topicName: "Numeracy - Unit Conversions",
    status: "in_progress",
    lessonsWatched: true,
    audioListened: false,
    lessonRead: true,
    assessmentAttempts: 2,
    bestScore: 75,
    passingScore: 80
  },
  lockedTopics: [
    {
      topicId: "1.3",
      topicName: "Numeracy - IV Flow",
      status: "locked",
      requiresPreviousPass: true
    }
  ]
}
```

### 2.3 Get Mock Exam Performance

```
GET /api/progress/mock-exams/:userId

Response:
{
  attempts: [
    {
      attemptNumber: 3,
      date: "2025-11-20T09:00:00Z",
      duration: 225,
      scorePercentage: 78,
      correctAnswers: 156,
      totalQuestions: 200,
      passed: true,
      topicWiseBreakdown: [
        {
          topic: "Numeracy",
          scored: 45,
          total: 50,
          percentage: 90
        },
        {
          topic: "Clinical Knowledge",
          scored: 111,
          total: 150,
          percentage: 74
        }
      ]
    }
  ],
  bestAttempt: 3,
  bestScore: 78,
  averageScore: 72,
  improvementTrend: "up"
}
```

### 2.4 Get Practice Module Stats

```
GET /api/progress/practice/:userId

Response:
{
  topicStats: [
    {
      topicId: "numeracy",
      topicName: "Numeracy",
      questionsAttempted: 145,
      correctAnswers: 125,
      averageScore: 86,
      timeSpent: 320,
      subtopics: [
        {
          id: "1.1",
          name: "Dosage",
          attempted: 25,
          correct: 24,
          score: 96
        }
      ]
    }
  ],
  totalQuestionsAttempted: 450,
  totalCorrect: 387,
  overallScore: 86,
  totalTimeSpent: 850
}
```

### 2.5 Get Time Analytics

```
GET /api/progress/time-analytics/:userId?days=30

Response:
{
  dailyBreakdown: [
    {
      date: "2025-11-20",
      minutesSpent: 120,
      moduleBreakdown: {
        practice: 45,
        learning: 60,
        mockExam: 15
      }
    }
  ],
  weeklyTrend: [
    {
      week: "Week 1",
      totalMinutes: 480,
      averagePerDay: 69
    }
  ],
  totalMinutes: 1250,
  averagePerDay: 42
}
```

---

## 3. Dashboard Screen Components

### 3.1 Dashboard Overview Header

```typescript
// DashboardHeader.tsx
import { View, Text, StyleSheet } from 'react-native'
import { CircularProgressIndicator } from '@/components/CircularProgressIndicator'

interface Props {
  overallCompletion: number
  examReadinessScore: number
  timeSpent: number
}

export function DashboardHeader({
  overallCompletion,
  examReadinessScore,
  timeSpent
}: Props) {
  function getReadinessLevel(score: number): string {
    if (score >= 80) return 'Ready'
    if (score >= 60) return 'Nearly Ready'
    if (score >= 40) return 'Moderate'
    return 'Getting Started'
  }

  function getReadinessColor(score: number): string {
    if (score >= 80) return '#00b300'
    if (score >= 60) return '#ff9500'
    if (score >= 40) return '#ffcc00'
    return '#ff3b30'
  }

  return (
    <View style={styles.container}>
      {/* Exam Readiness - Large Circle */}
      <View style={styles.readinessBox}>
        <CircularProgressIndicator
          percentage={examReadinessScore}
          size={120}
          strokeWidth={8}
          color={getReadinessColor(examReadinessScore)}
          backgroundColor="#f0f0f0"
        >
          <View style={styles.readinessContent}>
            <Text style={styles.readinessScore}>{examReadinessScore}%</Text>
            <Text style={styles.readinessLabel}>Exam Readiness</Text>
            <Text style={styles.readinessLevel}>
              {getReadinessLevel(examReadinessScore)}
            </Text>
          </View>
        </CircularProgressIndicator>
      </View>

      {/* Overall Progress */}
      <View style={styles.statsBox}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Overall Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${overallCompletion}%` }
              ]}
            />
          </View>
          <Text style={styles.statValue}>{overallCompletion}%</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Time Invested</Text>
          <Text style={styles.timeValue}>
            {Math.floor(timeSpent / 60)}h {timeSpent % 60}m
          </Text>
          <Text style={styles.statValue}>
            {Math.round(timeSpent / 60)} hours
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  readinessBox: {
    alignItems: 'center',
    marginBottom: 24
  },
  readinessContent: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  readinessScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333'
  },
  readinessLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  readinessLevel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007aff',
    marginTop: 2
  },
  statsBox: {
    gap: 16
  },
  statItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007aff',
    borderRadius: 3
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007aff'
  }
})
```

### 3.2 Module Progress Cards

```typescript
// ModuleProgressCard.tsx
import { View, Text, StyleSheet } from 'react-native'
import { CircularProgressIndicator } from '@/components/CircularProgressIndicator'

interface Props {
  moduleId: string
  moduleTitle: string
  icon: string
  completionPercentage: number
  averageScore: number
  status: string
}

export function ModuleProgressCard({
  moduleTitle,
  icon,
  completionPercentage,
  averageScore,
  status
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{moduleTitle}</Text>
          <Text style={styles.status}>{status}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Completion</Text>
          <CircularProgressIndicator
            percentage={completionPercentage}
            size={60}
            strokeWidth={4}
            color="#007aff"
            backgroundColor="#f0f0f0"
          >
            <Text style={styles.statValue}>{completionPercentage}%</Text>
          </CircularProgressIndicator>
        </View>

        <View style={styles.divider} />

        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Avg Score</Text>
          <Text style={styles.scoreValue}>{averageScore}%</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  icon: {
    fontSize: 32,
    marginRight: 12
  },
  titleSection: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  status: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  statColumn: {
    alignItems: 'center',
    flex: 1
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 8
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600'
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00b300'
  }
})
```

### 3.3 Learning Progress (Sequential Status)

```typescript
// LearningProgressList.tsx
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native'

interface Props {
  topics: LearningTopic[]
  onSelectTopic: (topicId: string) => void
}

export function LearningProgressList({ topics, onSelectTopic }: Props) {
  function getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return '✓'
      case 'in_progress':
        return '⏳'
      case 'locked':
        return '🔒'
      default:
        return '○'
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return '#00b300'
      case 'in_progress':
        return '#ff9500'
      case 'locked':
        return '#ccc'
      default:
        return '#ddd'
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Learning Module Topics</Text>
      
      {topics.map((topic) => (
        <TouchableOpacity
          key={topic.id}
          style={styles.topicRow}
          onPress={() => onSelectTopic(topic.id)}
          disabled={topic.status === 'locked'}
        >
          <View style={styles.statusIcon}>
            <Text style={{ color: getStatusColor(topic.status) }}>
              {getStatusIcon(topic.status)}
            </Text>
          </View>

          <View style={styles.topicInfo}>
            <Text style={styles.topicName}>{topic.name}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${topic.progress}%`,
                    backgroundColor: getStatusColor(topic.status)
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.scoreBox}>
            {topic.bestScore > 0 && (
              <Text style={styles.score}>{topic.bestScore}%</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007aff'
  },
  statusIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  topicInfo: {
    flex: 1
  },
  topicName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 2
  },
  scoreBox: {
    marginLeft: 12
  },
  score: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00b300'
  }
})
```

### 3.4 Mock Exam Attempts History

```typescript
// MockExamHistory.tsx
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native'

interface Props {
  attempts: MockAttempt[]
  onSelectAttempt: (attemptId: string) => void
}

export function MockExamHistory({ attempts, onSelectAttempt }: Props) {
  function getPassStatus(passed: boolean): { text: string; color: string } {
    return passed
      ? { text: 'PASSED', color: '#00b300' }
      : { text: 'NEEDS WORK', color: '#ff3b30' }
  }

  function getTrendIcon(trend: string): string {
    if (trend === 'up') return '📈'
    if (trend === 'down') return '📉'
    return '→'
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mock Exam Attempts</Text>

      {attempts.map((attempt, index) => {
        const status = getPassStatus(attempt.passed)
        return (
          <TouchableOpacity
            key={attempt.id}
            style={styles.attemptCard}
            onPress={() => onSelectAttempt(attempt.id)}
          >
            <View style={styles.attemptHeader}>
              <View style={styles.attemptNumber}>
                <Text style={styles.attemptNumberText}>
                  Attempt {attempt.attemptNumber}
                </Text>
              </View>
              <Text style={styles.attemptDate}>
                {new Date(attempt.date).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.scoreRow}>
              <View style={styles.scoreDisplay}>
                <Text style={styles.score}>{attempt.score}%</Text>
                <Text
                  style={[styles.status, { color: status.color }]}
                >
                  {status.text}
                </Text>
              </View>

              <View style={styles.stats}>
                <Text style={styles.stat}>
                  ✓ {attempt.correct}/{attempt.total}
                </Text>
                <Text style={styles.stat}>
                  ⏱ {attempt.duration} min
                </Text>
              </View>

              {index > 0 && (
                <View style={styles.trend}>
                  <Text style={styles.trendIcon}>
                    {getTrendIcon(
                      attempt.score > attempts[index - 1].score ? 'up' : 'down'
                    )}
                  </Text>
                </View>
              )}
            </View>

            {attempt.topicWise && (
              <View style={styles.topicBreakdown}>
                {attempt.topicWise.slice(0, 3).map((topic) => (
                  <View key={topic.id} style={styles.topicBar}>
                    <View style={styles.topicLabel}>
                      <Text style={styles.topicName}>{topic.name}</Text>
                      <Text style={styles.topicScore}>{topic.score}%</Text>
                    </View>
                    <View style={styles.topicProgressBar}>
                      <View
                        style={[
                          styles.topicProgressFill,
                          { width: `${topic.score}%` }
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  attemptCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  attemptNumber: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16
  },
  attemptNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666'
  },
  attemptDate: {
    fontSize: 12,
    color: '#999'
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12
  },
  scoreDisplay: {
    alignItems: 'center'
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007aff'
  },
  status: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 4
  },
  stats: {
    flex: 1,
    gap: 4
  },
  stat: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  trend: {
    fontSize: 20
  },
  trendIcon: {
    fontSize: 20
  },
  topicBreakdown: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8
  },
  topicBar: {
    gap: 4
  },
  topicLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  topicName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  topicScore: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333'
  },
  topicProgressBar: {
    height: 3,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden'
  },
  topicProgressFill: {
    height: '100%',
    backgroundColor: '#007aff',
    borderRadius: 2
  }
})
```

---

## 4. Analytics & Charts

### 4.1 Performance Trend Chart

```typescript
// PerformanceTrendChart.tsx
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { LineChart } from 'react-native-chart-kit'

interface Props {
  data: AnalyticsPoint[]
  metric: 'readiness' | 'practice' | 'learning' | 'mock'
}

export function PerformanceTrendChart({ data, metric }: Props) {
  const chartData = {
    labels: data.map(d => {
      const date = new Date(d.date)
      return `${date.getDate()}/${date.getMonth() + 1}`
    }),
    datasets: [
      {
        data: data.map(d => {
          switch (metric) {
            case 'readiness':
              return d.examReadinessScore
            case 'practice':
              return d.practiceScore
            case 'learning':
              return d.learningScore
            case 'mock':
              return d.mockExamScore
            default:
              return 0
          }
        })
      }
    ]
  }

  const metricLabel = {
    readiness: 'Exam Readiness Score',
    practice: 'Practice Performance',
    learning: 'Learning Progress',
    mock: 'Mock Exam Scores'
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{metricLabel[metric]}</Text>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: () => '#007aff',
          strokeWidth: 2,
          propsForLabels: {
            fontSize: 12,
            fill: '#999'
          }
        }}
        style={styles.chart}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  chart: {
    borderRadius: 8
  }
})
```

### 4.2 Topic-Wise Performance

```typescript
// TopicPerformanceChart.tsx
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { BarChart } from 'react-native-chart-kit'

interface Props {
  topics: TopicPerformance[]
}

export function TopicPerformanceChart({ topics }: Props) {
  const chartData = {
    labels: topics.map(t => t.name.substring(0, 8)),
    datasets: [
      {
        data: topics.map(t => t.score)
      }
    ]
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance by Topic</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={chartData}
          width={topics.length * 80}
          height={200}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: () => '#007aff',
            barPercentage: 0.7,
            propsForLabels: {
              fontSize: 11
            }
          }}
        />
      </ScrollView>

      {/* Topic Details */}
      <View style={styles.details}>
        {topics.map((topic) => (
          <View key={topic.id} style={styles.topicRow}>
            <Text style={styles.topicName}>{topic.name}</Text>
            <View style={styles.topicStats}>
              <Text style={styles.score}>{topic.score}%</Text>
              <Text style={styles.count}>
                {topic.correct}/{topic.total}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  details: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  topicName: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500'
  },
  topicStats: {
    flexDirection: 'row',
    gap: 8
  },
  score: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#007aff'
  },
  count: {
    fontSize: 12,
    color: '#999'
  }
})
```

---

## 5. Time Analytics

### 5.1 Time Spent Tracking

```typescript
// TimeAnalyticsScreen.tsx
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { PieChart } from 'react-native-chart-kit'

interface Props {
  dailyStats: DailyTime[]
  moduleBreakdown: ModuleTime[]
}

export function TimeAnalyticsScreen({ dailyStats, moduleBreakdown }: Props) {
  const totalTime = moduleBreakdown.reduce((sum, m) => sum + m.time, 0)

  const chartData = moduleBreakdown.map(m => ({
    name: m.module,
    minutes: m.time,
    color: m.color,
    legendFontColor: '#333',
    legendFontSize: 12
  }))

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Time Analytics</Text>

      {/* Total Time */}
      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total Time Invested</Text>
        <Text style={styles.totalTime}>
          {Math.floor(totalTime / 60)}h {totalTime % 60}m
        </Text>
        <Text style={styles.dailyAverage}>
          ~{Math.round(totalTime / 30)}/day (last 30 days)
        </Text>
      </View>

      {/* Module Breakdown */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Time by Module</Text>
        <PieChart
          data={chartData}
          width={320}
          height={220}
          chartConfig={{
            color: () => '#007aff'
          }}
          accessor="minutes"
        />
      </View>

      {/* Detailed Breakdown */}
      <View style={styles.breakdown}>
        <Text style={styles.breakdownTitle}>Breakdown</Text>
        {moduleBreakdown.map((module) => (
          <View key={module.module} style={styles.moduleRow}>
            <View style={styles.moduleDot} style={{ backgroundColor: module.color }} />
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleName}>{module.module}</Text>
              <Text style={styles.moduleTime}>
                {Math.floor(module.time / 60)}h {module.time % 60}m
              </Text>
            </View>
            <Text style={styles.percentage}>
              {Math.round((module.time / totalTime) * 100)}%
            </Text>
          </View>
        ))}
      </View>

      {/* Daily Trend */}
      <View style={styles.dailyTrend}>
        <Text style={styles.dailyTitle}>Daily Activity (Last 7 Days)</Text>
        {dailyStats.slice(-7).map((day, idx) => (
          <View key={idx} style={styles.dayRow}>
            <Text style={styles.dayLabel}>{day.date}</Text>
            <View style={styles.dayBarContainer}>
              <View
                style={[
                  styles.dayBar,
                  { width: `${(day.time / 300) * 100}%` } // 300 min = full width
                ]}
              />
            </View>
            <Text style={styles.dayTime}>{day.time}m</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12
  },
  totalBox: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  totalLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8
  },
  totalTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007aff',
    marginBottom: 4
  },
  dailyAverage: {
    fontSize: 12,
    color: '#999'
  },
  chartContainer: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center'
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  breakdown: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  moduleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12
  },
  moduleInfo: {
    flex: 1
  },
  moduleName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333'
  },
  moduleTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2
  },
  percentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007aff'
  },
  dailyTrend: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  dailyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    width: 40
  },
  dayBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  dayBar: {
    height: '100%',
    backgroundColor: '#007aff',
    borderRadius: 4
  },
  dayTime: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    width: 40,
    textAlign: 'right'
  }
})
```

---

## 6. Progress Service

```typescript
// progressService.ts
import { supabase } from '@/lib/supabase'

export const progressService = {
  // Get dashboard overview
  async getDashboardOverview(userId: string) {
    try {
      const response = await fetch(
        `https://your-api.com/api/progress/dashboard/${userId}`
      )
      return await response.json()
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      throw error
    }
  },

  // Get learning progress
  async getLearningProgress(userId: string) {
    try {
      const response = await fetch(
        `https://your-api.com/api/progress/learning/${userId}`
      )
      return await response.json()
    } catch (error) {
      console.error('Error fetching learning progress:', error)
      throw error
    }
  },

  // Get mock exam history
  async getMockExamHistory(userId: string) {
    try {
      const response = await fetch(
        `https://your-api.com/api/progress/mock-exams/${userId}`
      )
      return await response.json()
    } catch (error) {
      console.error('Error fetching mock exams:', error)
      throw error
    }
  },

  // Get practice stats
  async getPracticeStats(userId: string) {
    try {
      const response = await fetch(
        `https://your-api.com/api/progress/practice/${userId}`
      )
      return await response.json()
    } catch (error) {
      console.error('Error fetching practice stats:', error)
      throw error
    }
  },

  // Get time analytics
  async getTimeAnalytics(userId: string, days: number = 30) {
    try {
      const response = await fetch(
        `https://your-api.com/api/progress/time-analytics/${userId}?days=${days}`
      )
      return await response.json()
    } catch (error) {
      console.error('Error fetching time analytics:', error)
      throw error
    }
  },

  // Log activity session
  async logSession(userId: string, sessionData: {
    moduleId: string
    screenName: string
    durationMinutes: number
    action: string
  }) {
    try {
      const response = await fetch('https://your-api.com/api/progress/log-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...sessionData,
          timestamp: new Date()
        })
      })
      return await response.json()
    } catch (error) {
      console.error('Error logging session:', error)
    }
  }
}
```

---

## 7. Integration Example

```typescript
// ProgressDashboardScreen.tsx
import { useEffect, useState } from 'react'
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '@/contexts/AuthContext'
import { progressService } from '@/services/progressService'
import { DashboardHeader } from '@/components/DashboardHeader'
import { ModuleProgressCard } from '@/components/ModuleProgressCard'
import { LearningProgressList } from '@/components/LearningProgressList'
import { MockExamHistory } from '@/components/MockExamHistory'

export function ProgressDashboardScreen() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      loadDashboard()
    }, [])
  )

  async function loadDashboard() {
    if (!user?.id) return
    setLoading(true)
    try {
      const data = await progressService.getDashboardOverview(user.id)
      setDashboard(data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  async function onRefresh() {
    setRefreshing(true)
    await loadDashboard()
    setRefreshing(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with exam readiness */}
      <DashboardHeader
        overallCompletion={dashboard?.overallCompletion}
        examReadinessScore={dashboard?.examReadinessScore}
        timeSpent={dashboard?.totalTimeSpent}
      />

      {/* Module progress cards */}
      <View style={styles.section}>
        {dashboard?.moduleProgress.map((module) => (
          <ModuleProgressCard
            key={module.moduleId}
            moduleId={module.moduleId}
            moduleTitle={module.moduleName}
            completionPercentage={module.completionPercentage}
            averageScore={module.averageScore}
            status={module.status}
          />
        ))}
      </View>

      {/* Learning progress */}
      <LearningProgressList
        topics={dashboard?.learningTopics}
        onSelectTopic={(topicId) => {
          /* Navigate to topic details */
        }}
      />

      {/* Mock exam history */}
      <MockExamHistory
        attempts={dashboard?.mockExamAttempts}
        onSelectAttempt={(attemptId) => {
          /* Navigate to attempt details */
        }}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  section: {
    marginVertical: 12
  }
})
```

---

## 8. Database Tables (Already Created ✅)

```sql
-- Learning Progress
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY,
  user_id UUID,
  subtopic_id VARCHAR,
  status VARCHAR, -- 'locked', 'in_progress', 'completed'
  lessons_watched BOOLEAN,
  audio_listened BOOLEAN,
  lesson_read BOOLEAN,
  assessment_attempts INT,
  best_score INT,
  is_passed BOOLEAN,
  completed_at TIMESTAMP
);

-- Mock Exam Attempts
CREATE TABLE mock_exam_attempts (
  id UUID PRIMARY KEY,
  user_id UUID,
  attempt_number INT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration INT,
  score INT,
  passed BOOLEAN,
  topic_wise_scores JSONB
);

-- Session Logs
CREATE TABLE session_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  module_id VARCHAR,
  screen_name VARCHAR,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration_minutes INT,
  action VARCHAR
);

-- Analytics Points
CREATE TABLE analytics_daily (
  id UUID PRIMARY KEY,
  user_id UUID,
  date DATE,
  completion_percentage INT,
  exam_readiness_score INT,
  practice_score INT,
  learning_score INT,
  mock_exam_score INT,
  total_minutes_spent INT
);
```

---

## 9. Implementation Checklist

- [ ] Create progressService for API calls
- [ ] Create DashboardHeader component
- [ ] Create ModuleProgressCard component
- [ ] Create LearningProgressList component
- [ ] Create MockExamHistory component
- [ ] Create PerformanceTrendChart component
- [ ] Create TopicPerformanceChart component
- [ ] Create TimeAnalyticsScreen component
- [ ] Integrate components into main dashboard screen
- [ ] Add session logging on screen navigation
- [ ] Add refresh functionality
- [ ] Test all components with real data
- [ ] Add navigation to detailed views

---

## 10. Summary

| Metric | Display |
|--------|---------|
| Exam Readiness Score | Large circular gauge (0-100%) |
| Overall Completion | Progress bar |
| Time Invested | Total hours/minutes |
| Module Progress | Cards with completion % |
| Learning Status | Sequential list with lock icons |
| Mock Exam Attempts | History with trends |
| Topic Performance | Bar chart or list |
| Time Analytics | Pie chart + daily breakdown |

**Status:** ✅ Complete Implementation Guide  
**Ready for Integration:** Yes  
**Backend:** Fully ready with all endpoints
