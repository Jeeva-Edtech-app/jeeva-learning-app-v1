# 📱 Jeeva Learning - Feature Specifications

## 📋 Document Overview

This document provides detailed feature specifications for the Jeeva Learning mobile app. Each feature includes user stories, acceptance criteria, UI/UX requirements, and technical implementation details.

**Version:** 1.0  
**Last Updated:** October 11, 2025  
**Target Platform:** iOS & Android (React Native/Expo)

---

## 🎯 Feature Priority Matrix

### Phase 1: MVP (Must Have)
1. Authentication & Onboarding
2. Content Browsing (Modules, Topics, Lessons)
3. Lesson Viewer
4. Practice Questions
5. Progress Tracking
6. User Profile

### Phase 2: Enhanced Learning
1. Audio Lessons (Podcast Mode)
2. Flashcard System
3. Mock Exams
4. Analytics Dashboard
5. Bookmarks & Notes

### Phase 3: Advanced Features
1. AI Recommendations
2. Offline Mode
3. Push Notifications
4. Social Features
5. Subscription Management

---

## 1️⃣ Authentication & Onboarding

### 1.1 User Registration

**User Story:**  
*As a new user, I want to create an account so that I can access learning content and track my progress.*

**Acceptance Criteria:**
- [ ] User can sign up with email and password
- [ ] Password must be minimum 8 characters with 1 uppercase, 1 lowercase, 1 number
- [ ] Email validation before submission
- [ ] User receives verification email
- [ ] Account is created with default user profile
- [ ] Error messages for invalid inputs
- [ ] Loading state during signup
- [ ] Success message after registration

**UI Components:**
- Full name text input
- Email text input
- Password text input (with show/hide toggle)
- Confirm password text input
- Sign up button
- Terms & conditions checkbox
- Link to login page

**Technical Implementation:**
```typescript
// Required fields
interface SignUpData {
  fullName: string
  email: string
  password: string
}

// API endpoint
POST /auth/signup
supabase.auth.signUp()

// Creates records in:
- auth.users (Supabase)
- user_profiles table
```

**Validation Rules:**
- Email: Valid format (regex)
- Password: 8+ chars, 1 uppercase, 1 lowercase, 1 number
- Full name: 2-50 characters
- All fields required

---

### 1.2 Email Verification

**User Story:**  
*As a new user, I want to verify my email so that I can access my account.*

**Acceptance Criteria:**
- [ ] Verification email sent immediately after signup
- [ ] Email contains verification link
- [ ] Deep link opens app and verifies account
- [ ] User can resend verification email
- [ ] Success message after verification
- [ ] Redirect to dashboard after verification

**UI Components:**
- Verification pending screen
- Resend email button
- Email verification success screen

**Technical Implementation:**
```typescript
// Email verification
supabase.auth.verifyOtp({
  token_hash: token,
  type: 'signup'
})

// Deep link format
jeevalearning://auth/callback?token_hash=xxx&type=signup
```

---

### 1.3 Login

**User Story:**  
*As a registered user, I want to log in to my account so that I can access my learning content.*

**Acceptance Criteria:**
- [ ] User can login with email and password
- [ ] Remember me option saves session
- [ ] Error message for incorrect credentials
- [ ] Forgot password link available
- [ ] Loading state during login
- [ ] Auto-redirect to dashboard on success

**UI Components:**
- Email input
- Password input (with show/hide)
- Login button
- Remember me checkbox
- Forgot password link
- Sign up link

**Technical Implementation:**
```typescript
POST /auth/login
supabase.auth.signInWithPassword({
  email,
  password
})
```

---

### 1.4 Social Login (Google & Apple)

**User Story:**  
*As a user, I want to sign in with Google/Apple so that I can quickly access my account.*

**Acceptance Criteria:**
- [ ] Google sign-in button available
- [ ] Apple sign-in button available
- [ ] OAuth flow completes successfully
- [ ] User profile created automatically
- [ ] Auto-redirect after successful auth

