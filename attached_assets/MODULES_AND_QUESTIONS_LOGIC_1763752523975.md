# Jeeva Learning - Modules & Questions Logic Documentation

**Version:** Final  
**Date:** November 21, 2025  
**Status:** ✅ Validated Against Module Structure

---

## Executive Summary

Three distinct modules with different question display and interaction logic:

| Module | Purpose | Question Count | User Flow | Passing Criteria |
|--------|---------|-----------------|-----------|------------------|
| **Practice** | Familiarize with exam scenarios | Any | Free navigation | No requirement |
| **Learning** | Structured learning with assessment | 10-15 per subtopic | Sequential | 80% minimum |
| **Mock Exam** | Real exam simulation | Full exam length | Timed | Pass/fail |

---

## Module 1: PRACTICE MODULE

### Purpose
Users familiarize themselves with NMC CBT exam question types and scenarios. Can practice freely with no progression requirements.

### Structure

**Topics (2 total):**

1. **Numeracy**
   - Subtopics (4):
     - Dosage Calculations
     - Unit Conversions
     - IV Flow Rate Calculations
     - Fluid Balance
   - Questions per subtopic: Multiple choice questions

2. **Clinical Knowledge**
   - Subtopics (5):
     - Medical-Surgical Nursing
     - Pharmacology
     - Infection Control
     - Wound Care
     - Palliative Care
   - Questions per subtopic: Multiple choice questions

### Question Logic - Practice Module

**Database Fields:**
```typescript
{
  moduleType: 'practice',
  category: 'Numeracy' | 'Clinical Knowledge',
  subdivision: 'Dosage Calculations' | 'Unit Conversions' | etc,
  questionType: 'multiple_choice',
  difficulty: 'easy' | 'medium' | 'hard',
  points: 1,
  is_active: true
}
```

**User Flow:**
```
1. Select Topic (Numeracy OR Clinical Knowledge)
   ↓
2. Select Subtopic (e.g., "Dosage Calculations")
   ↓
3. Load ALL questions for that subtopic
   ↓
4. Display one question at a time with 4 options (A, B, C, D)
   ↓
5. User selects answer
   ↓
6. Show result (Correct/Incorrect)
   ↓
7. Show correct answer with explanation
   ↓
8. Move to next question OR
   9. End practice and see results summary
```

**Display Rules:**
- ✅ No question order restriction (can be randomized or sequential)
- ✅ User can skip questions
- ✅ User can mark for review
- ✅ No time limit per question
- ✅ Can practice same subtopic unlimited times
- ✅ Results shown immediately after each answer

**Results Summary:**
```
- Total questions attempted: X
- Correct answers: Y
- Incorrect answers: Z
- Score: Y/X (percentage)
- Topic-wise breakdown
- Option to practice again
```

**Admin Panel Control:**
- Add/Edit/Delete questions for each subtopic
- Set difficulty level
- Add explanations for each answer
- Upload images/diagrams
- Mark as active/inactive

---

## Module 2: LEARNING MODULE

### Purpose
Structured learning where users progressively learn through content (video, audio, text) and then assess their understanding with 10-15 questions per subtopic. Must achieve 80% to progress.

### Structure

**8 Topics with Sequential Progression:**

```
Topic 1: Numeracy (1.1 - 1.4)
  ├── 1.1 Dosage Calculations ← Start here
  ├── 1.2 Unit Conversions ← Unlock after 1.1 (80% pass)
  ├── 1.3 IV Flow Rate Calculations ← Unlock after 1.2 (80% pass)
  └── 1.4 Fluid Balance ← Unlock after 1.3 (80% pass)
  
Topic 2: The NMC Code (2.1 - 2.4)
  ├── 2.1 Prioritise People
  ├── 2.2 Practice Effectively
  ├── 2.3 Preserve Safety
  └── 2.4 Promote Professionalism

Topic 3: Mental Capacity Act (3.1 - 3.4)
  ├── 3.1 Presumption of Capacity
  ├── 3.2 Assessing Capacity
  ├── 3.3 Best Interests Decisions
  └── 3.4 Advanced Care Planning

Topic 4: Safeguarding (4.1 - 4.3)
  ├── 4.1 Recognising Abuse
  ├── 4.2 Reporting Protocols
  └── 4.3 Child Protection

Topic 5: Consent & Confidentiality (5.1 - 5.3)
  ├── 5.1 Valid Consent
  ├── 5.2 GDPR & Confidentiality
  └── 5.3 Confidentiality vs. Safeguarding

Topic 6: Equality & Diversity (6.1 - 6.3)
  ├── 6.1 Equality Act 2010
  ├── 6.2 Cultural Competence
  └── 6.3 Reasonable Adjustments

Topic 7: Duty of Candour (7.1 - 7.2)
  ├── 7.1 Transparency After Errors
  └── 7.2 NHS Incident Reporting

Topic 8: Cultural Adaptation (8.1 - 8.2)
  ├── 8.1 Autonomy vs. Family Decisions
  └── 8.2 UK Communication Styles
```

