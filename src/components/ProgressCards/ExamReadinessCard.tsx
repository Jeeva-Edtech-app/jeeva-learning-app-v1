import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, DesignSystem } from '@/constants/DesignSystem'
import { getReadinessLevel, getReadinessColor } from '@/data/progressData'

interface Props {
  examReadinessScore: number
}

export function ExamReadinessCard({ examReadinessScore }: Props) {
  const level = getReadinessLevel(examReadinessScore)
  const color = getReadinessColor(examReadinessScore)

  const getIcon = (score: number) => {
    if (score >= 80) return 'checkmark-circle'
    if (score >= 60) return 'alert-circle'
    if (score >= 40) return 'time'
    return 'school'
  }

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <Ionicons name={getIcon(examReadinessScore) as any} size={24} color={color} />
        <Text style={styles.title}>Exam Readiness</Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={[styles.score, { color }]}>{examReadinessScore}%</Text>
        <Text style={styles.level}>{level}</Text>
      </View>

      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${examReadinessScore}%`, backgroundColor: color }]} />
      </View>

      <Text style={styles.subtitle}>Based on all module performance</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: DesignSystem.borderRadius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  scoreContainer: {
    marginBottom: 12,
  },
  score: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  level: {
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
  subtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
})
