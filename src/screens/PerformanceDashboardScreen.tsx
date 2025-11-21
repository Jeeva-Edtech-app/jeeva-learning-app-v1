import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Colors, DesignSystem } from '@/constants/DesignSystem';
import { usePerformanceStats } from '@/hooks/usePerformance';
import {
  getWeakTopics,
  getStrongTopics,
  getRecentActivity,
  getMockExamStats,
  type TopicPerformance,
  type RecentActivity,
  type MockExamStats,
} from '@/api/performance';
import { useAuth } from '@/context/AuthContext';

const MOCK_PASS_THRESHOLD = 70;

export default function PerformanceDashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const pulseAnimation = useRef(new Animated.Value(0)).current;

  const [weakTopics, setWeakTopics] = useState<TopicPerformance[]>([]);
  const [strongTopics, setStrongTopics] = useState<TopicPerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [mockStats, setMockStats] = useState<MockExamStats | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: performance, isLoading: perfLoading } = usePerformanceStats(user?.id);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnimation]);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [weak, strong, activity, mocks] = await Promise.all([
        getWeakTopics(user.id),
        getStrongTopics(user.id),
        getRecentActivity(user.id, 7),
        getMockExamStats(user.id),
      ]);

      setWeakTopics(weak);
      setStrongTopics(strong);
      setRecentActivity(activity);
      setMockStats(mocks);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (score: number): string => {
    if (score < 60) return Colors.semantic.error;
    if (score < 80) return Colors.semantic.warning;
    return Colors.semantic.success;
  };

  const getReadinessMessage = (score: number): string => {
    if (score < 60) return "Keep practising—you're building your foundation.";
    if (score < 80) return 'Good progress—sharpen weak areas next.';
    return 'You’re almost ready—polish with final mocks.';
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Recently';
    }
  };

  const formatStudyTime = (minutes: number): string => {
    if (!minutes || minutes <= 0) return '0m';
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    const parts: string[] = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    return parts.join(' ');
  };

  const getActivityIcon = (type: string): any => {
    switch (type) {
      case 'practice':
        return 'book-outline';
      case 'mock_exam':
        return 'clipboard-outline';
      case 'lesson':
        return 'school-outline';
      default:
        return 'checkmark-circle-outline';
    }
  };

  const activityMeta = (activity: RecentActivity): string => {
    const base = formatDate(activity.date);
    if (typeof activity.score === 'number') {
      return `${base} • ${activity.score}%`;
    }
    if (activity.totalQuestions) {
      return `${base} • ${activity.totalQuestions} questions`;
    }
    return base;
  };

  if (perfLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading your performance data…</Text>
      </View>
    );
  }

  const examReadiness = performance?.examReadinessScore || 0;
  const readinessColor = getReadinessColor(examReadiness);
  const lastMockAttemptLabel = mockStats?.lastAttemptDate
    ? format(new Date(mockStats.lastAttemptDate), 'MMM dd, yyyy')
    : 'No attempts yet';

  const heroMetrics = [
    {
      key: 'practiceAccuracy',
      label: 'Practice accuracy',
      value: `${performance?.practiceAccuracy ?? 0}%`,
      icon: 'bar-chart-outline',
      tint: '#E2E8FF',
      iconColor: Colors.primary.main,
    },
    {
      key: 'mockAverage',
      label: 'Mock average',
      value: `${mockStats?.averageScore ?? 0}%`,
      icon: 'clipboard-outline',
      tint: '#FEF3C7',
      iconColor: Colors.semantic.warning,
    },
    {
      key: 'studyTime',
      label: 'Study time',
      value: formatStudyTime(performance?.totalTimeSpentMinutes ?? 0),
      icon: 'time-outline',
      tint: '#F1F5F9',
      iconColor: Colors.text.secondary,
    },
  ];

  const coreMetrics = [
    {
      key: 'modules',
      label: 'Modules completed',
      value: `${performance?.modulesCompleted ?? 0}/${performance?.totalModules ?? 0}`,
      icon: 'book-outline',
      tint: '#EEF2FF',
      iconColor: Colors.primary.main,
    },
    {
      key: 'mockAttempts',
      label: 'Mock attempts',
      value: `${mockStats?.totalAttempts ?? 0}`,
      icon: 'timer-outline',
      tint: '#FFF7ED',
      iconColor: Colors.semantic.warning,
    },
    {
      key: 'questions',
      label: 'Questions answered',
      value: `${performance?.totalPracticeQuestions ?? 0}`,
      icon: 'reader-outline',
      tint: '#ECFDF5',
      iconColor: Colors.semantic.success,
    },
    {
      key: 'averageScore',
      label: 'Average score',
      value: `${performance?.averageScore ?? 0}%`,
      icon: 'analytics-outline',
      tint: '#F5F3FF',
      iconColor: '#7C3AED',
    },
  ];

  const studyStats = [
    {
      key: 'lessons',
      label: 'Lessons completed',
      value: `${performance?.totalLessonsCompleted ?? 0}`,
    },
    {
      key: 'streak',
      label: 'Current study streak',
      value: `${performance?.studyStreak ?? 0} days`,
    },
    {
      key: 'time',
      label: 'Time invested',
      value: formatStudyTime(performance?.totalTimeSpentMinutes ?? 0),
    },
  ];

  const focusTopics = weakTopics.slice(0, 3);
  const strengthTopics = strongTopics.slice(0, 3);

  const getTopicColor = (accuracy: number) =>
    accuracy >= MOCK_PASS_THRESHOLD ? Colors.semantic.success : Colors.semantic.warning;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Performance dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Track readiness and plan the next revision sprint.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerAction}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/practice')}
          >
            <Ionicons name="flash-outline" size={18} color={Colors.primary.main} />
            <Text style={styles.headerActionText}>Quick practice</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, styles.heroCard]}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroLabel}>Exam readiness</Text>
              <Text style={styles.heroHeadline}>{getReadinessMessage(examReadiness)}</Text>
              <Text style={styles.heroSubcopy}>Last mock: {lastMockAttemptLabel}</Text>
            </View>
            <View style={styles.heroGaugeWrapper}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.heroPulse,
                  {
                    borderColor: readinessColor,
                    opacity: pulseAnimation,
                  },
                ]}
              />
              <View style={[styles.heroGauge, { borderColor: readinessColor }] }>
                <Text style={[styles.heroGaugeValue, { color: readinessColor }]}>
                  {examReadiness}%
                </Text>
                <Text style={styles.heroGaugeCaption}>ready</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroMetricRow}>
            {heroMetrics.map((metric) => (
              <View key={metric.key} style={styles.heroMetricChip}>
                <View style={[styles.heroMetricIcon, { backgroundColor: metric.tint }]}>
                  <Ionicons name={metric.icon as any} size={18} color={metric.iconColor} />
                </View>
                <View style={styles.heroMetricCopy}>
                  <Text style={styles.heroMetricLabel}>{metric.label}</Text>
                  <Text style={styles.heroMetricValue}>{metric.value}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.heroButton}
            activeOpacity={0.9}
            onPress={() => router.push('/(tabs)/mockexam')}
          >
            <Text style={styles.heroButtonText}>Review mock exams</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>

        <View style={styles.metricsGrid}>
          {coreMetrics.map((metric) => (
            <View key={metric.key} style={[styles.card, styles.metricCard]}>
              <View style={[styles.metricIconWrap, { backgroundColor: metric.tint }] }>
                <Ionicons name={metric.icon as any} size={18} color={metric.iconColor} />
              </View>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.sectionCard]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mock exam insights</Text>
            <Text style={styles.sectionSubtitle}>
              Average {mockStats?.averageScore ?? 0}% • Best {mockStats?.bestScore ?? 0}% • Attempts {mockStats?.totalAttempts ?? 0}
            </Text>
          </View>
          <View style={styles.inlineStatRow}>
            <View style={[styles.inlineStat, styles.inlineStatPrimary]}>
              <Text style={styles.inlineStatLabel}>Average score</Text>
              <Text style={styles.inlineStatValue}>{mockStats?.averageScore ?? 0}%</Text>
            </View>
            <View style={[styles.inlineStat, styles.inlineStatWarning]}>
              <Text style={styles.inlineStatLabel}>Best score</Text>
              <Text style={styles.inlineStatValue}>{mockStats?.bestScore ?? 0}%</Text>
            </View>
            <View style={[styles.inlineStat, styles.inlineStatNeutral]}>
              <Text style={styles.inlineStatLabel}>Last attempt</Text>
              <Text style={styles.inlineStatValue}>{lastMockAttemptLabel}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.sectionAction}
            activeOpacity={0.9}
            onPress={() => router.push('/(tabs)/mockexam')}
          >
            <Text style={styles.sectionActionText}>Launch mock exam</Text>
            <Ionicons name="rocket-outline" size={18} color={Colors.primary.main} />
          </TouchableOpacity>
        </View>

        <View style={[styles.card, styles.sectionCard]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Study overview</Text>
            <Text style={styles.sectionSubtitle}>How you’re investing your effort</Text>
          </View>
          <View style={styles.statList}>
            {studyStats.map((stat) => (
              <View key={stat.key} style={styles.statRow}>
                <View style={styles.statBullet} />
                <View style={styles.statCopy}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.sectionAction}
            activeOpacity={0.9}
            onPress={() => router.push('/(tabs)/learning')}
          >
            <Text style={styles.sectionActionText}>Open learning module</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.primary.main} />
          </TouchableOpacity>
        </View>

        <View style={[styles.card, styles.sectionCard]}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Focus next</Text>
              <Text style={styles.sectionSubtitle}>Topics below {MOCK_PASS_THRESHOLD}% accuracy</Text>
            </View>
            <TouchableOpacity
              style={styles.sectionLink}
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/practice')}
            >
              <Text style={styles.sectionLinkText}>Practice now</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary.main} />
            </TouchableOpacity>
          </View>
          {focusTopics.length > 0 ? (
            focusTopics.map((topic) => (
              <View key={topic.topicId} style={styles.topicItem}>
                <View style={styles.topicInfo}>
                  <Text style={styles.topicName}>{topic.topicName}</Text>
                  <Text style={styles.topicMeta}>
                    {topic.totalQuestions} questions • {topic.correctAnswers} correct
                  </Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(Math.max(topic.accuracy, 0), 100)}%`,
                          backgroundColor: getTopicColor(topic.accuracy),
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text style={[styles.topicScore, { color: getTopicColor(topic.accuracy) }] }>
                  {Math.round(topic.accuracy)}%
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyCopy}>No focus areas right now — keep the streak going!</Text>
          )}
        </View>

        <View style={[styles.card, styles.sectionCard]}>
          <Text style={styles.sectionTitle}>Strengths</Text>
          <Text style={styles.sectionSubtitle}>Where you’re consistently performing well</Text>
          {strengthTopics.length > 0 ? (
            strengthTopics.map((topic) => (
              <View key={topic.topicId} style={styles.strengthRow}>
                <View style={styles.strengthBadge}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={Colors.semantic.success} />
                </View>
                <View style={styles.strengthCopy}>
                  <Text style={styles.topicName}>{topic.topicName}</Text>
                  <Text style={styles.topicMeta}>
                    {topic.totalQuestions} questions • {Math.round(topic.accuracy)}% accuracy
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyCopy}>Complete more practice to surface your strongest topics.</Text>
          )}
        </View>

        <View style={[styles.card, styles.sectionCard]}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Text style={styles.sectionSubtitle}>Latest lessons, practice sets, and exams</Text>
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 6).map((activity) => (
              <View key={activity.id} style={styles.activityRow}>
                <View style={styles.activityIconWrap}>
                  <Ionicons name={getActivityIcon(activity.type) as any} size={18} color={Colors.primary.main} />
                </View>
                <View style={styles.activityCopy}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityMeta}>{activityMeta(activity)}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyCopy}>
              Once you start practising and completing lessons, your timeline will appear here.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.background.main,
  },
  loadingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 20,
    ...DesignSystem.platformShadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
  },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
  },
  headerActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary.main,
  },
  heroCard: {
    gap: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.text.secondary,
  },
  heroHeadline: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 26,
    color: Colors.text.primary,
  },
  heroSubcopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  heroGaugeWrapper: {
    width: 94,
    height: 94,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 47,
    borderWidth: 2,
    opacity: 0,
  },
  heroGauge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.main,
  },
  heroGaugeValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
  },
  heroGaugeCaption: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  heroMetricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  heroMetricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 140,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
  },
  heroMetricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroMetricCopy: {
    flex: 1,
    gap: 4,
  },
  heroMetricLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  heroMetricValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  heroButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary.main,
    borderRadius: 14,
  },
  heroButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.inverse,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flexBasis: '48%',
    padding: 18,
    gap: 10,
  },
  metricIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  metricValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  sectionCard: {
    gap: 16,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  inlineStatRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineStat: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    gap: 6,
  },
  inlineStatPrimary: {
    backgroundColor: '#EEF2FF',
  },
  inlineStatWarning: {
    backgroundColor: '#FEF3C7',
  },
  inlineStatNeutral: {
    backgroundColor: '#F1F5F9',
  },
  inlineStatLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  inlineStatValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  sectionAction: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.secondary,
  },
  sectionActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary.main,
  },
  statList: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  statBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.main,
    marginTop: 6,
  },
  statCopy: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.primary,
  },
  statValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  sectionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionLinkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary.main,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  topicInfo: {
    flex: 1,
    gap: 6,
  },
  topicName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
  },
  topicMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.background.secondary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  topicScore: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  strengthBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
  },
  strengthCopy: {
    flex: 1,
    gap: 4,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
  },
  activityCopy: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  activityMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  emptyCopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
  },
});
