import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, DesignSystem } from '@/constants/DesignSystem'

interface Props {
  totalMinutes: number
}

export function TimeSpentCard({ totalMinutes }: Props) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  const getEngagementLevel = (mins: number) => {
    if (mins > 1800) return 'Highly Engaged'
    if (mins > 1200) return 'Very Engaged'
    if (mins > 600) return 'Engaged'
    return 'Getting Started'
  }

  const getEngagementColor = (mins: number) => {
    if (mins > 1800) return '#16A34A'
    if (mins > 1200) return '#D97706'
    if (mins > 600) return '#F59E0B'
    return '#94A3B8'
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="timer-outline" size={24} color={getEngagementColor(totalMinutes)} />
        <Text style={styles.title}>Time Invested</Text>
      </View>

      <View style={styles.timeDisplay}>
        <Text style={styles.mainTime}>
          {hours}h {minutes}m
        </Text>
        <Text style={styles.subtitle}>Total Study Time</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{hours}</Text>
          <Text style={styles.statLabel}>Hours</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{minutes}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: getEngagementColor(totalMinutes) }]}>
            {getEngagementLevel(totalMinutes)}
          </Text>
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
    marginTop: 12,
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
  timeDisplay: {
    alignItems: 'center',
    marginBottom: 12,
  },
  mainTime: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary.main,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 4,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.ui.border,
  },
})