**UI Components:**
- "Continue with Google" button
- "Continue with Apple" button
- OAuth loading screen

**Technical Implementation:**
```typescript
supabase.auth.signInWithOAuth({
  provider: 'google' | 'apple',
  options: {
    redirectTo: 'jeevalearning://auth/callback'
  }
})
```

---

### 1.5 Onboarding Flow

**User Story:**  
*As a first-time user, I want to see an introduction to the app so that I understand its features.*

**Acceptance Criteria:**
- [ ] Onboarding shown only on first launch
- [ ] 3-5 slides explaining key features
- [ ] Skip option available
- [ ] Get started button on last slide
- [ ] Never show again after completion

**UI Components:**
- Intro slides with images
- Progress indicator dots
- Skip button
- Next/Previous navigation
- Get Started button

**Content Slides:**
1. Welcome to Jeeva Learning
2. Browse courses and lessons
3. Practice with questions
4. Track your progress
5. Get started now

---

## 2️⃣ Content Browsing

### 2.1 Module List

**User Story:**  
*As a user, I want to browse available modules so that I can choose what to learn.*

**Acceptance Criteria:**
- [ ] Display all active modules
- [ ] Show module thumbnail, title, description
- [ ] Display topic count per module
- [ ] Show progress percentage (if started)
- [ ] Pull to refresh
- [ ] Loading skeleton while fetching
- [ ] Empty state if no modules
- [ ] Search functionality

**UI Components:**
- Module card with:
  - Thumbnail image
  - Title
  - Description (truncated)
  - Topic count badge
  - Progress bar (if started)
- Search bar
- Filter/Sort options
- Pull-to-refresh

**Data Model:**
```typescript
interface Module {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  topicCount: number
  progress?: number // 0-100
}
```

**API Endpoint:**
```typescript
GET /modules
supabase.from('modules')
  .select('*')
  .eq('is_active', true)
  .order('display_order')
```

---

### 2.2 Topic List

**User Story:**  
*As a user, I want to view topics within a module so that I can navigate to specific content.*

**Acceptance Criteria:**
- [ ] Display topics for selected module
- [ ] Show topic title and description
- [ ] Display lesson count per topic
- [ ] Show completion status
- [ ] Lock icon for premium content (if applicable)
- [ ] Breadcrumb navigation (Module > Topics)

**UI Components:**
- Topic card with:
  - Title
  - Description
  - Lesson count
  - Completion checkmark/percentage
  - Lock icon (if premium)
- Module header with back button
- Progress summary

**Data Model:**
```typescript
interface Topic {
  id: string
  moduleId: string
  title: string
  description: string
  lessonCount: number
  completedLessons: number
  isPremium?: boolean
}
```

**API Endpoint:**
```typescript
GET /topics?moduleId={id}
supabase.from('topics')
  .select('*, modules(*)')
  .eq('module_id', moduleId)
  .eq('is_active', true)
```

---

### 2.3 Lesson List

**User Story:**  
*As a user, I want to see all lessons in a topic so that I can choose what to study.*

**Acceptance Criteria:**
- [ ] Display lessons in sequential order
- [ ] Show lesson title and duration
- [ ] Display completion status (checkmark)
- [ ] Show lesson type icon (text/video/audio)
- [ ] Lock unavailable lessons
- [ ] Sequential unlock (must complete previous)
- [ ] Current lesson highlighted

**UI Components:**
- Lesson card with:
  - Lesson number
  - Title
  - Duration
  - Type icon (📝 text, 🎥 video, 🎧 audio)
  - Completion checkmark
  - Lock icon (if locked)
- Topic header with progress
- Continue learning button

**Data Model:**
```typescript
interface Lesson {
  id: string
  topicId: string
  title: string
  content: string
  videoUrl?: string
  audioUrl?: string
  duration: number // seconds
  displayOrder: number
  isCompleted: boolean
  isLocked: boolean
}
```

**API Endpoint:**
```typescript
GET /lessons?topicId={id}
supabase.from('lessons')
  .select('*, topics(*)')
  .eq('topic_id', topicId)
  .eq('is_active', true)
  .order('display_order')
```

