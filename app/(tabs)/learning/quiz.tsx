import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuestionsByLesson, useLearningQuestions } from '@/hooks/usePractice';
import { markLessonComplete } from '@/api/learning';
import { Colors, DesignSystem } from '@/constants/DesignSystem';
import { Skeleton } from '@/components/ui/Skeleton';

const PASS_THRESHOLD = 80;

type LessonQuizParams = {
  lessonId?: string;
  lessonTitle?: string;
  category?: string;
  subdivision?: string;
};

type LessonQuestion = {
  id: string;
  question_text: string;
  question_options?: {
    id: string;
    option_text: string;
    is_correct: boolean;
  }[];
  explanation?: string;
};

type LessonAnswer = {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
};

type LessonOption = NonNullable<LessonQuestion['question_options']>[number];

export default function LessonQuizScreen() {
  const params = useLocalSearchParams<LessonQuizParams>();
  const lessonId = params.lessonId ?? '';
  const lessonTitle = params.lessonTitle ?? 'Lesson quiz';
  const categoryParam =
    typeof params.category === 'string' && params.category.length > 0 ? params.category : '';
  const subdivisionParam =
    typeof params.subdivision === 'string' && params.subdivision.length > 0
      ? params.subdivision
      : '';

  const { data: fetchedQuestions, isLoading, error } = useQuestionsByLesson(lessonId);
  const {
    data: fallbackData,
    isLoading: fallbackLoading,
    error: fallbackError,
  } = useLearningQuestions(categoryParam, subdivisionParam || undefined);

  const lessonQuestions: LessonQuestion[] = useMemo(
    () =>
      (fetchedQuestions ?? []).map((q) => ({
        id: q.id,
        question_text: q.question_text,
        question_options: q.question_options ?? [],
        explanation: q.explanation ?? 'Keep reviewing the lesson content to deepen your understanding.',
      })),
    [fetchedQuestions],
  );

  const fallbackQuestions: LessonQuestion[] = useMemo(() => {
    if (!fallbackData || fallbackData.length === 0) {
      return [];
    }
    return fallbackData.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      question_options: q.question_options ?? [],
      explanation: q.explanation ?? 'Review the lesson notes before retrying this scenario.',
    }));
  }, [fallbackData]);

  const questionsSource = lessonQuestions.length > 0 ? lessonQuestions : fallbackQuestions;
  const isFetching = isLoading || (lessonQuestions.length === 0 && categoryParam && fallbackLoading);
  const questionError =
    error ||
    (lessonQuestions.length === 0 && categoryParam ? fallbackError : undefined);

  const questions = questionsSource;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState<LessonAnswer[]>([]);

  const currentQuestion = questions[currentIndex];
  const correctCount = answers.filter((a) => a.isCorrect).length;

  const handleSelectOption = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion || !selectedOptionId) return;

    const isCorrect =
      currentQuestion.question_options?.some(
        (opt) => opt.id === selectedOptionId && opt.is_correct,
      ) ?? false;

    setAnswers((prev) => {
      const existing = prev.find((entry) => entry.questionId === currentQuestion.id);
      if (existing) {
        return prev.map((entry) =>
          entry.questionId === currentQuestion.id
            ? { ...entry, selectedOptionId, isCorrect }
            : entry,
        );
      }
      return [
        ...prev,
        {
          questionId: currentQuestion.id,
          selectedOptionId,
          isCorrect,
        },
      ];
    });

    setIsSubmitted(true);
  };

  const goToResults = async (totalQuestions: number, totalCorrect: number) => {
    const percentage = Math.round((totalCorrect / Math.max(totalQuestions, 1)) * 100);

    if (percentage >= PASS_THRESHOLD) {
      await markLessonComplete(lessonId);
    }

    router.replace({
      pathname: '/learning/quiz-results',
      params: {
        lessonId,
        lessonTitle,
        correct: String(totalCorrect),
        total: String(totalQuestions),
        score: String(percentage),
        answers: encodeURIComponent(JSON.stringify(answers)),
        passed: percentage >= PASS_THRESHOLD ? 'true' : 'false',
        category: categoryParam,
        subdivision: subdivisionParam,
      },
    });
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    if (!isSubmitted) {
      Alert.alert('Check your answer', 'Please check your answer before continuing.');
      return;
    }

    if (currentIndex === questions.length - 1) {
      goToResults(questions.length, correctCount);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOptionId(null);
    setIsSubmitted(false);
  };

  const renderOption = (option: LessonOption) => {
    const isSelected = selectedOptionId === option.id;
    const hasResult = isSubmitted;
    const isCorrect = option.is_correct;
    const showCorrect = hasResult && isCorrect;
    const showIncorrectSelection = hasResult && isSelected && !isCorrect;

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.optionCard,
          isSelected && !hasResult && styles.optionCardSelected,
          showCorrect && styles.optionCardCorrect,
          showIncorrectSelection && styles.optionCardIncorrect,
        ]}
        activeOpacity={0.85}
        onPress={() => handleSelectOption(option.id)}
        disabled={hasResult}
      >
        <Text
          style={[
            styles.optionLabel,
            isSelected && !hasResult && styles.optionLabelSelected,
            showCorrect && styles.optionLabelCorrect,
            showIncorrectSelection && styles.optionLabelIncorrect,
          ]}
        >
          {option.option_text}
        </Text>
        <Ionicons
          name={
            showCorrect
              ? 'checkmark-circle'
              : showIncorrectSelection
              ? 'close-circle'
              : isSelected
              ? 'radio-button-on'
              : 'radio-button-off'
          }
          size={20}
          color={
            showCorrect
              ? Colors.semantic.success
              : showIncorrectSelection
              ? Colors.semantic.error
              : isSelected
              ? Colors.primary.main
              : Colors.text.tertiary
          }
        />
      </TouchableOpacity>
    );
  };

  if (isFetching) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{lessonTitle}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <ScrollView contentContainerStyle={styles.loadingContent}>
          <Skeleton width="80%" height={24} />
          <Skeleton width="60%" height={16} style={styles.skeletonSpacer} />
          {[0, 1, 2].map((item) => (
            <Skeleton
              key={item}
              width="100%"
              height={56}
              borderRadius={16}
              style={styles.skeletonSpacer}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (questionError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{lessonTitle}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="alert-circle" size={48} color={Colors.semantic.error} />
          <Text style={styles.emptyTitle}>Unable to load quiz</Text>
          <Text style={styles.emptySubtitle}>Please check your connection and try again.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()} activeOpacity={0.9}>
            <Text style={styles.primaryButtonText}>Go back</Text>
            <Ionicons name="arrow-back" size={18} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{lessonTitle}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="information-circle" size={48} color={Colors.primary.main} />
          <Text style={styles.emptyTitle}>Quiz coming soon</Text>
          <Text style={styles.emptySubtitle}>
            We’re curating assessment items for this lesson. Check back after the next content update.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()} activeOpacity={0.9}>
            <Text style={styles.primaryButtonText}>Go back</Text>
            <Ionicons name="arrow-back" size={18} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalQuestions = questions.length;
  const progressLabel = `Question ${currentIndex + 1}/${totalQuestions}`;
  const percentage = (correctCount / Math.max(totalQuestions, 1)) * 100;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContext}>
          <Text style={styles.headerProgress}>{progressLabel}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {lessonTitle}
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionLabel}>Question {currentIndex + 1}</Text>
            <Text style={styles.scoreLabel}>{Math.round(percentage)}% mastery</Text>
          </View>
          <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
        </View>

        <View style={styles.optionsStack}>
          {(currentQuestion.question_options ?? []).map(renderOption)}
        </View>

        {isSubmitted && (
          <View
            style={[
              styles.feedbackCard,
              answers.find((a) => a.questionId === currentQuestion.id)?.isCorrect
                ? styles.feedbackCardSuccess
                : styles.feedbackCardError,
            ]}
          >
            <View style={styles.feedbackHeader}>
              <Ionicons
                name={
                  answers.find((a) => a.questionId === currentQuestion.id)?.isCorrect
                    ? 'checkmark-circle'
                    : 'close-circle'
                }
                size={20}
                color={
                  answers.find((a) => a.questionId === currentQuestion.id)?.isCorrect
                    ? Colors.semantic.success
                    : Colors.semantic.error
                }
              />
              <Text style={styles.feedbackTitle}>
                {answers.find((a) => a.questionId === currentQuestion.id)?.isCorrect
                  ? 'Correct'
                  : 'Not quite right'}
              </Text>
            </View>
            <Text style={styles.feedbackBody}>{currentQuestion.explanation}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            (!selectedOptionId || isSubmitted) && styles.primaryButtonDisabled,
          ]}
          disabled={!selectedOptionId || isSubmitted}
          activeOpacity={0.9}
          onPress={handleCheckAnswer}
        >
          <Text style={styles.primaryButtonText}>Check answer</Text>
          <Ionicons name="checkmark" size={18} color={Colors.text.inverse} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            !isSubmitted && styles.secondaryButtonDisabled,
          ]}
          activeOpacity={isSubmitted ? 0.9 : 1}
          onPress={handleNext}
          disabled={!isSubmitted}
        >
          <Text style={styles.secondaryButtonText}>
            {currentIndex === totalQuestions - 1 ? 'Continue' : 'Next question'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>
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
  headerContext: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerProgress: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
    gap: 16,
  },
  skeletonSpacer: {
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  scoreLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.primary.main,
  },
  questionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  optionsStack: {
    gap: 12,
  },
  optionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...DesignSystem.platformShadows.sm,
  },
  optionCardSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: '#EEF2FF',
  },
  optionCardCorrect: {
    borderColor: Colors.semantic.success,
    backgroundColor: '#ECFDF5',
  },
  optionCardIncorrect: {
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
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
  },
  feedbackCardSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  feedbackCardError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedbackTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
  },
  feedbackBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background.card,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.semantic.success,
    paddingVertical: 14,
    borderRadius: 16,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.background.secondary,
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.inverse,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: Colors.primary.main,
  },
  secondaryButtonDisabled: {
    backgroundColor: Colors.background.secondary,
  },
  secondaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.inverse,
  },
  skeletonStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skeletonTight: {
    marginTop: 12,
  },
  skeletonActionCopy: {
    flex: 1,
    gap: 8,
  },
});
