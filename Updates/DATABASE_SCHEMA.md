# 🗄️ Jeeva Learning - Database Schema Documentation

## 📊 Database Overview

The Jeeva Learning platform uses **Supabase PostgreSQL** as its database, shared between the admin portal and mobile app. This document provides complete schema details, relationships, and data structures.

**Database Type:** PostgreSQL 15+  
**Provider:** Supabase  
**Total Tables:** 24  
**Authentication:** Supabase Auth with RLS + OAuth (Google, Apple)

---

## 🔗 Entity Relationship Diagram

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION & USERS                      │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │    users     │──────│user_profiles │      │ admin_users  │  │
│  │  (students)  │      │              │      │              │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
┌─────────────────────────────────────────────────────────────────┐
│                       LEARNING CONTENT                           │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐              │
│  │ modules  │──────│  topics  │──────│ lessons  │              │
│  │          │      │          │      │          │              │
│  └──────────┘      └──────────┘      └──────────┘              │
│                                            │                     │
│                           ┌────────────────┼────────────┐       │
│                           │                │            │       │
│                      ┌──────────┐    ┌──────────┐ ┌──────────┐ │
│                      │questions │    │flashcards│ │question_ │ │
│                      │          │    │          │ │ options  │ │
│                      └──────────┘    └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    LEARNING PROGRESS & PRACTICE                  │
│  ┌──────────────────┐    ┌─────────────────┐                   │
│  │learning_         │    │practice_        │                   │
│  │completions       │    │sessions         │                   │
│  └──────────────────┘    └─────────────────┘                   │
│                               │                                  │
│  ┌──────────────────┐    ┌─────────────────┐                   │
│  │mock_exams        │    │practice_results │                   │
│  └──────────────────┘    └─────────────────┘                   │
│                                                                  │
│  ┌──────────────────┐    ┌─────────────────┐                   │
│  │ai_              │    │user_analytics   │                   │
│  │recommendations  │    │                 │                   │
│  └──────────────────┘    └─────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
┌─────────────────────────────────────────────────────────────────┐
│                  SUBSCRIPTIONS & SETTINGS                        │
│  ┌──────────────────┐    ┌─────────────────┐                   │
│  │subscription_     │────│subscriptions    │                   │
│  │plans             │    │                 │                   │
│  └──────────────────┘    └─────────────────┘                   │
│                                │                                 │
│  ┌──────────────────┐    ┌─────────────────┐                   │
│  │discount_coupons  │────│                 │                   │
│  │                  │    │                 │                   │
│  └──────────────────┘    └─────────────────┘                   │
│                                                                  │
│  ┌──────────────────┐    ┌─────────────────┐                   │
│  │app_settings      │    │hero_sections    │                   │
│  └──────────────────┘    └─────────────────┘                   │
│                                                                  │
│  ┌──────────────────┐                                           │
│  │content_approvals │                                           │
│  └──────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      AI & CHAT (Phase 1)                         │
│  ┌──────────────────┐    ┌─────────────────┐                   │
│  │chat_             │────│chat_messages    │                   │
│  │conversations     │    │                 │                   │
│  └──────────────────┘    └─────────────────┘                   │
│                                                                  │
│  ┌──────────────────┐                                           │
│  │ai_usage_stats    │                                           │
│  └──────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Table Categories

### 1. Authentication & Users
- `users` - Student/learner accounts
- `user_profiles` - Extended user information
- `admin_users` - Admin portal users

### 2. Learning Content
- `modules` - Course modules
- `topics` - Topics within modules
- `lessons` - Lesson content
- `questions` - Practice questions
- `question_options` - MCQ options
- `flashcards` - Study flashcards

### 3. Progress & Practice
- `learning_completions` - Lesson completion tracking
- `practice_sessions` - Practice session records
- `practice_results` - Practice session results
- `mock_exams` - Mock exam attempts
- `mock_exam_results` - Mock exam results
- `ai_recommendations` - AI-generated suggestions
- `user_analytics` - User engagement metrics

### 4. Subscriptions & Payments
- `subscription_plans` - Duration-based plans (30/60/90/120 days)
- `subscriptions` - User subscription records
- `discount_coupons` - Discount/coupon codes

