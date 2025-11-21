import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, DesignSystem } from '@/constants/DesignSystem';
import { useMockExamQuestions, useStartMockExam } from '@/hooks/usePractice';
import { PracticeAnswer, submitMockExam } from '@/api/practice';
import { useAuth } from '@/context/AuthContext';
import { MOCK_EXAM_CONFIG } from '@/api/constants';
import {
  clearMockExamSnapshot,
  loadMockExamSnapshot,
  saveMockExamSnapshot,
  type MockExamSnapshot,
} from '@/utils/mockExamProgress';
import { saveMockExamResultLocal } from '@/utils/mockExamResults';

type ExamPart = 'part_a' | 'part_b';

interface OptionChipProps {
  label: string;
  selected: boolean;
  submitted: boolean;
  disabled: boolean;
  isCorrect?: boolean;
  onPress: () => void;
}

function OptionChip({ label, selected, submitted, disabled, isCorrect, onPress }: OptionChipProps) {
  const stateStyles = useMemo(() => {
    if (!submitted) {
      return {
        container: [styles.optionChip, selected && styles.optionChipSelected],
        text: [styles.optionLabel, selected && styles.optionLabelSelected],
        icon: selected ? 'radio-button-on' : 'radio-button-off',
        iconColor: selected ? Colors.primary.main : Colors.text.tertiary,
      };
    }

    if (isCorrect) {
      return {
        container: [styles.optionChip, styles.optionChipCorrect],
        text: [styles.optionLabel, styles.optionLabelCorrect],
        icon: 'checkmark-circle',
        iconColor: Colors.semantic.success,
      };
    }

    if (selected && !isCorrect) {
      return {
        container: [styles.optionChip, styles.optionChipIncorrect],
        text: [styles.optionLabel, styles.optionLabelIncorrect],
        icon: 'close-circle',
        iconColor: Colors.semantic.error,
      };
    }

    return {
      container: [styles.optionChip],
      text: [styles.optionLabel],
      icon: 'radio-button-off',
      iconColor: Colors.text.tertiary,
    };
  }, [selected, submitted, isCorrect]);

  return (
    <TouchableOpacity
      style={stateStyles.container}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={stateStyles.text}>{label}</Text>
      <Ionicons name={stateStyles.icon as any} size={20} color={stateStyles.iconColor} />
    </TouchableOpacity>
  );
}