### Content Per Subtopic

**Each subtopic contains:**
1. **Video** (e.g., "Dosage Calculations - Expert Explanation")
   - Duration: 10-15 minutes
   - Embedded or linked from storage

2. **Podcast/Audio** (e.g., "Dosage Calculations - Audio Lesson")
   - Duration: 15-20 minutes
   - MP3 from storage

3. **Readable Lesson** (Accordion format)
   - Expandable/collapsible text content
   - Can include:
     - Definitions
     - Examples
     - Case studies
     - Key points
     - Practice scenarios

4. **Assessment Questions** (10-15 MCQs)
   - Only shown AFTER user has viewed content
   - User must score 80% to pass
   - Cannot proceed to next subtopic until passed

### Question Logic - Learning Module

**Database Fields:**
```typescript
{
  moduleType: 'learning',
  category: '1' | '2' | '3' | ... (Topic number),
  subdivision: '1.1' | '1.2' | '2.1' | etc (Subtopic code),
  questionType: 'multiple_choice',
  difficulty: 'medium', // Usually medium for assessment
  points: varies, // Each question might be worth different points
  lesson_id: UUID, // Links to the lesson content
  is_active: true,
  explanation: 'Detailed explanation of correct answer'
}
```

**User Flow:**
```
1. User selects a subtopic (e.g., "1.1 Dosage Calculations")
   ↓
2. Check: Is user's progress = "not_started"?
   - YES → Display content (video, audio, lesson)
   - NO → Skip to assessment
   ↓
3. User consumes content (in any order):
   - Watch video (if available)
   - Listen to podcast (if available)
   - Read expandable lesson content
   ↓
4. Click "Start Assessment" button
   ↓
5. Load 10-15 questions for this subtopic (randomized or sequential)
   ↓
6. Display one question with 4 options
   ↓
7. User selects answer
   ↓
8. Disable option selection (lock answer)
   ↓
9. Show if correct/incorrect immediately
   ↓
10. Show explanation of answer
    ↓
11. Click "Next Question"
    ↓
12. Repeat steps 6-11 until all questions done
    ↓
13. Calculate score (Correct/Total * 100)
    ↓
14. IF Score ≥ 80%:
    - Mark subtopic as "COMPLETED"
    - Unlock next subtopic
    - Show "Next Subtopic" button
    ELSE IF Score < 80%:
    - Show "Try Again" button
    - User can re-attempt unlimited times
    - Keep best score? (TBD)
```

**Progression Status:**
- `not_started` - Content available, assessment locked
- `in_progress` - User has started assessment
- `completed` - User scored ≥80%
- `locked` - User hasn't completed prerequisite subtopic

**Display Rules for Learning Module:**
- ✅ **Sequential Unlock:** Next subtopic only available after 80% pass
- ✅ **Content First:** Questions only show after viewing content
- ✅ **Mark Tracking:** Track which content user viewed
- ✅ **Progress Bar:** Show which subtopics completed/locked/current
- ✅ **Assessment Focus:** 10-15 questions per subtopic
- ✅ **Pass Requirement:** 80% minimum to proceed
- ✅ **Unlimited Attempts:** Can retake assessment until passing
- ✅ **Explanation Visible:** Show why each answer is correct/incorrect
- ✅ **No Time Limit:** Unlimited time per question

**User Cannot:**
- ❌ Skip content viewing
- ❌ Jump to next subtopic without 80% pass
- ❌ Access locked subtopics
- ❌ Move backward (once completed, subtopic stays completed)

**Admin Panel Control:**
- Add/Edit video, audio, lesson content per subtopic
- Add/Edit 10-15 questions per subtopic
- Set passing score (default 80%)
- Set time limit (optional)
- Create learning path order
- Mark content as active/inactive
- View student progress per subtopic

