# 📱 Jeeva Learning Mobile App - Overview

## 🎯 Vision & Purpose

The Jeeva Learning mobile app is a comprehensive educational platform designed to provide students with an engaging, personalized learning experience. Built with Expo and React Native, it connects to the same Supabase backend used by the admin portal, creating a unified ecosystem for content management and student learning.

### Mission Statement
To democratize quality education by providing accessible, interactive, and adaptive learning experiences that help students master concepts at their own pace.

---

## 👥 Target Users

### Primary Users: Students & Learners
- **Age Range**: 15-35 years old
- **Education Level**: High school to professional certification seekers
- **Learning Goals**: Exam preparation, skill development, concept mastery
- **Device Preference**: Mobile-first (iOS & Android)
- **Usage Pattern**: Daily practice sessions, on-the-go learning

### Use Cases
1. **Exam Preparation**: Students preparing for competitive exams
2. **Concept Mastery**: Learners wanting to strengthen fundamentals
3. **Quick Revision**: Using flashcards for rapid recall
4. **Progress Tracking**: Monitoring learning journey and achievements
5. **Practice**: Taking quizzes and mock exams

---

## ✨ Core Features

### 1. 📚 Learning Content Hierarchy

**Modules → Topics → Lessons → Practice**

- **Modules**: Top-level course categories (e.g., Mathematics, Physics, Chemistry)
- **Topics**: Organized subjects within modules (e.g., Algebra, Calculus)
- **Lessons**: Rich content with text, images, and audio (podcast-style learning)
- **Interactive Practice**: Questions and flashcards for each topic

### 2. 🎓 Learning Modes

#### Study Mode
- Sequential lesson progression
- Rich text content with images
- Audio lessons for auditory learners
- Note-taking capability
- Bookmark important content

#### Practice Mode
- Multiple choice questions
- Instant feedback with explanations
- Performance analytics
- Adaptive difficulty

#### Mock Exam Mode
- Timed assessments
- Exam-like environment
- Comprehensive scoring
- Detailed performance reports

#### Flashcard Mode
- Spaced repetition learning
- Quick revision
- Custom card sets
- Progress tracking

### 3. 📊 Progress & Analytics

- **Learning Dashboard**: Visual progress overview
- **Completion Tracking**: Track finished lessons and topics
- **Performance Metrics**: Accuracy rates, time spent, strengths/weaknesses
- **Streak Tracking**: Daily learning streaks and goals
- **Achievements**: Gamification with badges and milestones

### 4. 👤 User Profile & Account

- **Profile Management**: Update personal information
- **Learning Preferences**: Customize study settings
- **Subscription Status**: View current plan and benefits
- **Study History**: Access past sessions and results

### 5. 💳 Subscription Management

- **Free Tier**: Limited access to basic content
- **Premium Plans**: Full content access with advanced features
- **Payment Integration**: Secure subscription purchases
- **Auto-renewal Management**: Control subscription settings

### 6. 🔔 Notifications & Reminders

- **Study Reminders**: Custom learning schedules
- **Streak Notifications**: Maintain daily habits
- **New Content Alerts**: Updates on fresh lessons
- **Subscription Alerts**: Renewal and payment notifications

### 7. 🤖 AI-Powered Recommendations

- **Personalized Learning Paths**: AI suggests next topics based on performance
- **Weak Area Focus**: Identify and strengthen struggling concepts
- **Smart Practice**: Adaptive question selection

---

## 🛠️ Tech Stack

### Frontend - Mobile App
- **Framework**: Expo (Managed Workflow)
- **UI Library**: React Native
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: NativeWind (Tailwind for React Native) or StyleSheet
- **Forms**: React Hook Form
- **Icons**: Expo Vector Icons

### Backend & Services
- **Database**: Supabase PostgreSQL (Shared with Admin Portal)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for media files)
- **Real-time**: Supabase Realtime Subscriptions
- **Push Notifications**: Expo Notifications + Supabase Edge Functions

### Development Tools
- **Package Manager**: npm/yarn
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, React Native Testing Library
- **Build Service**: EAS (Expo Application Services)
- **Version Control**: Git + GitHub

---

## 🔗 Backend Integration

### Existing Supabase Infrastructure

The mobile app leverages the **same Supabase backend** as the admin portal:

**Database Tables Used:**
- `users` - User accounts and profiles
- `user_profiles` - Extended user information
- `modules` - Course modules
- `topics` - Learning topics
- `lessons` - Lesson content (text, audio, images)
- `questions` - Practice questions
- `question_options` - Multiple choice options
- `flashcards` - Study flashcards
- `practice_sessions` - User practice history
- `mock_exams` - Mock exam records
- `learning_completions` - Progress tracking
- `ai_recommendations` - Personalized suggestions
- `subscriptions` - User subscription data

**Authentication:**
- Supabase Auth with email/password
- Social login support (Google, Apple)
- JWT token-based sessions
- Row Level Security (RLS) policies

**Storage:**
- Lesson images and audio files
- User profile pictures
- Media content for flashcards

---

## 📱 Platform Support

### iOS
- **Minimum Version**: iOS 13+
- **Target Devices**: iPhone, iPad
- **App Store**: Submission ready
- **Features**: Push notifications, Face ID/Touch ID

### Android
- **Minimum Version**: Android 5.0 (API 21)+
- **Target Devices**: Smartphones, Tablets
- **Play Store**: Submission ready
- **Features**: Push notifications, Biometric authentication

### Responsive Design
- Adapts to different screen sizes
- Portrait and landscape support
- Tablet-optimized layouts

---

## 🎨 Design System

