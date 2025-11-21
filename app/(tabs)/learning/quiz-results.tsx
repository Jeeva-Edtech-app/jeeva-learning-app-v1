import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, DesignSystem } from '@/constants/DesignSystem';
import { Skeleton } from '@/components/ui/Skeleton';

type LessonQuizResultsParams = {
  lessonId?: string;
  lessonTitle?: string;
  correct?: string;
  total?: string;
  score?: string;
  passed?: string;
  answers?: string;
  category?: string;
  subdivision?: string;
};

const PASS_THRESHOLD = 80;

export default function LessonQuizResultsScreen() {
  const params = useLocalSearchParams<LessonQuizResultsParams>();

  const lessonId = params.lessonId ?? '';
  const lessonTitle = params.lessonTitle ?? 'Lesson quiz';
  const category = params.category ?? '';
  const subdivision = params.subdivision ?? '';
  const correctAnswers = Number(params.correct ?? 0);
  const totalQuestions = Number(params.total ?? 0);
  const scorePercentage = Number(params.score ?? 0);
  const didPass = params.passed === 'true' || scorePercentage >= PASS_THRESHOLD;
  const rawAnswers = params.answers ? decodeURIComponent(params.answers) : '[]';

  const answers = useMemo(() => {
    try {
      return JSON.parse(rawAnswers) as {
        questionId: string;
        selectedOptionId: string | null;
        isCorrect: boolean;
      }[];
    } catch {
      return [];
    }
  }, [rawAnswers]);

  const isLoading = !params.score;
  const incorrectAnswers = Math.max(totalQuestions - correctAnswers, 0);

  const handleRetry = () => {
    if (!lessonId) {
      router.back();
      return;
    }
    router.replace({
      pathname: '/learning/quiz',
      params: {
        lessonId,
        lessonTitle,
        category,
        subdivision,
      },
    });
  };

  const handleReviewLesson = () => {
    router.replace('/(tabs)/learning');
  };

  const handleNextLesson = () => {
    router.replace('/(tabs)/learning');
  };

  const handleReviewAnswers = () => {
    router.push({
      pathname: '/learning/quiz-review',
      params: {
        lessonId,
        lessonTitle,
        answers: encodeURIComponent(JSON.stringify(answers)),
        category,
        subdivision,
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} disabled>
            <Ionicons name="arrow-back" size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading results…</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <ScrollView contentContainerStyle={styles.loadingContent}>
          <Skeleton width="60%" height={24} />
          <Skeleton width="100%" height={160} borderRadius={20} style={styles.skeletonSpacer} />
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} width="100%" height={56} borderRadius={16} style={styles.skeletonSpacer} />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.replace('/(tabs)/learning')}>
          <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lessonTitle}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: didPass ? '#DCFCE7' : '#FEF3C7' },
            ]}
          >
            <Ionicons
              name={didPass ? 'sparkles' : 'refresh'}
              size={16}
              color={didPass ? Colors.semantic.success : Colors.semantic.warning}
            />
            <Text
              style={[
                styles.statusPillText,
                { color: didPass ? Colors.semantic.success : Colors.semantic.warning },
              ]}
            >
              {didPass ? 'Lesson completed!' : 'Review required'}
            </Text>
          </View>
          <Text style={styles.scoreNumber}>
            {correctAnswers}/{totalQuestions}
          </Text>
          <Text style={styles.scoreSubheading}>{scorePercentage}% mastery</Text>
          <Text style={styles.summarySubtitle}>
            {didPass
              ? 'Great work—move to the next lesson or reinforce with practice.'
              : 'Reach at least 80% before unlocking the next lesson. Review the lesson and retry.'}
          </Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Ionicons name="checkbox-outline" size={20} color={Colors.semantic.success} />
            <Text style={styles.metricValue}>{correctAnswers}</Text>
            <Text style={styles.metricLabel}>Correct</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="close-circle-outline" size={20} color={Colors.semantic.error} />
            <Text style={styles.metricValue}>{incorrectAnswers}</Text>
            <Text style={styles.metricLabel}>Incorrect</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="flag-outline" size={20} color={Colors.primary.main} />
            <Text style={styles.metricValue}>{answers.length}</Text>
            <Text style={styles.metricLabel}>Answered</Text>
          </View>
        </View>

        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackHeading}>What to focus on next</Text>
          <Text style={styles.feedbackBody}>
            {didPass
              ? 'Keep the momentum going by tackling the next lesson or switching to practice mode for spaced repetition.'
              : 'Revisit the lesson material, pay special attention to incorrect answers, and retry the quiz to consolidate your understanding.'}
          </Text>
        </View>

        <View style={styles.actionsList}>
          <TouchableOpacity style={styles.actionItem} onPress={handleReviewAnswers} activeOpacity={0.85}>
            <View style={styles.actionIcon}>
              <Ionicons name="list-circle" size={22} color={Colors.primary.main} />
            </View>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>Review answers</Text>
              <Text style={styles.actionSubtitle}>See each question with the correct answer and explanation.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleRetry} activeOpacity={0.85}>
            <View style={styles.actionIcon}>
              <Ionicons name="refresh" size={22} color={Colors.semantic.warning} />
            </View>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>Retry quiz</Text>
              <Text style={styles.actionSubtitle}>Take the quiz again to reach the 80% mastery requirement.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleReviewLesson} activeOpacity={0.85}>
            <View style={styles.actionIcon}>
              <Ionicons name="book-outline" size={22} color={Colors.primary.main} />
            </View>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>Review lesson</Text>
              <Text style={styles.actionSubtitle}>Jump back into the lesson to reinforce key concepts.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {didPass && (
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={handleNextLesson}>
            <Text style={styles.primaryButtonText}>Next lesson</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.text.inverse} />
          </TouchableOpacity>
        )}
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
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
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
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  loadingContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  skeletonSpacer: {
    marginTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20,
  },
  summaryCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    ...DesignSystem.platformShadows.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  scoreNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    color: Colors.text.primary,
  },
  scoreSubheading: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  summarySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
    ...DesignSystem.platformShadows.sm,
  },
  metricValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.text.primary,
  },
  metricLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  feedbackCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 20,
    gap: 10,
    ...DesignSystem.platformShadows.sm,
  },
  feedbackHeading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
  },
  feedbackBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  actionsList: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
    ...DesignSystem.platformShadows.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  actionCopy: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
  },
  actionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.primary.main,
    marginTop: 8,
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.inverse,
  },
});
