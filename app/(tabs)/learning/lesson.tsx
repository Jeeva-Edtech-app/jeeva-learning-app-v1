import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ActionSheetIOS,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Colors, DesignSystem } from '@/constants/DesignSystem';
import FloatingChatButton from '@/components/FloatingChatButton';
import { LEARNING_STRUCTURE } from '@/api/constants';
import {
  Lesson,
  Topic,
  getLessonsByTopic,
  getTopicById,
} from '@/api/modules';
import {
  LessonCompletionRecord,
  getLessonCompletionsForUser,
} from '@/api/learning';

type LessonStatus = 'completed' | 'in_progress' | 'not_started' | 'locked';

type SubtopicBlueprint = (typeof LEARNING_STRUCTURE)[number]['subtopics'][number];

interface DecoratedLesson {
  lesson: Lesson;
  status: LessonStatus;
  completion?: LessonCompletionRecord;
  blueprint?: SubtopicBlueprint;
  unlockPrerequisiteTitle?: string;
}

const DOT_COUNT = 7;

export default function LessonListScreen() {
  const params = useLocalSearchParams();
  const topicIdParam = Array.isArray(params.topicId) ? params.topicId[0] : params.topicId;
  const topicTitleParam = Array.isArray(params.topicTitle) ? params.topicTitle[0] : params.topicTitle;
  const topicId = topicIdParam ?? '';
  const topicFallbackTitle = topicTitleParam ?? 'Learning module';
  const insets = useSafeAreaInsets();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [lessons, setLessons] = useState<DecoratedLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const topicTitle = topic?.title ?? topicFallbackTitle;
  const topicBlueprint = useMemo(
    () =>
      LEARNING_STRUCTURE.find(
        (entry) => entry.id === topicId || entry.topic === topicTitle,
      ),
    [topicId, topicTitle],
  );
  const breadcrumbTitle = topic?.modules?.title ?? 'NMC CBT';

  const loadData = useCallback(async () => {
    if (!topicId) {
      setError('Topic not found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [topicRecord, lessonRecords] = await Promise.all([
        getTopicById(topicId),
        getLessonsByTopic(topicId),
      ]);

      const blueprint = LEARNING_STRUCTURE.find(
        (entry) =>
          entry.id === topicId ||
          entry.topic === (topicRecord?.title ?? topicFallbackTitle),
      );

      const completionRecords = await getLessonCompletionsForUser(
        lessonRecords.map((lesson) => lesson.id),
      );

      const completionsMap = new Map<string, LessonCompletionRecord>();
      completionRecords.forEach((record) => {
        completionsMap.set(record.lesson_id, record);
      });

      const initialDecorated: DecoratedLesson[] = lessonRecords.map((lesson, index) => {
        const completion = completionsMap.get(lesson.id);
        const blueprintInfo = blueprint?.subtopics[index];
        let status: LessonStatus = 'not_started';
        if (completion?.is_completed) {
          status = 'completed';
        } else if (completion) {
          status = 'in_progress';
        }
        return { lesson, status, completion, blueprint: blueprintInfo };
      });

      const firstIncompleteIndex = initialDecorated.findIndex(
        (item) => item.status !== 'completed',
      );

      if (firstIncompleteIndex !== -1) {
        for (let index = firstIncompleteIndex + 1; index < initialDecorated.length; index += 1) {
          const item = initialDecorated[index];
          if (item.status === 'not_started') {
            initialDecorated[index] = {
              ...item,
              status: 'locked',
              unlockPrerequisiteTitle: initialDecorated[index - 1]?.lesson.title,
            };
          } else if (item.status === 'completed') {
            // leave as completed so learners can review out of order
            initialDecorated[index] = { ...item };
          }
        }
      }

      const enrichedTopic = topicRecord
        ? {
            ...topicRecord,
            description: topicRecord.description ?? blueprint?.description ?? '',
          }
        : null;

      setTopic(enrichedTopic);
      setLessons(initialDecorated);
    } catch (err) {
      console.error('Lesson list load error:', err);
      setError('Unable to load lessons right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [topicId, topicFallbackTitle]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const blueprintSubtopics = topicBlueprint?.subtopics ?? [];
  const totalLessons = blueprintSubtopics.length || lessons.length;
  const completedLessons = lessons.filter((item) => item.status === 'completed').length;
  const effectiveCompleted = Math.min(completedLessons, totalLessons);
  const totalDurationFromData = lessons.reduce((sum, item) => sum + getLessonDuration(item), 0);
  const blueprintDuration = blueprintSubtopics.reduce(
    (sum, entry) => sum + (entry.durationMinutes ?? 0),
    0,
  );
  const totalDuration = totalDurationFromData > 0 ? totalDurationFromData : blueprintDuration;
  const completionPercentage =
    totalLessons > 0 ? Math.round((effectiveCompleted / totalLessons) * 100) : 0;

  const objectiveEntries = lessons.length
    ? lessons.slice(0, 4).map((item) => ({
        key: item.lesson.id,
        title: item.lesson.title,
        focus: item.blueprint?.focus,
      }))
    : blueprintSubtopics.slice(0, 4).map((entry) => ({
        key: entry.id,
        title: entry.title,
        focus: entry.focus,
      }));

  const timeEntries = lessons.length
    ? lessons.map((item) => ({
        key: item.lesson.id,
        title: item.lesson.title,
        duration: formatDuration(item.lesson.duration, item.blueprint?.durationMinutes),
      }))
    : blueprintSubtopics.map((entry) => ({
        key: entry.id,
        title: entry.title,
        duration: formatDuration(entry.durationMinutes),
      }));

  const nextLesson = useMemo(() => {
    if (!lessons.length) return undefined;
    return (
      lessons.find((item) => item.status === 'in_progress') ??
      lessons.find((item) => item.status === 'not_started') ??
      lessons.find((item) => item.status === 'locked') ??
      lessons[0]
    );
  }, [lessons]);

  const floatingContext = useMemo(
    () => ({
      topicId,
      topicTitle,
      totalLessons,
      completionPercentage,
      nextLessonId: nextLesson?.lesson.id ?? null,
      nextLessonTitle:
        nextLesson?.lesson.title ?? nextLesson?.blueprint?.title ?? null,
      nextLessonStatus: nextLesson?.status ?? null,
    }),
    [topicId, topicTitle, totalLessons, completionPercentage, nextLesson],
  );

  const topicDescription =
    (topic && topic.description) || topicBlueprint?.description ||
    "Lessons for this topic are coming soon.";

  const nextLessonTitle =
    nextLesson?.lesson.title ?? nextLesson?.blueprint?.title ??
    "All lessons complete";

  const handleBookmarkToggle = () => {
    setBookmarked((prev) => !prev);
  };

  const handleMoreActions = () => {
    const options = [
      'View Topic Stats',
      'Download All Lessons',
      bookmarked ? 'Remove Bookmark' : 'Bookmark Topic',
      'Reset Progress',
      'Topic Information',
      'Cancel',
    ];

    const actions: Record<number, () => void> = {
      0: () => Alert.alert('Insights coming soon', 'Detailed analytics will appear here shortly.'),
      1: () => Alert.alert('Offline mode', 'Downloading lessons is coming soon.'),
      2: handleBookmarkToggle,
      3: () =>
        Alert.alert(
          'Reset progress?',
          'This will clear your completion history for this topic.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', style: 'destructive', onPress: () => Alert.alert('Progress reset queued') },
          ],
        ),
      4: () =>
        Alert.alert(topicTitle, topic?.description || 'Topic details will be available soon.'),
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          title: 'More Actions',
        },
        (buttonIndex) => {
          const action = actions[buttonIndex];
          if (action) action();
        },
      );
    } else {
      Alert.alert('More actions', '', [
        { text: options[0], onPress: actions[0] },
        { text: options[1], onPress: actions[1] },
        { text: options[2], onPress: actions[2] },
        { text: options[3], onPress: actions[3] },
        { text: options[4], onPress: actions[4] },
        { text: options[5], style: 'cancel' },
      ]);
    }
  };

  const openLesson = (lesson?: DecoratedLesson) => {
    if (!lesson) return;
    if (lesson.status === 'locked') {
      Alert.alert(
        'Locked lesson',
        `Complete "${lesson.unlockPrerequisiteTitle ?? 'the previous lesson'}" to unlock this content.`,
      );
      return;
    }

    router.push({
      pathname: '/learning/lesson-viewer',
      params: {
        topicId,
        topicTitle,
        lessonId: lesson.lesson.id,
      },
    });
  };

  function formatDuration(minutes?: number, fallbackMinutes?: number): string {
    const value = minutes && minutes > 0 ? minutes : fallbackMinutes;
    if (!value || value <= 0) {
      return 'Self-paced';
    }
    return `${value} min`;
  }

  function getLessonDuration(item: DecoratedLesson): number {
    if (item.lesson.duration && item.lesson.duration > 0) {
      return item.lesson.duration;
    }
    return item.blueprint?.durationMinutes ?? 0;
  }

  const formatTimestamp = (iso?: string | null) => {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) {
      return 'Just now';
    }
    if (diffHours < 24) {
      return `Today, ${date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    if (diffHours < 48) {
      return 'Yesterday';
    }
    if (diffHours < 24 * 7) {
      const days = Math.floor(diffHours / 24);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const renderProgressDots = (fraction: number) => {
    const capped = Math.min(Math.max(fraction, 0), 1);
    const filledDots = Math.round(capped * DOT_COUNT);
    return (
      <View style={styles.progressDotsRow}>
        {Array.from({ length: DOT_COUNT }).map((_, index) => {
          const filled = index < filledDots;
          return (
            <View
              key={index}
              style={[styles.progressDot, filled ? styles.progressDotFilled : styles.progressDotEmpty]}
            />
          );
        })}
      </View>
    );
  };

  const computeContentMeta = (lesson: Lesson) => {
    if (lesson.video_url) {
      return { icon: 'videocam-outline', label: 'Video' };
    }
    if (lesson.audio_url) {
      return { icon: 'headset-outline', label: 'Audio' };
    }
    return { icon: 'document-text-outline', label: 'Text' };
  };

  const renderLessonCard = (item: DecoratedLesson, index: number) => {
    const { lesson, status, completion } = item;
    const blueprint = item.blueprint;
    const meta = computeContentMeta(lesson);
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';
    const isInProgress = status === 'in_progress';
    const durationLabel = formatDuration(lesson.duration, blueprint?.durationMinutes);
    const completionLabel = formatTimestamp(completion?.completed_at ?? completion?.updated_at ?? undefined);
    const estimatedDuration = getLessonDuration(item);
    const progressFraction =
      isCompleted || estimatedDuration === 0
        ? 1
        : Math.min(
            (completion?.time_spent_minutes ?? 0) / Math.max(estimatedDuration, 1),
            1,
          );

    const cardStyles = [
      styles.lessonCard,
      isCompleted && styles.lessonCardCompleted,
      isInProgress && styles.lessonCardInProgress,
      isLocked && styles.lessonCardLocked,
    ];

    const statusIconName = isCompleted
      ? 'checkmark-circle'
      : isInProgress
      ? 'ellipse'
      : isLocked
      ? 'lock-closed'
      : 'ellipse-outline';
    const statusIconColor = isCompleted
      ? Colors.semantic.success
      : isInProgress
      ? Colors.primary.main
      : isLocked
      ? Colors.text.tertiary
      : Colors.text.tertiary;

    return (
      <TouchableOpacity
        key={lesson.id}
        style={cardStyles}
        activeOpacity={0.9}
        onPress={() => openLesson(item)}
        disabled={isLocked}
        onLongPress={() =>
          Alert.alert(
            lesson.title,
            'Additional lesson actions will be available in a future update.',
          )
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: isLocked, selected: isInProgress }}
        accessibilityLabel={`Lesson ${index + 1}: ${lesson.title}. ${meta.label} lesson, ${durationLabel}`}
      >
        <View style={styles.lessonHeader}>
          <View style={styles.lessonTitleRow}>
            <Ionicons name={statusIconName as any} size={22} color={statusIconColor} />
            <Text
              style={[
                styles.lessonTitle,
                isCompleted && styles.lessonTitleCompleted,
                isLocked && styles.lessonTitleLocked,
              ]}
            >
              {index + 1}. {lesson.title}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isLocked ? Colors.text.tertiary : Colors.primary.main}
          />
        </View>

        <View style={styles.lessonMetaRow}>
          <View style={styles.lessonMetaItem}>
            <Ionicons name={meta.icon as any} size={16} color={Colors.text.secondary} />
            <Text style={styles.lessonMetaText}>{meta.label}</Text>
          </View>
          <Text style={styles.lessonMetaSeparator}>·</Text>
          <View style={styles.lessonMetaItem}>
            <Ionicons name="time-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.lessonMetaText}>{durationLabel}</Text>
          </View>
        </View>

        {blueprint?.focus && (
          <Text style={styles.lessonFocusText}>{blueprint.focus}</Text>
        )}

        {isCompleted && (
          <View style={styles.lessonFooterRow}>
            <Text style={[styles.lessonFooterText, styles.lessonCompletedText]}>
              Completed
            </Text>
            {completionLabel && (
              <Text style={styles.lessonFooterMeta}>Completed: {completionLabel}</Text>
            )}
          </View>
        )}

        {isInProgress && (
          <View style={styles.lessonFooterProgress}>
            <Text style={styles.lessonFooterText}>
              Progress: {Math.round(progressFraction * 100)}%
            </Text>
            {renderProgressDots(progressFraction)}
            {completionLabel && (
              <Text style={styles.lessonFooterMeta}>Last accessed: {completionLabel}</Text>
            )}
          </View>
        )}

        {status === 'not_started' && (
          <Text style={styles.lessonFooterMeta}>Ready to begin</Text>
        )}

        {isLocked && (
          <Text style={styles.lessonLockedText}>
            Complete “{item.unlockPrerequisiteTitle ?? 'previous lesson'}” to unlock
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderLoading = () => (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.centerState}>
        <ActivityIndicator color={Colors.primary.main} size="large" />
        <Text style={styles.centerStateText}>Loading lessons…</Text>
      </View>
    </SafeAreaView>
  );

  const renderError = () => (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.centerState}>
        <Ionicons name="alert-circle" size={48} color={Colors.semantic.error} />
        <Text style={styles.errorTitle}>Unable to load lessons</Text>
        <Text style={styles.centerStateText}>{error}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={loadData} activeOpacity={0.9}>
          <Text style={styles.primaryButtonText}>Retry</Text>
          <Ionicons name="refresh" size={18} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  if (loading) {
    return renderLoading();
  }

  if (error) {
    return renderError();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary.main} />
        </TouchableOpacity>
        <View style={styles.headerTitleColumn}>
          <Text style={styles.headerBreadcrumb} numberOfLines={1}>
            {breadcrumbTitle}
          </Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {topicTitle}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleBookmarkToggle}
            accessibilityRole="button"
            activeOpacity={0.85}
          >
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={bookmarked ? Colors.primary.main : Colors.text.secondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleMoreActions}
            accessibilityRole="button"
            activeOpacity={0.85}
          >
            <Ionicons name="ellipsis-vertical" size={22} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.topicCard}
          activeOpacity={0.95}
          onPress={() => setSummaryExpanded((prev) => !prev)}
        >
          <Text style={styles.topicBadge}>📚 Topic</Text>
          <Text style={styles.topicTitle}>{topicTitle}</Text>
          <Text style={styles.topicDescription} numberOfLines={summaryExpanded ? undefined : 3}>
            {topicDescription}
          </Text>

          {summaryExpanded && (
            <>
              <View style={styles.topicObjectives}>
                <Text style={styles.topicSectionHeading}>📌 Learning objectives</Text>
                {objectiveEntries.map((entry) => (
                  <View key={entry.key} style={styles.topicObjectiveRow}>
                    <Ionicons name="checkmark" size={14} color={Colors.semantic.success} />
                    <Text style={styles.topicObjectiveText}>{entry.focus ?? entry.title}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.topicTimeBreakdown}>
                <Text style={styles.topicSectionHeading}>⏱ Time breakdown</Text>
                {timeEntries.map((entry) => (
                  <Text key={entry.key} style={styles.topicTimeRow}>
                    • {entry.title}: {entry.duration}
                  </Text>
                ))}
              </View>
            </>
          )}

          <Text style={styles.topicStats}>
            {totalLessons} lesson{totalLessons === 1 ? '' : 's'} · {formatDuration(totalDuration)} ·{' '}
            {completionPercentage}% complete
          </Text>

          <TouchableOpacity
            style={styles.topicCta}
            onPress={() => openLesson(nextLesson)}
            activeOpacity={0.9}
          >
            <View>
              <Text style={styles.topicCtaPrimary}>Continue learning →</Text>
              <Text style={styles.topicCtaSecondary}>
                {nextLessonTitle}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={Colors.primary.main} />
          </TouchableOpacity>

          <View style={styles.topicToggleRow}>
            <Text style={styles.topicToggleText}>
              {summaryExpanded ? '▲ Hide details' : '▼ Show details'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>📖 Lessons</Text>
        </View>

        <View style={styles.lessonList}>
          {lessons.map((item, index) => renderLessonCard(item, index))}
        </View>
      </ScrollView>

      <FloatingChatButton
        context={floatingContext}
        style={{ bottom: 24 + insets.bottom, right: 24 }}
      />

      {nextLesson && (
        <TouchableOpacity
          style={[styles.fab, { bottom: 24 + insets.bottom }]}
          activeOpacity={0.9}
          onPress={() => openLesson(nextLesson)}
        >
          <Ionicons name="play" size={24} color={Colors.text.inverse} />
          <Text style={styles.fabLabel}>Resume</Text>
        </TouchableOpacity>
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
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  headerTitleColumn: {
    flex: 1,
    marginHorizontal: 12,
    gap: 2,
  },
  headerBreadcrumb: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.primary.main,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  topicCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    ...DesignSystem.platformShadows.sm,
  },
  topicBadge: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.primary.main,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  topicTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: Colors.text.primary,
  },
  topicDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  topicObjectives: {
    gap: 8,
    paddingTop: 8,
  },
  topicObjectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topicObjectiveText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.primary,
    opacity: 0.78,
  },
  topicTimeBreakdown: {
    gap: 4,
    paddingTop: 4,
  },
  topicTimeRow: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  topicSectionHeading: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  topicStats: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  topicCta: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicCtaPrimary: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.primary.main,
  },
  topicCtaSecondary: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  topicToggleRow: {
    alignItems: 'center',
    paddingTop: 4,
  },
  topicToggleText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.primary.main,
  },
  sectionHeader: {
    paddingTop: 8,
  },
  sectionHeading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  lessonList: {
    gap: 12,
  },
  lessonCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
    padding: 16,
    gap: 12,
    ...DesignSystem.platformShadows.sm,
  },
  lessonCardCompleted: {
    borderColor: 'rgba(16, 185, 129, 0.2)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  lessonCardInProgress: {
    borderWidth: 2,
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.card,
  },
  lessonCardLocked: {
    borderStyle: 'dashed',
    borderColor: Colors.ui.border,
    backgroundColor: '#F3F4F6',
    opacity: 0.7,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    flexShrink: 1,
  },
  lessonTitleCompleted: {
    color: Colors.semantic.success,
  },
  lessonTitleLocked: {
    color: Colors.text.secondary,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lessonMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonMetaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  lessonFocusText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.primary,
    opacity: 0.78,
    lineHeight: 18,
  },
  lessonMetaSeparator: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.tertiary,
  },
  lessonFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonFooterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.primary,
  },
  lessonCompletedText: {
    color: Colors.semantic.success,
  },
  lessonFooterMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  lessonFooterProgress: {
    gap: 6,
  },
  lessonLockedText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#D97706',
  },
  progressDotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotFilled: {
    backgroundColor: Colors.primary.main,
  },
  progressDotEmpty: {
    backgroundColor: Colors.ui.border,
  },
  fab: {
    position: 'absolute',
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    ...DesignSystem.platformShadows.md,
  },
  fabLabel: {
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
  primaryButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: Colors.primary.main,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.inverse,
  },
});
