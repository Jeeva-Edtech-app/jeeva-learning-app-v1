import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, DesignSystem } from '@/constants/DesignSystem';
import { MOCK_EXAM_CONFIG } from '@/api/constants';

type MockExamSetupParams = {
  examPart?: string;
  title?: string;
  duration?: string;
  questionCount?: string;
};

const INSTRUCTIONS = [
  'You cannot pause once the timer starts.',
  'Flag questions to revisit before submission.',
  'The exam auto-submits when the timer reaches zero.',
  'Use the navigator to jump between questions quickly.',
];

const SUPPORT_TIPS = [
  'Calculator is available for numeracy questions.',
  'Each question is worth one mark—no negative scoring.',
  'Aim for at least 70% to meet the pass benchmark.',
];

export default function MockExamSetupScreen() {
  const params = useLocalSearchParams<MockExamSetupParams>();
  const durationMinutes = Number(params.duration ?? 0);
  const questionCount = Number(params.questionCount ?? 0);
  const examPart = params.examPart === 'part_b' ? 'part_b' : 'part_a';
  const title =
    params.title ??
    (examPart === 'part_a' ? MOCK_EXAM_CONFIG.PART_A.title : MOCK_EXAM_CONFIG.PART_B.title);

  const handleStartExam = () => {
    router.replace({
      pathname: '/mockexam/exam',
      params: {
        examPart,
        title,
        duration: durationMinutes.toString(),
        questionCount: questionCount.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exam set-up</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Ionicons
              name={examPart === 'part_a' ? 'calculator-outline' : 'medkit-outline'}
              size={22}
              color={Colors.primary.main}
            />
            <Text style={styles.heroBadge}>{examPart === 'part_a' ? 'Part A · Numeracy' : 'Part B · Clinical'}</Text>
          </View>
          <Text style={styles.heroTitle}>{title}</Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaItem}>
              <Ionicons name="help-circle-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.heroMetaLabel}>{questionCount} questions</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Ionicons name="timer-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.heroMetaLabel}>{durationMinutes} minutes</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Ionicons name="trophy-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.heroMetaLabel}>Pass mark 70%</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Before you start</Text>
          {INSTRUCTIONS.map((instruction) => (
            <View style={styles.listItem} key={instruction}>
              <Ionicons name="checkmark-circle-outline" size={18} color={Colors.primary.main} />
              <Text style={styles.listItemText}>{instruction}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Helpful tips</Text>
          {SUPPORT_TIPS.map((tip) => (
            <View style={styles.listItem} key={tip}>
              <Ionicons name="bulb-outline" size={18} color={Colors.semantic.warning} />
              <Text style={styles.listItemText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="alert-circle" size={18} color={Colors.semantic.error} />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>Important</Text>
            <Text style={styles.warningBody}>
              Leaving the exam will pause the timer, but the session will auto-submit if the full duration passes.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={Colors.primary.main} />
          <Text style={styles.secondaryButtonText}>Select another exam</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={handleStartExam}>
          <Text style={styles.primaryButtonText}>Start exam</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 18,
  },
  heroCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    ...DesignSystem.platformShadows.sm,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroBadge: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.primary.main,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroMetaLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
    padding: 18,
    gap: 12,
    ...DesignSystem.platformShadows.sm,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  listItemText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    padding: 16,
  },
  warningTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.semantic.error,
  },
  warningBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.secondary,
  },
  secondaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.primary.main,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: Colors.primary.main,
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.inverse,
  },
});

