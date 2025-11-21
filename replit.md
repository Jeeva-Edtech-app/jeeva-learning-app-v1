# Jeeva Learning App - Project Documentation

## Project Overview
**Jeeva Learning App** is a React Native Expo mobile application designed for Indian nurses preparing for the UK NMC CBT (Computer-Based Test) exam. The app provides comprehensive learning materials, practice questions, mock exams, and an AI-powered chatbot (JeevaBot) using Gemini AI.

**Status**: Database connected and API queries fixed ✅

---

## Architecture

### Tech Stack
- **Frontend**: React Native (Expo) with TypeScript
- **Backend**: Supabase (PostgreSQL, Edge Functions, OAuth)
- **AI Integration**: Google Gemini API for intelligent chatbot
- **Authentication**: OAuth (Google & Apple) via Supabase Auth
- **State Management**: TanStack React Query with async storage persistence
- **Payments**: Stripe integration for subscriptions (Razorpay alternative)
- **Voice Input**: Expo Voice for speech-to-text capabilities

### Key Features
1. **Three Main Learning Modules**:
   - Practice Module: Question-by-question practice with instant feedback
   - Learning Module: Comprehensive lessons with video/audio support
   - Mock Exam Module: Full-length practice exams simulating real NMC CBT

2. **AI Chatbot (JeevaBot)**:
   - Contextual assistance based on current lesson/module
   - Performance-aware recommendations
   - 50 messages/day rate limiting
   - Integrated with lesson context and user analytics

3. **User Features**:
   - Progress tracking and analytics
   - Flashcard system for memorization
   - Push notifications (Expo notifications)
   - Subscription management
   - User profiles with coaching preferences

---

## Database Schema (Supabase PostgreSQL)

### Core Learning Tables

#### `modules` (UUID primary key)
Defines the three main app modules
```
Columns: id, title, description, thumbnail_url, is_active, display_order
Key relationships: 1-to-many with topics, practice_sessions, mock_exams
```

#### `topics` (UUID primary key)
Subdivisions within each module (e.g., "Pharmacology", "Infection Control")
```
Columns: id, module_id (FK), title, description, is_active, display_order
Key relationships: 1-to-many with lessons and user_analytics
```

#### `lessons` (UUID primary key)
Individual learning units with content and quizzes
```
Columns: id, topic_id (FK), title, content, video_url, audio_url, lesson_type,
         passing_score_percentage, category, duration, is_active, display_order, notes
Key relationships: 1-to-many with questions, flashcards, learning_completions
```

#### `questions` (UUID primary key)
Quiz questions with multiple types (multiple_choice, true_false, short_answer)
```
Columns: id, lesson_id (FK), question_text, question_type, difficulty, points, 
         explanation, image_url, is_active, module_type, category, subdivision, exam_part
Key relationships: 1-to-many with question_options and practice_results
```

#### `question_options` (serial primary key)
Answer options for multiple-choice questions
```
Columns: id, question_id (FK), option_text, is_correct, display_order
Key relationships: many-to-one with questions
```

### User & Progress Tables

#### `user_profiles` (UUID primary key, linked to auth.users)
Extended user information
```
Columns: id, user_id (FK to users), email, full_name, phone_number, country_code,
         date_of_birth, gender, current_country, nmc_attempts, uses_coaching, 
         nursing_id_url, profile_completed, oauth_provider
Key relationships: 1-to-many with subscriptions, user_sessions, practice_sessions
```

#### `learning_completions` (UUID primary key)
Tracks completed lessons
```
Columns: id, user_id (FK), lesson_id (FK), is_completed, completed_at, time_spent_minutes
Constraints: Unique(user_id, lesson_id) for idempotency
Key relationships: tracks user progress through lessons
```

#### `practice_sessions` (serial primary key)
Practice quiz sessions with performance tracking
```
Columns: id, user_id (FK), topic_id, subtopic_id, module_id (FK), 
         started_at, completed_at, total_questions, correct_count, 
         incorrect_count, skipped_count
Key relationships: 1-to-many with practice_results
```

#### `practice_results` (serial primary key)
Individual question answers within a practice session
```
Columns: id, session_id (FK), question_id (UUID), selected_option_id, 
         is_correct, time_taken_seconds
Key relationships: many-to-one with practice_sessions and questions
```

#### `mock_exams` (serial primary key)
Full mock exam attempts
```
Columns: id, user_id (FK), started_at, completed_at, total_questions,
         correct_count, incorrect_count, skipped_count
Key relationships: 1-to-many with mock_results
```

#### `mock_results` (serial primary key)
Individual answers in mock exams
```
Columns: id, mock_exam_id (FK), question_id (UUID), selected_option_id,
         is_correct, time_taken_seconds
Key relationships: many-to-one with mock_exams
```

#### `mock_sessions` (UUID primary key)
Extended mock exam session tracking
```
Columns: id, user_id (FK), exam_part (part_a/part_b), started_at, completed_at,
         total_questions, correct_answers, score_percentage, time_taken_minutes, passed
```

