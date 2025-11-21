import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuestionsByLesson } from '@/hooks/usePractice';
import { Colors, DesignSystem } from '@/constants/DesignSystem';
import { Skeleton } from '@/components/ui/Skeleton';

type LessonQuizReviewParams = {
  lessonId?: string;
  lessonTitle?: string;
  answers?: string;
};

type LessonAnswer = {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
};

export default function LessonQuizReviewScreen() {
  const params = useLocalSearchParams<LessonQuizReviewParams>();
  const lessonId = params.lessonId ?? '';
  const lessonTitle = params.lessonTitle ?? 'Lesson quiz';
  const rawAnswers = params.answers ? decodeURIComponent(params.answers) : '[]';

  const answers = useMemo(() => {
    try {
      return JSON.parse(rawAnswers) as LessonAnswer[];
    } catch {
      return [];
    }
  }, [rawAnswers]);

  const { data: questions, isLoading, error } = useQuestionsByLesson(lessonId);

  const answerMap = useMemo(() => {
    const map = new Map<string, LessonAnswer>();
    answers.forEach((answer) => {
      map.set(answer.questionId, answer);
    });
    return map;
  }, [answers]);

  const renderOption = (
    option: { id: string; option_text: string; is_correct: boolean },
    selectedOptionId: string | null,
  ) => {
    const isSelected = selectedOptionId === option.id;
    const isCorrect = option.is_correct;

    return (
      <View
        key={option.id}
        style={[
          styles.optionCard,
          isCorrect && styles.optionCardCorrect,
          isSelected && !isCorrect && styles.optionCardIncorrect,
        ]}
      >
        <Text
          style={[
            styles.optionLabel,
            isCorrect && styles.optionLabelCorrect,
            isSelected && !isCorrect && styles.optionLabelIncorrect,
          ]}
        >
          {option.option_text}
        </Text>
        <Ionicons
          name={
            isCorrect
              ? 'checkmark-circle'
              : isSelected
              ? 'close-circle'
              : 'radio-button-off'
          }
          size={20}
          color={
            isCorrect
              ? Colors.semantic.success
              : isSelected
              ? Colors.semantic.error
              : Colors.text.tertiary
          }
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review answers</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {isLoading ? (
        <ScrollView contentContainerStyle={styles.loadingContent}>
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} width="100%" height={160} borderRadius={20} style={styles.skeletonSpacer} />
          ))}
        </ScrollView>
      ) : error ? (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle" size={48} color={Colors.semantic.error} />
          <Text style={styles.emptyTitle}>Unable to load answers</Text>
          <Text style={styles.emptySubtitle}>Please check your connection and try again.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.lessonSummary}>
            <Ionicons name="book-outline" size={20} color={Colors.primary.main} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lessonTitle}>{lessonTitle}</Text>
              <Text style={styles.lessonSubtitle}>Reviewing {answers.length} answered questions</Text>
            </View>
          </View>

          {questions?.map((question) => {
            const userAnswer = answerMap.get(question.id);
            return (
              <View key={question.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionLabel}>Question</Text>
                  <View
                    style={[
                      styles.answerBadge,
                      userAnswer?.isCorrect ? styles.answerBadgePass : styles.answerBadgeFail,
                    ]}
                  >
                    <Ionicons
                      name={userAnswer?.isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={Colors.text.inverse}
                    />
                    <Text style={styles.answerBadgeText}>
                      {userAnswer?.isCorrect ? 'Correct' : 'Incorrect'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.questionText}>{question.question_text}</Text>

                <View style={styles.optionsStack}>
                  {(question.question_options ?? []).map((option) =>
                    renderOption(option, userAnswer?.selectedOptionId ?? null),
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
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
    paddingTop: 24,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  lessonSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    ...DesignSystem.platformShadows.sm,
  },
  lessonTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
  },
  lessonSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  questionCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    gap: 14,
    ...DesignSystem.platformShadows.sm,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  answerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  answerBadgePass: {
    backgroundColor: Colors.semantic.success,
  },
  answerBadgeFail: {
    backgroundColor: Colors.semantic.error,
  },
  answerBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.inverse,
  },
  questionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
    lineHeight: 22,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    ...DesignSystem.platformShadows.sm,
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
  optionLabelCorrect: {
    color: Colors.semantic.success,
  },
  optionLabelIncorrect: {
    color: Colors.semantic.error,
  },
});