export default function MockExamSessionScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    title?: string;
    duration?: string;
    questionCount?: string;
    examPart?: string;
    resumeExamId?: string;
  }>();
  const examPart: ExamPart =
    params.examPart === 'part_b' || params.examPart === 'part_a' ? (params.examPart as ExamPart) : 'part_a';
  const config = examPart === 'part_a' ? MOCK_EXAM_CONFIG.PART_A : MOCK_EXAM_CONFIG.PART_B;
  const examTitle = params.title ?? config.title;
  const durationMinutes = Number(params.duration ?? config.durationMinutes);
  const totalSeconds = durationMinutes * 60;
  const resumeExamId = params.resumeExamId ?? null;

  const { user } = useAuth();
  const { data: questions, isLoading, error } = useMockExamQuestions(examPart);
  const startMockExamMutation = useStartMockExam();

  const [examId, setExamId] = useState<string | null>(resumeExamId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | number | null>(null);
  const [answers, setAnswers] = useState<PracticeAnswer[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState<string>(new Date().toISOString());
  const [hydrated, setHydrated] = useState(false);
  const [snapshotEnabled, setSnapshotEnabled] = useState(false);
  const [legacyExamId, setLegacyExamId] = useState<number | null>(null);
  const [navigatorVisible, setNavigatorVisible] = useState(false);
  const [calculatorVisible, setCalculatorVisible] = useState(false);
  const [calculatorExpression, setCalculatorExpression] = useState<string>('');
  const [calculatorResult, setCalculatorResult] = useState<string>('0');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalQuestions = questions?.length ?? 0;
  const currentQuestion = totalQuestions > 0 ? questions?.[currentIndex] : null;

  // Hydrate from snapshot if present
  useEffect(() => {
    const hydrate = async () => {
      if (!user?.id) {
        setHydrated(true);
        return;
      }

      const snapshot = await loadMockExamSnapshot(user.id);
      if (snapshot && snapshot.examPart === examPart) {
        setExamId(snapshot.examId);
        setAnswers(snapshot.state.answers || []);
        setFlaggedQuestions(new Set(snapshot.state.flaggedQuestionIds || []));
        setCurrentIndex(snapshot.state.currentIndex || 0);
        setSelectedOptionId(snapshot.state.selectedOptionId ?? null);
        setSubmitted(Boolean(snapshot.state.submitted));
        setTimeLeft(snapshot.state.timeLeft > 0 ? snapshot.state.timeLeft : totalSeconds);
        setElapsedSeconds(snapshot.state.elapsedSeconds || 0);
        setStartedAt(snapshot.startedAt || new Date().toISOString());
        setLegacyExamId(
          typeof snapshot.legacyExamId === 'number' ? snapshot.legacyExamId : null,
        );
      }
      setHydrated(true);
    };
    hydrate();
  }, [user?.id, examPart, totalSeconds]);

  // Clamp index when questions arrive
  useEffect(() => {
    if (!questions) return;
    setCurrentIndex((prev) => Math.min(prev, Math.max(questions.length - 1, 0)));
  }, [questions]);

  // Create a new mock exam session if one doesn't already exist
  useEffect(() => {
    if (!hydrated || !questions || !user?.id) return;

    if (examId) {
      setSnapshotEnabled(true);
      return;
    }

    startMockExamMutation
      .mutateAsync({
        userId: user.id,
        examPart,
        totalQuestions: questions.length,
      })
      .then((session) => {
        setExamId(session.id);
        setLegacyExamId(
          typeof session.legacy_exam_id === 'number' ? session.legacy_exam_id : null,
        );
        setStartedAt(new Date().toISOString());
        setSnapshotEnabled(true);
      })
      .catch((err) => {
        console.error('Failed to create mock exam session:', err);
        Alert.alert('Unable to start exam', 'Please try again shortly.');
        router.back();
      });
  }, [hydrated, questions, user?.id, examId, examPart, startMockExamMutation]);

  // Persist snapshot whenever state changes
  useEffect(() => {
    if (!snapshotEnabled || !user?.id || !examId || !questions || questions.length === 0) return;

    const snapshot: MockExamSnapshot = {
      examId,
      examPart,
      examTitle,
      durationMinutes,
      questionCount: questions.length,
      startedAt,
      legacyExamId,
      state: {
        currentIndex,
        selectedOptionId,
        submitted,
        answers,
        flaggedQuestionIds: Array.from(flaggedQuestions),
        timeLeft,
        elapsedSeconds,
      },
    };
    saveMockExamSnapshot(user.id, snapshot);
  }, [
    snapshotEnabled,
    user?.id,
    examId,
    examPart,
    examTitle,
    durationMinutes,
    questions,
    questions?.length,
    currentIndex,
    selectedOptionId,
    submitted,
    answers,
    flaggedQuestions,
    timeLeft,
    elapsedSeconds,
    startedAt,
    legacyExamId,
  ]);

  const formatClock = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const recordAnswer = useCallback(
    (optionId: string | number) => {
      if (!currentQuestion) return;
      const isCorrect =
        currentQuestion.question_options?.find((opt) => opt.id === optionId)?.is_correct ?? false;
      setAnswers((prev) => {
        const next = prev.filter((ans) => ans.questionId !== currentQuestion.id);
        next.push({
          questionId: currentQuestion.id,
          selectedOptionId: optionId,
          isCorrect,
          timeTaken: totalSeconds - timeLeft,
        });
        return next;
      });
    },
    [currentQuestion, timeLeft, totalSeconds],
  );

  const handleExamFinish = useCallback(
    async (timeExpired: boolean = false) => {
      try {
        if (!questions || !examId) return;
        if (!timeExpired && !submitted) {
          Alert.alert('Submit answer', 'Please submit the current answer before finishing.');
          return;
        }
        if (!timeExpired && submitted && selectedOptionId) {
          recordAnswer(selectedOptionId);
        }

        const answered = answers.length;
        const correct = answers.filter((ans) => ans.isCorrect).length;
        const score = Math.round((correct / Math.max(totalQuestions, 1)) * 100);
        const timeSpent = Math.min(elapsedSeconds, totalSeconds);

        await submitMockExam(examId, {
          examPart,
          score,
          totalQuestions,
          correctAnswers: correct,
          timeTakenSeconds: timeSpent,
          answers,
          legacyExamId,
        });

        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setSnapshotEnabled(false);
        if (user?.id) {
          await clearMockExamSnapshot(user.id);
          const reviewPayload =
            questions?.map((question) => ({
              id: question.id,
              question_text: question.question_text,
              explanation: question.explanation,
              correct_answer_id:
                question.question_options?.find((option) => option.is_correct)?.id ?? null,
              category: question.category ?? null,
              subdivision: question.subdivision ?? null,
              question_options: question.question_options?.map((option) => ({
                id: option.id,
                option_text: option.option_text,
                is_correct: option.is_correct,
              })),
            })) ?? [];
          await saveMockExamResultLocal(user.id, {
            sessionId: examId,
            examPart,
            examTitle,
            completedAt: new Date().toISOString(),
            scorePercentage: score,
            totalQuestions,
            correctAnswers: correct,
            timeTakenSeconds: timeSpent,
            durationMinutes,
            flaggedCount: flaggedQuestions.size,
            answers,
            questions: reviewPayload,
          });
        }
        setLegacyExamId(null);

        router.replace({
          pathname: '/practice/results',
          params: {
            isMockExam: 'true',
            sessionId: examId,
            correct: String(correct),
            total: String(totalQuestions),
            score: String(score),
            timeTaken: String(timeSpent),
            duration: String(durationMinutes),
            flagged: String(flaggedQuestions.size),
            answered: String(answered),
            examPart: String(examPart),
            examTitle: examTitle,
          },
        });
      } catch (err) {
        console.error('Mock exam submission failed:', err);
        Alert.alert(
          'Unable to submit exam',
          'Please check your connection and try finishing again. Your progress is saved locally.',
        );
      }
    },
    [
      answers,
      durationMinutes,
      elapsedSeconds,
      examId,
      examPart,
      flaggedQuestions,
      examTitle,
      legacyExamId,
      questions,
      recordAnswer,
      selectedOptionId,
      submitted,
      totalQuestions,
      totalSeconds,
      user?.id,
    ],
  );

  // Countdown timer
  useEffect(() => {
    if (!examId || !questions || questions.length === 0 || !snapshotEnabled) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          handleExamFinish(true);
          return 0;
        }
        return prev - 1;
      });
      setElapsedSeconds((prev) => prev + 1);
    }, 1000) as unknown as NodeJS.Timeout;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [examId, questions, questions?.length, snapshotEnabled, handleExamFinish]);

  const hydrateQuestionState = (index: number) => {
    if (!questions) return;
    const question = questions[index];
    if (!question) {
      setSelectedOptionId(null);
      setSubmitted(false);
      return;
    }
    const existing = answers.find((ans) => String(ans.questionId) === String(question.id));
    setSelectedOptionId(existing?.selectedOptionId ?? null);
    setSubmitted(Boolean(existing));
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId) {
      Alert.alert('Select an option', 'Choose an answer before continuing.');
      return;
    }
    if (!submitted) {
      recordAnswer(selectedOptionId);
      setSubmitted(true);
    }
  };

  const handleNextQuestion = () => {
    if (!submitted) {
      Alert.alert('Check answer first', 'Submit your answer before moving forward.');
      return;
    }
    if (!questions) return;

    if (currentIndex === questions.length - 1) {
      handleExamFinish();
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    hydrateQuestionState(nextIndex);
  };

  const handlePreviousQuestion = () => {
    if (!questions || currentIndex === 0) return;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    hydrateQuestionState(prevIndex);
  };

  const toggleFlag = () => {
    if (!currentQuestion) return;
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      const key = String(currentQuestion.id);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleOpenNavigator = () => setNavigatorVisible(true);
  const handleCloseNavigator = () => setNavigatorVisible(false);

  const handleJumpToQuestion = (index: number) => {
    handleCloseNavigator();
    setCurrentIndex(index);
    hydrateQuestionState(index);
  };

  const handleReviewFlagged = () => {
    if (questionStatuses.length === 0) return;
    const flaggedIndex = questionStatuses.findIndex((status) => status.isFlagged);
    if (flaggedIndex >= 0) {
      setCurrentIndex(flaggedIndex);
      hydrateQuestionState(flaggedIndex);
      setNavigatorVisible(false);
    }
  };

  const calculatorButtons = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', 'C', '+'],
  ];

  const applyCalculatorInput = (value: string) => {
    if (value === 'C') {
      setCalculatorExpression('');
      setCalculatorResult('0');
      return;
    }
    setCalculatorExpression((prev) => prev + value);
  };

  const handleCalculatorBackspace = () => {
    setCalculatorExpression((prev) => prev.slice(0, -1));
  };

  const evaluateCalculator = () => {
    const sanitized = calculatorExpression.replace(/[^0-9+\-*/.()]/g, '');
    if (!sanitized) {
      setCalculatorResult('0');
      return;
    }
    try {
      const fn = new Function(`return (${sanitized})`);
      const result = fn();
      if (Number.isFinite(result)) {
        setCalculatorResult(String(result));
      } else {
        setCalculatorResult('Error');
      }
    } catch (err) {
      console.error('Calculator error:', err);
      setCalculatorResult('Error');
    }
  };

  const flagged = flaggedQuestions.has(String(currentQuestion?.id ?? ''));
  const submittedAnswer = answers.find((ans) => ans.questionId === currentQuestion?.id);
  const progressRatio = totalQuestions > 0 ? (currentIndex + 1) / totalQuestions : 0;
  const correctCount = useMemo(
    () => answers.reduce((count, entry) => (entry.isCorrect ? count + 1 : count), 0),
    [answers],
  );
  const answeredMap = useMemo(() => {
    const map = new Map<string, PracticeAnswer>();
    answers.forEach((entry) => {
      map.set(String(entry.questionId), entry);
    });
    return map;
  }, [answers]);

  const questionStatuses = useMemo(() => {
    return (questions ?? []).map((question, index) => {
      const key = String(question.id);
      const answeredEntry = answeredMap.get(key);
      const isCurrent = index === currentIndex;
      const isFlagged = flaggedQuestions.has(key);
      return {
        key,
        isCurrent,
        isFlagged,
        answered: Boolean(answeredEntry),
        correct: answeredEntry?.isCorrect ?? false,
      };
    });
  }, [questions, answeredMap, flaggedQuestions, currentIndex]);
  const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

  if (isLoading || !hydrated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.centerText}>Preparing your mock exam…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !questions || questions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centerState}>
          <Ionicons name="alert-circle" size={42} color={Colors.semantic.error} />
          <Text style={styles.centerTitle}>Unable to load mock exam</Text>
          <Text style={styles.centerText}>Please try again later.</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{examTitle}</Text>
          <Text style={styles.headerMeta}>
            Question {currentIndex + 1} of {totalQuestions}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.headerTimer}>
            <Ionicons
              name={timeLeft < 60 ? 'flash-outline' : 'timer-outline'}
              size={18}
              color={timeLeft < 60 ? Colors.semantic.error : Colors.primary.main}
            />
            <Text
              style={[
                styles.timerLabel,
                timeLeft < 60 && { color: Colors.semantic.error, fontWeight: '600' },
              ]}
            >
              {formatClock(timeLeft)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleOpenNavigator}
            activeOpacity={0.85}
            accessibilityLabel="Open question navigator"
          >
            <Ionicons name="grid-outline" size={18} color={Colors.text.primary} />
          </TouchableOpacity>
          {examPart === 'part_a' && (
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => setCalculatorVisible(true)}
              activeOpacity={0.85}
              accessibilityLabel="Open calculator"
            >
              <Ionicons name="calculator-outline" size={18} color={Colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
        </View>
        <View style={styles.progressMetaRow}>
          <View style={styles.progressMetaItem}>
            <Ionicons name="stats-chart" size={16} color={Colors.semantic.success} />
            <Text style={styles.progressMetaText}>{answers.length}/{totalQuestions} answered</Text>
          </View>
          <View style={styles.progressMetaItem}>
            <Ionicons name="checkmark-done" size={16} color={Colors.primary.main} />
            <Text style={styles.progressMetaText}>{accuracy}% accuracy</Text>
          </View>
          <View style={styles.progressMetaItem}>
            <Ionicons name="flag-outline" size={16} color={Colors.semantic.warning} />
            <Text style={styles.progressMetaText}>{flaggedQuestions.size} flagged</Text>
          </View>
        </View>
        {flaggedQuestions.size > 0 && (
          <TouchableOpacity style={styles.reviewFlaggedButton} onPress={handleReviewFlagged} activeOpacity={0.85}>
            <Ionicons name="flag" size={14} color={Colors.semantic.warning} />
            <Text style={styles.reviewFlaggedText}>Review flagged</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionLabel}>Question {currentIndex + 1}</Text>
            <TouchableOpacity
              style={[styles.flagButton, flagged && styles.flagButtonActive]}
              onPress={toggleFlag}
              activeOpacity={0.85}
            >
              <Ionicons
                name={flagged ? 'flag' : 'flag-outline'}
                size={16}
                color={flagged ? Colors.semantic.warning : Colors.text.secondary}
              />
              <Text
                style={[
                  styles.flagButtonLabel,
                  flagged && { color: Colors.semantic.warning },
                ]}
              >
                {flagged ? 'Flagged' : 'Flag'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.questionBody}>{currentQuestion?.question_text}</Text>
        </View>

        <View style={styles.optionsStack}>
          {currentQuestion?.question_options?.map((option) => (
            <OptionChip
              key={option.id}
              label={option.option_text}
              selected={selectedOptionId === option.id}
              submitted={submitted}
              disabled={submitted}
              isCorrect={option.is_correct}
              onPress={() => setSelectedOptionId(option.id)}
            />
          ))}
        </View>

        {submittedAnswer && (
          <View style={styles.feedbackCard}>
            <Ionicons
              name={submittedAnswer.isCorrect ? 'checkmark-circle' : 'close-circle'}
              size={22}
              color={submittedAnswer.isCorrect ? Colors.semantic.success : Colors.semantic.error}
            />
            <View style={styles.feedbackCopy}>
              <Text style={styles.feedbackTitle}>
                {submittedAnswer.isCorrect ? 'Correct' : 'Review needed'}
              </Text>
              <Text style={styles.feedbackSubtitle}>
                {submittedAnswer.isCorrect
                  ? 'Great pace—lock in the method before moving on.'
                  : 'Note the model answer; revisit this scenario after you finish.'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity
          style={[styles.footerButton, currentIndex === 0 && styles.footerButtonDisabled]}
          onPress={handlePreviousQuestion}
          disabled={currentIndex === 0}
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={currentIndex === 0 ? Colors.text.tertiary : Colors.primary.main}
          />
        </TouchableOpacity>
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={[styles.ctaButton, submitted && styles.ctaButtonDisabled]}
            onPress={handleSubmitAnswer}
            disabled={submitted}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaButtonLabel}>Check</Text>
            <Ionicons name="checkmark" size={18} color={Colors.text.inverse} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.ctaButton,
              styles.ctaButtonPrimary,
              !submitted && styles.ctaButtonDisabled,
            ]}
            onPress={handleNextQuestion}
            disabled={!submitted}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaButtonLabel}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={navigatorVisible} animationType="fade" transparent onRequestClose={handleCloseNavigator}>
        <View style={styles.navigatorBackdrop}>
          <View style={styles.navigatorSheet}>
            <View style={styles.navigatorHeader}>
              <View>
                <Text style={styles.navigatorTitle}>Question navigator</Text>
                <Text style={styles.navigatorSubtitle}>
                  Tap a question to jump directly. Flagged items are highlighted.
                </Text>
              </View>
              <TouchableOpacity style={styles.navigatorClose} onPress={handleCloseNavigator}>
                <Ionicons name="close" size={22} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.navigatorMetaRow}>
              <View style={styles.navigatorMetaItem}>
                <View style={[styles.navigatorStatusDot, styles.navigatorStatusCurrent]} />
                <Text style={styles.navigatorMetaLabel}>Current</Text>
              </View>
              <View style={styles.navigatorMetaItem}>
                <View style={[styles.navigatorStatusDot, styles.navigatorStatusAnswered]} />
                <Text style={styles.navigatorMetaLabel}>Answered</Text>
              </View>
              <View style={styles.navigatorMetaItem}>
                <View style={[styles.navigatorStatusDot, styles.navigatorStatusFlagged]} />
                <Text style={styles.navigatorMetaLabel}>Flagged</Text>
              </View>
            </View>
            <View style={styles.navigatorGrid}>
              {questionStatuses.map((status, index) => (
                <TouchableOpacity
                  key={status.key}
                  style={[
                    styles.navigatorItem,
                    status.answered && styles.navigatorItemAnswered,
                    status.isCurrent && styles.navigatorItemCurrent,
                    status.isFlagged && styles.navigatorItemFlagged,
                  ]}
                  onPress={() => handleJumpToQuestion(index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.navigatorItemText}>{index + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.reviewFlaggedButton, { alignSelf: 'flex-end' }]}
              onPress={handleReviewFlagged}
              activeOpacity={0.85}
              disabled={flaggedQuestions.size === 0}
            >
              <Ionicons
                name="flag"
                size={14}
                color={flaggedQuestions.size === 0 ? Colors.text.tertiary : Colors.semantic.warning}
              />
              <Text
                style={[
                  styles.reviewFlaggedText,
                  flaggedQuestions.size === 0 && { color: Colors.text.tertiary },
                ]}
              >
                Review flagged
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={calculatorVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCalculatorVisible(false)}
      >
        <View style={styles.calculatorBackdrop}>
          <View style={styles.calculatorSheet}>
            <View style={styles.calculatorHeader}>
              <Text style={styles.calculatorTitle}>Calculator</Text>
              <TouchableOpacity
                style={styles.navigatorClose}
                onPress={() => setCalculatorVisible(false)}
              >
                <Ionicons name="close" size={22} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.calculatorDisplay}>
              <Text style={styles.calculatorExpression} numberOfLines={1}>
                {calculatorExpression || '0'}
              </Text>
              <Text style={styles.calculatorResult}>{calculatorResult}</Text>
            </View>
            <View style={styles.calculatorGrid}>
              {calculatorButtons.map((row) => (
                <View style={styles.calculatorRow} key={row.join('-')}>
                  {row.map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[styles.calculatorKey, /[*/+\-/]/.test(value) && styles.calculatorKeyOperator]}
                      onPress={() => applyCalculatorInput(value)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.calculatorKeyText,
                          /[*/+\-/]/.test(value) && styles.calculatorKeyOperatorText,
                          value === 'C' && styles.calculatorKeyDangerText,
                        ]}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
              <View style={styles.calculatorRow}>
                <TouchableOpacity
                  style={styles.calculatorKey}
                  onPress={handleCalculatorBackspace}
                  activeOpacity={0.85}
                >
                  <Ionicons name="arrow-back" size={18} color={Colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.calculatorKey}
                  onPress={() => {
                    setCalculatorExpression('');
                    setCalculatorResult('0');
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.calculatorKeyText, styles.calculatorKeyDangerText]}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calculatorKey, styles.calculatorKeyPrimary]}
                  onPress={evaluateCalculator}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.calculatorKeyText, { color: Colors.text.inverse }]}>=</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 24,
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
  headerInfo: {
    flex: 1,
    marginHorizontal: 12,
    gap: 2,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  headerMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  headerTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.background.secondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  timerLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary.main,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.background.secondary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary.main,
  },
  progressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  progressMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressMetaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  reviewFlaggedButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
  },
  reviewFlaggedText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.semantic.warning,
  },
  questionCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 20,
    gap: 12,
    ...DesignSystem.platformShadows.sm,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.secondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  questionBody: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
  },
  flagButtonActive: {
    backgroundColor: '#FEF3C7',
  },
  flagButtonLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  optionsStack: {
    gap: 12,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    ...DesignSystem.platformShadows.sm,
  },
  optionChipSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: '#EEF2FF',
  },
  optionChipCorrect: {
    borderColor: Colors.semantic.success,
    backgroundColor: '#ECFDF5',
  },
  optionChipIncorrect: {
    borderColor: Colors.semantic.error,
    backgroundColor: '#FEE2E2',
  },
  optionLabel: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  optionLabelSelected: {
    color: Colors.primary.main,
  },
  optionLabelCorrect: {
    color: Colors.semantic.success,
  },
  optionLabelIncorrect: {
    color: Colors.semantic.error,
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
    padding: 16,
    ...DesignSystem.platformShadows.sm,
  },
  feedbackCopy: {
    flex: 1,
    gap: 4,
  },
  feedbackTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
  },
  feedbackSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.secondary,
    flexShrink: 0,
  },
  footerButtonDisabled: {
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.secondary,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.semantic.success,
    flex: 1,
    minWidth: 0,
  },
  ctaButtonPrimary: {
    backgroundColor: Colors.primary.main,
  },
  ctaButtonDisabled: {
    opacity: 0.45,
  },
  ctaButtonLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.inverse,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  centerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  centerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary.main,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.inverse,
  },
  navigatorBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  navigatorSheet: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    padding: 20,
    gap: 18,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
    maxHeight: 520,
    ...DesignSystem.platformShadows.lg,
  },
  navigatorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  navigatorTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  navigatorSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  navigatorClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  navigatorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  navigatorMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navigatorStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.ui.border,
  },
  navigatorStatusCurrent: {
    backgroundColor: Colors.primary.main,
  },
  navigatorStatusAnswered: {
    backgroundColor: Colors.semantic.success,
  },
  navigatorStatusFlagged: {
    backgroundColor: Colors.semantic.warning,
  },
  navigatorMetaLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  navigatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  navigatorItem: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.secondary,
  },
  navigatorItemAnswered: {
    borderColor: Colors.semantic.success,
    backgroundColor: '#ECFDF5',
  },
  navigatorItemCurrent: {
    borderColor: Colors.primary.main,
    backgroundColor: '#EEF2FF',
  },
  navigatorItemFlagged: {
    borderColor: Colors.semantic.warning,
    backgroundColor: '#FEF3C7',
  },
  navigatorItemText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
  },
  calculatorBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  calculatorSheet: {
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 20,
    ...DesignSystem.platformShadows.lg,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calculatorTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  calculatorDisplay: {
    borderRadius: 18,
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  calculatorExpression: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    color: Colors.text.secondary,
    textAlign: 'right',
  },
  calculatorResult: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: Colors.text.primary,
    textAlign: 'right',
  },
  calculatorGrid: {
    gap: 12,
  },
  calculatorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  calculatorKey: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  calculatorKeyOperator: {
    backgroundColor: '#E0E7FF',
  },
  calculatorKeyPrimary: {
    backgroundColor: Colors.primary.main,
  },
  calculatorKeyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  calculatorKeyOperatorText: {
    color: Colors.primary.main,
  },
  calculatorKeyDangerText: {
    color: Colors.semantic.warning,
  },
});