### 5. System & Settings
- `app_settings` - Application configuration
- `hero_sections` - Dashboard hero/banner sections
- `content_approvals` - Content review queue
- `email_templates` - Email template storage

### 6. AI & Chat (Phase 1)
- `chat_conversations` - AI chatbot conversation threads
- `chat_messages` - Individual chat messages
- `ai_usage_stats` - AI usage tracking and rate limiting

---

## 📊 Detailed Table Schemas

### 1. Authentication & Users

#### Table: `users`
**Purpose:** Student/learner user accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | TEXT | UNIQUE, NOT NULL | User email address |
| `role` | TEXT | DEFAULT 'student' | User role |
| `is_active` | BOOLEAN | DEFAULT true | Account status |
| `oauth_provider` | VARCHAR(20) | DEFAULT 'email' | Authentication method |
| `oauth_id` | TEXT | | OAuth provider user ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**OAuth Providers:**
- `email` - Email/password authentication (default)
- `google` - Google Sign-In
- `apple` - Apple ID Sign-In

**Indexes:**
- Primary Key: `id`
- Unique: `email`
- Index: `oauth_provider` for analytics

**RLS Policy:** Users can read/update their own data

---

#### Table: `user_profiles`
**Purpose:** Extended user profile information for nursing students

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Profile ID |
| `user_id` | UUID | FK → users.id, NOT NULL | User reference |
| `full_name` | TEXT | NOT NULL | User's full name |
| `phone_number` | TEXT | | Contact number |
| `country_code` | TEXT | | Phone country code |
| `date_of_birth` | DATE | | Birth date |
| `gender` | TEXT | | Gender |
| `current_country` | TEXT | | Current country (for payment routing) |
| `nmc_attempts` | INTEGER | NOT NULL, DEFAULT 0 | Number of NMC CBT exam attempts |
| `uses_coaching` | BOOLEAN | NOT NULL, DEFAULT false | Whether attending coaching |
| `nursing_id_url` | TEXT | | Nursing license/ID upload URL |
| `profile_completed` | BOOLEAN | NOT NULL, DEFAULT false | Onboarding completion flag |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Profile creation |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**Business Logic:**
- `current_country` determines payment gateway routing (India → Razorpay, Others → Stripe)
- `profile_completed` tracks onboarding flow (false → show profile completion screen)
- `nmc_attempts` helps personalize study recommendations
- `nursing_id_url` for identity verification if needed

**RLS Policy:** Users can only access their own profile

---

#### Table: `admin_users`
**Purpose:** Admin portal user accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Admin user ID |
| `email` | TEXT | UNIQUE, NOT NULL | Admin email |
| `full_name` | TEXT | | Admin's name |
| `role` | TEXT | NOT NULL | superadmin/editor/moderator |
| `is_active` | BOOLEAN | DEFAULT true | Account status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Roles:**
- `superadmin` - Full system access
- `editor` - Content & user management
- `moderator` - Content approval only

**RLS Policy:** Only active admin users can access

---

### 2. Learning Content

#### Table: `modules`
**Purpose:** Top-level course modules

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Module ID |
| `title` | TEXT | NOT NULL | Module title |
| `description` | TEXT | | Module description |
| `thumbnail_url` | TEXT | | Module image |
| `is_active` | BOOLEAN | DEFAULT true | Visibility status |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- Primary Key: `id`
- Index: `display_order`

**RLS Policy:** Public read, admin write

**Example Data:**
```json
{
  "id": "uuid-1",
  "title": "Mathematics",
  "description": "Complete mathematics course",
  "thumbnail_url": "https://storage/math.jpg",
  "is_active": true,
  "display_order": 1
}
```

---

#### Table: `topics`
**Purpose:** Topics within modules

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Topic ID |
| `module_id` | UUID | FK → modules.id | Parent module |
| `title` | TEXT | NOT NULL | Topic title |
| `description` | TEXT | | Topic description |
| `is_active` | BOOLEAN | DEFAULT true | Visibility status |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Foreign Keys:**
- `module_id` → `modules.id` (ON DELETE CASCADE)

**Indexes:**
- Primary Key: `id`
- Foreign Key: `module_id`
- Index: `display_order`

**RLS Policy:** Public read, admin write

---