### Analytics & Engagement Tables

#### `analytics_sessions` (UUID primary key)
Session tracking for app usage analytics
```
Columns: id, user_id (FK), session_start, session_end, duration_seconds
Indexes: user_id, session_start date, (user_id, session_start)
```

#### `daily_stats` (UUID primary key)
Aggregated daily metrics
```
Columns: id, date (UNIQUE), total_signups, total_conversions, active_users,
         total_sessions, avg_session_duration, total_revenue
```

#### `user_analytics` (serial primary key)
Per-user progress metrics
```
Columns: id, user_id (FK), subtopic_id (FK), lessons_completed, questions_attempted,
         correct_answers, incorrect_answers, time_spent_minutes, accuracy_percentage
```

#### `ai_usage_stats` (UUID primary key)
AI chatbot usage tracking with rate limiting
```
Columns: id, user_id (FK), date, message_count, total_tokens, total_cost
Constraints: Unique(user_id, date) for daily aggregation
```

#### `user_sessions` (UUID primary key)
User login/logout session tracking
```
Columns: id, user_id (FK), session_start, session_end, duration_seconds
```

### Chat & Notifications Tables

#### `chat_conversations` (UUID primary key)
Chatbot conversation threads
```
Columns: id, user_id (FK), title, context_data (JSONB), is_active
Key relationships: 1-to-many with chat_messages
```

#### `chat_messages` (UUID primary key)
Individual messages in conversations
```
Columns: id, conversation_id (FK), role (user/assistant), content, metadata (JSONB)
Indexes: (conversation_id, created_at DESC), (role, created_at)
```

#### `notifications` (UUID primary key)
App notifications (push, email, in-app)
```
Columns: id, title, body, image_url, data (JSONB), audience_filter (JSONB),
         notification_type, status (draft/sent), total_recipients, total_sent,
         created_by (FK to admin_users)
```

#### `notification_preferences` (UUID primary key)
User notification settings
```
Columns: id, user_id (FK), push_enabled, email_enabled, in_app_enabled,
         subscription_expiring_enabled, content_approved_enabled, marketing_enabled,
         quiet_hours (JSONB)
```

#### `notification_targets` (UUID primary key)
Delivery tracking for individual notifications
```
Columns: id, notification_id (FK), user_id (FK), push_token_id (FK),
         delivery_status, expo_ticket_id, expo_receipt_id, sent_at, delivered_at, read_at
```

#### `push_tokens` (UUID primary key)
Expo push notification tokens
```
Columns: id, user_id (FK), expo_push_token, device_id, platform, is_active, last_seen_at
```

### Subscription & Billing Tables

#### `subscription_plans` (UUID primary key)
Available subscription tiers
```
Columns: id, name, description, price_usd, duration_days, features (ARRAY),
         is_active, display_order, config (JSONB)
```

#### `subscriptions` (UUID primary key)
User subscription records
```
Columns: id, user_id (FK), plan_id (FK), status, plan_type, start_date, end_date,
         is_active, auto_renew, payment_gateway, payment_method, amount_paid_usd,
         coupon_code (FK), discount_amount, transaction_id
```

#### `discount_coupons` (UUID primary key)
Promotional coupon codes
```
Columns: id, code (UNIQUE), description, discount_type, discount_value,
         applicable_plans (ARRAY), usage_limit, usage_count, valid_from, valid_until, is_active
```

### Support Tables

#### `flashcards` (UUID primary key)
Flashcard study system
```
Columns: id, lesson_id (FK), front, back, category, image_url, is_active, display_order
```

#### `lesson_quiz_results` (UUID primary key)
Lesson-level quiz performance
```
Columns: id, user_id (FK), lesson_id (FK), score_percentage, passed, completed_at
Constraints: Unique(user_id, lesson_id)
```

#### `lesson_quizzes` (serial primary key)
Quiz composition (questions per lesson)
```
Columns: id, lesson_id, question_id, position
```

#### `ai_recommendations` (serial primary key)
AI-generated study recommendations
```
Columns: id, user_id (FK), recommendation_type, reference_id, score, created_at, expires_at
```

#### `admin_users` (UUID primary key)
Admin/moderator accounts
```
Columns: id, email (UNIQUE), password_hash, full_name, role, is_active
```

#### `content_approvals` (UUID primary key)
Content moderation workflow
```
Columns: id, resource_id, resource_type, resource_title, status (pending/approved/rejected),
         submitted_by (FK), reviewed_by (FK), review_comments
```

#### `email_templates` (UUID primary key)
Email notification templates
```
Columns: id, template_name (UNIQUE), subject, html_content, variables (JSONB)
```

#### `app_settings` (text primary key)
Global app configuration
```
Columns: key (PRIMARY), value (JSONB), description, updated_at
```

---

## API Modules

### `/src/api/practice.ts`
- Manages practice sessions and results
- Stores question attempts, timing, and scores
- Uses `practice_sessions` and `practice_results` tables
- Handles mock exam logic (part_a, part_b)

