import AsyncStorage from '@react-native-async-storage/async-storage';
import { PracticeAnswer } from '@/api/practice';

const HISTORY_KEY_PREFIX = 'mockExam:history';
const HISTORY_LIMIT = 12;

export type StoredMockExamQuestion = {
  id: string | number;
  question_text: string;
  explanation?: string;
  correct_answer_id: string | number | null;
  category?: string | null;
  subdivision?: string | null;
  question_options?: {
    id: string | number;
    option_text: string;
    is_correct: boolean;
  }[];
};

export type StoredMockExamResult = {
  sessionId: string;
  examPart: 'part_a' | 'part_b';
  examTitle: string;
  completedAt: string;
  scorePercentage: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTakenSeconds: number;
  durationMinutes: number;
  flaggedCount: number;
  answers: PracticeAnswer[];
  questions: StoredMockExamQuestion[];
};

const getHistoryKey = (userId: string) => `${HISTORY_KEY_PREFIX}:${userId}`;

export async function loadMockExamHistoryLocal(userId: string): Promise<StoredMockExamResult[]> {
  try {
    const key = getHistoryKey(userId);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const entries = JSON.parse(raw) as StoredMockExamResult[];
    if (!Array.isArray(entries)) {
      return [];
    }
    return entries;
  } catch (error) {
    console.warn('Failed to load mock exam history cache:', error);
    return [];
  }
}

export async function loadMockExamResultLocal(
  userId: string,
  sessionId: string,
): Promise<StoredMockExamResult | null> {
  const history = await loadMockExamHistoryLocal(userId);
  return history.find((entry) => entry.sessionId === sessionId) ?? null;
}

export async function saveMockExamResultLocal(
  userId: string,
  payload: StoredMockExamResult,
): Promise<void> {
  if (!userId) return;
  try {
    const key = getHistoryKey(userId);
    const history = await loadMockExamHistoryLocal(userId);
    const next = [payload, ...history.filter((entry) => entry.sessionId !== payload.sessionId)].slice(
      0,
      HISTORY_LIMIT,
    );
    await AsyncStorage.setItem(key, JSON.stringify(next));
  } catch (error) {
    console.warn('Failed to persist mock exam result cache:', error);
  }
}
