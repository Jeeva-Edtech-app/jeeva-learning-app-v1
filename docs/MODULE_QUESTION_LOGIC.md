# Module Question Display & Logic Documentation

## 1. PRACTICE MODULE

### User Flow
```
Browse Topics → Select Subtopic → Load Questions (10-20) → Quiz Mode → Results → Practice Again
```

### Question Display Logic
- **Load**: Fetches 10-20 questions from `getQuestionsBySubdivision()` API
- **Format**: Questions mapped to include correct answer ID and formatted options
- **Display**: One question at a time in scrollable card format
- **Options**: Multiple choice displayed as selectable chips

### Answer Validation
```
User selects option → Clicks "Check Answer" → System validates:
  - Is option ID === correct_answer_id?
  - Records: {questionId, selectedOptionId, isCorrect, timeTaken}
  - Displays feedback immediately:
    ✅ Green highlight + checkmark = Correct
    ❌ Red highlight + X = Wrong
  - Shows explanation from question.explanation
  - Disables options (cannot reselect after submit)
```

### Session Management
| Event | Action |
|-------|--------|
| Quiz Start | `startPracticeSession()` creates session entry |
| Answer Recorded | `recordAnswer()` adds to answers[] array |
| Question Submit | `recordAnswer()` + `setIsSubmitted(true)` |
| Next Question | Clear selection, move index forward, reset timer |
| Back Button | Move index back, remove last answer from array |
| Quiz Complete | `savePracticeResults()` → stores all answers in `practice_results` table |

### Results Page
```
Score: (correctCount / totalQuestions) × 100%
Displays:
- Correct count with green checkmark
- Incorrect count with red X
- Time taken (MM:SS format)
- Option to review answers (shows question + correct answer + explanation)
- Button to practice again (restarts from topic selection)
```

### Database Writes
- **practice_sessions**: One row per session
- **practice_results**: One row per question attempted
```typescript
{
  session_id, 
  question_id, 
  selected_option_id, 
  is_correct, 
  time_taken_seconds
}
```

---

## 2. LEARNING MODULE

### User Flow
```
View Topics (Linear Sequential) → Select Topic → View Lesson Content 
→ (Accordion: Video/Audio/Reading) → 10-15 Assessment Questions 
→ Must Score ≥80% to Complete → Unlock Next Topic → Repeat
```

### Key Rules
- **Sequential Unlock**: Topics MUST be completed in order
  - Topic N+1 is LOCKED until Topic N is COMPLETED
  - Cannot skip ahead
- **Mandatory 80% Pass**: User MUST achieve ≥80% to unlock next topic
- **No Optional Learning**: Users cannot choose which topic to learn
- **Progress Linear**: Always follows recommended order

### Question Display Logic
```
Lesson Content displayed in accordion:
├─ Video URL (if available) → embedded player
├─ Audio/Podcast URL (if available) → audio player
└─ Readable Lesson Text (if available) → expandable/collapsible

THEN → Assessment Quiz (10-15 questions)
```

### Assessment Quiz Flow
```javascript
PASS_THRESHOLD = 80 // Hardcoded constant

1. Load questions for lesson_id using useQuestionsByLesson()
2. Display one question at a time
3. User selects option → Click "Check Answer"
4. Validate: isCorrect = option.is_correct === true?
5. Record answer: {questionId, selectedOptionId, isCorrect}
6. Show feedback (green/red + explanation)
7. Continue until all questions answered

COMPLETION LOGIC:
Score = (correctCount / totalQuestions) × 100

if (score >= PASS_THRESHOLD) {
  ✅ Lesson PASSED
  await markLessonComplete(lessonId) // Writes to learning_completions
  Next lesson UNLOCKED
} else {
  ⚠️  Lesson NOT PASSED
  Message: "Reach at least 80% before unlocking next lesson"
  Action: "Retry Quiz" button available
}
```