---

## 3️⃣ Lesson Viewer

### 3.1 Text Lessons

**User Story:**  
*As a user, I want to read text-based lessons so that I can learn new concepts.*

**Acceptance Criteria:**
- [ ] Display formatted lesson content
- [ ] Support rich text (bold, italic, lists)
- [ ] Render images inline
- [ ] Smooth scrolling
- [ ] Font size adjustable
- [ ] Progress indicator (% read)
- [ ] Mark as complete button
- [ ] Next lesson button

**UI Components:**
- Lesson header (title, topic breadcrumb)
- Rich text content viewer
- Image viewer (zoomable)
- Font size controls (A-, A+)
- Progress bar
- Mark complete button
- Next lesson button
- Bookmark button

**Technical Implementation:**
```typescript
// Rich text rendering
<RenderHTML 
  source={{ html: lesson.content }}
  contentWidth={width}
/>

// Mark complete
supabase.from('learning_completions')
  .insert({
    user_id: userId,
    lesson_id: lessonId
  })
```

---

### 3.2 Video Lessons

**User Story:**  
*As a user, I want to watch video lessons so that I can learn visually.*

**Acceptance Criteria:**
- [ ] Play video inline
- [ ] Video controls (play, pause, seek)
- [ ] Fullscreen mode
- [ ] Playback speed control (0.5x, 1x, 1.5x, 2x)
- [ ] Quality selection (if available)
- [ ] Auto-mark complete when finished
- [ ] Resume from last position
- [ ] Picture-in-picture support

**UI Components:**
- Video player with controls
- Progress bar
- Play/Pause button
- Fullscreen toggle
- Speed control menu
- Quality selector
- Timestamp display

**Technical Implementation:**
```typescript
import { Video } from 'expo-av'

<Video
  source={{ uri: lesson.videoUrl }}
  useNativeControls
  resizeMode="contain"
  onPlaybackStatusUpdate={handleProgress}
/>

// Save progress
AsyncStorage.setItem(`video_${lessonId}`, position)
```

---

### 3.3 Audio Lessons (Podcast Mode)

**User Story:**  
*As a user, I want to listen to audio lessons so that I can learn while multitasking.*

**Acceptance Criteria:**
- [ ] Play audio in background
- [ ] Playback controls in notification (iOS/Android)
- [ ] Seek forward/backward (15s)
- [ ] Playback speed control
- [ ] Sleep timer
- [ ] Resume from last position
- [ ] Download for offline (optional)
- [ ] Show waveform visualization

**UI Components:**
- Audio player UI with:
  - Waveform visualization
  - Play/Pause button
  - Seek buttons (±15s)
  - Progress slider
  - Timestamp
  - Speed control
  - Sleep timer
- Lesson title and description
- Background play notification

**Technical Implementation:**
```typescript
import { Audio } from 'expo-av'

// Background audio
await Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false
})

const { sound } = await Audio.Sound.createAsync(
  { uri: lesson.audioUrl },
  { shouldPlay: true }
)
```

---

## 4️⃣ Practice & Assessment

### 4.1 Practice Questions

**User Story:**  
*As a user, I want to practice questions so that I can test my knowledge.*

**Acceptance Criteria:**
- [ ] Display questions one at a time
- [ ] Show all answer options
- [ ] Highlight selected answer
- [ ] Submit button to check answer
- [ ] Instant feedback (correct/incorrect)
- [ ] Show explanation after answer
- [ ] Track score
- [ ] Navigate between questions
- [ ] Show progress (3/10)
- [ ] Results summary at end

**UI Components:**
- Question card:
  - Question text
  - Question image (if any)
  - Answer options (radio/checkboxes)
  - Submit button
  - Explanation panel
- Progress indicator (3/10)
- Score display
- Navigation buttons (Previous/Next)
- Quit practice button

