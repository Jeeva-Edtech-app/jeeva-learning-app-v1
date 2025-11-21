import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, DesignSystem } from '@/constants/DesignSystem';
import { LEARNING_STRUCTURE } from '@/api/constants';
import { useTrialMode } from '@/context/TrialContext';
import { LockedTopicOverlay } from '@/components/LockedTopicOverlay';

type TopicStatus = 'locked' | 'available' | 'in_progress' | 'completed';

interface TopicProgress {
  status: TopicStatus;
  completedSubtopics: number;
  totalSubtopics: number;
  latestScore?: number;
}

const PASS_THRESHOLD = 80;

const SAMPLE_PROGRESS: Record<string, TopicProgress> = {
  Numeracy: {
    status: 'completed',
    completedSubtopics: 1,
    totalSubtopics: 1,
    latestScore: 92,
  },
  'The NMC Code': {
    status: 'in_progress',
    completedSubtopics: 2,
    totalSubtopics: 4,
    latestScore: 78,
  },
};

const STATUS_CONFIG: Record<TopicStatus, { label: string; color: string; background: string }> = {
  completed: {
    label: 'Completed',
    color: Colors.semantic.success,
    background: '#DCFCE7',
  },
  in_progress: {
    label: 'In progress',
    color: '#D97706',
    background: '#FEF3C7',
  },
  available: {
    label: 'Start topic',
    color: Colors.primary.main,
    background: '#DBEAFE',
  },
  locked: {
    label: 'Locked',
    color: Colors.text.tertiary,
    background: '#F1F5F9',
  },
};

interface TopicCardProps {
  title: string;
  icon: string;
  description: string;
  subtopics: number;
  status: TopicStatus;
  latestScore?: number;
  onPress: () => void;
  locked: boolean;
  completedSubtopics: number;
}

