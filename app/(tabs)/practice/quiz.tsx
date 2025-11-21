import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  startPracticeSession,
  savePracticeResults,
  PracticeAnswer,
  Question as APIQuestion,
} from '@/api/practice';
import { usePracticeQuestions, useLearningQuestions } from '@/hooks/usePractice';
import { useAuth } from '@/context/AuthContext';
import { Colors, DesignSystem } from '@/constants/DesignSystem';
import { Skeleton } from '@/components/ui/Skeleton';

interface QuestionOption {
  id: string;
  option_text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  question_text: string;
  explanation: string;
  correct_answer_id: string;
  question_options: QuestionOption[];
}

interface OptionChipProps {
  option: QuestionOption;
  isSelected: boolean;
  isSubmitted: boolean;
  onSelect: () => void;
}

function OptionChip({ option, isSelected, isSubmitted, onSelect }: OptionChipProps) {
  const statusStyles = useMemo(() => {
    if (!isSubmitted) {
      return {
        container: [styles.optionChip, isSelected && styles.optionChipSelected],
        text: [styles.optionLabel, isSelected && styles.optionLabelSelected],
        icon: isSelected ? 'radio-button-on' : 'radio-button-off',
        iconColor: isSelected ? Colors.primary.main : Colors.text.tertiary,
      };
    }

    if (option.is_correct) {
      return {
        container: [styles.optionChip, styles.optionChipCorrect],
        text: [styles.optionLabel, styles.optionLabelCorrect],
        icon: 'checkmark-circle',
        iconColor: Colors.semantic.success,
      };
    }

    if (isSelected && !option.is_correct) {
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
  }, [isSelected, isSubmitted, option.is_correct]);

  return (
    <TouchableOpacity
      style={statusStyles.container}
      activeOpacity={0.85}
      onPress={onSelect}
      disabled={isSubmitted}
    >
      <Text style={statusStyles.text}>{option.option_text}</Text>
      <Ionicons name={statusStyles.icon as any} size={20} color={statusStyles.iconColor} />
    </TouchableOpacity>
  );
}

export default function PracticeQuizScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ subdivision?: string; category?: string; mode?: string }>();
  const subdivisionParam = typeof params.subdivision === 'string' ? params.subdivision : '';
  const categoryParam = typeof params.category === 'string' ? params.category : '';
  const isLearningMode = params.mode === 'learning';
  const { user } = useAuth();

  const practiceQuery = usePracticeQuestions(subdivisionParam, 20);
  const learningQuery = useLearningQuestions(categoryParam, subdivisionParam || undefined);

  const practiceResults = practiceQuery.data ?? [];
  const learningResults = learningQuery.data ?? [];
  const hasPracticeResults = practiceResults.length > 0;

  const fetchedQuestions = isLearningMode
    ? learningResults
    : hasPracticeResults
    ? practiceResults
    : learningResults;

  const isLoading = isLearningMode
    ? learningQuery.isLoading
    : practiceQuery.isLoading || (!hasPracticeResults && learningQuery.isLoading);

  const queryError = isLearningMode
    ? learningQuery.error
    : hasPracticeResults
    ? practiceQuery.error
    : learningQuery.error ?? practiceQuery.error;
  const quizLabel =
    subdivisionParam || categoryParam || (isLearningMode ? 'Check understanding' : 'Practice set');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string | number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [answers, setAnswers] = useState<PracticeAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (fetchedQuestions && fetchedQuestions.length > 0 && user) {
      const formatted: Question[] = fetchedQuestions.map((q: APIQuestion) => {
        const correct = q.question_options?.find((opt) => opt.is_correct);
        return {
          id: q.id,
          question_text: q.question_text,
          explanation: q.explanation || 'Explanation coming soon from the learning team.',
          correct_answer_id: correct?.id ?? '',
          question_options:
            q.question_options?.map((opt) => ({
              id: opt.id,
              option_text: opt.option_text,
              is_correct: opt.is_correct,
            })) ?? [],
        };
      });

      setQuestions(formatted);
      setSessionElapsed(0);
      setIsFinished(false);
      setQuestionStartTime(Date.now());

      const sessionContext = subdivisionParam ? { subdivision: subdivisionParam } : undefined;

      startPracticeSession(user.id, sessionContext)
        .then((session) => {
          setSessionId(session.id);
          setQuestionStartTime(Date.now());
        })
        .catch((err) => console.error('Failed to create practice session:', err));
    }
  }, [fetchedQuestions, user, subdivisionParam]);

  const correctCount = useMemo(() => answers.filter((r) => r.isCorrect).length, [answers]);
  const accuracy = questions.length
    ? Math.round((correctCount / Math.max(answers.length, 1)) * 100)
    : 0;

  const recordAnswer = useCallback(
    (optionId: string | number) => {
      if (!currentQuestion) return;
      const isCorrect = String(optionId) === String(currentQuestion.correct_answer_id);
      const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          selectedOptionId: optionId,
          isCorrect,
          timeTaken,
        },
      ]);
    },
    [currentQuestion, questionStartTime],
  );

  useEffect(() => {
    if (isLoading || questions.length === 0 || isFinished) {
      return;
    }

    const timer = setInterval(() => {
      setSessionElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, questions.length, isFinished]);

  const handleCheckAnswer = () => {
    if (!selectedOptionId) {
      Alert.alert('Choose an answer', 'Select one option to continue.');
      return;
    }

    if (!isSubmitted) {
      recordAnswer(selectedOptionId);
      setIsSubmitted(true);
    }
  };

  const handleNextQuestion = async () => {
    if (!isSubmitted) {
      return;
    }

    if (currentIndex === questions.length - 1) {
      await handleFinish();
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setQuestionStartTime(Date.now());
  };

  const handleBack = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setQuestionStartTime(Date.now());
    setAnswers((prev) => prev.filter((_, idx) => idx < prev.length - 1));
  };

  const handleFinish = async () => {
    try {
      setIsFinished(true);
      if (sessionId && user) {
        await savePracticeResults(sessionId, answers);
      }

      const totalQuestions = questions.length;
      const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
      const reviewPayload = questions.map((q) => ({
        id: q.id,
        question_text: q.question_text,
        explanation: q.explanation,
        correct_answer_id: q.correct_answer_id,
        question_options: q.question_options,
      }));

      router.replace({
        pathname: '/practice/results',
        params: {
          sessionId: String(sessionId ?? ''),
          correct: String(correctCount),
          total: String(totalQuestions),
          score: String(scorePercentage),
          elapsed: String(sessionElapsed),
          answers: encodeURIComponent(JSON.stringify(answers)),
          questions: encodeURIComponent(JSON.stringify(reviewPayload)),
          subdivision: subdivisionParam,
          category: categoryParam,
        },
      });
    } catch (err) {
      console.error('Error saving practice session:', err);
      Alert.alert('Unable to save results', 'Please check your connection and try again.');
    }
  };

  function handleQuitPractice() {
    const exitPractice = () => {
      setIsFinished(true);
      router.replace('/(tabs)/practice');
    };

    if (answers.length === 0) {
      exitPractice();
      return;
    }

    Alert.alert('Quit practice?', 'Your current progress will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Quit',
        style: 'destructive',
        onPress: exitPractice,
      },
    ]);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.loaderHeader}>
          <Skeleton width="70%" height={24} />
          <Skeleton width="50%" height={16} />
        </View>
        <ScrollView contentContainerStyle={styles.loaderContent}>
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} width="100%" height={140} borderRadius={20} style={styles.loaderSpacer} />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (queryError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centerState}>
          <Ionicons name="alert-circle" size={48} color={Colors.semantic.error} />
          <Text style={styles.errorTitle}>Unable to fetch questions</Text>
          <Text style={styles.centerStateText}>Please try again in a moment.</Text>
          <TouchableOpacity style={styles.pillButton} onPress={() => router.back()}>
            <Text style={styles.pillButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centerState}>
          <Ionicons name="document-text-outline" size={48} color={Colors.text.tertiary} />
          <Text style={styles.errorTitle}>No questions yet</Text>
          <Text style={styles.centerStateText}>More content is on the way for this topic.</Text>
          <TouchableOpacity style={styles.pillButton} onPress={() => router.back()}>
            <Text style={styles.pillButtonText}>Choose another topic</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progressRatio = (currentIndex + 1) / questions.length;
  const latestAnswer = isSubmitted ? answers[answers.length - 1] : null;
  const isCurrentCorrect =
    latestAnswer && latestAnswer.questionId === currentQuestion.id ? latestAnswer.isCorrect : false;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContext}>
          <Text style={styles.headerSubtitle}>{quizLabel}</Text>
          <View style={styles.headerMetaRow}>
            <Text style={styles.headerProgress}>
              Question {currentIndex + 1}/{questions.length}
            </Text>
            <View style={styles.headerMetaPill}>
              <Ionicons name="time-outline" size={14} color={Colors.primary.main} />
              <Text style={styles.headerMetaText}>{formatTime(sessionElapsed)}</Text>
            </View>
            <View style={styles.headerMetaPill}>
              <Ionicons name="stats-chart" size={14} color={Colors.semantic.success} />
              <Text style={styles.headerMetaText}>
                {correctCount}/{answers.length}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.quitButton} onPress={handleQuitPractice} activeOpacity={0.85}>
          <Ionicons name="exit-outline" size={18} color={Colors.text.primary} />
          <Text style={styles.quitButtonText}>Quit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
        </View>
        <View style={styles.progressMetaRow}>
          <View style={styles.progressMetaItem}>
            <Ionicons name="stats-chart" size={16} color={Colors.semantic.success} />
            <Text style={styles.progressMetaText}>{correctCount} correct</Text>
          </View>
          <View style={styles.progressMetaItem}>
            <Ionicons name="trophy-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.progressMetaText}>{accuracy}% accuracy</Text>
          </View>
          <View style={styles.progressMetaItem}>
            <Ionicons name="checkmark-done" size={16} color={Colors.primary.main} />
            <Text style={styles.progressMetaText}>{answers.length}/{questions.length} answered</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionPrompt}>{currentQuestion.question_text}</Text>
          <View style={styles.optionsStack}>
            {currentQuestion.question_options.map((option) => (
              <OptionChip
                key={option.id}
                option={option}
                isSelected={String(selectedOptionId) === String(option.id)}
                isSubmitted={isSubmitted}
                onSelect={() => setSelectedOptionId(option.id)}
              />
            ))}
          </View>
        </View>

        {isSubmitted && (
          <>
            <View
              style={[
                styles.answerOutcomeCard,
                isCurrentCorrect ? styles.answerOutcomeCorrect : styles.answerOutcomeIncorrect,
              ]}
            >
              <Ionicons
                name={isCurrentCorrect ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={isCurrentCorrect ? Colors.semantic.success : Colors.semantic.error}
              />
              <View style={styles.answerOutcomeCopy}>
                <Text style={styles.answerOutcomeTitle}>
                  {isCurrentCorrect ? 'Correct answer' : 'Not quite right'}
                </Text>
                <Text style={styles.answerOutcomeSubtitle}>
                  {isCurrentCorrect
                    ? 'Great work—lock in the concept before moving on.'
                    : 'Review the breakdown below, then try the next one.'}
                </Text>
              </View>
            </View>
            <View style={styles.explanationCard}>
              <Text style={styles.explanationHeading}>Explanation</Text>
              <Text style={styles.explanationBody}>{currentQuestion.explanation}</Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.footerBar, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity
          style={[styles.footerButton, styles.footerSecondary, currentIndex === 0 && styles.footerHidden]}
          onPress={handleBack}
          disabled={currentIndex === 0}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={18} color={Colors.primary.main} />
        </TouchableOpacity>
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.actionButton,
              styles.checkButton,
              (!selectedOptionId || isSubmitted) && styles.footerButtonDisabled,
            ]}
            onPress={handleCheckAnswer}
            disabled={!selectedOptionId || isSubmitted}
            activeOpacity={0.9}
          >
            <Text style={styles.footerPrimaryText}>Check</Text>
            <Ionicons name="checkmark" size={18} color={Colors.text.inverse} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.actionButton,
              styles.nextButton,
              !isSubmitted && styles.footerButtonDisabled,
            ]}
            onPress={handleNextQuestion}
            disabled={!isSubmitted}
            activeOpacity={0.9}
          >
            <Text style={styles.footerPrimaryText}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  centerStateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  pillButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.primary.main,
  },
  pillButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
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
  headerContext: {
    flex: 1,
    marginHorizontal: 12,
    gap: 6,
  },
  headerSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  headerProgress: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
  },
  headerMetaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.primary,
  },
  quitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: Colors.background.secondary,
  },
  quitButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.primary,
  },
  loaderHeader: {
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 12,
  },
  loaderContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  loaderSpacer: {
    marginTop: 16,
  },
  progressCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    ...DesignSystem.platformShadows.sm,
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
    justifyContent: 'space-between',
    gap: 12,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  questionCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 18,
    padding: 20,
    gap: 18,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    ...DesignSystem.platformShadows.sm,
  },
  questionPrompt: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  optionsStack: {
    gap: 12,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.ui.border,
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
    marginRight: 12,
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
  explanationCard: {
    marginTop: 20,
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 18,
    gap: 8,
  },
  explanationHeading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.primary.main,
  },
  explanationBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  answerOutcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
  },
  answerOutcomeCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  answerOutcomeIncorrect: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  answerOutcomeCopy: {
    flex: 1,
    gap: 4,
  },
  answerOutcomeTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
  },
  answerOutcomeSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: Colors.background.card,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    ...DesignSystem.platformShadows.sm,
  },
  footerSecondary: {
    borderWidth: 1,
    borderColor: Colors.primary.main,
    backgroundColor: '#F1F5F9',
  },
  footerHidden: {
    opacity: 0,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  checkButton: {
    backgroundColor: Colors.semantic.success,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
  },
  nextButton: {
    backgroundColor: Colors.primary.main,
  },
  footerPrimaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.inverse,
  },
  footerButtonDisabled: {
    opacity: 0.5,
  },
});
