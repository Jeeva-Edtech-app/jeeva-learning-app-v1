import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { VideoView, useVideoPlayer, type VideoSource } from 'expo-video';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import RenderHTML from 'react-native-render-html';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { markLessonComplete } from '@/api/learning';
import {
  getLessonById,
  getLessonsByTopic,
  getFlashcardsByLesson,
  getFlashcardsByCategory,
  Lesson as APILesson,
  Flashcard,
} from '@/api/modules';
import { useAuth } from '@/context/AuthContext';
import { Colors, DesignSystem } from '@/constants/DesignSystem';

interface LessonData {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  audioUrl?: string;
  moduleTitle: string;
  topicTitle: string;
  subdivision?: string;
}

const PLAYBACK_SPEEDS = [0.75, 1.0, 1.25, 1.5];

export default function LessonViewerScreen() {
  const params = useLocalSearchParams<{ topicId?: string; topicTitle?: string; lessonId?: string }>();
  const topicId = params.topicId ?? '';
  const topicTitleParam = params.topicTitle ?? 'Learning module';
  const lessonIdParam = params.lessonId ?? '';
  const { user } = useAuth();
  const userId = user?.id;
  const { width } = useWindowDimensions();

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showLessonContent, setShowLessonContent] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState<string | null>(null);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardReveal, setFlashcardReveal] = useState(false);
  const completionTriggered = useRef(false);

  const [resolvedTopicTitle, setResolvedTopicTitle] = useState(topicTitleParam);

  const hasAudio = Boolean(lesson?.audioUrl);
  const audioSource = lesson?.audioUrl ?? null;
  const player = useAudioPlayer(audioSource ?? undefined);
  const status = useAudioPlayerStatus(player);

  const videoSource = useMemo<VideoSource>(
    () => (lesson?.videoUrl ? { uri: lesson.videoUrl } : null),
    [lesson?.videoUrl],
  );
  const videoPlayer = useVideoPlayer(videoSource);

  const isPlaying = status.playing ?? false;
  const positionMillis = (status.currentTime ?? 0) * 1000;
  const durationMillis = (status.duration ?? 0) * 1000;

  const loadLesson = useCallback(async () => {
    try {
      if (!userId) {
        throw new Error('Please sign in to continue');
      }
      if (!lessonIdParam && !topicId) {
        throw new Error('Missing lesson identifier');
      }

      setLoading(true);
      setError(null);

      let selectedLesson: APILesson | null = null;

      if (lessonIdParam) {
        selectedLesson = await getLessonById(lessonIdParam);
      } else if (topicId) {
        const fetchedLessons = await getLessonsByTopic(topicId);
        if (!fetchedLessons || fetchedLessons.length === 0) {
          throw new Error('Lessons for this topic are coming soon.');
        }
        selectedLesson = fetchedLessons[0];
      }

      if (!selectedLesson) {
        throw new Error('Lesson is unavailable.');
      }

      const moduleTitle = selectedLesson.topics?.modules?.title ?? topicTitleParam;
      const topicTitleResolved = selectedLesson.topics?.title ?? topicTitleParam;

      setResolvedTopicTitle(topicTitleResolved);

      setLesson({
        id: selectedLesson.id,
        title: selectedLesson.title,
        content: selectedLesson.content || 'Lesson content will be available shortly.',
        videoUrl: selectedLesson.video_url || undefined,
        audioUrl: selectedLesson.audio_url || undefined,
        moduleTitle,
        topicTitle: topicTitleResolved,
        subdivision: selectedLesson.category || undefined,
      });
    } catch (err: any) {
      console.error('Lesson load error:', err);
      setError(err.message || 'Unable to load lesson. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [userId, topicId, topicTitleParam, lessonIdParam]);

  useEffect(() => {
    if (!userId || !topicId) {
      return;
    }
    loadLesson();
  }, [userId, topicId, loadLesson]);

  const handleLessonCompletion = useCallback(async () => {
    if (completionTriggered.current || isCompleted || !lesson) return;
    completionTriggered.current = true;
    setIsCompleted(true);

    try {
      await markLessonComplete(lesson.id);
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    }
  }, [isCompleted, lesson]);

  useEffect(() => {
    if (!durationMillis || !lesson || completionTriggered.current) {
      return;
    }

    const percentage = durationMillis > 0 ? (positionMillis / durationMillis) * 100 : 0;
    if (percentage >= 90) {
      handleLessonCompletion();
    }
  }, [positionMillis, durationMillis, lesson, handleLessonCompletion]);

  const togglePlayback = () => {
    if (!hasAudio) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const seekTo = async (secondsDelta: number) => {
    if (!hasAudio) return;
    const current = status.currentTime ?? 0;
    const target = Math.max(0, current + secondsDelta);
    await player.seekTo(target);
  };

  const cycleSpeed = () => {
    if (!hasAudio) return;
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextSpeed = PLAYBACK_SPEEDS[(currentIndex + 1) % PLAYBACK_SPEEDS.length];
    setPlaybackSpeed(nextSpeed);
    player.setPlaybackRate(nextSpeed);
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleCheckUnderstanding = async () => {
    await handleLessonCompletion();
    if (!lesson) {
      return;
    }

    try {
      if (hasAudio) {
        player.pause();
      }
      if (videoPlayer) {
        videoPlayer.pause?.();
      }
    } catch (err) {
      console.warn('Failed to pause media before quiz:', err);
    }

    router.push({
      pathname: '/learning/quiz',
      params: {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        category: lesson.topicTitle ?? resolvedTopicTitle,
        subdivision: lesson.subdivision ?? '',
      },
    });
  };

  const audioProgress = durationMillis > 0 ? positionMillis / durationMillis : 0;

  useFocusEffect(
    useCallback(() => {
      return () => {
        try {
          if (hasAudio) {
            player.pause();
            player.seekTo(0).catch(() => {});
          }
        } catch (err) {
          console.warn('Failed to reset audio player on blur:', err);
        }
        try {
          videoPlayer?.pause?.();
          if (videoPlayer) {
            videoPlayer.currentTime = 0;
          }
        } catch (err) {
          console.warn('Failed to reset video player on blur:', err);
        }
      };
    }, [hasAudio, player, videoPlayer]),
  );

  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch (err) {
        console.warn('Failed to pause audio player on unmount:', err);
      }
      try {
        videoPlayer?.pause?.();
      } catch (err) {
        console.warn('Failed to pause video player on unmount:', err);
      }
    };
  }, [player, videoPlayer]);

  useEffect(() => {
    if (!lesson) {
      setFlashcards([]);
      setFlashcardsError(null);
      setFlashcardIndex(0);
      setFlashcardReveal(false);
      return;
    }

    let isMounted = true;

    const fetchFlashcards = async () => {
      setFlashcardsLoading(true);
      setFlashcardsError(null);

      try {
        let cards: Flashcard[] = [];
        let lastError: any = null;

        try {
          cards = await getFlashcardsByLesson(lesson.id);
        } catch (err: any) {
          lastError = err;
        }

        if ((!cards || cards.length === 0) && lesson.subdivision) {
          try {
            cards = await getFlashcardsByCategory(lesson.subdivision);
            lastError = null;
          } catch (err: any) {
            lastError = err;
          }
        }

        if (isMounted) {
          const normalizedCards = Array.isArray(cards) ? cards : [];
          setFlashcards(normalizedCards);
          setFlashcardIndex(0);
          setFlashcardReveal(false);

          if (normalizedCards.length === 0) {
            if (lastError?.message?.includes('lesson_id')) {
              setFlashcardsError('Flashcards are coming soon for this lesson.');
            } else if (lastError) {
              setFlashcardsError(lastError.message || 'Unable to load flashcards right now.');
            } else {
              setFlashcardsError('Flashcards are coming soon for this lesson.');
            }
          } else {
            setFlashcardsError(null);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setFlashcards([]);
          setFlashcardsError(err.message || 'Unable to load flashcards right now.');
        }
      } finally {
        if (isMounted) {
          setFlashcardsLoading(false);
        }
      }
    };

    fetchFlashcards();

    return () => {
      isMounted = false;
    };
  }, [lesson]);

  useEffect(() => {
    if (flashcards.length === 0) {
      setFlashcardIndex(0);
      setFlashcardReveal(false);
      return;
    }

    if (flashcardIndex >= flashcards.length) {
      setFlashcardIndex(0);
      setFlashcardReveal(false);
    }
  }, [flashcards.length, flashcardIndex]);

  const currentFlashcard = flashcards[flashcardIndex] ?? null;
  const flashcardRecord = (currentFlashcard as unknown as Record<string, any>) || null;
  const flashcardFront = flashcardRecord?.front ?? flashcardRecord?.front_text ?? '';
  const flashcardBack = flashcardRecord?.back ?? flashcardRecord?.back_text ?? '';

  const fallbackBody = useMemo(
    () => ({
      safe: (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.centerState}>
            <Ionicons name="alert-circle" size={56} color={Colors.semantic.error} />
            <Text style={styles.centerTitle}>Something went wrong</Text>
            <Text style={styles.centerMessage}>{error}</Text>
            <TouchableOpacity style={styles.pillButton} onPress={loadLesson}>
              <Text style={styles.pillButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      ),
      loading: (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={styles.centerMessage}>Loading lesson…</Text>
          </View>
        </SafeAreaView>
      ),
    }),
    [error, loadLesson],
  );

  if (loading) {
    return fallbackBody.loading;
  }

  if (error || !lesson) {
    return fallbackBody.safe;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {lesson.moduleTitle}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.topicLabel}>{resolvedTopicTitle}</Text>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonSubtitle}>
            Watch the walkthrough, listen to the audio guide, then skim the optional reading and flashcards before
            you jump into practice.
          </Text>
        </View>

        {lesson.videoUrl ? (
           <View style={styles.videoCard}>
             <VideoView
               player={videoPlayer}
               style={styles.videoPlayer}
               allowsFullscreen
               allowsPictureInPicture
             />
             <Text style={styles.videoCaption}>Video walkthrough</Text>
           </View>
         ) : null}

        {lesson.audioUrl ? (
          <View style={styles.audioCard}>
            <View style={styles.audioHeader}>
              <Ionicons name="headset-outline" size={18} color={Colors.primary.main} />
              <Text style={styles.audioHeaderText}>Audio guide</Text>
            </View>
            <Slider
              style={styles.progressSlider}
              value={positionMillis}
              minimumValue={0}
              maximumValue={Math.max(durationMillis, 1)}
              minimumTrackTintColor={Colors.primary.main}
              maximumTrackTintColor={Colors.ui.border}
              onSlidingComplete={(value) => player.seekTo(value / 1000)}
            />
            <View style={styles.audioTimingRow}>
              <Text style={styles.audioTimingText}>{formatTime(positionMillis)}</Text>
              <Text style={styles.audioTimingText}>{formatTime(durationMillis)}</Text>
            </View>

            <View style={styles.audioControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => seekTo(-10)}
                activeOpacity={0.8}
              >
                <Ionicons name="play-back-outline" size={20} color={Colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, styles.playButton]}
                onPress={togglePlayback}
                activeOpacity={0.85}
              >
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color={Colors.text.inverse} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => seekTo(10)}
                activeOpacity={0.8}
              >
                <Ionicons name="play-forward-outline" size={20} color={Colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.speedButton} onPress={cycleSpeed} activeOpacity={0.8}>
                <Ionicons name="speedometer-outline" size={18} color={Colors.primary.main} />
                <Text style={styles.speedLabel}>{playbackSpeed.toFixed(2)}x</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.progressBadgeRow}>
              <View style={styles.progressPill}>
                <View style={[styles.progressFillMini, { width: `${audioProgress * 100}%` }]} />
              </View>
              <Text style={styles.progressHint}>{Math.round(audioProgress * 100)}% listened</Text>
            </View>
          </View>
        ) : null}

        {lesson.content ? (
          <View style={styles.collapsibleCard}>
            <TouchableOpacity
              style={styles.notesHeader}
              onPress={() => setShowLessonContent((prev) => !prev)}
              activeOpacity={0.85}
            >
              <View style={styles.notesHeaderLeft}>
                <Ionicons name="book-outline" size={18} color={Colors.primary.main} />
                <Text style={styles.sectionHeading}>Read lesson</Text>
              </View>
              <Ionicons
                name={showLessonContent ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.text.secondary}
              />
            </TouchableOpacity>
            {showLessonContent && (
              <RenderHTML
                contentWidth={width - 40}
                source={{ html: lesson.content || '' }}
                baseStyle={styles.htmlBase}
                tagsStyles={{
                  p: styles.htmlParagraph,
                  ul: styles.htmlList,
                  ol: styles.htmlList,
                  li: styles.htmlListItem,
                  h1: styles.htmlHeading,
                  h2: styles.htmlHeading,
                  h3: styles.htmlHeading,
                }}
              />
            )}
          </View>
        ) : null}

        <View style={styles.flashcardSection}>
          <View style={styles.flashcardHeader}>
            <View style={styles.flashcardHeaderLeft}>
              <Ionicons name="layers-outline" size={18} color={Colors.primary.main} />
              <Text style={styles.sectionHeading}>Flashcards</Text>
            </View>
            {flashcards.length > 0 && (
              <Text style={styles.flashcardCounter}>
                {flashcardIndex + 1}/{flashcards.length}
              </Text>
            )}
          </View>

          {flashcardsLoading ? (
            <View style={styles.flashcardSkeleton}>
              <ActivityIndicator size="small" color={Colors.primary.main} />
              <Text style={styles.flashcardSkeletonText}>Loading flashcards…</Text>
            </View>
          ) : flashcards.length === 0 ? (
            <Text style={styles.flashcardEmpty}>
              {flashcardsError || 'Flashcards are coming soon for this lesson.'}
            </Text>
          ) : (
            <>
              <View style={styles.flashcardCard}>
                <Text style={styles.flashcardPromptLabel}>Prompt</Text>
                <Text style={styles.flashcardPromptText}>
                  {flashcardFront || 'Prompt coming soon.'}
                </Text>

                {flashcardReveal && (
                  <View style={styles.flashcardAnswer}>
                    <Text style={styles.flashcardAnswerLabel}>Answer</Text>
                    <Text style={styles.flashcardAnswerText}>
                      {flashcardBack || 'Answer coming soon.'}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.flashcardRevealButton,
                    flashcardReveal && styles.flashcardRevealButtonMuted,
                  ]}
                  onPress={() => setFlashcardReveal((prev) => !prev)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={flashcardReveal ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={flashcardReveal ? Colors.text.secondary : Colors.primary.main}
                  />
                  <Text
                    style={[
                      styles.flashcardRevealText,
                      flashcardReveal && styles.flashcardRevealTextMuted,
                    ]}
                  >
                    {flashcardReveal ? 'Hide answer' : 'Reveal answer'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.flashcardActions}>
                <TouchableOpacity
                  style={[
                    styles.flashcardNavButton,
                    flashcardIndex === 0 && styles.flashcardNavButtonDisabled,
                  ]}
                  onPress={() => {
                    if (flashcardIndex > 0) {
                      setFlashcardIndex((prev) => prev - 1);
                      setFlashcardReveal(false);
                    }
                  }}
                  disabled={flashcardIndex === 0}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="arrow-back"
                    size={18}
                    color={flashcardIndex === 0 ? Colors.text.tertiary : Colors.primary.main}
                  />
                  <Text
                    style={[
                      styles.flashcardNavText,
                      flashcardIndex === 0 && styles.flashcardNavTextDisabled,
                    ]}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.flashcardNavButton,
                    flashcardIndex === flashcards.length - 1 && styles.flashcardNavButtonDisabled,
                  ]}
                  onPress={() => {
                    if (flashcardIndex < flashcards.length - 1) {
                      setFlashcardIndex((prev) => prev + 1);
                      setFlashcardReveal(false);
                    }
                  }}
                  disabled={flashcardIndex === flashcards.length - 1}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.flashcardNavText,
                      flashcardIndex === flashcards.length - 1 && styles.flashcardNavTextDisabled,
                    ]}
                  >
                    Next
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={
                      flashcardIndex === flashcards.length - 1
                        ? Colors.text.tertiary
                        : Colors.primary.main
                    }
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.actionsStack}>
          <TouchableOpacity
            style={[styles.primaryAction, isCompleted && styles.primaryActionCompleted]}
            onPress={handleLessonCompletion}
            activeOpacity={0.9}
          >
            <Ionicons
              name={isCompleted ? 'checkmark-circle-outline' : 'checkmark'}
              size={18}
              color={Colors.text.inverse}
            />
            <Text style={styles.primaryActionText}>
              {isCompleted ? 'Lesson completed' : 'Mark lesson complete'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction} onPress={handleCheckUnderstanding} activeOpacity={0.9}>
            <Text style={styles.secondaryActionText}>Check understanding</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.primary.main} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    flex: 1,
    marginHorizontal: 12,
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
    gap: 10,
    ...DesignSystem.platformShadows.sm,
  },
  topicLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.primary.main,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  lessonTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  lessonSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  videoCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 12,
    gap: 8,
    ...DesignSystem.platformShadows.sm,
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    backgroundColor: '#000',
  },
  videoCaption: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  audioCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 18,
    gap: 16,
    ...DesignSystem.platformShadows.sm,
  },
  audioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioHeaderText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
  },
  progressSlider: {
    width: '100%',
    height: 32,
  },
  audioTimingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  audioTimingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  playButton: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
  },
  speedLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.primary.main,
  },
  progressBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressPill: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.background.secondary,
    overflow: 'hidden',
  },
  progressFillMini: {
    height: '100%',
    backgroundColor: Colors.primary.main,
  },
  progressHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  collapsibleCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
    ...DesignSystem.platformShadows.sm,
  },
  sectionHeading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flashcardSection: {
    backgroundColor: Colors.background.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 18,
    gap: 16,
    ...DesignSystem.platformShadows.sm,
  },
  flashcardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flashcardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flashcardCounter: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  flashcardSkeleton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  flashcardSkeletonText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  flashcardEmpty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  flashcardCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 20,
    gap: 14,
  },
  flashcardPromptLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  flashcardPromptText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  flashcardAnswer: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    padding: 14,
    gap: 6,
  },
  flashcardAnswerLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.primary.main,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  flashcardAnswerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.primary.dark,
    lineHeight: 22,
  },
  flashcardRevealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    backgroundColor: '#EEF2FF',
  },
  flashcardRevealButtonMuted: {
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
  },
  flashcardRevealText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.primary.main,
  },
  flashcardRevealTextMuted: {
    color: Colors.text.secondary,
  },
  flashcardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  flashcardNavButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.card,
  },
  flashcardNavButtonDisabled: {
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.secondary,
  },
  flashcardNavText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.primary.main,
  },
  flashcardNavTextDisabled: {
    color: Colors.text.tertiary,
  },
  htmlBase: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  htmlParagraph: {
    marginVertical: 6,
    color: Colors.text.secondary,
    fontFamily: 'Inter_400Regular',
  },
  htmlList: {
    marginVertical: 6,
  },
  htmlListItem: {
    marginVertical: 4,
    color: Colors.text.secondary,
    fontFamily: 'Inter_400Regular',
  },
  htmlHeading: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
    marginVertical: 8,
  },
  actionsStack: {
    gap: 12,
  },
  primaryAction: {
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionCompleted: {
    backgroundColor: Colors.semantic.success,
  },
  primaryActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.inverse,
  },
  secondaryAction: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
  },
  secondaryActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.primary.main,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  centerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  centerMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
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
    color: Colors.text.inverse,
  },
});