**Data Model:**
```typescript
interface Question {
  id: string
  questionText: string
  imageUrl?: string
  questionType: 'multiple_choice' | 'true_false'
  difficulty: 'easy' | 'medium' | 'hard'
  explanation: string
  options: QuestionOption[]
}

interface QuestionOption {
  id: string
  optionText: string
  isCorrect: boolean
}

interface PracticeSession {
  id: string
  userId: string
  answers: Answer[]
  score: number
  totalQuestions: number
}
```

**API Endpoints:**
```typescript
// Get questions
GET /questions?lessonId={id}&limit=10

// Save practice session
POST /practice-sessions
{
  user_id: string
  answers: [
    {
      questionId: string,
      selectedOptionId: string,
      isCorrect: boolean,
      timeTaken: number
    }
  ]
}
```

**Practice Flow:**
1. Select topic/lesson for practice
2. Fetch 10 random questions
3. Show questions one by one
4. User selects answer
5. Submit and show feedback
6. Next question
7. Show results summary
8. Save session to database

---

### 4.2 Mock Exams

**User Story:**  
*As a user, I want to take mock exams so that I can prepare for real tests.*

**Acceptance Criteria:**
- [ ] Timed exam mode (configurable duration)
- [ ] All questions displayed
- [ ] Cannot go back after submit
- [ ] Timer countdown visible
- [ ] Auto-submit when time expires
- [ ] Review mode after completion
- [ ] Detailed performance report
- [ ] Compare with previous attempts

**UI Components:**
- Exam setup screen:
  - Topic selection
  - Number of questions
  - Duration setting
- Exam screen:
  - Timer (countdown)
  - Question number
  - Question list view
  - Flag for review
  - Submit exam button
- Results screen:
  - Score percentage
  - Time taken
  - Correct/Incorrect breakdown
  - Topic-wise performance
  - Review answers button

**Data Model:**
```typescript
interface MockExam {
  id: string
  userId: string
  topicId: string
  duration: number // minutes
  questionsCount: number
  status: 'in_progress' | 'completed'
  startedAt: string
  completedAt?: string
}

interface MockExamResult {
  examId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeTaken: number
  topicPerformance: {
    topicId: string
    score: number
  }[]
}
```

**Exam Flow:**
1. Configure exam (topic, duration, questions)
2. Start timer
3. Answer questions
4. Flag questions for review
5. Submit or auto-submit on timeout
6. Calculate results
7. Show performance report
8. Save to database

---

### 4.3 Flashcards

**User Story:**  
*As a user, I want to study flashcards so that I can quickly review key concepts.*

**Acceptance Criteria:**
- [ ] Display card front initially
- [ ] Tap to flip to back
- [ ] Swipe right for "Got it"
- [ ] Swipe left for "Review again"
- [ ] Track mastery level
- [ ] Spaced repetition algorithm
- [ ] Shuffle cards option
- [ ] Progress indicator
- [ ] Review statistics

**UI Components:**
- Flashcard:
  - Front side (question/concept)
  - Back side (answer/explanation)
  - Flip animation
  - Swipe gestures
- Action buttons:
  - Got it (right)
  - Review (left)
  - Shuffle toggle
- Progress: X/Y cards reviewed
- Statistics panel

**Data Model:**
```typescript
interface Flashcard {
  id: string
  lessonId: string
  front: string
  back: string
  imageUrl?: string
  masteryLevel: number // 0-5
  nextReviewDate: string
}

interface FlashcardSession {
  userId: string
  flashcardId: string
  wasCorrect: boolean
  reviewedAt: string
}
```

**Spaced Repetition Algorithm:**
```typescript
// Update next review date based on mastery
const intervals = [1, 3, 7, 14, 30, 90] // days
const nextInterval = intervals[masteryLevel]
const nextReviewDate = addDays(new Date(), nextInterval)
```

---

## 5️⃣ Progress Tracking

### 5.1 Learning Dashboard

**User Story:**  
*As a user, I want to view my learning progress so that I can track my achievements.*