#### Table: `lessons`
**Purpose:** Lesson content with multimedia support

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Lesson ID |
| `topic_id` | UUID | FK → topics.id | Parent topic |
| `title` | TEXT | NOT NULL | Lesson title |
| `content` | TEXT | | Lesson text content |
| `video_url` | TEXT | | Video lesson URL |
| `audio_url` | TEXT | | Audio/podcast URL |
| `duration` | INTEGER | | Duration in seconds |
| `is_active` | BOOLEAN | DEFAULT true | Visibility status |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Foreign Keys:**
- `topic_id` → `topics.id` (ON DELETE CASCADE)

**Features:**
- Rich text content
- Video lessons
- Audio/podcast support
- Duration tracking

**RLS Policy:** Public read, admin write

---

#### Table: `questions`
**Purpose:** Practice questions and quiz items

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Question ID |
| `lesson_id` | UUID | FK → lessons.id | Associated lesson (optional) |
| `question_text` | TEXT | NOT NULL | Question content |
| `question_type` | TEXT | NOT NULL | Type of question |
| `difficulty` | TEXT | NOT NULL | Difficulty level |
| `points` | INTEGER | DEFAULT 1 | Points value |
| `explanation` | TEXT | | Answer explanation |
| `image_url` | TEXT | | Question image |
| `is_active` | BOOLEAN | DEFAULT true | Visibility status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Enums:**
- `question_type`: 'multiple_choice' | 'true_false' | 'short_answer'
- `difficulty`: 'easy' | 'medium' | 'hard'

**Foreign Keys:**
- `lesson_id` → `lessons.id` (ON DELETE SET NULL)

**RLS Policy:** Public read, admin write

---

#### Table: `question_options`
**Purpose:** Multiple choice question options

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Option ID |
| `question_id` | UUID | FK → questions.id | Parent question |
| `option_text` | TEXT | NOT NULL | Option content |
| `is_correct` | BOOLEAN | DEFAULT false | Correct answer flag |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |

**Foreign Keys:**
- `question_id` → `questions.id` (ON DELETE CASCADE)

**Note:** One option per question must have `is_correct = true`

---

#### Table: `flashcards`
**Purpose:** Study flashcards for spaced repetition

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Flashcard ID |
| `lesson_id` | UUID | FK → lessons.id | Associated lesson |
| `front` | TEXT | NOT NULL | Front of card |
| `back` | TEXT | NOT NULL | Back of card |
| `image_url` | TEXT | | Card image |
| `is_active` | BOOLEAN | DEFAULT true | Visibility status |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Foreign Keys:**
- `lesson_id` → `lessons.id` (ON DELETE CASCADE)

**RLS Policy:** Public read, admin write

---

### 3. Progress & Practice

#### Table: `learning_completions`
**Purpose:** Track user lesson completion

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Completion ID |
| `user_id` | UUID | FK → users.id | User reference |
| `lesson_id` | UUID | FK → lessons.id | Completed lesson |
| `completed_at` | TIMESTAMP | DEFAULT NOW() | Completion time |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `lesson_id` → `lessons.id` (ON DELETE CASCADE)

**Indexes:**
- Composite: `(user_id, lesson_id)` - UNIQUE
- Index: `completed_at` for streak calculation

**RLS Policy:** Users can only insert/read their own completions

---

#### Table: `practice_sessions`
**Purpose:** Practice session records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Session ID |
| `user_id` | UUID | FK → users.id | User reference |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Session start |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

---

#### Table: `practice_results`
**Purpose:** Store practice session results

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Result ID |
| `session_id` | UUID | FK → practice_sessions.id | Parent session |
| `answer_log` | JSONB | NOT NULL | Answers & scores |

**Foreign Keys:**
- `session_id` → `practice_sessions.id` (ON DELETE CASCADE)

**JSONB Structure:**
```json
[
  {
    "questionId": "uuid",
    "selectedOptionId": "uuid",
    "isCorrect": true,
    "timeTaken": 30
  }
]
```

---

#### Table: `mock_exams`
**Purpose:** Mock exam attempts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Exam ID |
| `user_id` | UUID | FK → users.id | User reference |
| `exam_data` | JSONB | NOT NULL | Exam configuration |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Exam start time |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**JSONB Structure:**
```json
{
  "topicId": "uuid",
  "questionIds": ["uuid1", "uuid2"],
  "duration": 60,
  "examTitle": "Physics Mock Test"
}
```

