# 📱 Jeeva Learning App v1

A comprehensive mobile application for Indian nurses preparing for the UK NMC CBT (Computer-Based Test) exam. Built with Expo and React Native, the app provides structured learning, on-demand practice, realistic mock exams, and AI-powered support.

## 📋 Overview

Jeeva Learning transforms Indian nurses to think and practice like UK nurses through:
- 🏥 UK-specific clinical scenarios and professional standards (NMC Code)
- 📚 Multi-format learning (videos, podcasts, text lessons, flashcards)
- 🎯 Large MCQ database for topic-targeted practice
- 📝 Realistic mock exams mimicking actual Pearson VUE CBT experience
- 🤖 AI-powered chatbot (JeevaBot) for 24/7 doubt clearing
- 📊 Performance analytics and personalized study recommendations
- ⚡ Optimized performance with aggressive caching and image optimization

> **November 2025 Updates:** See [Performance Optimization Guide](./docs/nov-update/README.md) for details on hero banner caching, image optimization, and push notifications.

**Target Users:** Indian registered nurses planning to work in the UK  
**Exam Focus:** NMC CBT (Numeracy, Clinical Knowledge, Professional Standards)  
**Platform:** React Native with Expo  
**Backend:** Supabase

## ✨ Key Features

### 📚 Learning Module
- Structured, sequential learning content
- Multi-format lessons (text, video, audio/podcasts)
- Embedded flashcards for quick revision
- 80% mastery threshold to progress
- Comprehensive UK nursing protocols

### 🎯 Practice Module
- On-demand MCQ practice on any topic
- Smart question selection (prioritizes weak areas)
- Immediate feedback with explanations
- Performance tracking and analytics
- Topic-wise accuracy metrics

### 📝 Mock Exam Module
- Realistic CBT exam simulation
- Part A: Numeracy (15 questions, 22.5 mins)
- Part B: Clinical Knowledge (60 questions, 90 mins)
- Professional Standards (50 questions, 75 mins)
- Detailed performance reports

### 🤖 AI JeevaBot
- 24/7 AI-powered nursing tutor
- Clinical doubt clearing
- NMC Code guidance
- Context-aware responses
- Study support and exam strategies

### 👤 Profile & Analytics
- Comprehensive progress tracking
- Study streak monitoring
- Exam readiness score
- Weak area identification
- Personalized recommendations

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based)
- **UI Components**: React Native core components
- **State Management**: React Context API
- **Data Fetching**: TanStack React Query (with AsyncStorage persistence)
- **Image Loading**: React Native Fast Image (aggressive caching)
- **Styling**: StyleSheet with design system
- **Icons**: Expo Symbols, Ionicons
- **Fonts**: Inter (via @expo-google-fonts)
- **Notifications**: Expo Notifications (push notifications)

### Backend
- **BaaS**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Authentication**: Supabase Auth with OAuth (Google, Apple)
- **Database**: PostgreSQL 15+ with RLS
- **AI**: Gemini API (via Supabase Edge Functions)
- **Payment**: Stripe (International) + Razorpay (India)
- **Push Notifications**: Expo Push Service

### Development Tools
- **Language**: TypeScript
- **Build Tool**: Expo CLI
- **Package Manager**: npm
- **Version Control**: Git

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase account and project
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jeeva-Edtech-app/jeeva-learning-app.git
   cd jeeva-learning-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file or use Replit Secrets:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Run the SQL scripts in `docs/SUPABASE_SETUP.sql` in your Supabase SQL editor
   - Follow database setup instructions in `docs/DATABASE_SCHEMA.md`

5. **Start the development server**
   ```bash
   npx expo start
   ```
   
   Or in Replit, the Expo App workflow will start automatically.

6. **Run on device/simulator**
   - **iOS**: Press `i` to open iOS simulator
   - **Android**: Press `a` to open Android emulator
   - **Web**: Press `w` to open in browser
   - **Device**: Scan QR code with Expo Go app

## 📦 Available Scripts

```bash
npx expo start          # Start Expo dev server
npx expo start --web    # Start web version
npx expo start --ios    # Start iOS simulator
npx expo start --android # Start Android emulator
npm run reset-project   # Reset to blank project
```

## 📁 Project Structure

```
jeeva-learning-app/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Dashboard/Home
│   │   ├── courses.tsx    # Learning modules
│   │   ├── ai-assistant.tsx # AI chatbot
│   │   └── profile.tsx    # User profile
│   ├── complete-profile.tsx # Profile completion flow
│   ├── login.tsx          # Login screen
│   ├── welcome.tsx        # Welcome/landing screen
│   └── _layout.tsx        # Root layout with auth
├── src/
│   ├── api/               # API clients (Supabase queries)
│   ├── components/        # Reusable components
│   ├── constants/         # Design system, colors, typography
│   ├── context/           # React context (AuthContext)
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Supabase client configuration
├── assets/                # Images, fonts, icons
├── docs/                  # Documentation
│   ├── DATABASE_SCHEMA.md        # Complete database schema
│   ├── MOBILE_APP_FEATURES.md    # Detailed features spec
│   ├── PAYMENT_INTEGRATION.md    # Payment gateway docs
│   └── SUPABASE_SETUP.sql        # Database setup SQL
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## 🎨 Design System

The app uses a comprehensive design system defined in `src/constants/DesignSystem.ts`:

- **Colors**: Primary blue (#3B82F6), background (#F5F7FA), semantic colors
- **Typography**: Inter font family with predefined text styles
- **Spacing**: Consistent 4-40px scale
- **Components**: Buttons, cards, inputs with standardized specs
- **Shadows**: Small, medium, large shadow presets
- **Layout**: Global layout specifications

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## 📚 Core Modules

### 1. Learning Module
- Hierarchical content (Modules → Topics → Lessons)
- Multi-format content (text, video, audio, flashcards)
- 80% mastery threshold for progression
- Progress tracking per lesson

### 2. Practice Module
- On-demand MCQ practice
- Smart question selection
- Topic-wise performance analytics
- Review incorrect answers

### 3. Mock Exam Module
- Realistic exam simulations
- Timed exams with score tracking
- Performance reports and weak area identification
- Exam history with trends

## 💳 Subscription & Payments

- **Duration-based plans**: 30/60/90/120 days
- **Payment gateways**: 
  - Stripe (International students)
  - Razorpay (Indian students)
- **Trial mode**: Limited access to 1 module
- **Coupon system**: Percentage and fixed amount discounts

See `docs/PAYMENT_INTEGRATION.md` for complete payment implementation details.

## 🔒 Security

- Row Level Security (RLS) policies in Supabase
- OAuth authentication (Google, Apple)
- Secure secret management
- JWT-based session handling
- Profile-based authorization

## 📝 Documentation

- **Features**: Complete features specification in `docs/MOBILE_APP_FEATURES.md`
- **Database**: Full database schema in `docs/DATABASE_SCHEMA.md`
- **Payment**: Payment integration guide in `docs/PAYMENT_INTEGRATION.md`
- **Setup**: Supabase setup SQL in `docs/SUPABASE_SETUP.sql`

## 🚢 Deployment

This app is configured for Replit deployment with:
- Expo web build for production
- Environment-specific configurations
- Automated workflow setup

## 👨‍💻 Developer

**Developed by:** Jeeva EdTech Team  
**Contact:** vollstek@gmail.com  
**GitHub:** [Jeeva-Edtech-app](https://github.com/Jeeva-Edtech-app)

## 📄 License

This project is proprietary software developed for Jeeva Learning.

---

Made with ❤️ for nurses preparing for UK NMC CBT