**Acceptance Criteria:**
- [ ] Display total lessons completed
- [ ] Show current streak (days)
- [ ] Display total study time
- [ ] Show average score
- [ ] Weekly activity chart
- [ ] Achievement badges
- [ ] Recently studied lessons
- [ ] Recommended next lessons

**UI Components:**
- Stats cards:
  - Lessons completed
  - Current streak 🔥
  - Total study time
  - Average score
- Activity chart (7-day view)
- Achievement badges section
- Recent activity list
- Recommended section

**Data Model:**
```typescript
interface UserStats {
  lessonsCompleted: number
  currentStreak: number
  totalStudyTime: number // minutes
  averageScore: number
  weeklyActivity: {
    date: string
    lessonsCompleted: number
  }[]
  achievements: Achievement[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
}
```

**API Endpoint:**
```typescript
GET /users/{id}/stats
// Aggregates data from:
- learning_completions
- practice_sessions
- mock_exams
```

---

### 5.2 Topic Progress

**User Story:**  
*As a user, I want to see my progress in each topic so that I know what to focus on.*

**Acceptance Criteria:**
- [ ] Show lessons completed / total
- [ ] Display progress percentage
- [ ] Show last studied date
- [ ] Display average score for topic
- [ ] List completed lessons
- [ ] Show remaining lessons
- [ ] Time spent on topic

**UI Components:**
- Progress bar (visual %)
- Stats summary:
  - X/Y lessons completed
  - Last studied: date
  - Average score: %
  - Time spent: hours
- Completed lessons list (checkmarks)
- Remaining lessons list
- Continue learning button

**Calculation:**
```typescript
const progress = (completedLessons / totalLessons) * 100
const averageScore = totalScore / attemptedQuestions
const timeSpent = sum(lessonDurations)
```

---

### 5.3 Streak Tracking

**User Story:**  
*As a user, I want to maintain a daily learning streak so that I stay motivated.*

**Acceptance Criteria:**
- [ ] Track daily learning activity
- [ ] Display current streak count
- [ ] Show streak calendar view
- [ ] Notify when streak is at risk
- [ ] Show longest streak achieved
- [ ] Streak freeze feature (1 day pass)
- [ ] Celebrate milestone streaks

**UI Components:**
- Streak counter with fire icon 🔥
- Calendar view (30 days):
  - Green dot: activity
  - Gray: no activity
  - Today highlighted
- Longest streak badge
- Streak freeze button
- Milestone notifications

**Streak Logic:**
```typescript
// Calculate streak
const sortedDates = completions
  .map(c => c.completed_at)
  .sort()

let streak = 0
let currentDate = today

for (const date of sortedDates.reverse()) {
  const daysDiff = differenceInDays(currentDate, date)
  
  if (daysDiff === 0 || daysDiff === 1) {
    streak++
    currentDate = date
  } else {
    break
  }
}
```

---

## 6️⃣ User Profile & Settings

### 6.1 User Profile

**User Story:**  
*As a user, I want to manage my profile so that I can keep my information up to date.*

**Acceptance Criteria:**
- [ ] View profile information
- [ ] Edit full name
- [ ] Update phone number
- [ ] Change date of birth
- [ ] Upload profile picture
- [ ] View account email (read-only)
- [ ] Save changes button
- [ ] Validation for all fields

**UI Components:**
- Profile picture (with edit icon)
- Text inputs:
  - Full name
  - Email (read-only)
  - Phone number
  - Date of birth (date picker)
- Save button
- Loading state

**Data Model:**
```typescript
interface UserProfile {
  id: string
  userId: string
  fullName: string
  phoneNumber?: string
  dateOfBirth?: string
  profilePictureUrl?: string
}
```

**API Endpoint:**
```typescript
GET /user-profiles/{userId}
PUT /user-profiles/{userId}
{
  full_name: string
  phone_number: string
  date_of_birth: string
}
```

---

### 6.2 App Settings

**User Story:**  
*As a user, I want to customize app settings so that I can personalize my experience.*