---

#### Table: `mock_exam_results`
**Purpose:** Mock exam results

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Result ID |
| `exam_id` | UUID | FK → mock_exams.id | Parent exam |
| `results_data` | JSONB | NOT NULL | Scores & answers |

**Foreign Keys:**
- `exam_id` → `mock_exams.id` (ON DELETE CASCADE)

**JSONB Structure:**
```json
{
  "score": 85,
  "totalQuestions": 20,
  "correctAnswers": 17,
  "timeTaken": 3600,
  "answers": [...]
}
```

---

#### Table: `ai_recommendations`
**Purpose:** AI-generated learning recommendations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Recommendation ID |
| `user_id` | UUID | FK → users.id | User reference |
| `recommendation_data` | JSONB | NOT NULL | AI suggestion data |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**JSONB Structure:**
```json
{
  "type": "weak_topic",
  "topicId": "uuid",
  "reason": "Low score in recent practice",
  "confidence": 0.85
}
```

---

#### Table: `user_analytics`
**Purpose:** User engagement and progress metrics

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Analytics ID |
| `user_id` | UUID | FK → users.id | User reference |
| `analytics_data` | JSONB | NOT NULL | Metrics data |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record time |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**JSONB Structure:**
```json
{
  "totalStudyTime": 7200,
  "lessonsCompleted": 45,
  "averageScore": 82,
  "currentStreak": 7,
  "longestStreak": 15
}
```

---

### 3.1. AI & Chat (Phase 1)

#### Table: `chat_conversations`
**Purpose:** AI chatbot conversation threads

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Conversation ID |
| `user_id` | UUID | FK → users.id | User reference |
| `title` | TEXT | DEFAULT 'New Conversation' | Conversation title |
| `context_data` | JSONB | | User context for AI |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**Indexes:**
- `idx_chat_conversations_user` on `user_id`
- `idx_chat_conversations_created` on `created_at DESC`

**JSONB Structure (`context_data`):**
```json
{
  "currentLesson": {
    "id": "uuid",
    "title": "Introduction to Physics",
    "moduleId": "uuid"
  },
  "userLevel": "intermediate",
  "recentTopics": ["mechanics", "thermodynamics"]
}
```

---

#### Table: `chat_messages`
**Purpose:** Individual messages in chat conversations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Message ID |
| `conversation_id` | UUID | FK → chat_conversations.id | Parent conversation |
| `role` | TEXT | CHECK (role IN ('user', 'assistant')) | Message sender |
| `content` | TEXT | NOT NULL | Message text |
| `metadata` | JSONB | | AI metadata |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |

**Foreign Keys:**
- `conversation_id` → `chat_conversations.id` (ON DELETE CASCADE)

**Indexes:**
- `idx_chat_messages_conversation` on `conversation_id`
- `idx_chat_messages_created` on `created_at DESC`

**JSONB Structure (`metadata`):**
```json
{
  "model": "gemini-1.5-flash",
  "tokensUsed": 245,
  "responseTime": 1.2,
  "confidenceScore": 0.87
}
```

---

#### Table: `ai_usage_stats`
**Purpose:** Track AI usage for rate limiting and cost control

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Stat ID |
| `user_id` | UUID | FK → users.id | User reference |
| `date` | DATE | DEFAULT CURRENT_DATE | Usage date |
| `message_count` | INTEGER | DEFAULT 0 | Messages sent |
| `total_tokens` | INTEGER | DEFAULT 0 | Tokens consumed |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**Indexes:**
- `idx_ai_usage_user_date` on `(user_id, date)`
- Unique constraint on `(user_id, date)`

**Usage:**
Used to enforce daily message limits (e.g., 50 messages/day per user) and track API costs.

---

### 4. Subscriptions

#### Table: `subscription_plans`
**Purpose:** Duration-based subscription plans for NMC CBT exam preparation

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Plan ID |
| `name` | TEXT | NOT NULL | Plan name (e.g., "30 Days Plan") |
| `description` | TEXT | | Plan description |
| `price_usd` | NUMERIC | NOT NULL | Price in USD |
| `duration_days` | INTEGER | NOT NULL | Access duration in days |
| `features` | TEXT[] | | Feature list |
| `is_active` | BOOLEAN | DEFAULT true | Availability |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Duration Options:**
- 30 days - Short-term preparation
- 60 days - Medium-term preparation  
- 90 days - Standard preparation (recommended)
- 120 days - Extended preparation

