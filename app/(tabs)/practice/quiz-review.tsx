import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, DesignSystem } from '@/constants/DesignSystem';
import { Skeleton } from '@/components/ui/Skeleton';

type PracticeQuizReviewParams = {
  answers?: string;
  questions?: string;
  title?: string;
};

type PracticeReviewAnswer = {
  questionId: string | number;
  selectedOptionId: string | number | null;
  isCorrect: boolean;
};

type PracticeReviewQuestion = {
  id: string | number;
  question_text: string;
  explanation?: string;
  question_options?: {
    id: string | number;
    option_text: string;
    is_correct: boolean;
  }[];
};

export default function PracticeQuizReviewScreen() {
  const params = useLocalSearchParams<PracticeQuizReviewParams>();
  const encodedAnswers = typeof params.answers === 'string' ? params.answers : '';
  const encodedQuestions = typeof params.questions === 'string' ? params.questions : '';
  const title = params.title ?? 'Practice review';

  const answers = useMemo<PracticeReviewAnswer[]>(() => {
    if (!encodedAnswers) return [];
    try {
      return JSON.parse(encodedAnswers) as PracticeReviewAnswer[];
    } catch {
      try {
        return JSON.parse(decodeURIComponent(encodedAnswers)) as PracticeReviewAnswer[];
      } catch {
        return [];
      }
    }
  }, [encodedAnswers]);

  const questions = useMemo<PracticeReviewQuestion[]>(() => {
    if (!encodedQuestions) return [];
    try {
      return JSON.parse(encodedQuestions) as PracticeReviewQuestion[];
    } catch {
      try {
        return JSON.parse(decodeURIComponent(encodedQuestions)) as PracticeReviewQuestion[];
      } catch {
        return [];
      }
    }
  }, [encodedQuestions]);

  const answerMap = useMemo(() => {
    const map = new Map<string | number, PracticeReviewAnswer>();
    answers.forEach((entry) => map.set(entry.questionId, entry));
    return map;
  }, [answers]);

  const isLoading = !encodedQuestions || questions.length === 0;

  const renderOption = (
    option: { id: string | number; option_text: string; is_correct: boolean },
    selectedOptionId: string | number | null,
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {isLoading ? (
        <ScrollView contentContainerStyle={styles.loadingContent}>
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} width="100%" height={160} borderRadius={20} style={styles.loadingSpacer} />
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Ionicons name="list-circle" size={22} color={Colors.primary.main} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.summaryTitle}>Answers reviewed</Text>
              <Text style={styles.summarySubtitle}>
                {answers.length} question{answers.length === 1 ? '' : 's'} from this practice set
              </Text>
            </View>
          </View>

          {questions.map((question, index) => {
            const answer = answerMap.get(question.id);
            return (
              <View key={question.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionCounter}>Question {index + 1}</Text>
                  <View
                    style={[
                      styles.answerBadge,
                      answer?.isCorrect ? styles.answerBadgePass : styles.answerBadgeFail,
                    ]}
                  >
                    <Ionicons
                      name={answer?.isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={Colors.text.inverse}
                    />
                    <Text style={styles.answerBadgeText}>
                      {answer?.isCorrect ? 'Correct' : 'Incorrect'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.questionText}>{question.question_text}</Text>

                <View style={styles.optionsStack}>
                  {(question.question_options ?? []).map((option) =>
                    renderOption(option, answer?.selectedOptionId ?? null),
                  )}
                </View>

                {question.explanation ? (
                  <View style={styles.explanationCard}>
                    <Text style={styles.explanationHeading}>Explanation</Text>
                    <Text style={styles.explanationBody}>{question.explanation}</Text>
                  </View>
                ) : null}
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
    flex: 1,
    marginHorizontal: 12,
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
  loadingSpacer: {
    marginTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  summaryCard: {
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
  summaryTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
  },
  summarySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  questionCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
    padding: 20,
    gap: 14,
    ...DesignSystem.platformShadows.sm,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionCounter: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
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
  explanationCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.background.secondary,
  },
  explanationHeading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  explanationBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});