**Acceptance Criteria:**
- [ ] Toggle dark mode
- [ ] Change language (if multi-language)
- [ ] Notification preferences
- [ ] Download quality (Wi-Fi only/Mobile data)
- [ ] Auto-play videos
- [ ] Font size preference
- [ ] Clear cache option

**UI Components:**
- Settings list with:
  - Dark mode toggle
  - Language selector
  - Notification settings link
  - Download settings
  - Auto-play toggle
  - Font size slider
  - Clear cache button

**Settings Storage:**
```typescript
// AsyncStorage
await AsyncStorage.multiSet([
  ['theme', 'dark'],
  ['language', 'en'],
  ['autoplay', 'true'],
  ['fontSize', '16']
])
```

---

### 6.3 Change Password

**User Story:**  
*As a user, I want to change my password so that I can keep my account secure.*

**Acceptance Criteria:**
- [ ] Require current password
- [ ] Enter new password
- [ ] Confirm new password
- [ ] Validate password strength
- [ ] Show success message
- [ ] Auto logout after change

**UI Components:**
- Current password input
- New password input
- Confirm password input
- Password strength indicator
- Update password button

**API Endpoint:**
```typescript
POST /auth/update-password
supabase.auth.updateUser({
  password: newPassword
})
```

---

## 7️⃣ Notifications

### 7.1 Push Notifications

**User Story:**  
*As a user, I want to receive notifications so that I stay engaged with learning.*

**Notification Types:**

**1. Study Reminders**
- Daily reminder at set time
- Custom schedule (Mon-Fri, weekends)
- Streak reminder (if about to break)

**2. Content Updates**
- New lesson available
- New topic added to module
- Course completion

**3. Achievement Notifications**
- Milestone reached (10, 50, 100 lessons)
- Streak milestones (7, 30, 100 days)
- Perfect score on practice

**4. Subscription Alerts**
- Trial expiring soon
- Subscription renewal
- Payment failed

**UI Components:**
- Notification preferences screen:
  - Study reminders toggle
  - Reminder time picker
  - Content updates toggle
  - Achievements toggle
  - Subscription alerts toggle
- In-app notification center
- Badge count on notifications icon

**Technical Implementation:**
```typescript
import * as Notifications from 'expo-notifications'

// Request permission
await Notifications.requestPermissionsAsync()

// Schedule notification
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Time to learn! 📚",
    body: "Your daily streak is waiting!",
  },
  trigger: {
    hour: 19,
    minute: 0,
    repeats: true
  }
})
```

---

### 7.2 In-App Notifications

**User Story:**  
*As a user, I want to see in-app notifications so that I don't miss important updates.*

**Acceptance Criteria:**
- [ ] Notification bell icon with badge
- [ ] List of recent notifications
- [ ] Mark as read functionality
- [ ] Tap to view details
- [ ] Clear all option
- [ ] Delete individual notifications

**UI Components:**
- Notification icon with badge count
- Notification list:
  - Icon (type indicator)
  - Title
  - Message
  - Timestamp
  - Read/unread indicator
- Mark all read button
- Clear all button

---

## 8️⃣ Subscription Management

### 8.1 Subscription Plans

**User Story:**  
*As a user, I want to view subscription plans so that I can upgrade to premium.*

**Acceptance Criteria:**
- [ ] Display all available plans
- [ ] Show plan features
- [ ] Display pricing (monthly/yearly)
- [ ] Highlight recommended plan
- [ ] Current plan indicator
- [ ] Subscribe button for each plan
- [ ] Free trial badge (if applicable)

**UI Components:**
- Plan cards:
  - Plan name
  - Price
  - Billing cycle
  - Feature list (checkmarks)
  - Subscribe/Current plan button
  - Free trial badge
- Recommended badge
- Compare plans table

**Data Model:**
```typescript
interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  features: string[]
  isCurrent?: boolean
  isRecommended?: boolean
}
```

---

### 8.2 Payment Integration

**User Story:**  
*As a user, I want to purchase a subscription so that I can access premium content.*