---

## Module 3: MOCK EXAM MODULE

### Purpose
Real exam simulation matching the actual NMC CBT exam format. Full exam experience with all topics combined.

### Structure

**One exam with:**
- Full question bank (all topics combined)
- Timed format (matches real exam: 3 hours 45 minutes)
- All question types included
- Full score calculation
- Comparison with previous attempts
- Pass/fail determination

### Question Logic - Mock Exam Module

**Database Fields:**
```typescript
{
  moduleType: 'mock_exam',
  category: null, // All topics combined
  subdivision: null,
  questionType: 'multiple_choice',
  difficulty: 'mixed', // Mix of easy, medium, hard
  points: 1, // Each question worth 1 point
  exam_part: 'full' | 'part1' | 'part2', // If segmented
  is_active: true
}
```

**User Flow:**
```
1. User clicks "Start Mock Exam"
   ↓
2. Show exam instructions:
   - Duration: 3 hours 45 minutes
   - Total questions: X (varies)
   - Passing score: Y%
   - All topics included
   ↓
3. Display confirmation dialog
   ↓
4. Start timer (3:45:00)
   ↓
5. Display questions one at a time OR all questions with navigation
   ↓
6. User selects answer
   ↓
7. Can navigate:
   - Next/Previous question
   - Jump to any question
   - Mark for review
   - See question progress (10/100)
   ↓
8. Timer counting down in header
   ↓
9. When timer reaches 5 minutes → warning alert
   ↓
10. When timer reaches 0 → auto-submit
    ↓
11. Submit exam (user can also manually submit)
    ↓
12. Calculate final score
    ↓
13. Show results:
    - Final score
    - Pass/Fail status
    - Time taken
    - Questions per topic breakdown
    - Comparison with previous attempts
    - Areas to improve
```

**Display Rules for Mock Exam:**
- ✅ **Timed Exam:** 3 hours 45 minutes (like real NMC CBT)
- ✅ **All Questions:** Mix from all topics
- ✅ **Question Navigation:** Can jump to any question
- ✅ **Mark For Review:** Questions can be marked
- ✅ **Question Overview:** See all questions at a glance
- ✅ **Timer Visible:** Always visible in header
- ✅ **Auto-Submit:** If time runs out
- ✅ **Immediate Results:** After submission

**User Cannot:**
- ❌ Pause exam (timer keeps running)
- ❌ Extend time
- ❌ Review answers during exam
- ❌ Exit and restart (auto-submits if closed)

**Results Include:**
- Total score (e.g., 76/100)
- Pass/Fail (if 80% required)
- Time taken
- Topic-wise breakdown
  - Numeracy: 8/10
  - Clinical Knowledge: 12/15
  - NMC Code: 10/12
  - Etc.
- Questions marked for review
- Download/share option
- Option to retry

**Admin Panel Control:**
- Select which questions go into mock exam
- Set exam duration (default 3:45)
- Set passing score (default 80%)
- Set total question count
- View student mock exam history
- Compare student performance across attempts

---

## Database Schema Mapping

### Questions Table Structure

```typescript
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  
  // Identification
  question_text TEXT NOT NULL,
  module_type VARCHAR(50), // 'practice' | 'learning' | 'mock_exam'
  category VARCHAR(100), // Topic: 'Numeracy', 'The NMC Code', etc
  subdivision VARCHAR(100), // Subtopic: '1.1', '2.1', etc
  
  // Content
  lesson_id UUID, // Links to lessons table (for learning module)
  question_type VARCHAR(50), // 'multiple_choice' | 'true_false'
  difficulty VARCHAR(50), // 'easy' | 'medium' | 'hard'
  points INT DEFAULT 1,
  explanation TEXT,
  image_url TEXT,
  
  // Status
  is_active BOOLEAN DEFAULT true,
  exam_part VARCHAR(50), // For mock exam: 'full' | 'part1'
  
  // Audit
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE question_options (
  id UUID PRIMARY KEY,
  question_id UUID NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INT,
  created_at TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE learning_progress (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  subdivision VARCHAR(100), // e.g., '1.1'
  status VARCHAR(50), // 'not_started' | 'in_progress' | 'completed' | 'locked'
  score INT, // e.g., 85
  attempts INT DEFAULT 0,
  best_score INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

CREATE TABLE mock_exam_attempts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  total_score INT,
  passed BOOLEAN,
  duration_minutes INT,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);
```

