import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, DesignSystem } from '@/constants/DesignSystem';

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20;
const MODULE_GAP = 12;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - MODULE_GAP * 2) / 3;

const COURSE_HIGHLIGHTS = [
  'Full CBT syllabus with clinical, numeracy, and professional standards tracks',
  'Live mentor support plus on-demand micro lessons',
  'Adaptive practice sets that mirror the exam blueprint',
];

const FAQ_ITEMS = [
  {
    question: 'How long will I have access?',
    answer: 'You keep access to lessons, mock exams, and updates for 6 months from enrollment.',
  },
  {
    question: 'Do I get mentor support?',
    answer: 'Yes, our nurse educators review your progress weekly and host live Q&A clinics.',
  },
  {
    question: 'Can I pause my plan?',
    answer: 'Absolutely. You can pause once during the subscription—perfect for exam scheduling.',
  },
];

interface ModuleCardProps {
  tint: string;
  iconColor: string;
  iconName: string;
  iconType: 'ionicons' | 'material';
  title: string;
  subtitle: string;
  onPress: () => void;
}

function ModuleCard({ tint, iconColor, iconName, iconType, title, subtitle, onPress }: ModuleCardProps) {
  return (
    <TouchableOpacity style={styles.moduleCard} onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.moduleAccent, { backgroundColor: tint }]}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor }]}>
          {iconType === 'ionicons' ? (
            <Ionicons name={iconName as any} size={18} color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name={iconName as any} size={18} color="#FFFFFF" />
          )}
        </View>
      </View>
      <View style={styles.moduleBody}>
        <Text style={styles.moduleTitle}>{title}</Text>
        <Text style={styles.moduleSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CoursesScreen() {
  const [courseExpanded, setCourseExpanded] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handlePracticeModule = () => {
    router.push('/(tabs)/practice');
  };

  const handleLearningModule = () => {
    router.push('/(tabs)/learning');
  };

  const handleMockExams = () => {
    router.push('/(tabs)/mockexam');
  };

  const toggleCourseExpanded = () => {
    setCourseExpanded(prev => !prev);
  };

  const toggleFaqIndex = (index: number) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#6D6D6D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Courses</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.contentArea}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        {/* Main Course Card */}
        <View style={styles.courseCard}>
          <View style={styles.courseMediaWrap}>
            <Image
              source={{ uri: 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Jeeva%20Learning%20App/Course%20banner.png' }}
              style={styles.courseImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.coursePlay} activeOpacity={0.9}>
              <Ionicons name="play" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.courseContent}>
            <View style={styles.courseHeader}>
              <Text style={styles.courseLabel}>Flagship programme</Text>
              <Text style={styles.courseTitle}>NMC CBT Accelerator</Text>
              <Text style={styles.courseSubtitle}>
                Transform your revision into a structured journey that mirrors the latest exam format.
              </Text>
            </View>

            {courseExpanded && (
              <>
                <View style={styles.courseStats}>
                  <View style={styles.courseStat}>
                    <Ionicons name="time-outline" size={18} color={Colors.primary.main} />
                    <Text style={styles.courseStatText}>12 guided sprints</Text>
                  </View>
                  <View style={styles.courseStat}>
                    <Ionicons name="people-outline" size={18} color={Colors.semantic.success} />
                    <Text style={styles.courseStatText}>Mentor-led checkpoints</Text>
                  </View>
                  <View style={styles.courseStat}>
                    <Ionicons name="bar-chart-outline" size={18} color="#F59E0B" />
                    <Text style={styles.courseStatText}>Exam-style analytics</Text>
                  </View>
                </View>

                <View style={styles.courseHighlights}>
                  {COURSE_HIGHLIGHTS.map((highlight) => (
                    <View style={styles.highlightItem} key={highlight}>
                      <Ionicons name="checkmark-circle" size={18} color={Colors.primary.main} />
                      <Text style={styles.highlightText}>{highlight}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.courseActions}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleLearningModule}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.primaryButtonText}>Start lesson</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.push('/subscriptions')}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.secondaryButtonText}>View plans</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity style={styles.expandButton} onPress={toggleCourseExpanded} activeOpacity={0.8}>
              <Ionicons name={courseExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Modules */}
        <View style={styles.moduleGrid}>
          <ModuleCard
            tint="#EFF6FF"
            iconColor="#2563EB"
            iconName="book-outline"
            iconType="ionicons"
            title="Practice module"
            subtitle="Timed drills & scorecards"
            onPress={handlePracticeModule}
          />
          <ModuleCard
            tint="#ECFDF5"
            iconColor="#059669"
            iconName="book"
            iconType="ionicons"
            title="Learning module"
            subtitle="Structured lessons"
            onPress={handleLearningModule}
          />
          <ModuleCard
            tint="#FEF3C7"
            iconColor="#D97706"
            iconName="file-document-outline"
            iconType="material"
            title="Mock exams"
            subtitle="Real CBT scenarios"
            onPress={handleMockExams}
          />
        </View>

        <TouchableOpacity style={styles.tryButton} activeOpacity={0.9} onPress={handlePracticeModule}>
          <Ionicons name="flash-outline" size={18} color="#FFFFFF" />
          <Text style={styles.tryButtonText}>Let&apos;s try now</Text>
        </TouchableOpacity>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>FAQs</Text>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <View style={[styles.faqItem, isOpen && styles.faqItemOpen]} key={item.question}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleFaqIndex(index)}
                  activeOpacity={0.8}
                >
                  <View style={styles.faqHeaderLeft}>
                    <Ionicons name="help-circle-outline" size={18} color={Colors.primary.main} style={styles.faqIcon} />
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                  </View>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Colors.text.secondary}
                  />
                </TouchableOpacity>
                {isOpen && <Text style={styles.faqAnswer}>{item.answer}</Text>}
              </View>
            );
          })}
        </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentArea: {
    backgroundColor: '#F5F7FA',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6D6D6D',
    fontFamily: 'Inter_500Medium',
    lineHeight: 18,
  },
  headerPlaceholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  courseCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.ui.border,
    marginBottom: 28,
    ...DesignSystem.platformShadows.md,
  },
  courseMediaWrap: {
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#E5E7EB',
  },
  coursePlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -28 }, { translateY: -28 }],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(37,99,235,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseContent: {
    padding: 24,
    gap: 16,
  },
  courseHeader: {
    gap: 8,
  },
  courseLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary.main,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  courseTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.text.primary,
    lineHeight: 28,
  },
  courseSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  courseStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  courseStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  courseStatText: {
    marginLeft: 8,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.text.primary,
  },
  courseHighlights: {
    gap: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.secondary,
  },
  courseActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  secondaryButtonText: {
    color: Colors.primary.main,
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  expandButton: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqSection: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingBottom: 12,
    ...DesignSystem.platformShadows.sm,
  },
  faqTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
    marginLeft: 16,
    marginTop: 16,
  },
  faqItem: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  faqItemOpen: {
    borderColor: '#DBEAFE',
    backgroundColor: '#F8FAFF',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  faqHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  faqIcon: {
    marginTop: 0,
  },
  faqQuestion: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
  },
  faqAnswer: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.secondary,
    lineHeight: 19,
    paddingBottom: 12,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  moduleCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
    padding: 16,
    ...DesignSystem.platformShadows.sm,
    marginBottom: MODULE_GAP,
  },
  moduleAccent: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    width: '100%',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleBody: {
    gap: 6,
  },
  moduleTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  moduleSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  tryButton: {
    marginTop: 8,
    marginBottom: 28,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