**Acceptance Criteria:**
- [ ] Select subscription plan
- [ ] Enter payment details (Stripe/in-app purchase)
- [ ] Review order summary
- [ ] Confirm payment
- [ ] Receive confirmation email
- [ ] Instant premium access

**Payment Flow:**
1. Select plan
2. Choose payment method (card/app store)
3. Enter payment details
4. Review & confirm
5. Process payment
6. Update subscription status
7. Send confirmation
8. Grant access

**Technical Implementation:**
```typescript
// iOS/Android in-app purchase
import * as InAppPurchases from 'expo-in-app-purchases'

await InAppPurchases.connectAsync()
const products = await InAppPurchases.getProductsAsync([
  'premium_monthly',
  'premium_yearly'
])

const purchase = await InAppPurchases.purchaseItemAsync('premium_monthly')
```

---

### 8.3 Manage Subscription

**User Story:**  
*As a subscriber, I want to manage my subscription so that I can control my plan.*

**Acceptance Criteria:**
- [ ] View current subscription details
- [ ] See next billing date
- [ ] Change payment method
- [ ] Upgrade/downgrade plan
- [ ] Cancel subscription
- [ ] Reactivate cancelled subscription
- [ ] View billing history

**UI Components:**
- Subscription details card:
  - Current plan name
  - Status (active/cancelled/expired)
  - Next billing date
  - Amount
- Action buttons:
  - Change plan
  - Update payment
  - Cancel subscription
- Billing history list
- Cancellation confirmation dialog

---

## 9️⃣ AI Recommendations

### 9.1 Personalized Learning Path

**User Story:**  
*As a user, I want AI-powered recommendations so that I know what to study next.*

**Acceptance Criteria:**
- [ ] Analyze user performance
- [ ] Identify weak areas
- [ ] Suggest relevant topics
- [ ] Recommend practice questions
- [ ] Adaptive difficulty
- [ ] Daily recommendations
- [ ] Explanation for suggestions

**Recommendation Types:**

**1. Weak Topic Recommendations**
- Based on low practice scores
- Suggest focused revision
- Provide extra resources

**2. Next Lesson Suggestions**
- Sequential learning path
- Based on prerequisites
- Consider user pace

**3. Practice Recommendations**
- Target weak areas
- Adaptive difficulty
- Optimal review timing

**UI Components:**
- "Recommended for You" section on dashboard
- Recommendation cards:
  - Type (weak area/next lesson/practice)
  - Title
  - Reason/explanation
  - Start button
- AI insights panel

**Data Model:**
```typescript
interface AIRecommendation {
  id: string
  userId: string
  type: 'weak_topic' | 'next_lesson' | 'practice'
  resourceId: string
  resourceTitle: string
  reason: string
  confidence: number // 0-1
  createdAt: string
}
```

**Algorithm:**
```typescript
// Identify weak topics
const weakTopics = topics.filter(topic => {
  const avgScore = getAverageScore(topic.id, userId)
  return avgScore < 70
})

// Calculate recommendation
const recommendation = {
  type: 'weak_topic',
  topicId: weakTopics[0].id,
  reason: `Your average score in ${topic.title} is ${avgScore}%. Let's strengthen this.`,
  confidence: 0.85
}
```

---

## 🔟 Offline Mode

### 10.1 Download Content

**User Story:**  
*As a user, I want to download lessons so that I can learn offline.*

**Acceptance Criteria:**
- [ ] Download individual lessons
- [ ] Download entire topics
- [ ] Show download progress
- [ ] Manage downloaded content
- [ ] Auto-delete old downloads
- [ ] Wi-Fi only option
- [ ] Storage usage display

**UI Components:**
- Download button on lessons/topics
- Download manager screen:
  - Downloaded content list
  - Storage used
  - Delete button
- Download progress indicator
- Settings: Wi-Fi only toggle

**Technical Implementation:**
```typescript
import * as FileSystem from 'expo-file-system'

