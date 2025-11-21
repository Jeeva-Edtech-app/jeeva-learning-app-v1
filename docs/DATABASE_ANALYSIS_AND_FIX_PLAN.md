# Database Analysis & Fix Plan
**Date:** November 21, 2025  
**Status:** Prepared (Not Yet Applied)

---

## Executive Summary

**Overall Assessment:** The migration file I created is ❌ **INCOMPLETE** compared to the official documentation. It's missing critical tables, incomplete data structure, and insufficient seed data.

**Key Issues Found:**
1. ❌ **CRITICAL**: `learning_progress` table missing (tracks 80% unlock mechanism)
2. ❌ Insufficient module/topic structure for all 3 modules
3. ❌ Missing Practice module topics and subtopics
4. ❌ Incomplete Learning module seed data (only 2 of 8 topics created)
5. ❌ Insufficient question count (only 3 questions vs. 180+ needed)
6. ⚠️  No learning progress tracking mechanism

---

## What We Have vs. What We Need

### Current Migration State (001_create_learning_schema.sql)

✅ **Good:**
- Module, Topic, Lesson, Question, Question_Options tables created
- Practice/Mock/Learning table structures exist
- RLS policies implemented
- Indexes for performance added
- Basic seed data for Numeracy topic

❌ **Missing/Incomplete:**
- `learning_progress` table (CRITICAL!)
- Only 2 Learning topics (should be 8)
- Only 2 Practice topics (should be 2 ✓ but no seed data)
- Only 4 Numeracy lessons (correct but need all 8 topics × avg 3-4 lessons = 32+ lessons)
- Only 3 questions total (need minimum 180+ for full coverage)
- No Practice module question structure
- No Mock Exam module questions

---

## Required Structure Per Documentation

### Module 1: PRACTICE (Freelance Learning)
**Topics: 2**
1. **Numeracy** (4 subtopics)
   - Dosage Calculations
   - Unit Conversions
   - IV Flow Rate Calculations
   - Fluid Balance

2. **Clinical Knowledge** (5 subtopics)
   - Medical-Surgical Nursing
   - Pharmacology
   - Infection Control
   - Wound Care
   - Palliative Care

**Questions:** Multiple MCQs per subtopic (no fixed count, unlimited retries)  
**Tags:** `module_type='practice'`, `category='Numeracy'|'Clinical Knowledge'`, `subdivision='Dosage Calculations'`

---

### Module 2: LEARNING (Structured with 80% Gate)
**Topics: 8 (SEQUENTIAL)**

1. **Numeracy** (1.1 - 1.4)
2. **The NMC Code** (2.1 - 2.4)
3. **Mental Capacity Act** (3.1 - 3.4)
4. **Safeguarding** (4.1 - 4.3)
5. **Consent & Confidentiality** (5.1 - 5.3)
6. **Equality & Diversity** (6.1 - 6.3)
7. **Duty of Candour** (7.1 - 7.2)
8. **Cultural Adaptation** (8.1 - 8.2)

**Per Subtopic:**
- 1 Lesson with: title, content, video_url, audio_url, duration
- 10-15 Questions (Assessment)
- Progress Tracking: not_started → in_progress → completed (≥80%) OR locked

**Questions:** `module_type='learning'`, `category='1'|'2'...'8'`, `subdivision='1.1'|'1.2'...`

---

### Module 3: MOCK EXAM (Full Exam Simulation)
**Structure:** Full question bank (all topics combined)  
**Duration:** 3 hours 45 minutes  
**Questions:** 100+ mix of all topics  
**Tags:** `module_type='mock_exam'`, `exam_part='full'|'part_a'|'part_b'`

---

## Missing Table: learning_progress

**CRITICAL FOR 80% UNLOCK MECHANISM**

```sql
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subdivision VARCHAR(100) NOT NULL, -- e.g., '1.1', '2.1', '8.2'
  status VARCHAR(50) NOT NULL, -- 'not_started' | 'in_progress' | 'completed' | 'locked'
  score_percentage INTEGER, -- e.g., 85
  attempts INTEGER DEFAULT 0,
  best_score INTEGER,
  last_attempted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subdivision),
  CHECK (status IN ('not_started', 'in_progress', 'completed', 'locked'))
);

-- Indexes for fast queries
CREATE INDEX idx_learning_progress_user ON learning_progress(user_id);
CREATE INDEX idx_learning_progress_status ON learning_progress(status);
CREATE INDEX idx_learning_progress_subdivision ON learning_progress(subdivision);
```

**Purpose:**
- Track which subtopics user has completed (≥80%)
- Determine which subtopics are locked/unlocked
- Store best score for each subtopic
- Track attempt count