function TopicCard({
  title,
  icon,
  description,
  subtopics,
  status,
  latestScore,
  onPress,
  locked,
  completedSubtopics,
}: TopicCardProps) {
  const { isContentLocked, isTrialUser } = useTrialMode();
  const trialLocked = isContentLocked('learning', title);
  const config = STATUS_CONFIG[status];
  const hasSubtopics = subtopics > 0;
  const completionRatio = hasSubtopics ? Math.min(completedSubtopics / subtopics, 1) : 1;
  const includesCopy =
    status === 'locked' ? 'Complete previous topic to unlock' : 'Lessons · Flashcards · Quiz';

  return (
    <TouchableOpacity
      style={[styles.topicCard, (locked || trialLocked) && styles.topicCardLocked]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={locked || trialLocked}
    >
      <View style={styles.topicHeaderRow}>
        <View style={styles.topicIconBadge}>
          <Text style={styles.topicIconEmoji}>{icon}</Text>
        </View>
        <View style={styles.topicHeaderCopy}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.topicTitle}>{title}</Text>
            {(locked || trialLocked) && (
              <Ionicons name="lock-closed" size={16} color="#EF4444" />
            )}
          </View>
          <Text style={styles.topicDescription}>{description}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: config.background }]}>
          <Text style={[styles.statusPillLabel, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      <View style={styles.topicBody}>
        {hasSubtopics ? (
          <View style={styles.topicProgressBlock}>
            <View style={styles.topicProgressTrack}>
              <View style={[styles.topicProgressFill, { width: `${completionRatio * 100}%` }]} />
            </View>
            <View style={styles.topicProgressMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="layers-outline" size={16} color={Colors.text.secondary} />
                <Text style={styles.metaText}>
                  {completedSubtopics}/{subtopics} subtopics
                </Text>
              </View>
              {latestScore !== undefined && (
                <View style={styles.metaItem}>
                  <Ionicons name="medal-outline" size={16} color={Colors.text.secondary} />
                  <Text style={styles.metaText}>{latestScore}% best score</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.metaItem}>
            <Ionicons name="calculator-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.metaText}>Direct numeracy drills</Text>
          </View>
        )}
      </View>

      <View style={styles.topicFooter}>
        <View>
          <Text style={styles.footerHintLabel}>Includes</Text>
          <Text style={styles.footerHint}>{includesCopy}</Text>
        </View>
        <Ionicons
          name={locked ? 'lock-closed-outline' : 'arrow-forward'}
          size={18}
          color={locked ? Colors.text.tertiary : Colors.primary.main}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function LearningOverviewScreen() {
  const { isContentLocked } = useTrialMode();
  const [selectedLockedTopic, setSelectedLockedTopic] = useState<string | null>(null);

  const topicsWithStatus = useMemo(() => {
    const mapped: {
      id: string;
      title: string;
      icon: string;
      description: string;
      subtopics: number;
      status: TopicStatus;
      latestScore?: number;
      completedSubtopics: number;
      locked: boolean;
    }[] = [];

    LEARNING_STRUCTURE.forEach((topic, index) => {
      const progress = SAMPLE_PROGRESS[topic.topic];
      const previous = mapped[index - 1];

      let status: TopicStatus = 'available';
      let locked = false;
      let completedSubtopics = progress?.completedSubtopics ?? 0;
      completedSubtopics = Math.min(completedSubtopics, topic.subtopics.length || 0);

      if (index > 0 && previous && previous.status !== 'completed') {
        status = 'locked';
        locked = true;
      } else if (progress?.status) {
        status = progress.status;
        locked = progress.status === 'locked';
      }

      mapped.push({
        id: topic.id,
        title: topic.topic,
        icon: topic.icon,
        description:
          topic.description ??
          'Learn, revise, and quiz through structured UK CBT lessons.',
        subtopics: topic.subtopics.length,
        status,
        latestScore: progress?.latestScore,
        completedSubtopics,
        locked,
      });
    });

    return mapped;
  }, []);

  const completedCount = topicsWithStatus.filter((topic) => topic.status === 'completed').length;
  const nextTopic = topicsWithStatus.find((topic) => topic.status !== 'completed');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning pathway</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="school-outline" size={16} color={Colors.primary.main} />
            <Text style={styles.heroBadgeText}>Guided progression</Text>
          </View>
          <Text style={styles.heroTitle}>Complete each topic to unlock the next and stay exam ready.</Text>
          <Text style={styles.heroSubtitle}>
            Follow the recommended order—learn the content, review flashcards, then score 80% in the quiz
            to move forward.
          </Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressIcon}>
              <Ionicons name="trending-up" size={18} color={Colors.primary.main} />
            </View>
            <View style={styles.progressHeaderCopy}>
              <Text style={styles.progressTitle}>Learning progress</Text>
              <Text style={styles.progressSubtitle}>
                {completedCount} of {topicsWithStatus.length} topics completed
              </Text>
            </View>
            <View style={styles.progressPill}>
              <Text style={styles.progressPillText}>
                {Math.round((completedCount / topicsWithStatus.length) * 100)}%
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((completedCount / topicsWithStatus.length) * 100, 100)}%` },
              ]}
            />
          </View>

          <View style={styles.progressStatsRow}>
            <View style={styles.progressStat}>
              <Ionicons name="layers-outline" size={16} color={Colors.primary.main} />
              <View>
                <Text style={styles.progressStatLabel}>Completed</Text>
                <Text style={styles.progressStatValue}>{completedCount} topics</Text>
              </View>
            </View>
            <View style={styles.progressStatDivider} />
            <View style={styles.progressStat}>
              <Ionicons name="ribbon-outline" size={16} color={Colors.primary.main} />
              <View>
                <Text style={styles.progressStatLabel}>Quiz target</Text>
                <Text style={styles.progressStatValue}>{PASS_THRESHOLD}% mastery</Text>
              </View>
            </View>
            <View style={styles.progressStatDivider} />
            <View style={styles.progressStat}>
              <Ionicons name="flag-outline" size={16} color={Colors.primary.main} />
              <View>
                <Text style={styles.progressStatLabel}>Next focus</Text>
                <Text style={styles.progressStatValue}>{nextTopic ? nextTopic.title : 'All done'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Learning topics</Text>
          <Text style={styles.sectionSubtitle}>Move sequentially to unlock new content and practice sets.</Text>
        </View>

        <View style={styles.topicsStack}>
          {topicsWithStatus.map((topic) => (
            <TopicCard
              key={topic.id}
              title={topic.title}
              icon={topic.icon}
              description={topic.description}
              subtopics={topic.subtopics}
              status={topic.status}
              latestScore={topic.latestScore}
              completedSubtopics={topic.completedSubtopics}
              locked={topic.locked}
              onPress={() => {
                if (isContentLocked('learning', topic.title)) {
                  setSelectedLockedTopic(topic.title)
                } else {
                  router.push({
                    pathname: '/learning/lesson',
                    params: { topicId: topic.id, topicTitle: topic.title },
                  })
                }
              }}
            />
          ))}
        </View>
      </ScrollView>

      {selectedLockedTopic && (
        <LockedTopicOverlay
          moduleType="learning"
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
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 20,
    gap: 12,
    ...DesignSystem.platformShadows.sm,
  },
  sectionHeader: {
    gap: 6,
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
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  progressCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 20,
    gap: 16,
    ...DesignSystem.platformShadows.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  progressTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
  },
  progressSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  progressPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
  },
  progressPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary.main,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.background.secondary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.primary.main,
  },
  progressStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressStatLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  progressStatValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.text.primary,
  },
  progressStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.ui.border,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  topicsStack: {
    gap: 16,
  },
  topicCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 18,
    gap: 16,
    ...DesignSystem.platformShadows.sm,
  },
  topicCardLocked: {
    opacity: 0.6,
  },
  topicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  topicIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicIconEmoji: {
    fontSize: 20,
  },
  topicHeaderCopy: {
    flex: 1,
    gap: 6,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusPillLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  topicBody: {
    gap: 12,
  },
  topicTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  topicDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  topicProgressBlock: {
    gap: 8,
  },
  topicProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.background.secondary,
    overflow: 'hidden',
  },
  topicProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary.main,
  },
  topicProgressMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  topicFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  footerHintLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  footerHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.tertiary,
  },
});
