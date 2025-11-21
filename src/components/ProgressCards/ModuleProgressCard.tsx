import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, DesignSystem } from '@/constants/DesignSystem'

interface Props {
  moduleId: 'practice' | 'learning' | 'mock_exam'
  completedSubtopics: number
  totalSubtopics: number
  completionPercentage: number
  averageScore: number
}

export function ModuleProgressCard({
  moduleId,
  completedSubtopics,
  totalSubtopics,
  completionPercentage,
  averageScore,
}: Props) {
  const getModuleInfo = () => {
    switch (moduleId) {
      case 'practice':
        return {
          name: 'Practice Module',
          icon: 'play-circle-outline',
          color: '#3B82F6',
          description: 'Familiarization',
        }
      case 'learning':
        return {
          name: 'Learning Module',
          icon: 'book-outline',
          color: '#059669',
          description: 'Structured Learning',
        }
      case 'mock_exam':
        return {
          name: 'Mock Exams',
          icon: 'document-outline',
          color: '#D97706',
          description: 'Exam Simulation',
        }
    }
  }

  const info = getModuleInfo()

  return (
    <View style={[styles.card, { borderLeftColor: info.color }]}>
      <View style={styles.header}>
        <Ionicons name={info.icon as any} size={24} color={info.color} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{info.name}</Text>
          <Text style={styles.description}>{info.description}</Text>
        </View>
      </View>

      <View style={styles.completionContainer}>
        <Text style={[styles.completionPercentage, { color: info.color }]}>
          {completionPercentage}%
        </Text>
        <Text style={styles.topicsText}>
          {completedSubtopics}/{totalSubtopics} Topics
        </Text>
      </View>

      <View style={styles.bar}>
        <View
          style={[
            styles.barFill,
            {
              width: `${completionPercentage}%`,
              backgroundColor: info.color,
            },
          ]}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={[styles.statValue, { color: info.color }]}>{averageScore}%</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: DesignSystem.borderRadius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  description: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
    fontWeight: '500',
  },
  completionContainer: {
    marginBottom: 12,
  },
  completionPercentage: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  topicsText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  bar: {
    height: 6,
    backgroundColor: Colors.ui.border,
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
})