### Results Screen (Learning)
```
If PASSED (≥80%):
┌─ Status: "Lesson completed!" (green)
├─ Score Display: "X/Y questions" + "Z% mastery"
├─ Message: "Great work—move to the next lesson"
├─ Buttons:
│  ├─ Review answers (see each question + correct answer + explanation)
│  ├─ Retry quiz (retake the assessment)
│  └─ Next lesson (proceed to next locked topic)
└─ Auto-creates learning_completions record

If NOT PASSED (<80%):
┌─ Status: "Review required" (yellow/orange)
├─ Score Display: "X/Y questions" + "Z% mastery"
├─ Message: "Reach at least 80% before unlocking next lesson"
├─ Buttons:
│  ├─ Review answers
│  ├─ Retry quiz
│  └─ Review lesson (go back to content)
└─ learning_completions NOT created (stays locked)
```

### Database Records
```typescript
// When score ≥ 80%:
INSERT INTO learning_completions {
  user_id,
  lesson_id,
  completed_at: NOW(),
  is_completed: true
}

// Always records in lesson_quiz_results:
INSERT INTO lesson_quiz_results {
  user_id,
  lesson_id,
  score_percentage,
  passed: (percentage >= 80),
  completed_at: NOW()
}
```

### Topic Progression Logic
```
Topic Status Types:
1. LOCKED: Previous topic not completed
2. AVAILABLE: Ready to start (first topic OR previous completed)
3. IN_PROGRESS: Currently working through lessons
4. COMPLETED: All lessons passed (≥80% each)

Rule: User can ONLY access:
- Currently available/in-progress topic
- Cannot jump to future topics (requires previous completion)
```

---

## 3. MOCK EXAM MODULE

### User Flow
```
Mock Exam Hub → Select Part (A or B) → Review Instructions & Tips 
→ Full Exam Interface (Timed) → Question Navigator & Flag System 
→ Submit All Answers → Results & Analytics → Compare History
```

### Exam Configuration
```typescript
MOCK_EXAM_CONFIG = {
  PART_A: {
    title: "Numeracy (Part A)",
    questionCount: 15,
    durationMinutes: 22.5,
    passingScore: 13/15 (87%)
  },
  PART_B: {
    title: "Clinical Knowledge (Part B)",
    questionCount: 60,
    durationMinutes: 90,
    passingScore: 48/60 (80%)
  }
}
```

### Question Display Logic
```
Load all questions for exam_part (part_a OR part_b)
│
├─ Exam Interface displays:
│  ├─ Header:
│  │  ├─ Timer: MM:SS countdown
│  │  ├─ Question: "X of Y"
│  │  └─ Progress bar
│  │
│  ├─ Main Content:
│  │  ├─ Question text + optional image
│  │  ├─ 4 Multiple choice options
│  │  └─ "Flag for review" button (toggle)
│  │
│  └─ Footer:
│     ├─ Previous button (skip to any question via navigator)
│     ├─ Next button (navigate questions)
│     └─ Submit Exam button (only after all answered)
│
├─ Question Navigator (drawer/modal):
│  ├─ Visual grid of all questions (1-15 or 1-60)
│  ├─ Color coding:
│  │  ├─ ⚪ Unanswered (white)
│  │  ├─ ✓ Answered (blue)
│  │  ├─ 🚩 Flagged (red/yellow)
│  │  └─ ⭐ Current (highlighted)
│  └─ Tap any question to jump to it
│
└─ Tools Available:
   ├─ Calculator (on-screen for Part A)
   ├─ Timer display
   └─ Flag button (mark for review)
```

### Answer Recording
```javascript
// BEFORE submission (in-memory):
answers[] = [{
  questionId,
  selectedOptionId,
  isCorrect: (selectedOptionId === question.correct_answer_id),
  timeTaken
}, ...]

// AFTER submission:
submitMockExam() {
  1. Calculate: correctAnswers = answers.filter(a => a.isCorrect).length
  2. Calculate: scorePercentage = (correctAnswers / totalQuestions) × 100
  3. Check: passed = (scorePercentage >= PASS_THRESHOLD)
  4. Record in mock_sessions table
  5. INSERT individual answers in mock_results table
}
```

### Timer & Auto-Submit
```
Timer countdown: 22.5 min (Part A) or 90 min (Part B)
├─ Continuously updates UI every 1 second
├─ When timeLeft === 0:
│  └─ Auto-trigger: submitMockExam()
│  └─ Disable further answering
│  └─ Show results page
└─ User can manually submit before timer ends
```

