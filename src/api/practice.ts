import { supabase } from '@/lib/supabase';
import { FIXED_MODULE_IDS } from '@/api/constants';

const MOCK_PASS_RULES: Record<'part_a' | 'part_b', number> = {
  part_a: 80,
  part_b: 70,
};

export interface Question {
  id: string;
  lesson_id?: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  explanation?: string;
  image_url?: string;
  is_active: boolean;
  module_type?: 'practice' | 'learning' | 'mock_exam';
  category?: string;
  subdivision?: string;
  exam_part?: 'part_a' | 'part_b';
  created_at: string;
  updated_at: string;
  question_options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  display_order: number;
}

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && UUID_REGEX.test(value);

const coerceIdentifier = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  const trimmed = value.trim();
  if (isUuid(trimmed)) return trimmed;
  const numeric = Number(trimmed);
  return Number.isNaN(numeric) ? trimmed : numeric;
};

const mapAnswersToRowPayload = (
  parentKey: 'session_id' | 'mock_session_id' | 'mock_exam_id',
  parentId: string | number,
  answers: PracticeAnswer[],
) =>
  answers.map((answer) => ({
    [parentKey]: parentId,
    question_id: coerceIdentifier(answer.questionId),
    selected_option_id: coerceIdentifier(answer.selectedOptionId),
    is_correct: answer.isCorrect,
    time_taken_seconds:
      typeof answer.timeTaken === 'number' && Number.isFinite(answer.timeTaken)
        ? Math.max(Math.floor(answer.timeTaken), 0)
        : null,
  }));

export interface PracticeSession {
  id: string | number;
  user_id: string;
  module_id?: string | number | null;
  subdivision?: string | null;
  topic_id?: string | number | null;
  created_at?: string;
  updated_at?: string;
  practice_results?: PracticeResultRow[];
}

export interface PracticeAnswer {
  questionId: string | number;
  selectedOptionId: string | number | null;
  isCorrect: boolean;
  timeTaken: number;
}

export interface PracticeResultRow {
  id: string | number;
  session_id: string | number;
  answer_log?: PracticeAnswer[];
  question_id?: string | number;
  selected_option_id?: string | number | null;
  is_correct?: boolean;
  time_taken_seconds?: number | null;
  created_at?: string;
}

const toNumericIdentifier = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  return null;
};

type NormalizedResultRow = Record<string, any> & {
  session_id: number;
  question_id: number;
  selected_option_id: number | null;
};

const normalizeResultRows = (rows: Record<string, any>[]): NormalizedResultRow[] =>
  rows
    .map((row) => {
      const normalizedSessionId = toNumericIdentifier(row.session_id);
      const normalizedQuestionId = toNumericIdentifier(row.question_id);
      const normalizedSelectedOptionId =
        row.selected_option_id === null || row.selected_option_id === undefined
          ? null
          : toNumericIdentifier(row.selected_option_id);

      if (normalizedSessionId === null || normalizedQuestionId === null) {
        return null;
      }

      return {
        ...row,
        session_id: normalizedSessionId,
        question_id: normalizedQuestionId,
        selected_option_id: normalizedSelectedOptionId,
      };
    })
    .filter((row): row is NormalizedResultRow => row !== null);

