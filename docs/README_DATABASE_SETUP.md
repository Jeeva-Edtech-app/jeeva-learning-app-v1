# Database Setup Instructions

## Overview
This guide helps you set up your Supabase database with the new tag-based architecture for the Jeeva Learning app.

## Steps to Setup

### Step 1: Add New Columns

1. Go to your Supabase Dashboard (https://app.supabase.com)
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the contents of `docs/01_ADD_COLUMNS.sql`
6. Click "Run" to execute

**What this does:**
- Adds `module_type`, `category`, `subdivision`, and `exam_part` columns to the `questions` table
- Adds `category` column to the `flashcards` table
- Creates indexes for faster queries

### Step 2: Insert Test Data

1. In the same SQL Editor
2. Click "New Query" (or clear the previous one)
3. Copy and paste the contents of `docs/02_SEED_TEST_DATA.sql`
4. Click "Run" to execute

**What this does:**
- Inserts 14 test questions with 4 options each
- Covers all module types:
  - **Practice Module**: Numeracy and Clinical Knowledge questions
  - **Learning Module**: The NMC Code questions
  - **Mock Exam**: Part A (Numeracy) and Part B (Clinical Knowledge)

### Step 3: Verify the Data

Run this query in the SQL Editor to verify:

```sql
SELECT 
  module_type, 
  category, 
  subdivision, 
  exam_part, 
  COUNT(*) as question_count
FROM questions 
WHERE module_type IS NOT NULL
GROUP BY module_type, category, subdivision, exam_part
ORDER BY module_type;
```

You should see:
- 8 practice questions (Numeracy and Clinical Knowledge)
- 2 learning questions (The NMC Code)
- 4 mock exam questions (2 Part A, 2 Part B)

## Test the App

After running both SQL scripts:

1. Open your app in the browser
2. Navigate to the **Practice** tab
3. Select a category (Numeracy or Clinical Knowledge)
4. Select a subdivision (e.g., "Dosage Calculations")
5. Click "Start Practice"
6. You should see questions load!

## Troubleshooting

### No questions appear
- Check that both SQL scripts ran successfully
- Verify data exists: `SELECT * FROM questions LIMIT 5;`
- Check browser console for errors

### RLS Policy Errors
- The SQL scripts bypass RLS when run in the Supabase SQL Editor
- Don't try to seed from the app - use SQL Editor only

### Need more test data?
- Copy the pattern from `02_SEED_TEST_DATA.sql`
- Add more questions following the same structure
- Make sure to use the correct `module_type`, `category`, `subdivision`, or `exam_part` values

## New Field Values

### module_type
- `practice` - Practice module questions
- `learning` - Learning module questions  
- `mock_exam` - Mock exam questions

### category (Practice & Learning)
- Practice: `Numeracy` or `Clinical Knowledge`
- Learning: `The NMC Code`, `Mental Capacity Act`, `Safeguarding`, `Consent & Confidentiality`, `Equality & Diversity`, `Duty of Candour`, `Cultural Adaptation`

### subdivision (Practice only)
- Numeracy: `Dosage Calculations`, `Unit Conversions`, `IV Flow Rate Calculations`, `Fluid Balance`
- Clinical Knowledge: `Medical-Surgical Nursing`, `Pharmacology`, `Infection Control`, `Wound Care`, `Palliative Care`

### exam_part (Mock Exam only)
- `part_a` - Numeracy questions (15 questions, 30 minutes)
- `part_b` - Clinical Knowledge questions (120 questions, 150 minutes)
