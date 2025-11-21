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
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconBg, { backgroundColor: `${info.color}20` }]}>
          <Ionicons name={info.icon as any} size={20} color={info.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{info.name}</Text>
          <Text style={styles.description}>{info.description}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${completionPercentage}%`,
                backgroundColor: info.color,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {completedSubtopics}/{totalSubtopics} Topics
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Completion</Text>
          <Text style={styles.statValue}>{completionPercentage}%</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Avg Score</Text>
          <Text style={styles.statValue}>{averageScore}%</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: DesignSystem.borderRadius.lg,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  description: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 5,
    backgroundColor: Colors.ui.border,
    borderRadius: 2.5,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  progressText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.ui.border,
  },
})