### Results & Analytics
```
Post-Exam Results Screen:
┌─ Score: "X/Y" + "Z%"
├─ Pass/Fail Status
├─ Time Taken: MM:SS
├─ Correct/Incorrect Breakdown (visual cards)
├─ Topic-wise Performance (if categorized)
│
├─ Actions:
│  ├─ Review Answers (see each question + selected + correct)
│  ├─ Retry Exam (start over, fresh session)
│  ├─ View History (compare with previous attempts)
│  └─ Back to Hub
│
└─ Database Records:
   ├─ mock_sessions: One row per exam attempt
   │  {user_id, exam_part, started_at, completed_at, 
   │   total_questions, correct_answers, score_percentage, 
   │   time_taken_minutes, passed}
   │
   └─ mock_results: One row per question
      {mock_session_id, question_id, selected_option_id, 
       is_correct, time_taken_seconds}
```

### Exam History
```
Tracks all past attempts:
├─ Displays previous exam sessions
├─ Shows score trend (line graph over attempts)
├─ Filters by Part A / Part B
├─ Allows comparison: "Best: 92% | Latest: 78%"
└─ Can review any past exam's answers
```

### Resume Functionality
```
If exam interrupted:
├─ Snapshot stored locally (React state)
├─ Hub shows: "Resume your mock exam" card
├─ Options:
│  ├─ Continue from Question X (remaining time)
│  └─ Discard (start fresh)
├─ Timer resumes from saved state
└─ Answers preserved across app close (local storage)
```

---

## Summary Table

| Aspect | Practice | Learning | Mock Exam |
|--------|----------|----------|-----------|
| **Question Load** | 10-20 per session | 10-15 per lesson | 15 (Part A) / 60 (Part B) |
| **Display Mode** | One at a time | One at a time | One at a time + Navigator |
| **Pass Requirement** | None (practice only) | ≥80% mandatory | Part A: 87% / Part B: 80% |
| **Progression** | Repeatable anytime | Sequential + locked | Repeatable, tracked history |
| **Feedback** | Instant after each Q | After all Q answered | After exam submitted |
| **Time Tracking** | Per question | Total quiz time | Timer with auto-submit |
| **Use Case** | Familiarization | Structured learning | Exam simulation |
| **Prerequisite** | None | Previous topic completed | None |
| **Retakes** | Unlimited | Unlimited (until 80%) | Unlimited (history tracked) |

---

## Validation Constants

```typescript
// Hardcoded thresholds
PRACTICE_MODULE.PASS_THRESHOLD = N/A (no pass requirement)
LEARNING_MODULE.PASS_THRESHOLD = 80 // From app/(tabs)/learning/quiz.tsx line 18
MOCK_EXAM_A.PASS_THRESHOLD = 13/15 (87%)
MOCK_EXAM_B.PASS_THRESHOLD = 48/60 (80%)

// Question limits
PRACTICE_MODULE.QUESTIONS_PER_SESSION = 10-20 (configurable)
LEARNING_MODULE.QUESTIONS_PER_LESSON = 10-15
MOCK_EXAM_A.QUESTIONS = 15 (fixed)
MOCK_EXAM_B.QUESTIONS = 60 (fixed)
```

---

## File References

| Module | Main Files | API Handler |
|--------|-----------|-------------|
| **Practice** | `app/(tabs)/practice/quiz.tsx` | `src/api/practice.ts` |
| | `app/(tabs)/practice/results.tsx` | `startPracticeSession()` |
| | | `savePracticeResults()` |
| **Learning** | `app/(tabs)/learning/quiz.tsx` | `src/api/learning.ts` |
| | `app/(tabs)/learning/quiz-results.tsx` | `src/api/quiz.ts` |
| | `app/(tabs)/learning/index.tsx` | `markLessonComplete()` |
| **Mock Exam** | `app/(tabs)/mockexam/exam.tsx` | `src/api/practice.ts` |
| | `app/(tabs)/mockexam/index.tsx` | `startMockExam()` |
| | `app/(tabs)/mockexam/setup.tsx` | `submitMockExam()` |
