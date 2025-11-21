import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  PRACTICE_CATEGORIES,
  LEARNING_STRUCTURE,
} from '@/api/constants';
import { Colors, DesignSystem } from '@/constants/DesignSystem';
import { useTrialMode } from '@/context/TrialContext';
import { LockedTopicOverlay } from '@/components/LockedTopicOverlay';

interface PracticeCategory {
  key: string;
  title: string;
  description: string;
  icon: string;
  tint: string;
  accent: string;
}

const PRACTICE_OPTIONS: PracticeCategory[] = [
  {
    key: PRACTICE_CATEGORIES.NUMERACY,
    title: 'Numeracy practice',
    description: 'Drug dosages, IV rate and calculation drills.',
    icon: 'calculator-variant',
    tint: '#E0F2FE',
    accent: '#0284C7',
  },
  {
    key: PRACTICE_CATEGORIES.CLINICAL_KNOWLEDGE,
    title: 'Clinical knowledge',
    description: 'Safety, procedures, ethics and patient care.',
    icon: 'stethoscope',
    tint: '#FEF3C7',
    accent: '#D97706',
  },
];

interface CategoryTileProps extends PracticeCategory {
  isSelected: boolean;
  onPress: () => void;
}

function CategoryTile({
  title,
  description,
  icon,
  tint,
  accent,
  isSelected,
  onPress,
}: CategoryTileProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.categoryTile,
        { backgroundColor: tint, borderColor: isSelected ? accent : 'transparent' },
        isSelected && styles.categoryTileSelected,
      ]}
      onPress={onPress}
    >
      <View style={[styles.categoryIcon, { backgroundColor: accent }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.categoryTitle}>{title}</Text>
      <Text style={styles.categoryDescription}>{description}</Text>
      <Ionicons
        name={isSelected ? 'checkmark-circle' : 'chevron-forward'}
        size={20}
        color={isSelected ? accent : Colors.text.tertiary}
        style={styles.categoryChevron}
      />
    </TouchableOpacity>
  );
}

interface TopicChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  isLocked?: boolean;
}