const persistPracticeSessionSummary = async (
  sessionIdCandidate: string | number,
  answers: PracticeAnswer[],
) => {
  const sessionId = toNumericIdentifier(sessionIdCandidate);
  if (sessionId === null) {
    console.warn('savePracticeResults: unable to normalize session identifier', {
      sessionIdCandidate,
    });
    return;
  }

  const totalQuestions = answers.length;
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const skippedCount = answers.filter((answer) => answer.selectedOptionId == null).length;
  const incorrectCount = Math.max(totalQuestions - correctCount - skippedCount, 0);

  const { error } = await supabase
    .from('practice_sessions')
    .update({
      total_questions: totalQuestions,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      skipped_count: skippedCount,
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) {
    console.error('savePracticeResults: failed to persist practice summary', error);
  }
};

export interface MockSession {
  id: string;
  user_id: string;
  exam_part?: 'part_a' | 'part_b';
  started_at?: string;
  completed_at?: string;
  total_questions?: number;
  correct_answers?: number;
  score_percentage?: number;
  time_taken_minutes?: number;
  passed?: boolean;
  created_at?: string;
  updated_at?: string;
  legacy_exam_id?: number | null;
}

export const getQuestionsByLesson = async (lessonId: string): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_options (
        id,
        option_text,
        is_correct,
        display_order
      )
    `)
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getQuestionsByTopic = async (topicId: string, limit: number = 10): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_options (*),
      lessons!inner (
        topic_id
      )
    `)
    .eq('lessons.topic_id', topicId)
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const getQuestionsByModule = async (
  moduleType: 'practice' | 'learning' | 'mock_exam',
  limit: number = 20
): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_options (
        id,
        option_text,
        is_correct,
        display_order
      )
    `)
    .eq('module_type', moduleType)
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const getQuestionsBySubdivision = async (
  subdivision: string,
  limit: number = 20,
): Promise<Question[]> => {
  const normalized = subdivision.trim();
  const escaped = normalized.replace(/[%_]/g, (match) => `\\${match}`);
  const fuzzy = `%${escaped}%`;

  const buildBaseQuery = () =>
    supabase
      .from('questions')
      .select(
        `
      *,
      question_options (
        id,
        option_text,
        is_correct,
        display_order
      )
    `,
      )
      .eq('module_type', 'practice')
      .limit(limit);

  type Attempt = {
    column: 'subdivision' | 'category';
    op: 'eq' | 'ilike';
    value: string;
  };

  const attempts: Attempt[] = [
    { column: 'subdivision', op: 'eq', value: normalized },
    { column: 'category', op: 'eq', value: normalized },
    { column: 'subdivision', op: 'ilike', value: normalized },
    { column: 'category', op: 'ilike', value: normalized },
    { column: 'subdivision', op: 'ilike', value: fuzzy },
    { column: 'category', op: 'ilike', value: fuzzy },
  ];

  for (const attempt of attempts) {
    if (!attempt.value) {
      continue;
    }
    let query = buildBaseQuery();
    if (attempt.op === 'eq') {
      query = query.eq(attempt.column, attempt.value);
    } else {
      query = query.ilike(attempt.column, attempt.value);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('getQuestionsBySubdivision attempt failed', {
        subdivision: normalized,
        attempt,
        error,
      });
      continue;
    }

    if (data && data.length > 0) {
      return data;
    }
  }

  const { data: fallbackData, error: fallbackError } = await buildBaseQuery();
  if (fallbackError) throw fallbackError;
  return fallbackData ?? [];
};

export const getQuestionsByCategory = async (
  category: string,
  subdivision?: string,
  limit: number = 10
): Promise<Question[]> => {
  let query = supabase
    .from('questions')
    .select(`
      *,
      question_options (
        id,
        option_text,
        is_correct,
        display_order
      )
    `)
    .eq('module_type', 'learning')
    .eq('category', category)
    .limit(limit);

  if (subdivision) {
    query = query.eq('subdivision', subdivision);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const getMockExamQuestions = async (
  examPart: 'part_a' | 'part_b'
): Promise<Question[]> => {
  const limit = examPart === 'part_a' ? 15 : 120;

  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_options (
        id,
        option_text,
        is_correct,
        display_order
      )
    `)
    .eq('module_type', 'mock_exam')
    .eq('exam_part', examPart)
    .limit(limit);

  if (error) throw error;
  return data || [];
};

const FALLBACK_PRACTICE_MODULE_ID = FIXED_MODULE_IDS.PRACTICE;
let practiceModuleIdCache: string | null = null;

const normalizeModuleId = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  return raw.length > 0 ? raw : null;
};