### Based on Figma Design
- **Design Tool**: Figma (provided by user)
- **Color Palette**: Consistent with brand identity
- **Typography**: Custom font family
- **Components**: Reusable UI components
- **Spacing**: Standardized margins and padding
- **Icons**: Vector-based icon set

### Key UI Patterns
- **Bottom Tab Navigation**: Main app sections
- **Stack Navigation**: Nested screens
- **Cards**: Content presentation
- **Buttons**: Primary, secondary, outlined
- **Forms**: Input fields with validation
- **Modals**: Overlays and dialogs

---

## 🚀 User Flows

### 1. Onboarding & Authentication
```
Splash Screen → Welcome/Intro Slides → Sign Up/Login → Email Verification → Profile Setup → Dashboard
```

### 2. Learning Journey
```
Dashboard → Browse Modules → Select Topic → View Lessons → Complete Lesson → Mark Progress → Practice Questions → Review Results
```

### 3. Practice Session
```
Dashboard → Practice Mode → Select Topic → Answer Questions → Get Instant Feedback → View Score → Retry/Continue
```

### 4. Mock Exam
```
Dashboard → Mock Exams → Choose Exam → Start Timed Test → Submit Answers → View Detailed Report → Review Solutions
```

### 5. Flashcard Study
```
Dashboard → Flashcards → Select Deck → Study Cards → Mark Difficulty → Track Progress → Repeat
```

---

## 📈 Key Metrics & Analytics

### App Performance Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Session Duration
- Retention Rate (D1, D7, D30)
- Crash-free Rate

### Learning Metrics
- Lessons Completed
- Practice Sessions per User
- Average Score
- Time Spent Learning
- Topic Completion Rate

### Engagement Metrics
- Streak Maintenance
- Daily Login Rate
- Feature Usage (Practice vs Lessons vs Flashcards)
- Content Interaction

### Subscription Metrics
- Conversion Rate (Free → Premium)
- Churn Rate
- Lifetime Value (LTV)
- Average Revenue Per User (ARPU)

---

## 🔒 Security & Privacy

### Data Protection
- End-to-end encryption for sensitive data
- Secure API communication (HTTPS)
- JWT token authentication
- Row Level Security (RLS) in Supabase

### User Privacy
- GDPR compliance ready
- Privacy policy implementation
- Data deletion on request
- Minimal data collection

### Content Security
- Protected premium content
- Secure media delivery
- DRM for paid resources (if needed)

---

## 🎯 Development Roadmap

### Phase 1: MVP (Core Features)
- [ ] Authentication (Sign up, Login, Password Reset)
- [ ] Browse Modules & Topics
- [ ] View Lessons (Text + Images)
- [ ] Practice Questions
- [ ] Basic Progress Tracking
- [ ] User Profile

### Phase 2: Enhanced Learning
- [ ] Audio Lessons (Podcast mode)
- [ ] Flashcards System
- [ ] Mock Exams
- [ ] Detailed Analytics Dashboard
- [ ] Bookmarks & Notes

### Phase 3: Advanced Features
- [ ] AI Recommendations
- [ ] Offline Mode
- [ ] Push Notifications
- [ ] Social Features (Leaderboards)
- [ ] Subscription Integration

### Phase 4: Optimization
- [ ] Performance Optimization
- [ ] Accessibility Features
- [ ] Multi-language Support
- [ ] Dark Mode
- [ ] Advanced Gamification

---

## 📦 Project Structure (Proposed)

```
jeeva-mobile-app/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab screens
│   └── (modals)/          # Modal screens
├── components/            # Reusable components
│   ├── common/           # Shared components
│   ├── learning/         # Learning-specific
│   └── ui/              # UI components
├── lib/                  # Core utilities
│   ├── supabase/        # Supabase client & queries
│   ├── api/             # API helpers
│   └── utils/           # Utility functions
├── hooks/               # Custom React hooks
├── contexts/            # React contexts
├── types/               # TypeScript types
├── constants/           # App constants
├── assets/              # Images, fonts, etc.
└── docs/                # Documentation
```

---

## 🔄 Sync with Admin Portal

### Shared Resources
- **Database**: Same Supabase instance
- **Authentication**: Unified user system
- **Content**: Admin creates → Students consume
- **Analytics**: Mobile data visible in admin dashboard

### Data Flow
1. Admin portal creates/updates content
2. Changes sync to Supabase database
3. Mobile app fetches updated content
4. Real-time updates via Supabase subscriptions

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator / Android Emulator (for testing)
- Supabase project credentials

### Environment Setup
```bash
# Clone repository
git clone https://github.com/Jeeva-Edtech-app/jeeva-mobile-app.git

# Install dependencies
npm install

# Configure environment variables
# .env file with Supabase credentials

# Start development server
npx expo start
```

### Required Environment Variables
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 📝 Next Documentation Files

After this overview, create these docs in order:

1. **API_DOCUMENTATION.md** - Complete API endpoints and Supabase queries
2. **DATABASE_SCHEMA.md** - Detailed table structures
3. **AUTHENTICATION_FLOW.md** - Auth implementation details
4. **FEATURE_SPECIFICATIONS.md** - Detailed feature specs
5. **UI_DESIGN_SPECS.md** - Design system implementation
6. **MOBILE_SETUP_GUIDE.md** - Development environment setup

---

## 👨‍💻 Development Team

**Lead Developer**: vollstek@gmail.com  
**Organization**: Jeeva EdTech  
**Repository**: https://github.com/Jeeva-Edtech-app

---

## 📄 License

Proprietary - Jeeva Learning Platform

---

**Built with ❤️ for accessible education**