function TopicChip({ label, selected, onPress, isLocked }: TopicChipProps) {
  return (
    <TouchableOpacity
      style={[styles.topicChip, selected && styles.topicChipSelected, isLocked && styles.topicChipLocked]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={isLocked}
    >
      <Text style={[styles.topicChipLabel, selected && styles.topicChipLabelSelected, isLocked && styles.topicChipLabelLocked]}>
        {label}
      </Text>
      {isLocked ? (
        <Ionicons name="lock-closed" size={14} color="#EF4444" />
      ) : selected ? (
        <Ionicons name="checkmark-circle" size={16} color={Colors.primary.main} />
      ) : null}
    </TouchableOpacity>
  );
}

export default function PracticeModuleScreen() {
  type SubdivisionOption = {
    id: string;
    label: string;
    category: string;
  };

  const { isContentLocked } = useTrialMode();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubdivision, setSelectedSubdivision] = useState<SubdivisionOption | null>(null);
  const [selectedLockedTopic, setSelectedLockedTopic] = useState<string | null>(null);

  const numeracyOptions = useMemo<SubdivisionOption[]>(() => {
    const numeracyTopic = LEARNING_STRUCTURE.find((topic) => topic.topic === 'Numeracy');
    if (!numeracyTopic) return [];
    return numeracyTopic.subtopics.map((subtopic) => ({
      id: subtopic.id,
      label: subtopic.title,
      category: numeracyTopic.topic,
    }));
  }, []);

  const clinicalOptions = useMemo<SubdivisionOption[]>(() => {
    return LEARNING_STRUCTURE.filter((topic) => topic.topic !== 'Numeracy').flatMap((topic) =>
      topic.subtopics.map((subtopic) => ({
        id: subtopic.id,
        label: `${topic.topic}: ${subtopic.title}`,
        category: topic.topic,
      })),
    );
  }, []);

  const subdivisions = useMemo<SubdivisionOption[]>(() => {
    if (selectedCategory === PRACTICE_CATEGORIES.NUMERACY) {
      return numeracyOptions;
    }
    if (selectedCategory === PRACTICE_CATEGORIES.CLINICAL_KNOWLEDGE) {
      return clinicalOptions;
    }
    return [];
  }, [selectedCategory, numeracyOptions, clinicalOptions]);

  const handleStartPractice = () => {
    if (!selectedSubdivision) return;
    
    if (isContentLocked('practice', selectedSubdivision.id)) {
      setSelectedLockedTopic(selectedSubdivision.id);
      return;
    }
    
    router.push({
      pathname: '/practice/quiz',
      params: {
        subdivision: selectedSubdivision.id,
        category: selectedSubdivision.category,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice mode</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="flash-outline" size={16} color={Colors.primary.main} />
            <Text style={styles.heroBadgeText}>Adaptive drills</Text>
          </View>
          <Text style={styles.heroTitle}>Build exam confidence through focussed practice.</Text>
          <Text style={styles.heroSubtitle}>
            Choose a pathway, stay on track with topic-based quizzes, and aim for 80% mastery
            before advancing.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>1. Pick a pathway</Text>
          <Text style={styles.sectionSubtitle}>Select the area you want to sharpen today.</Text>
        </View>

        <View style={styles.categoryGrid}>
          {PRACTICE_OPTIONS.map(({ key, ...rest }) => (
            <CategoryTile
              key={key}
              {...rest}
              isSelected={selectedCategory === key}
              onPress={() => {
                setSelectedCategory(key);
                setSelectedSubdivision(null);
              }}
            />
          ))}
        </View>

        {selectedCategory && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>2. Choose a topic</Text>
              <Text style={styles.sectionSubtitle}>
                Drill questions within one focussed numeracy or clinical subdivision.
              </Text>
            </View>

            <View style={styles.topicGrid}>
              {subdivisions.map((option) => {
                const isLocked = isContentLocked('practice', option.id);
                return (
                  <TopicChip
                    key={option.id}
                    label={option.label}
                    selected={selectedSubdivision?.id === option.id}
                    isLocked={isLocked}
                    onPress={() => {
                      if (!isLocked) {
                        setSelectedSubdivision(option);
                      }
                    }}
                  />
                );
              })}
            </View>
          </>
        )}

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Ionicons name="stopwatch-outline" size={18} color={Colors.primary.main} />
            </View>
            <Text style={styles.summaryText}>20-question adaptive quiz • 60s per question</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Ionicons name="checkmark-done-outline" size={18} color={Colors.semantic.success} />
            </View>
            <Text style={styles.summaryText}>Score 80% to unlock the next subdivision.</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startButton, !selectedSubdivision && styles.startButtonDisabled]}
          onPress={handleStartPractice}
          activeOpacity={0.85}
          disabled={!selectedSubdivision}
        >
          <Text style={[styles.startButtonText, !selectedSubdivision && styles.startButtonTextDisabled]}>
            {selectedSubdivision ? 'Start practice' : 'Select a topic to continue'}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={!selectedSubdivision ? Colors.text.tertiary : Colors.text.inverse}
          />
        </TouchableOpacity>
      </ScrollView>

      {selectedLockedTopic && (
        <LockedTopicOverlay
          moduleType="practice"
          onSubscribe={() => router.push('/subscriptions')}
          onClose={() => setSelectedLockedTopic(null)}
        />
      )}
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
    paddingBottom: 32,
    gap: 28,
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
  heroCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    ...DesignSystem.platformShadows.sm,
    gap: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  heroBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.primary.main,
  },
  heroTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  sectionHeader: {
    gap: 6,
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
  categoryGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  categoryTile: {
    flex: 1,
    minWidth: '48%',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
    gap: 8,
  },
  categoryTileSelected: {
    ...DesignSystem.platformShadows.sm,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  categoryDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  categoryChevron: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  topicChipSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: '#EEF2FF',
  },
  topicChipLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.primary,
  },
  topicChipLabelSelected: {
    color: Colors.primary.main,
  },
  topicChipLocked: {
    opacity: 0.6,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  topicChipLabelLocked: {
    color: '#9CA3AF',
  },
  summaryCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 16,
    gap: 12,
    ...DesignSystem.platformShadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  summaryText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 19,
  },
  startButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonDisabled: {
    backgroundColor: Colors.ui.inputBorder,
  },
  startButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.inverse,
  },
  startButtonTextDisabled: {
    color: Colors.text.tertiary,
  },
});
