import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Colors, DesignSystem } from '@/constants/DesignSystem';
import { MOCK_EXAM_CONFIG } from '@/api/constants';
import { useAuth } from '@/context/AuthContext';
import {
  clearMockExamSnapshot,
  hasActiveMockExam,
  loadMockExamSnapshot,
  type MockExamSnapshot,
} from '@/utils/mockExamProgress';

interface ExamPartCardProps {
  title: string;
  questionCount: number;
  duration: number;
  examPart: 'part_a' | 'part_b';
  icon: string;
  tint: string;
  onPress: () => void;
}

function ExamPartCard({ title, questionCount, duration, examPart, icon, tint, onPress }: ExamPartCardProps) {
  return (
    <TouchableOpacity style={styles.examCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.examIconBadge, { backgroundColor: tint }]}>
        <MaterialCommunityIcons name={icon as any} size={22} color={Colors.primary.main} />
      </View>
      <View style={styles.examCopy}>
        <View style={styles.examHeaderRow}>
          <Text style={styles.examTitle}>{title}</Text>
          <View style={styles.examBadge}>
            <Text style={styles.examBadgeLabel}>{examPart === 'part_a' ? 'Part A' : 'Part B'}</Text>
          </View>
        </View>
        <Text style={styles.examSubtitle}>Timed session · {duration} minutes</Text>
        <View style={styles.examMetaRow}>
          <View style={styles.examMetaItem}>
            <Ionicons name="help-circle-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.examMetaLabel}>{questionCount} questions</Text>
          </View>
          <View style={styles.examMetaItem}>
            <Ionicons name="timer-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.examMetaLabel}>{duration} mins</Text>
          </View>
        </View>
      </View>
      <Ionicons name="arrow-forward" size={18} color={Colors.primary.main} />
    </TouchableOpacity>
  );
}