**Pricing Model:**
- All prices in USD (converted by payment gateways)
- Non-recurring (expires after duration)
- Trial plan: 0 USD, limited features

**Example Data:**
```json
{
  "id": "uuid-1",
  "name": "90 Days Access",
  "price_usd": 119.00,
  "duration_days": 90,
  "features": ["All Modules", "Mock Exams", "AI JeevaBot", "Analytics"]
}
```

---

#### Table: `subscriptions`
**Purpose:** User subscription records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Subscription ID |
| `user_id` | UUID | FK → users.id | User reference |
| `plan_id` | UUID | FK → subscription_plans.id | Plan reference |
| `status` | TEXT | NOT NULL | Subscription status |
| `start_date` | TIMESTAMP | NOT NULL | Start date |
| `end_date` | TIMESTAMP | NOT NULL | End date (start + duration) |
| `payment_gateway` | TEXT | | Gateway used (stripe/razorpay) |
| `payment_method` | TEXT | | Payment type (card/upi) |
| `amount_paid_usd` | NUMERIC | | Amount in USD |
| `coupon_code` | TEXT | FK → discount_coupons.code | Applied coupon |
| `discount_amount` | NUMERIC | DEFAULT 0 | Discount applied |
| `transaction_id` | TEXT | | Payment transaction ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Enums:**
- `status`: 'trial' | 'active' | 'expired' | 'cancelled'
- `payment_gateway`: 'stripe' | 'razorpay'

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `plan_id` → `subscription_plans.id` (ON DELETE RESTRICT)
- `coupon_code` → `discount_coupons.code` (ON DELETE SET NULL)

**Business Logic:**
- Trial users: status='trial', amount_paid_usd=0, limited access
- Subscription expires when `end_date` < NOW() → status='expired'
- Payment gateway selected based on `user_profiles.current_country`

**RLS Policy:** Users can read their own subscriptions

---

#### Table: `discount_coupons`
**Purpose:** Subscription discount/coupon management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Coupon ID |
| `code` | TEXT | UNIQUE, NOT NULL | Coupon code (e.g., "FIRST20") |
| `description` | TEXT | | Coupon description |
| `discount_type` | TEXT | NOT NULL | Type of discount |
| `discount_value` | NUMERIC | NOT NULL | Discount amount/percentage |
| `applicable_plans` | UUID[] | | Plan IDs (null = all plans) |
| `usage_limit` | INTEGER | | Max redemptions (null = unlimited) |
| `usage_count` | INTEGER | DEFAULT 0 | Times used |
| `valid_from` | TIMESTAMP | NOT NULL | Start date |
| `valid_until` | TIMESTAMP | NOT NULL | Expiry date |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Enums:**
- `discount_type`: 'percentage' | 'fixed_amount'

**Validation:**
- `discount_type = 'percentage'` → `discount_value` between 1-100
- `discount_type = 'fixed_amount'` → `discount_value` in USD

**Example Data:**
```json
{
  "code": "FIRST20",
  "discount_type": "percentage",
  "discount_value": 20,
  "applicable_plans": null,
  "usage_limit": 500,
  "valid_until": "2025-12-31"
}
```

**Business Logic:**
- Check: coupon is_active AND NOW() BETWEEN valid_from AND valid_until
- Check: usage_count < usage_limit (if limit exists)
- Check: plan_id IN applicable_plans (if specified)
- Increment usage_count on successful application

**RLS Policy:** Public read (for validation), admin write

---

### 5. System & Settings

#### Table: `app_settings`
**Purpose:** Application configuration

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Setting ID |
| `key` | TEXT | UNIQUE, NOT NULL | Setting key |
| `value` | TEXT | | Setting value |

**Example Keys:**
- `site_name`
- `maintenance_mode`
- `registration_enabled`
- `max_file_upload_size`

---

