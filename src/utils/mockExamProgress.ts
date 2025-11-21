import AsyncStorage from '@react-native-async-storage/async-storage';
import { PracticeAnswer } from '@/api/practice';

const PROGRESS_KEY_PREFIX = 'mockExam:progress';

export interface MockExamSnapshot {
  examId: string;
  examPart: 'part_a' | 'part_b';
  examTitle: string;
  durationMinutes: number;
  questionCount: number;
  startedAt: string;
  legacyExamId?: number | null;
  state: {
    currentIndex: number;
    selectedOptionId: string | number | null;
    submitted: boolean;
    answers: PracticeAnswer[];
    flaggedQuestionIds: string[];
    timeLeft: number;
    elapsedSeconds: number;
  };
}

const getKey = (userId: string) => `${PROGRESS_KEY_PREFIX}:${userId}`;

export async function loadMockExamSnapshot(userId: string): Promise<MockExamSnapshot | null> {
  try {
    const key = getKey(userId);
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored) as MockExamSnapshot;
  } catch (error) {
    console.warn('Failed to load mock exam snapshot:', error);
    return null;
  }
}

export async function saveMockExamSnapshot(userId: string, snapshot: MockExamSnapshot): Promise<void> {
  try {
    const key = getKey(userId);
    await AsyncStorage.setItem(key, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('Failed to persist mock exam snapshot:', error);
  }
}

export async function clearMockExamSnapshot(userId: string): Promise<void> {
  try {
    const key = getKey(userId);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear mock exam snapshot:', error);
  }
}

export function hasActiveMockExam(snapshot: MockExamSnapshot | null): snapshot is MockExamSnapshot {
  return Boolean(snapshot && snapshot.examId);
}