---

## API Endpoints Required

### Practice Module Endpoints

```
GET /api/content/practice/topics
Response: [{ id, name, subtopics: [...] }, ...]

GET /api/content/practice/topics/:topicId/subtopics/:subtopicId/questions
Response: [{ id, questionText, options: [...] }, ...]

POST /api/analytics/practice-attempt
Body: { subtopic, score, answers: [...] }
Response: { attempt_id, recorded: true }
```

### Learning Module Endpoints

```
GET /api/content/learning/topics
Response: [{ id, name, subtopics: [...] }, ...]

GET /api/content/learning/topics/:topicId/subtopics/:subtopicId/content
Response: { video: { url, duration }, audio: { url }, lesson: { text, html } }

GET /api/content/learning/topics/:topicId/subtopics/:subtopicId/questions
Response: [{ id, questionText, options: [...] }, ...]

GET /api/learning/progress/:userId
Response: [{ subdivision: '1.1', status: 'completed', score: 85 }, ...]

POST /api/learning/submit-assessment
Body: { userId, subdivision, answers: [...], score: 85 }
Response: { passed: true, unlocked: '1.2' }
```

### Mock Exam Endpoints

```
GET /api/content/mock-exam/info
Response: { duration: 225, totalQuestions: 100, passingScore: 80 }

GET /api/content/mock-exam/questions
Response: [{ id, questionText, options: [...] }, ...]

POST /api/mock-exam/submit
Body: { userId, answers: [...], timeTaken: 180 }
Response: { score: 78, passed: false, breakdown: {...} }

GET /api/mock-exam/attempts/:userId
Response: [{ attemptId, score, date, duration }, ...]
```

---

## Summary Table

| Aspect | Practice | Learning | Mock Exam |
|--------|----------|----------|-----------|
| **Topics** | 2 (Numeracy, Clinical Knowledge) | 8 (All topics) | All combined |
| **Subtopics** | 9 total | 21 total | N/A - full exam |
| **Questions per Subtopic** | Multiple | 10-15 | 100+ |
| **Content Required** | None | Video, Audio, Lesson | None |
| **Question Type** | Multiple choice | Multiple choice | Multiple choice |
| **User Can Select** | Yes, any subtopic | No, sequential only | No, only one exam |
| **Time Limit** | None | None | 3 hours 45 minutes |
| **Passing Requirement** | None | 80% | Varies (default 80%) |
| **Can Retry** | Unlimited | Until 80% | Unlimited |
| **Progress Tracking** | None | By subtopic | By attempt |
| **Results** | Immediate | Immediate | Detailed breakdown |
| **Purpose** | Familiarize | Learn & assess | Simulate real exam |

---

## Implementation Checklist for Mobile App

### Practice Module
- [ ] Create topic selector UI
- [ ] Create subtopic selector UI
- [ ] Fetch questions from `/api/content/practice/.../questions`
- [ ] Display questions one by one
- [ ] Handle answer submission
- [ ] Show correct/incorrect immediately
- [ ] Show explanation
- [ ] Calculate and show results
- [ ] Option to retry same subtopic

### Learning Module
- [ ] Create topic/subtopic list (showing locked/unlocked status)
- [ ] Fetch content (video, audio, lesson)
- [ ] Display video player
- [ ] Display audio player
- [ ] Create accordion for readable lesson
- [ ] Track content viewing
- [ ] Display "Start Assessment" button (after content viewed)
- [ ] Fetch 10-15 questions
- [ ] Display questions one by one
- [ ] Handle answer submission
- [ ] Calculate score
- [ ] If ≥80% → mark complete, unlock next
- [ ] If <80% → show "Try Again"
- [ ] Track progress per subtopic
- [ ] Show progress bar for all topics

### Mock Exam Module
- [ ] Display exam info and confirm start
- [ ] Start timer (3:45:00)
- [ ] Fetch all exam questions
- [ ] Display questions with navigation
- [ ] Allow marking for review
- [ ] Show question progress
- [ ] Handle timer countdown
- [ ] Auto-submit when time ends
- [ ] Calculate final score
- [ ] Show results breakdown
- [ ] Compare with previous attempts
- [ ] Allow retry

---

**Last Updated:** November 21, 2025  
**Status:** ✅ Complete & Ready for Mobile Implementation  
**Next Step:** Share this with mobile team for implementation