#### Table: `hero_sections`
**Purpose:** Dashboard hero/banner sections for mobile app

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Hero ID |
| `title` | TEXT | NOT NULL | Hero title |
| `subtitle` | TEXT | | Hero subtitle/description |
| `image_url` | TEXT | | Banner image URL |
| `cta_text` | TEXT | | Call-to-action button text |
| `cta_link` | TEXT | | CTA destination link/route |
| `is_active` | BOOLEAN | DEFAULT true | Visibility status |
| `display_order` | INTEGER | DEFAULT 0 | Sort order (ascending) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Mobile App Display:**
- Displays at top of dashboard/home screen
- First active hero (lowest display_order) shown prominently
- Swipeable carousel if multiple active heroes exist
- CTA links can be internal routes or external URLs

**Example Data:**
```json
{
  "title": "NMC CBT Exam Tips",
  "subtitle": "Master clinical scenarios with our new video lessons",
  "image_url": "https://storage.../hero-banner.jpg",
  "cta_text": "Start Learning",
  "cta_link": "/learning/clinical-knowledge",
  "is_active": true,
  "display_order": 1
}
```

**RLS Policy:** Public read, admin write

---

#### Table: `content_approvals`
**Purpose:** Content review and approval workflow

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Approval ID |
| `resource_id` | UUID | NOT NULL | Content ID |
| `resource_type` | TEXT | NOT NULL | Content type |
| `resource_title` | TEXT | NOT NULL | Content title |
| `status` | TEXT | NOT NULL | Approval status |
| `submitted_by` | UUID | FK → admin_users.id | Submitter |
| `reviewed_by` | UUID | FK → admin_users.id | Reviewer |
| `review_comments` | TEXT | | Review notes |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Submission time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |
| `reviewed_at` | TIMESTAMP | | Review time |

**Enums:**
- `resource_type`: 'module' | 'topic' | 'lesson' | 'question' | 'flashcard'
- `status`: 'pending' | 'approved' | 'rejected'

**Foreign Keys:**
- `submitted_by` → `admin_users.id`
- `reviewed_by` → `admin_users.id`

---

#### Table: `email_templates`
**Purpose:** Email template storage

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Template ID |
| `name` | TEXT | UNIQUE, NOT NULL | Template name |
| `subject` | TEXT | NOT NULL | Email subject |
| `body` | TEXT | NOT NULL | HTML content |
| `variables` | TEXT[] | | Template variables |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Example Templates:**
- `welcome_email`
- `password_reset`
- `subscription_confirmation`

---

## 🔗 Relationship Summary

### Primary Relationships

**Content Hierarchy:**
```
modules (1) ──→ (*) topics (1) ──→ (*) lessons
                                        ├──→ (*) questions ──→ (*) question_options
                                        └──→ (*) flashcards
```

**User Progress:**
```
users (1) ──→ (*) learning_completions ──→ (1) lessons
users (1) ──→ (*) practice_sessions ──→ (*) practice_results
users (1) ──→ (*) mock_exams ──→ (*) mock_exam_results
```

**Subscriptions:**
```
subscription_plans (1) ──→ (*) subscriptions ──→ (1) users
```

**Content Approval:**
```
admin_users (1) ──→ (*) content_approvals (submitted)
admin_users (1) ──→ (*) content_approvals (reviewed)
```

---

## 🔒 Row Level Security (RLS) Policies

### Policy Matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| **users** | Self + Admin | Anyone | Self + Admin | Admin |
| **user_profiles** | Self | Self | Self | Self |
| **admin_users** | Active Admin | Superadmin | Superadmin | Superadmin |
| **modules** | Public | Editor/Super | Editor/Super | Superadmin |
| **topics** | Public | Editor/Super | Editor/Super | Superadmin |
| **lessons** | Public | Editor/Super | Editor/Super | Superadmin |
| **questions** | Public | Editor/Super | Editor/Super | Superadmin |
| **flashcards** | Public | Editor/Super | Editor/Super | Superadmin |
| **learning_completions** | Self | Self | - | - |
| **practice_sessions** | Self | Self | Self | Self |
| **mock_exams** | Self | Self | - | - |
| **subscriptions** | Self | Payment/Admin | Admin | Admin |
| **subscription_plans** | Public | Superadmin | Superadmin | Superadmin |

### Key Policies

**1. Self-Access Policy (user_profiles)**
```sql
CREATE POLICY "Users can access own profile"
ON user_profiles
FOR ALL
USING (auth.uid() = user_id);
```