// Download lesson
const downloadLesson = async (lesson: Lesson) => {
  const uri = FileSystem.documentDirectory + `lesson_${lesson.id}.json`
  
  await FileSystem.downloadAsync(
    lesson.contentUrl,
    uri
  )
  
  // Save to AsyncStorage
  await AsyncStorage.setItem(`downloaded_${lesson.id}`, 'true')
}
```

---

### 10.2 Offline Access

**User Story:**  
*As a user, I want to access downloaded content offline so that I can learn without internet.*

**Acceptance Criteria:**
- [ ] View downloaded lessons offline
- [ ] Practice with downloaded questions
- [ ] Track progress offline (sync later)
- [ ] Offline indicator visible
- [ ] Sync when online
- [ ] Conflict resolution

**Sync Strategy:**
```typescript
// Queue offline actions
const queueAction = async (action: OfflineAction) => {
  const queue = await getOfflineQueue()
  queue.push(action)
  await saveOfflineQueue(queue)
}

// Sync when online
const syncOfflineData = async () => {
  const queue = await getOfflineQueue()
  
  for (const action of queue) {
    await executeAction(action)
  }
  
  await clearOfflineQueue()
}
```

---

## 📊 Analytics & Insights

### User Activity Tracking

**Events to Track:**
- App opens
- Lesson views
- Lesson completions
- Practice sessions
- Mock exam attempts
- Feature usage
- Time spent per screen
- Drop-off points

**Analytics Dashboard (Admin Portal):**
- Daily active users
- Popular content
- Completion rates
- Average session duration
- User retention
- Conversion rates

---

## 🔐 Security & Privacy

### Data Protection
- End-to-end encryption for sensitive data
- Secure API communication (HTTPS)
- JWT token authentication
- Row-level security in database
- Secure storage for credentials

### Privacy Features
- GDPR compliance
- Data deletion on request
- Privacy policy
- Terms of service
- Cookie consent (web)
- Analytics opt-out

---

## 🧪 Testing Requirements

### Unit Tests
- Authentication flows
- Business logic
- Utility functions
- State management

### Integration Tests
- API integration
- Database operations
- Payment flows
- Notification system

### E2E Tests
- User registration → lesson completion
- Practice session flow
- Subscription purchase
- Offline sync

---

## 📱 Platform-Specific Features

### iOS
- Face ID/Touch ID authentication
- 3D Touch quick actions
- Siri Shortcuts
- Apple Watch companion (Phase 4)
- SharePlay for group study (Phase 4)

### Android
- Fingerprint authentication
- Home screen widgets
- Android Auto support (Phase 4)
- Split screen support

---

## 🎨 Accessibility

### Requirements
- Screen reader support (VoiceOver/TalkBack)
- Minimum touch target size (44x44pt)
- Color contrast ratio (WCAG AA)
- Font scaling support
- Keyboard navigation (tablet)
- Alternative text for images
- Closed captions for videos

---

## 🚀 Performance Targets

### Key Metrics
- App launch time < 2s
- Time to interactive < 3s
- Screen transition < 300ms
- API response < 500ms
- 60 FPS animations
- Bundle size < 50MB
- Crash-free rate > 99.5%

---

## 📋 Success Metrics

### User Engagement
- Daily active users (DAU)
- Weekly active users (WAU)
- Average session duration > 10 min
- Retention rate D1 > 40%, D7 > 20%, D30 > 10%
- Lesson completion rate > 60%

### Learning Outcomes
- Average quiz score > 75%
- Practice completion rate > 70%
- Streak maintenance > 7 days (30% of users)
- Content consumption rate

### Business Metrics
- Free to paid conversion > 5%
- Subscription retention > 80%
- Average revenue per user (ARPU)
- Lifetime value (LTV)

---

## 🔗 Related Documentation

- [Mobile App Overview](./MOBILE_APP_OVERVIEW.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Authentication Flow](./AUTHENTICATION_FLOW.md)

---

**Version:** 1.0  
**Last Updated:** October 11, 2025  
**Author:** vollstek@gmail.com