export default function MockExamSelectionScreen() {
  const { user } = useAuth();
  const [resumeSnapshot, setResumeSnapshot] = useState<MockExamSnapshot | null>(null);

  const refreshSnapshot = useCallback(async () => {
    if (!user?.id) {
      setResumeSnapshot(null);
      return;
    }
    const snapshot = await loadMockExamSnapshot(user.id);
    if (hasActiveMockExam(snapshot)) {
      setResumeSnapshot(snapshot);
    } else {
      setResumeSnapshot(null);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      refreshSnapshot();
    }, [refreshSnapshot]),
  );

  const startExam = (
    examPart: 'part_a' | 'part_b',
    config: typeof MOCK_EXAM_CONFIG.PART_A | typeof MOCK_EXAM_CONFIG.PART_B,
  ) => {
    router.push({
      pathname: '/mockexam/setup',
      params: {
        examPart: config.examPart,
        title: config.title,
        duration: config.durationMinutes.toString(),
        questionCount: config.questionCount.toString(),
      },
    });
  };

  const handleStartExam = (examPart: 'part_a' | 'part_b', config: typeof MOCK_EXAM_CONFIG.PART_A | typeof MOCK_EXAM_CONFIG.PART_B) => {
    if (!resumeSnapshot) {
      startExam(examPart, config);
      return;
    }

    if (resumeSnapshot.examPart === examPart) {
      Alert.alert(
        'Resume or restart?',
        'You already have this mock exam in progress. Choose resume or start over.',
        [
          {
            text: 'Resume',
            onPress: () => handleResume(),
          },
          {
            text: 'Start over',
            style: 'destructive',
            onPress: async () => {
              if (user?.id) {
                await clearMockExamSnapshot(user.id);
              }
              setResumeSnapshot(null);
              startExam(examPart, config);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
      return;
    }

    Alert.alert(
      'Active mock exam',
      'Starting a different mock exam will discard your current progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start new',
          style: 'destructive',
          onPress: async () => {
            if (user?.id) {
              await clearMockExamSnapshot(user.id);
            }
            setResumeSnapshot(null);
            startExam(examPart, config);
          },
        },
      ],
    );
  };

  const handleResume = () => {
    if (!resumeSnapshot) return;
    router.push({
      pathname: '/mockexam/exam',
      params: {
        examPart: resumeSnapshot.examPart,
        title: resumeSnapshot.examTitle,
        duration: resumeSnapshot.durationMinutes.toString(),
        questionCount: resumeSnapshot.questionCount.toString(),
        resumeExamId: resumeSnapshot.examId,
      },
    });
  };

  const handleDiscard = async () => {
    if (!resumeSnapshot || !user?.id) return;
    await clearMockExamSnapshot(user.id);
    setResumeSnapshot(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mock CBT exam</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {resumeSnapshot && (
          <View style={styles.resumeCard}>
            <View style={styles.resumeHeader}>
              <View>
                <Text style={styles.resumeTitle}>Resume your mock exam</Text>
                <Text style={styles.resumeSubtitle}>
                  {resumeSnapshot.examTitle} • Question {resumeSnapshot.state.currentIndex + 1} of{' '}
                  {resumeSnapshot.questionCount}
                </Text>
              </View>
              <Ionicons name="timer-outline" size={20} color={Colors.primary.main} />
            </View>
            <View style={styles.resumeActions}>
              <TouchableOpacity style={styles.resumePrimary} onPress={handleResume} activeOpacity={0.9}>
                <Text style={styles.resumePrimaryLabel}>Resume exam</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.text.inverse} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.resumeSecondary} onPress={handleDiscard} activeOpacity={0.85}>
                <Ionicons name="trash-outline" size={16} color={Colors.text.secondary} />
                <Text style={styles.resumeSecondaryLabel}>Discard</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles-outline" size={16} color={Colors.primary.main} />
            <Text style={styles.heroBadgeText}>Exam simulator</Text>
          </View>
          <Text style={styles.heroTitle}>Simulate the full CBT exam experience.</Text>
          <Text style={styles.heroSubtitle}>
            Choose the section you want to master, follow official timing, flag questions, and review detailed analytics once you submit.
          </Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaCard}>
              <Ionicons name="calculator-outline" size={18} color={Colors.primary.main} />
              <Text style={styles.heroMetaLabel}>Part A</Text>
              <Text style={styles.heroMetaValue}>15 numeracy questions · 30 mins</Text>
            </View>
            <View style={styles.heroMetaCard}>
              <Ionicons name="medkit-outline" size={18} color={Colors.semantic.success} />
              <Text style={styles.heroMetaLabel}>Part B</Text>
              <Text style={styles.heroMetaValue}>120 clinical questions · 150 mins</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select exam part</Text>
          <Text style={styles.sectionSubtitle}>Timed mode with review and analytics</Text>
        </View>

        <View style={styles.examsList}>
          <ExamPartCard
            title={MOCK_EXAM_CONFIG.PART_A.title}
            questionCount={MOCK_EXAM_CONFIG.PART_A.questionCount}
            duration={MOCK_EXAM_CONFIG.PART_A.durationMinutes}
            examPart={MOCK_EXAM_CONFIG.PART_A.examPart}
            icon="calculator-variant"
            tint="#E0F2FE"
            onPress={() => handleStartExam('part_a', MOCK_EXAM_CONFIG.PART_A)}
          />

          <ExamPartCard
            title={MOCK_EXAM_CONFIG.PART_B.title}
            questionCount={MOCK_EXAM_CONFIG.PART_B.questionCount}
            duration={MOCK_EXAM_CONFIG.PART_B.durationMinutes}
            examPart={MOCK_EXAM_CONFIG.PART_B.examPart}
            icon="stethoscope"
            tint="#DCFCE7"
            onPress={() => handleStartExam('part_b', MOCK_EXAM_CONFIG.PART_B)}
          />
        </View>

        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color={Colors.semantic.warning} />
            <Text style={styles.tipsTitle}>Exam tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipRow}>
              <Ionicons name="flag-outline" size={16} color={Colors.primary.main} />
              <Text style={styles.tipText}>Flag tricky questions and revisit before you submit.</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="stopwatch-outline" size={16} color={Colors.primary.main} />
              <Text style={styles.tipText}>Keep an eye on the countdown—auto submit triggers at zero.</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="analytics-outline" size={16} color={Colors.primary.main} />
              <Text style={styles.tipText}>Review accuracy, pace, and flagged questions in the results dashboard.</Text>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
    gap: 20,
  },
  resumeCard: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
    padding: 20,
    gap: 14,
    ...DesignSystem.platformShadows.sm,
  },
  resumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resumeTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
  },
  resumeSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.secondary,
  },
  resumeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  resumePrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary.main,
    borderRadius: 14,
    paddingVertical: 10,
  },
  resumePrimaryLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.inverse,
  },
  resumeSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  resumeSecondaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.text.secondary,
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 20,
    gap: 14,
    ...DesignSystem.platformShadows.sm,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.background.secondary,
  },
  heroBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.primary.main,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.text.primary,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroMetaCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 16,
    gap: 6,
    backgroundColor: Colors.background.secondary,
  },
  heroMetaLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroMetaValue: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
    lineHeight: 18,
  },
  sectionHeader: {
    marginHorizontal: 20,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.secondary,
  },
  examsList: {
    paddingHorizontal: 20,
    gap: 14,
  },
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: 18,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    ...DesignSystem.platformShadows.sm,
  },
  examIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  examCopy: {
    flex: 1,
    gap: 8,
  },
  examHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  examTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
  },
  examBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.background.secondary,
  },
  examBadgeLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.primary.main,
    letterSpacing: 0.4,
  },
  examSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.secondary,
  },
  examMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  examMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  examMetaLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.secondary,
  },
  tipsCard: {
    marginHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
    padding: 20,
    gap: 12,
    ...DesignSystem.platformShadows.sm,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
  },
  tipsList: {
    gap: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});