---

## Fix Plan - Step by Step

### Phase 1: Update Migration File (001_create_learning_schema.sql)

**Actions:**
1. ✅ Add `learning_progress` table
2. ✅ Create complete Practice module topics/subtopics
3. ✅ Expand Learning module to all 8 topics + all subtopics
4. ✅ Add 10-15 questions per Learning subtopic (21 subtopics × 12 avg = 252 questions)
5. ✅ Add Clinical Knowledge questions for Practice module
6. ✅ Add Mock Exam questions (100+ sample questions)

**New Migration Structure:**
```
001_create_learning_schema.sql
├── 1. Core Learning Tables (modules, topics, lessons, questions, question_options) ✓
├── 2. User Progress Tables (learning_completions, lesson_quiz_results) ✓
├── 3. Learning Progress Table (NEW - CRITICAL) ❌ ADD
├── 4. Practice Module Tables ✓
├── 5. Mock Exam Tables ✓
├── 6. Analytics Tables ✓
├── 7. Indexes ✓
├── 8. RLS Policies ✓
├── 9. Seed Data:
│   ├── 3 Modules: Practice, Learning, Mock Exam ❌ EXPAND
│   ├── Practice Topics (2) + subtopics (9) ❌ CREATE
│   ├── Learning Topics (8) + all subtopics (21) ❌ EXPAND
│   ├── Lessons: 32+ total ❌ EXPAND
│   └── Questions: 252+ total ❌ ADD
```

---

## Data Requirements Summary

| Entity | Current | Required | Gap |
|--------|---------|----------|-----|
| **Modules** | 3 ✓ | 3 | 0 |
| **Learning Topics** | 2 | 8 | +6 |
| **Learning Subtopics** | 4 | 21 | +17 |
| **Practice Topics** | 2 | 2 | 0 |
| **Practice Subtopics** | 0 | 9 | +9 |
| **Lessons** | 8 | 32+ | +24 |
| **Questions (Learning)** | 3 | 252 | +249 |
| **Questions (Practice)** | 0 | 50+ | +50 |
| **Questions (Mock)** | 0 | 100+ | +100 |
| **Total Questions** | 3 | 402+ | +399 |

---

## Implementation Approach

### Option A: Comprehensive (Recommended) ✅
**Pros:**
- Complete, production-ready database
- All learning content properly structured
- 80% unlock mechanism fully functional
- Ready for beta testing

**Cons:**
- Larger migration file (~2000 lines)
- More seed data to manage

### Option B: Minimal (MVP) ⚠️
**Pros:**
- Smaller migration
- Faster to apply

**Cons:**
- Incomplete content
- Mock Exam won't work
- Practice module incomplete
- Not suitable for real testing

### RECOMMENDATION: Go with **Option A** (Comprehensive)

**Rationale:**
- User explicitly requested complete database setup
- Documentation is comprehensive and specific
- Better to have complete structure from start than patch later
- Only difference is seed data size (2000 lines vs. 400 lines SQL)

---

## Execution Plan

**Step 1: Create Updated Migration**
- Add learning_progress table
- Add complete module/topic/lesson structure
- Add 10-15 questions per Learning subtopic
- Add Practice module questions
- Add Mock Exam sample questions

**Step 2: Back Up Existing Migration**
- Save current 001_create_learning_schema.sql as 001_create_learning_schema.backup.sql

**Step 3: Replace Migration**
- Create new comprehensive 001_create_learning_schema.sql
- Include ALL seed data for testing

**Step 4: Apply Migration**
- Run SQL in Supabase SQL Editor
- Verify all tables created
- Verify all seed data inserted
- Check indexes exist

**Step 5: Verify App**
- Restart Expo workflow
- Navigate to Learning module
- Verify lessons load
- Test sequential unlock logic
- Verify Practice module loads

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Existing tables dropped | LOW | Using `IF NOT EXISTS` clauses |
| Foreign key failures | LOW | Proper constraint setup |
| Large migration file | LOW | Well-commented, organized |
| Duplicate seed data | MEDIUM | Using `ON CONFLICT DO NOTHING` |
| Performance impact | LOW | Proper indexes included |

---

## Next Steps (After Approval)

1. ✅ Replace 001_create_learning_schema.sql with comprehensive version
2. ⏳ User to run migration in Supabase SQL Editor
3. ✅ Verify database state
4. ✅ Restart Expo app
5. ✅ Test all three modules

---

**Prepared by:** Database Migration Team  
**Status:** Ready for Implementation  
**Last Updated:** November 21, 2025