const resolvePracticeModuleId = async (): Promise<string | null> => {
  if (practiceModuleIdCache !== null) {
    return practiceModuleIdCache;
  }

  const { data, error } = await supabase
    .from('modules')
    .select('id, title')
    .eq('is_active', true)
    .in('title', ['Practice Module', 'Practice'])
    .order('display_order', { ascending: true })
    .limit(1);

  if (error) {
    throw error;
  }

  let record = data?.[0];

  if (!record) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('modules')
      .select('id, title')
      .eq('is_active', true)
      .ilike('title', '%practice%')
      .order('display_order', { ascending: true })
      .limit(1);

    if (fallbackError) {
      throw fallbackError;
    }

    record = fallbackData?.[0];
  }

  const resolved = normalizeModuleId(record?.id);
  practiceModuleIdCache = resolved ?? FALLBACK_PRACTICE_MODULE_ID;
  return practiceModuleIdCache;
};
type PracticeSessionContext = {
  subdivision?: string;
  topicId?: string | number;
};

const buildPracticeSessionPayloads = (
  userId: string,
  moduleId: string | null,
  context?: PracticeSessionContext,
) => {
  const base: Record<string, any> = {
    user_id: userId,
    started_at: new Date().toISOString(),
  };

  if (context?.subdivision) {
    base.subdivision = context.subdivision;
  }
  if (context?.topicId !== undefined) {
    base.topic_id = coerceIdentifier(context.topicId);
  }

  const candidates: Record<string, any>[] = [];
  const moduleCandidates: (string | number | null)[] = [];

  if (moduleId) {
    if (isUuid(moduleId)) {
      moduleCandidates.push(moduleId);
    }
    const numeric = Number(moduleId);
    if (!Number.isNaN(numeric)) {
      moduleCandidates.push(numeric);
    }
    moduleCandidates.push(moduleId);
  }

  moduleCandidates.push(null);

  const seen = new Set<string>();
  moduleCandidates.forEach((candidate) => {
    const key = candidate === null ? 'null' : `${typeof candidate}-${candidate}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (candidate === null) {
      candidates.push({ ...base });
    } else {
      candidates.push({ ...base, module_id: candidate });
    }
  });

  return candidates;
};

export const startPracticeSession = async (
  userId: string,
  context?: PracticeSessionContext,
): Promise<PracticeSession> => {
  const moduleId = await resolvePracticeModuleId();
  const payloads = buildPracticeSessionPayloads(userId, moduleId, context);

  let lastError: any = null;

  for (const payload of payloads) {
    const { data, error } = await supabase.from('practice_sessions').insert(payload).select().single();
    if (!error) {
      return data as PracticeSession;
    }

    lastError = error;
    const retryableCodes = new Set(['22P02', '23502', '23503']);
    if (!retryableCodes.has(error.code ?? '')) {
      throw error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('Unable to create practice session');
};

export const savePracticeResults = async (
  sessionId: string | number,
  answers: PracticeAnswer[],
): Promise<PracticeResultRow[] | PracticeResultRow | null> => {
  if (answers.length === 0) {
    return null;
  }

  const resolvedSessionId = coerceIdentifier(sessionId) ?? sessionId;

  const { data, error } = await supabase
    .from('practice_results')
    .insert({
      session_id: resolvedSessionId,
      answer_log: answers,
    })
    .select()
    .single();

  if (!error) {
    await persistPracticeSessionSummary(resolvedSessionId, answers);
    return data as PracticeResultRow;
  }

  const fallbackCodes = new Set(['42703', '22P02', '23502']);
  if (!fallbackCodes.has(error.code ?? '') && !error.message?.includes('answer_log')) {
    throw error;
  }

  const fallbackRows = mapAnswersToRowPayload('session_id', resolvedSessionId, answers);

  if (fallbackRows.length === 0) {
    await persistPracticeSessionSummary(resolvedSessionId, answers);
    return null;
  }

  const normalizedRows = normalizeResultRows(fallbackRows);

  if (normalizedRows.length > 0) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('practice_results')
      .insert(normalizedRows)
      .select();

    if (!fallbackError) {
      await persistPracticeSessionSummary(resolvedSessionId, answers);
      return (fallbackData as PracticeResultRow[]) ?? null;
    }

    if (!fallbackCodes.has(fallbackError.code ?? '')) {
      throw fallbackError;
    }
  }

  await persistPracticeSessionSummary(resolvedSessionId, answers);
  return null;
};

export const getPracticeHistory = async (userId: string, limit: number = 20): Promise<PracticeSession[]> => {
  const { data, error } = await supabase
    .from('practice_sessions')
    .select(`
      *,
      practice_results (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const startMockExam = async (
  userId: string,
  params: { examPart: 'part_a' | 'part_b'; totalQuestions: number },
): Promise<MockSession> => {
  const { examPart, totalQuestions } = params;
  const startedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from('mock_sessions')
    .insert({
      user_id: userId,
      exam_part: examPart,
      total_questions: totalQuestions,
      started_at: startedAt,
    })
    .select()
    .single();

  if (error) throw error;

  let legacyExamId: number | null = null;
  try {
    const { data: legacyData, error: legacyError } = await supabase
      .from('mock_exams')
      .insert({
        user_id: userId,
        started_at: startedAt,
        total_questions: totalQuestions,
        correct_count: 0,
        incorrect_count: 0,
        skipped_count: 0,
      })
      .select()
      .single();

    if (!legacyError && legacyData) {
      legacyExamId = legacyData.id;
    } else if (legacyError && !['42P01', '42703'].includes(legacyError.code ?? '')) {
      console.warn('mock_exams insert failed:', legacyError);
    }
  } catch (legacyInsertError) {
    console.warn('mock_exams insert unexpected failure:', legacyInsertError);
  }

  return { ...(data as MockSession), legacy_exam_id: legacyExamId };
};

export const submitMockExam = async (
  sessionId: string,
  results: {
    examPart: 'part_a' | 'part_b';
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeTakenSeconds: number;
    answers: PracticeAnswer[];
    legacyExamId?: number | null;
  },
): Promise<void> => {
  const { legacyExamId } = results;
  const summary = {
    completed_at: new Date().toISOString(),
    correct_answers: results.correctAnswers,
    score_percentage: results.score,
    time_taken_minutes: Math.ceil(results.timeTakenSeconds / 60),
    passed: results.score >= MOCK_PASS_RULES[results.examPart],
    total_questions: results.totalQuestions,
  };

  const { error: updateError } = await supabase
    .from('mock_sessions')
    .update(summary)
    .eq('id', sessionId);

  if (updateError) throw updateError;

  if (legacyExamId !== undefined && legacyExamId !== null) {
    const totalQuestions = results.totalQuestions;
    const incorrectCount = Math.max(totalQuestions - results.correctAnswers, 0);
    const skippedCount = Math.max(totalQuestions - results.answers.length, 0);

    try {
      const { error: legacyUpdateError } = await supabase
        .from('mock_exams')
        .update({
          completed_at: summary.completed_at,
          total_questions: totalQuestions,
          correct_count: results.correctAnswers,
          incorrect_count: incorrectCount,
          skipped_count: skippedCount,
        })
        .eq('id', legacyExamId);

      if (legacyUpdateError && !['42P01', '42703'].includes(legacyUpdateError.code ?? '')) {
        console.warn('mock_exams update failed:', legacyUpdateError);
      }
    } catch (legacyUpdateUnexpected) {
      console.warn('mock_exams update unexpected error:', legacyUpdateUnexpected);
    }
  }

  if (results.answers.length === 0) return;

  try {
    const sessionRows = mapAnswersToRowPayload('mock_session_id', sessionId, results.answers);
    const { error: insertError } = await supabase.from('mock_results').insert(sessionRows);
    if (!insertError) {
      return;
    }

    const fallbackAllowed =
      ['42703', '22P02', '23502'].includes(insertError.code ?? '') ||
      insertError.message?.includes('mock_session_id');

    if (!fallbackAllowed) {
      console.warn('mock_results insert failed; skipping detailed rows', insertError);
      return;
    }

    if (legacyExamId === undefined || legacyExamId === null) {
      console.warn('mock_results insert skipped (no legacy exam ID available).');
      return;
    }

    console.info('mock_results insert skipped due to legacy schema mismatch.');
  } catch (resultsInsertError) {
    console.error('mock_results insert unexpected error:', resultsInsertError);
  }
};

export const getMockExamHistory = async (userId: string): Promise<MockSession[]> => {
  const { data, error } = await supabase
    .from('mock_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as MockSession[]) || [];
};