**2. Public Read Policy (modules)**
```sql
CREATE POLICY "Public can read active modules"
ON modules
FOR SELECT
USING (is_active = true);
```

**3. Admin Write Policy (lessons)**
```sql
CREATE POLICY "Editors can manage lessons"
ON lessons
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.role IN ('editor', 'superadmin')
    AND admin_users.is_active = true
  )
);
```

---

## 📊 Indexes & Performance

### Critical Indexes

**1. User Lookups**
- `users.email` (UNIQUE)
- `user_profiles.user_id`

**2. Content Navigation**
- `topics.module_id`
- `lessons.topic_id`
- `questions.lesson_id`
- `flashcards.lesson_id`

**3. Progress Queries**
- `learning_completions (user_id, lesson_id)` (UNIQUE)
- `learning_completions.completed_at`
- `practice_sessions.user_id`

**4. Display Order**
- `modules.display_order`
- `topics.display_order`
- `lessons.display_order`

---

## 🔄 Cascading Rules

### ON DELETE CASCADE

**Content Hierarchy:**
- Delete Module → Cascade to Topics → Lessons → Questions/Flashcards

**User Data:**
- Delete User → Cascade to Profile, Completions, Sessions, Exams

### ON DELETE RESTRICT

**Protected References:**
- Cannot delete Subscription Plan if active subscriptions exist
- Cannot delete Admin User if they have approval records

---

## 💾 Data Types Guide

### UUID Generation
```sql
DEFAULT gen_random_uuid()
```

### Timestamp Defaults
```sql
DEFAULT NOW()
DEFAULT CURRENT_TIMESTAMP
```

### JSONB Usage
- `practice_results.answer_log`
- `mock_exams.exam_data`
- `ai_recommendations.recommendation_data`
- `user_analytics.analytics_data`

### Array Types
- `subscription_plans.features` (TEXT[])
- `email_templates.variables` (TEXT[])

---

## 🚀 Migration Guide

### Initial Setup

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all tables)
```

### Sample Seed Data

```sql
-- Insert sample module
INSERT INTO modules (title, description, is_active, display_order)
VALUES ('Mathematics', 'Complete math course', true, 1);

-- Insert sample topic
INSERT INTO topics (module_id, title, description, is_active, display_order)
VALUES ('[module-id]', 'Algebra', 'Introduction to Algebra', true, 1);

-- Insert sample lesson
INSERT INTO lessons (topic_id, title, content, is_active, display_order)
VALUES ('[topic-id]', 'Basic Equations', 'Learn to solve equations...', true, 1);
```

---

## 📱 Mobile App Queries

### Common Query Patterns

**1. Get Learning Path**
```sql
SELECT m.*, t.*, l.*
FROM modules m
LEFT JOIN topics t ON t.module_id = m.id
LEFT JOIN lessons l ON l.topic_id = t.id
WHERE m.is_active = true
ORDER BY m.display_order, t.display_order, l.display_order;
```

**2. Get User Progress**
```sql
SELECT 
  l.*,
  CASE WHEN lc.id IS NOT NULL THEN true ELSE false END as is_completed
FROM lessons l
LEFT JOIN learning_completions lc 
  ON lc.lesson_id = l.id AND lc.user_id = '[user-id]'
WHERE l.topic_id = '[topic-id]';
```

**3. Get Practice Questions**
```sql
SELECT q.*, json_agg(qo.*) as options
FROM questions q
LEFT JOIN question_options qo ON qo.question_id = q.id
WHERE q.lesson_id = '[lesson-id]'
GROUP BY q.id;
```

---

## 🔗 Related Documentation

- [Mobile App Overview](./MOBILE_APP_OVERVIEW.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Authentication Flow](./AUTHENTICATION_FLOW.md) (Next to create)

---

**Database Version:** 2.0  
**Last Updated:** October 18, 2025  
**Maintained by:** vollstek@gmail.com

**Recent Changes (v2.0):**
- Added OAuth authentication support (Google, Apple)
- Enhanced `user_profiles` with NMC-specific fields
- Added `discount_coupons` table for subscription offers
- Updated `subscription_plans` to duration-based model (30/60/90/120 days)
- Renamed `dashboard_hero` to `hero_sections`
- Added payment gateway tracking in subscriptions