### `/src/api/learning.ts`
- Tracks lesson completions
- Manages learning progress
- Uses `learning_completions` table
- Integrates with lesson availability

### `/src/api/quiz.ts`
- Saves and retrieves quiz results
- Uses `lesson_quiz_results` table
- Calculates pass/fail based on score thresholds

### `/src/api/analytics.ts`
- Fetches aggregated analytics data
- Uses `analytics_sessions`, `daily_stats`, `practice_sessions`
- Calculates engagement trends, conversion metrics, revenue growth
- Supports time-range queries (default 30 days)

### `/src/api/modules.ts`
- Loads modules, topics, lessons, questions
- Uses `modules`, `topics`, `lessons`, `questions`, `question_options` tables
- Caches completion status from `learning_completions`

### `/src/api/performance.ts`
- User performance analytics
- Calculates accuracy, time spent, progress percentage
- Uses `practice_sessions`, `learning_completions`, `user_analytics`

### `/supabase/functions/chat/index.ts` (Edge Function)
- AI chatbot backend using Google Gemini
- Rate limiting (50 messages/day) via `ai_usage_stats`
- Contextual learning from `chat_conversations`, `chat_messages`
- Performance analysis using practice/mock exam data

### `/supabase/functions/rate-limit/index.ts` (Edge Function)
- Enforces daily message limits
- Tracks usage in `ai_usage_stats` table

---

## Critical Fixes Applied

### Database Query Corrections (Previous Session)
1. **Analytics Module**: Fixed queries from `user_sessions` to `analytics_sessions`
2. **Quiz Module**: Restored queries to correct `lesson_quiz_results` table
3. **All Modules**: Aligned with actual Supabase schema structure

### Data Consistency
- All UUID columns use `gen_random_uuid()` by default
- Serial IDs preserved for legacy tables (practice_results, mock_results, etc.)
- Foreign key relationships properly configured
- Unique constraints prevent duplicate records

---

## User Preferences & Development Notes

### Decisions Made
- **Backend**: Supabase for all services (no Replit PostgreSQL migration)
- **Authentication**: OAuth with Google & Apple via Supabase Auth
- **AI Provider**: Google Gemini API with rate limiting (50 msgs/day)
- **Payment Gateway**: Stripe integration for subscriptions
- **Push Notifications**: Expo Notifications service

### File Structure
```
src/
  ├── api/              # Supabase queries & data fetching
  ├── screens/          # React Native screen components
  ├── hooks/            # Custom React hooks (useChatbot, useVoiceInput, etc.)
  ├── lib/              # Utilities (Supabase client, helpers)
  ├── components/       # Reusable UI components
  └── navigation/       # Navigation configuration

supabase/
  ├── functions/        # Edge Functions (chat, rate-limit)
  └── migrations/       # Database migration history
```

---

## Current Status

### ✅ Working Features
- App running on port 5000 (Expo web)
- Database fully connected to Supabase
- All core tables created with proper relationships
- Practice, Learning, Mock Exam modules operational
- Chatbot Edge Functions deployed
- OAuth authentication functional
- Stripe payment integration active

### 📊 Database Health
- 48 tables across learning, analytics, user, notification, and billing domains
- 200+ indexes for query optimization
- All foreign key relationships validated
- ✅ **MIGRATION APPLIED SUCCESSFULLY** (Nov 21, 2025):
  - 6 Modules (Practice, Learning, Mock Exam + duplicates from previous runs)
  - 18 Topics total
  - 184 Lessons with video/audio URLs and durations
  - 209 Questions across all module types
  - 775 Question Options (answer choices)
  - learning_progress table created for 80% unlock tracking
  - All RLS policies configured
  - All indexes created for performance

### ✅ Completed Steps
1. ✅ Created comprehensive migration v2 (`001_create_learning_schema_v2_comprehensive.sql`)
2. ✅ Fixed RLS policy conflicts (drop-then-create pattern)
3. ✅ Applied migration to Supabase successfully
4. ✅ Verified seed data: 209 questions + 184 lessons loaded
5. ✅ Restarted Expo app - running on port 5000
6. ✅ learning_completions + learning_progress tables operational

### 🔄 Next Steps (For User)
1. **Test Learning Module**: Navigate to Learning tab in app
   - Should display 8 topics with lessons
   - Click a lesson to see content and assessment questions
   - Test 80% pass requirement unlocks next subtopic
2. Deploy app to iOS/Android with EAS Build
3. Configure Stripe webhook endpoints
4. Set up email notification templates
5. Test push notifications end-to-end

### 📄 Reference Documentation
- `docs/DATABASE_ANALYSIS_AND_FIX_PLAN.md` - Detailed analysis of what was missing and fixed
- `supabase/migrations/001_create_learning_schema_v2_comprehensive.sql` - Complete migration script

---

## Contact & Support

**App**: Jeeva Learning App (for NMC CBT preparation)
**Last Updated**: November 21, 2025
**Maintained By**: Development Team
