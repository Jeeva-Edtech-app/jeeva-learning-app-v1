import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, DesignSystem } from '@/constants/DesignSystem';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import {
  loadMockExamHistoryLocal,
  loadMockExamResultLocal,
  type StoredMockExamResult,
} from '@/utils/mockExamResults';

const PRACTICE_PASS_THRESHOLD = 80;
const MOCK_PASS_THRESHOLD = 70;

type PracticeReviewAnswer = {
  questionId: string | number;
  selectedOptionId: string | number | null;
  isCorrect: boolean;
  timeTaken?: number;
};

type PracticeReviewQuestion = {
  id: string;
  question_text: string;
  explanation?: string;
  correct_answer_id: string | number | null;
  category?: string | null;
  subdivision?: string | null;
  question_options?: {
    id: string;
    option_text: string;
    is_correct: boolean;
  }[];
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const parts = [];
  if (mins > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const formatExamDate = (iso?: string) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const day = date.getDate().toString().padStart(2, '0');
  const month = MONTH_NAMES[date.getMonth()] ?? '';
  return `${day} ${month}`;
};

export default function PracticeResultsScreen() {
  const params = useLocalSearchParams();
  const hasParams = Object.keys(params).length > 0;
  const isLoading = !hasParams;
  const { user } = useAuth();

  const isMockExam = params.isMockExam === 'true';
  const sessionIdParam = typeof params.sessionId === 'string' ? params.sessionId : '';
  const encodedAnswers = typeof params.answers === 'string' ? params.answers : '';
  const encodedQuestions = typeof params.questions === 'string' ? params.questions : '';
  const subdivisionParam = typeof params.subdivision === 'string' ? params.subdivision : '';
  const categoryParam = typeof params.category === 'string' ? params.category : '';
  const examPartParam = typeof params.examPart === 'string' ? params.examPart : '';
  const examTitleParam = typeof params.examTitle === 'string' ? params.examTitle : '';

  const [localResult, setLocalResult] = useState<StoredMockExamResult | null>(null);
  const [localHistory, setLocalHistory] = useState<StoredMockExamResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const parseNumericParam = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  useEffect(() => {
    if (!isMockExam || !user?.id) return;
    let active = true;

    const load = async () => {
      setHistoryLoading(true);
      try {
        const [history, storedResult] = await Promise.all([
          loadMockExamHistoryLocal(user.id),
          sessionIdParam ? loadMockExamResultLocal(user.id, sessionIdParam) : Promise.resolve(null),
        ]);
        if (!active) return;
        setLocalHistory(history);
        setLocalResult(storedResult);
      } finally {
        if (active) {
          setHistoryLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [isMockExam, user?.id, sessionIdParam]);

  const hasCorrectParam = Object.prototype.hasOwnProperty.call(params, 'correct');
  const hasTotalParam = Object.prototype.hasOwnProperty.call(params, 'total');
  const hasScoreParam = Object.prototype.hasOwnProperty.call(params, 'score');
  const hasDurationParam = Object.prototype.hasOwnProperty.call(params, 'duration');
  const hasFlaggedParam = Object.prototype.hasOwnProperty.call(params, 'flagged');
  const hasAnsweredParam = Object.prototype.hasOwnProperty.call(params, 'answered');
  const hasTimeParam =
    Object.prototype.hasOwnProperty.call(params, 'timeTaken') ||
    Object.prototype.hasOwnProperty.call(params, 'elapsed');

  const correctAnswers = hasCorrectParam
    ? parseNumericParam(params.correct)
    : localResult?.correctAnswers ?? 0;
  const totalQuestions = hasTotalParam
    ? parseNumericParam(params.total)
    : localResult?.totalQuestions ?? localResult?.questions.length ?? 0;
  const scorePercentage = hasScoreParam
    ? parseNumericParam(params.score)
    : localResult?.scorePercentage ?? 0;
  const durationMinutes = hasDurationParam
    ? parseNumericParam(params.duration)
    : localResult?.durationMinutes ?? 0;
  const flaggedCount = hasFlaggedParam
    ? parseNumericParam(params.flagged)
    : localResult?.flaggedCount ?? 0;
  const answeredCountParam = hasAnsweredParam
    ? parseNumericParam(params.answered)
    : localResult?.answers.length ?? 0;
  const rawElapsedSeconds = parseNumericParam(params.elapsed ?? params.timeTaken ?? 0);
  const timeTakenSeconds = hasTimeParam
    ? parseNumericParam(params.timeTaken ?? rawElapsedSeconds)
    : localResult?.timeTakenSeconds ?? rawElapsedSeconds;
  const durationSeconds = durationMinutes * 60;
  const timeRemainingSeconds =
    durationSeconds > 0 ? Math.max(durationSeconds - timeTakenSeconds, 0) : Math.max(0, durationSeconds);
  const incorrectAnswers = Math.max(totalQuestions - correctAnswers, 0);

  const passThreshold = isMockExam ? MOCK_PASS_THRESHOLD : PRACTICE_PASS_THRESHOLD;

  const status = useMemo(() => {
    if (!hasParams) {
      return {
        title: '',
        subtitle: '',
        badgeColor: Colors.background.secondary,
        badgeTextColor: Colors.text.secondary,
      };
    }
    if (scorePercentage >= passThreshold) {
      return {
        title: isMockExam ? 'Exam ready! 🎉' : 'Great work! 🎉',
        subtitle: isMockExam
          ? 'You’re tracking above the pass mark—maintain the tempo.'
          : 'You’re on track—keep the momentum going.',
        badgeColor: '#DCFCE7',
        badgeTextColor: Colors.semantic.success,
      };
    }
    if (scorePercentage >= passThreshold - 10) {
      return {
        title: 'Closing in',
        subtitle: 'A focussed revision sprint will lift you over the line.',
        badgeColor: '#FEF3C7',
        badgeTextColor: '#D97706',
      };
    }
    return {
      title: 'Keep practising',
      subtitle: isMockExam
        ? 'Revisit lessons and run Part A/B drills to boost your score.'
        : 'Target the topics below to raise your score.',
      badgeColor: '#F1F5F9',
      badgeTextColor: Colors.text.secondary,
    };
  }, [hasParams, isMockExam, passThreshold, scorePercentage]);

  const practiceTitle = subdivisionParam || categoryParam || 'Practice set';
  const mockExamTitle = examTitleParam || localResult?.examTitle || 'Mock exam';

  const parsedAnswerParams = useMemo(() => {
    if (!encodedAnswers) return null;
    try {
      return JSON.parse(decodeURIComponent(encodedAnswers)) as PracticeReviewAnswer[];
    } catch {
      return null;
    }
  }, [encodedAnswers]);

  const practiceAnswers: PracticeReviewAnswer[] = useMemo(() => {
    if (parsedAnswerParams && parsedAnswerParams.length > 0) {
      return parsedAnswerParams;
    }
    if (isMockExam && localResult) {
      return localResult.answers.map((answer) => ({
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
        isCorrect: answer.isCorrect,
        timeTaken: answer.timeTaken,
      }));
    }
    return [];
  }, [parsedAnswerParams, isMockExam, localResult]);

  const reviewQuestions: PracticeReviewQuestion[] = useMemo(() => {
    if (encodedQuestions) {
      try {
        return JSON.parse(decodeURIComponent(encodedQuestions)) as PracticeReviewQuestion[];
      } catch {
        /* fall back to local cache */
      }
    }
    if (isMockExam && localResult) {
      return localResult.questions.map((question) => ({
        id: String(question.id),
        question_text: question.question_text,
        explanation: question.explanation,
        correct_answer_id: question.correct_answer_id ?? null,
        category: question.category ?? null,
        subdivision: question.subdivision ?? null,
        question_options: question.question_options?.map((option) => ({
          ...option,
          id: String(option.id),
        })),
      }));
    }
    return [];
  }, [encodedQuestions, isMockExam, localResult]);

  const totalAnswered = practiceAnswers.length || answeredCountParam;
  const skippedCount = Math.max(totalQuestions - totalAnswered, 0);
  const totalTimeSeconds =
    timeTakenSeconds ||
    practiceAnswers.reduce((sum, answer) => sum + (answer.timeTaken ?? 0), 0);
  const unansweredCount = Math.max(totalQuestions - totalAnswered, 0);
  const weakCount = practiceAnswers.filter((answer) => !answer.isCorrect).length;
  const answersWithKeys = useMemo(
    () =>
      practiceAnswers.map((answer) => ({
        ...answer,
        questionKey: String(answer.questionId),
      })),
    [practiceAnswers],
  );

  const questionLookup = useMemo(() => {
    const map = new Map<string, PracticeReviewQuestion>();
    reviewQuestions.forEach((question) => {
      map.set(String(question.id), question);
    });
    return map;
  }, [reviewQuestions]);

  const sectionStats = useMemo(() => {
    if (!isMockExam || answersWithKeys.length === 0 || reviewQuestions.length === 0) {
      return [];
    }
    const stats = new Map<
      string,
      { label: string; correct: number; total: number; accuracy?: number }
    >();
    answersWithKeys.forEach((answer) => {
      const question = questionLookup.get(answer.questionKey);
      if (!question) return;
      const label = question.category || question.subdivision || 'General';
      const key = label.toLowerCase();
      const entry = stats.get(key) ?? { label, correct: 0, total: 0 };
      entry.total += 1;
      if (answer.isCorrect) {
        entry.correct += 1;
      }
      stats.set(key, entry);
    });
    return Array.from(stats.values())
      .map((entry) => ({
        ...entry,
        accuracy: entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [isMockExam, answersWithKeys, questionLookup, reviewQuestions.length]);

  const weakSections = useMemo(
    () => sectionStats.filter((section) => section.accuracy < MOCK_PASS_THRESHOLD),
    [sectionStats],
  );
  const strengthSections = useMemo(
    () => sectionStats.filter((section) => section.accuracy >= MOCK_PASS_THRESHOLD),
    [sectionStats],
  );
  const recentSections = sectionStats.slice(0, 5);

  const timeStats = useMemo(() => {
    if (!isMockExam || practiceAnswers.length === 0) {
      return {
        average: totalQuestions > 0 ? Math.round(timeTakenSeconds / Math.max(totalQuestions, 1)) : 0,
        fastest: 0,
        slowest: 0,
      };
    }
    const chronological = [...practiceAnswers]
      .filter((answer) => typeof answer.timeTaken === 'number')
      .sort((a, b) => (a.timeTaken ?? 0) - (b.timeTaken ?? 0));

    if (chronological.length === 0) {
      return {
        average: totalQuestions > 0 ? Math.round(timeTakenSeconds / Math.max(totalQuestions, 1)) : 0,
        fastest: 0,
        slowest: 0,
      };
    }

    let previousElapsed = 0;
    const spans: number[] = [];

    chronological.forEach((entry) => {
      const elapsed = Math.max(entry.timeTaken ?? 0, 0);
      const spent = Math.max(elapsed - previousElapsed, 0);
      spans.push(spent);
      previousElapsed = Math.max(previousElapsed, elapsed);
    });

    const average =
      spans.length > 0 ? Math.round(spans.reduce((sum, value) => sum + value, 0) / spans.length) : 0;
    const fastest = spans.length > 0 ? Math.min(...spans) : 0;
    const slowest = spans.length > 0 ? Math.max(...spans) : 0;

    return { average, fastest, slowest };
  }, [isMockExam, practiceAnswers, timeTakenSeconds, totalQuestions]);

  const otherAttempts = useMemo(() => {
    if (!isMockExam) return [];
    return localHistory.filter((entry) => entry.sessionId !== sessionIdParam);
  }, [isMockExam, localHistory, sessionIdParam]);

  const previousAttempt = otherAttempts[0];
  const scoreDeltaValue = previousAttempt
    ? Math.round(scorePercentage - previousAttempt.scorePercentage)
    : 0;
  const hasScoreDelta = previousAttempt !== undefined && !Number.isNaN(scoreDeltaValue);
  const historyList = otherAttempts.slice(0, 4);

  const resolvedExamPart = examPartParam || localResult?.examPart || '';
  const examPartLabel = isMockExam
    ? resolvedExamPart === 'part_a'
      ? 'Part A · Numeracy'
      : resolvedExamPart === 'part_b'
      ? 'Part B · Clinical'
      : ''
    : '';
  const topStrengths = strengthSections.slice(0, 2);
  const weakFocusLabels = weakSections.slice(0, 2).map((section) => section.label);
  const weakSectionSummary = weakFocusLabels.join(' & ');
  const mockFeedbackCopy = useMemo(() => {
    if (!isMockExam) return '';
    if (weakSectionSummary) {
      return `Prioritise ${weakSectionSummary} in your next study sprint, then rerun the mock to confirm progress.`;
    }
    return 'Use the flagged items list and incorrect answers to plan a revision sprint. Follow up with targeted practice quizzes before your next mock exam.';
  }, [isMockExam, weakSectionSummary]);

  const answersParam =
    encodedAnswers || (practiceAnswers.length > 0 ? encodeURIComponent(JSON.stringify(practiceAnswers)) : '');
  const questionsParam =
    encodedQuestions ||
    (reviewQuestions.length > 0 ? encodeURIComponent(JSON.stringify(reviewQuestions)) : '');

  const practiceActions = useMemo(() => {
    const items: {
      icon: keyof typeof Ionicons.glyphMap;
      label: string;
      description: string;
      onPress: () => void;
    }[] = [];

    if (practiceAnswers.length > 0 && reviewQuestions.length > 0) {
      items.push({
        icon: 'list-circle-outline',
        label: 'Review answers',
        description: 'See each question with explanations to reinforce learning.',
        onPress: () =>
          router.push({
            pathname: '/practice/quiz-review',
            params: {
              answers: answersParam,
              questions: questionsParam,
              title: practiceTitle,
            },
          }),
      });
    }

    items.push({
      icon: 'refresh-outline',
      label: 'Retake quiz',
      description: 'Run the same practice set again to beat your score.',
      onPress: () => router.replace('/(tabs)/practice'),
    });

    items.push({
      icon: 'flash-outline',
      label: 'Study weak topics',
      description:
        weakCount > 0
          ? `Focus on the ${weakCount} questions you missed in this session.`
          : 'Reinforce this topic with another targeted drill.',
      onPress: () => router.replace('/(tabs)/practice'),
    });

    items.push({
      icon: 'book-outline',
      label: 'Review lessons',
      description: 'Jump into guided lessons to fill any knowledge gaps.',
      onPress: () => router.push('/learning'),
    });

    items.push({
      icon: 'home-outline',
      label: 'Return home',
      description: 'Explore other preparation tools on the dashboard.',
      onPress: () => router.push('/'),
    });

    return items;
  }, [practiceAnswers.length, reviewQuestions.length, answersParam, questionsParam, practiceTitle, weakCount]);

  const mockActions = useMemo(() => {
    const items: {
      icon: keyof typeof Ionicons.glyphMap;
      label: string;
      description: string;
      onPress: () => void;
    }[] = [];

    if (practiceAnswers.length > 0 && reviewQuestions.length > 0) {
      items.push({
        icon: 'list-circle-outline',
        label: 'Review answers',
        description: 'Walk through every question with the official explanations.',
        onPress: () =>
          router.push({
            pathname: '/practice/quiz-review',
            params: {
              answers: answersParam,
              questions: questionsParam,
              title: mockExamTitle,
            },
          }),
      });
    }

    items.push({
      icon: 'repeat-outline',
      label: 'Retake this mock exam',
      description: 'Apply your insights and run the timed session again.',
      onPress: () =>
        router.replace({
          pathname: '/(tabs)/mockexam',
        }),
    });

    const weakestLabel = weakSections[0]?.label;
    items.push({
      icon: 'flash-outline',
      label: 'Study weak topics',
      description: weakestLabel
        ? `Target ${weakestLabel} in practice mode to boost your next attempt.`
        : 'Switch to practice mode for an adaptive revision drill.',
      onPress: () => router.push('/(tabs)/practice'),
    });

    items.push({
      icon: 'analytics-outline',
      label: 'View performance dashboard',
      description: 'Track your readiness and plan the next revision sprint.',
      onPress: () => router.push('/'),
    });

    return items;
  }, [
    practiceAnswers.length,
    reviewQuestions.length,
    answersParam,
    questionsParam,
    mockExamTitle,
    weakSections,
  ]);

  const actions = isMockExam ? mockActions : practiceActions;

  const handlePrimary = () => {
    if (isMockExam) {
      router.replace('/(tabs)');
      return;
    }
    router.replace('/(tabs)/practice');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.85} disabled>
            <Ionicons name="arrow-back" size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading results…</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            <View style={styles.skeletonStatusPill}>
              <Skeleton width={120} height={18} borderRadius={999} />
            </View>
            <Skeleton width={80} height={40} />
            <Skeleton width="60%" height={16} />
            <Skeleton width="80%" height={14} />
          </View>

          <View style={styles.mockInsights}>
            <View style={styles.mockInsightCard}>
              <Skeleton width="50%" height={14} />
              <Skeleton width="70%" height={20} style={styles.skeletonTight} />
              <Skeleton width="60%" height={12} />
            </View>
            <View style={styles.mockInsightCard}>
              <Skeleton width="50%" height={14} />
              <Skeleton width="70%" height={20} style={styles.skeletonTight} />
              <Skeleton width="60%" height={12} />
            </View>
            <View style={styles.mockInsightCard}>
              <Skeleton width="50%" height={14} />
              <Skeleton width="70%" height={20} style={styles.skeletonTight} />
              <Skeleton width="60%" height={12} />
            </View>
          </View>

          <View style={styles.metricsRow}>
            {[0, 1, 2].map((item) => (
              <View key={item} style={styles.metricCard}>
                <Skeleton width={32} height={32} borderRadius={16} />
                <Skeleton width="60%" height={24} style={styles.skeletonTight} />
                <Skeleton width="50%" height={12} />
              </View>
            ))}
          </View>

          <View style={styles.feedbackCard}>
            <Skeleton width="70%" height={18} />
            <Skeleton width="100%" height={60} borderRadius={12} />
          </View>

          <View style={styles.actionsList}>
            {[0, 1, 2].map((item) => (
              <View key={item} style={styles.actionItem}>
                <Skeleton width={32} height={32} borderRadius={16} />
                <View style={styles.skeletonActionCopy}>
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="80%" height={12} />
                </View>
                <Skeleton width={18} height={18} borderRadius={9} />
              </View>
            ))}
          </View>

          <Skeleton width="100%" height={48} borderRadius={16} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handlePrimary} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isMockExam ? `${mockExamTitle} results` : `${practiceTitle} results`}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeaderRow}>
            <View style={[styles.statusPill, { backgroundColor: status.badgeColor }]}>
              <Ionicons name="sparkles" size={16} color={status.badgeTextColor} />
              <Text style={[styles.statusPillText, { color: status.badgeTextColor }]}>{status.title}</Text>
            </View>
            {isMockExam ? (
              examPartLabel ? (
                <View style={styles.summaryTag}>
                  <Ionicons name="layers-outline" size={14} color={Colors.primary.main} />
                  <Text style={styles.summaryTagText}>{examPartLabel}</Text>
                </View>
              ) : null
            ) : (
              <View style={styles.summaryTag}>
                <Ionicons name="book-outline" size={14} color={Colors.primary.main} />
                <Text style={styles.summaryTagText}>{practiceTitle}</Text>
              </View>
            )}
          </View>
          <Text style={styles.scoreNumber}>{scorePercentage}%</Text>
          <Text style={styles.scoreSubheading}>
            {correctAnswers} of {totalQuestions} answers correct
          </Text>
          <Text style={styles.summarySubtitle}>{status.subtitle}</Text>
          {isMockExam && hasScoreDelta && (
            <View
              style={[
                styles.trendPill,
                scoreDeltaValue > 0 && styles.trendPillPositive,
                scoreDeltaValue < 0 && styles.trendPillNegative,
              ]}
            >
              <Ionicons
                name={
                  scoreDeltaValue > 0
                    ? 'trending-up'
                    : scoreDeltaValue < 0
                    ? 'trending-down'
                    : 'remove-outline'
                }
                size={16}
                color={
                  scoreDeltaValue > 0
                    ? Colors.semantic.success
                    : scoreDeltaValue < 0
                    ? Colors.semantic.error
                    : Colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.trendPillText,
                  scoreDeltaValue > 0 && styles.trendTextPositive,
                  scoreDeltaValue < 0 && styles.trendTextNegative,
                ]}
              >
                {scoreDeltaValue === 0
                  ? 'Matches your last attempt'
                  : `${scoreDeltaValue > 0 ? '+' : ''}${scoreDeltaValue} pts vs previous mock`}
              </Text>
            </View>
          )}
          {isMockExam && topStrengths.length > 0 && (
            <View style={styles.summaryChipRow}>
              {topStrengths.map((section) => (
                <View key={section.label} style={styles.summaryChip}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.semantic.success} />
                  <Text style={styles.summaryChipText}>{section.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {isMockExam && (
          <View style={styles.mockInsights}>
            <View style={styles.mockInsightCard}>
              <Ionicons name="stopwatch-outline" size={18} color={Colors.primary.main} />
              <Text style={styles.mockInsightLabel}>Time spent</Text>
              <Text style={styles.mockInsightValue}>{formatDuration(timeTakenSeconds)}</Text>
              {durationSeconds > 0 && (
                <Text style={styles.mockInsightMeta}>
                  {formatDuration(timeRemainingSeconds)} remaining
                </Text>
              )}
            </View>
            <View style={styles.mockInsightCard}>
              <Ionicons name="flag-outline" size={18} color={Colors.semantic.warning} />
              <Text style={styles.mockInsightLabel}>Flagged items</Text>
              <Text style={styles.mockInsightValue}>{flaggedCount}</Text>
              <Text style={styles.mockInsightMeta}>Review them before retaking</Text>
            </View>
            <View style={styles.mockInsightCard}>
              <Ionicons name="clipboard-outline" size={18} color={Colors.semantic.success} />
              <Text style={styles.mockInsightLabel}>Questions answered</Text>
              <Text style={styles.mockInsightValue}>{totalAnswered}</Text>
              <Text style={styles.mockInsightMeta}>
                {unansweredCount > 0 ? `${unansweredCount} unanswered` : 'All attempted'}
              </Text>
            </View>
          </View>
        )}

        {isMockExam && recentSections.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Section breakdown</Text>
              {weakSectionSummary ? (
                <Text style={styles.sectionSubtitle}>Focus on {weakSectionSummary}</Text>
              ) : (
                <Text style={styles.sectionSubtitle}>Great coverage across sections</Text>
              )}
            </View>
            <View style={styles.sectionList}>
              {recentSections.map((section) => {
                const accuracyColor =
                  section.accuracy >= MOCK_PASS_THRESHOLD
                    ? Colors.semantic.success
                    : section.accuracy >= MOCK_PASS_THRESHOLD - 10
                    ? Colors.semantic.warning
                    : Colors.semantic.error;
                return (
                  <View key={section.label} style={styles.sectionRow}>
                    <View style={styles.sectionRowHeader}>
                      <Text style={styles.sectionRowTitle}>{section.label}</Text>
                      <Text style={styles.sectionRowMeta}>
                        {section.correct}/{section.total} correct
                      </Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(Math.max(section.accuracy, 0), 100)}%`,
                            backgroundColor: accuracyColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.sectionRowAccuracy}>{section.accuracy}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Ionicons name="checkbox-outline" size={18} color={Colors.semantic.success} />
            <Text style={styles.metricValue}>{correctAnswers}</Text>
            <Text style={styles.metricLabel}>Correct</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="close-circle-outline" size={18} color={Colors.semantic.error} />
            <Text style={styles.metricValue}>{incorrectAnswers}</Text>
            <Text style={styles.metricLabel}>Incorrect</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="help-circle-outline" size={18} color={Colors.semantic.warning} />
            <Text style={styles.metricValue}>{skippedCount}</Text>
            <Text style={styles.metricLabel}>Skipped</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="time-outline" size={18} color={Colors.primary.main} />
            <Text style={styles.metricValue}>{formatDuration(totalTimeSeconds)}</Text>
            <Text style={styles.metricLabel}>Time taken</Text>
          </View>
        </View>

        {isMockExam && (
          <View style={styles.timeCard}>
            <View style={styles.timeHeader}>
              <Ionicons name="timer-outline" size={18} color={Colors.primary.main} />
              <Text style={styles.timeTitle}>Pace insights</Text>
            </View>
            <View style={styles.timeGrid}>
              <View style={styles.timeMetric}>
                <Text style={styles.timeMetricLabel}>Average per question</Text>
                <Text style={styles.timeMetricValue}>{formatDuration(timeStats.average)}</Text>
              </View>
              <View style={styles.timeMetric}>
                <Text style={styles.timeMetricLabel}>Fastest solve</Text>
                <Text style={styles.timeMetricValue}>{formatDuration(timeStats.fastest)}</Text>
              </View>
              <View style={styles.timeMetric}>
                <Text style={styles.timeMetricLabel}>Slowest solve</Text>
                <Text style={styles.timeMetricValue}>{formatDuration(timeStats.slowest)}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackHeading}>
            {isMockExam ? 'What to do with this attempt' : 'Next steps to focus on'}
          </Text>
          <Text style={styles.feedbackBody}>
            {isMockExam
              ? mockFeedbackCopy
              : 'Target any numeracy conversions or clinical scenarios that slowed you down. Reviewing the corresponding lessons before your next attempt will lift your score above the 80% threshold.'}
          </Text>
        </View>

        {isMockExam && (
          <View style={styles.historyCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent mock attempts</Text>
            </View>
            {historyLoading ? (
              <View style={styles.historySkeletonList}>
                {[0, 1, 2].map((item) => (
                  <View key={item} style={styles.historySkeletonRow}>
                    <Skeleton width="40%" height={14} />
                    <Skeleton width="60%" height={12} />
                  </View>
                ))}
              </View>
            ) : historyList.length === 0 ? (
              <Text style={styles.emptyHistoryText}>No previous attempts logged yet.</Text>
            ) : (
              <View style={styles.historyList}>
                {historyList.map((entry) => {
                  const entryTitle = entry.examTitle || 'Mock exam';
                  const delta = scorePercentage - entry.scorePercentage;
                  const deltaRounded = Math.round(delta);
                  const deltaLabel =
                    deltaRounded === 0 ? '—' : `${deltaRounded > 0 ? '+' : ''}${deltaRounded} pts`;
                  const pass = entry.scorePercentage >= MOCK_PASS_THRESHOLD;
                  const deltaStyle =
                    deltaRounded > 0
                      ? styles.historyDeltaPositive
                      : deltaRounded < 0
                      ? styles.historyDeltaNegative
                      : styles.historyDeltaNeutral;
                  return (
                    <View key={entry.sessionId} style={styles.historyRow}>
                      <View style={styles.historyMeta}>
                        <Text style={styles.historyTitle}>{entryTitle}</Text>
                        <Text style={styles.historySubtitle}>
                          {formatExamDate(entry.completedAt)} ·{' '}
                          {entry.examPart === 'part_a' ? 'Part A' : 'Part B'}
                        </Text>
                      </View>
                      <View style={styles.historyScore}>
                        <Ionicons
                          name={pass ? 'checkmark-circle' : 'alert-circle'}
                          size={18}
                          color={pass ? Colors.semantic.success : Colors.semantic.warning}
                        />
                        <Text style={styles.historyScoreValue}>{entry.scorePercentage}%</Text>
                        <Text style={[styles.historyDelta, deltaStyle]}>{deltaLabel}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <View style={styles.actionsList}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionItem}
              onPress={action.onPress}
              activeOpacity={0.85}
            >
              <View style={styles.actionIconWrap}>
                <Ionicons name={action.icon} size={18} color={Colors.primary.main} />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionLabel}>{action.label}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            !isMockExam && scorePercentage < PRACTICE_PASS_THRESHOLD && styles.primaryButtonSecondary,
          ]}
          onPress={handlePrimary}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>
            {isMockExam ? 'Return to dashboard' : scorePercentage >= PRACTICE_PASS_THRESHOLD ? 'Start a new topic' : 'Try again now'}
          </Text>
          <Ionicons
            name={isMockExam ? 'analytics-outline' : scorePercentage >= PRACTICE_PASS_THRESHOLD ? 'compass-outline' : 'refresh-outline'}
            size={18}
            color={Colors.text.inverse}
          />
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    gap: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 24,
    alignItems: 'flex-start',
    gap: 16,
    ...DesignSystem.platformShadows.sm,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  scoreNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
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
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
  },
  trendPillPositive: {
    backgroundColor: '#ECFDF5',
  },
  trendPillNegative: {
    backgroundColor: '#FEF3F2',
  },
  trendPillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  trendTextPositive: {
    color: Colors.semantic.success,
  },
  trendTextNegative: {
    color: Colors.semantic.error,
  },
  summaryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    alignSelf: 'flex-start',
  },
  summaryTagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.primary.main,
  },
  summaryChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
  },
  summaryChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.semantic.success,
  },
  sectionCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 20,
    gap: 16,
    ...DesignSystem.platformShadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  sectionList: {
    gap: 14,
  },
  sectionRow: {
    gap: 10,
  },
  sectionRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionRowTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.primary,
  },
  sectionRowMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.background.secondary,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionRowAccuracy: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  mockInsights: {
    flexDirection: 'row',
    gap: 12,
  },
  mockInsightCard: {
    flex: 1,
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 16,
    gap: 6,
    ...DesignSystem.platformShadows.sm,
  },
  mockInsightLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  mockInsightValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  mockInsightMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  skeletonStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skeletonTight: {
    marginTop: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.ui.border,
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
    textAlign: 'center',
  },
  timeCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 20,
    gap: 16,
    ...DesignSystem.platformShadows.sm,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeMetric: {
    flexBasis: '30%',
    minWidth: 120,
    gap: 4,
  },
  timeMetricLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  timeMetricValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
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
  historyCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 20,
    gap: 16,
    ...DesignSystem.platformShadows.sm,
  },
  historySkeletonList: {
    gap: 12,
  },
  historySkeletonRow: {
    gap: 8,
  },
  historyList: {
    gap: 14,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  historyMeta: {
    flex: 1,
    gap: 4,
  },
  historyTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.primary,
  },
  historySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  historyScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyScoreValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
  },
  historyDelta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  historyDeltaPositive: {
    color: Colors.semantic.success,
  },
  historyDeltaNegative: {
    color: Colors.semantic.error,
  },
  historyDeltaNeutral: {
    color: Colors.text.tertiary,
  },
  emptyHistoryText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  actionsList: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
    gap: 12,
    ...DesignSystem.platformShadows.sm,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  actionCopy: {
    flex: 1,
    gap: 4,
  },
  skeletonActionCopy: {
    flex: 1,
    gap: 8,
  },
  actionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
  },
  actionDescription: {
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
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: Colors.primary.main,
  },
  primaryButtonSecondary: {
    backgroundColor: Colors.semantic.warning,
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.inverse,
  },
});
