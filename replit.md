# Jeeva Learning Mobile App

## Overview
Jeeva Learning is a mobile application built with Expo and React Native, designed to deliver a personalized and engaging educational experience. It features interactive lessons, practice questions, flashcards, and progress tracking, all supported by Supabase. The app offers multi-modal content, a hierarchical content structure, real-time analytics, and cross-platform compatibility (iOS, Android, Web). The project aims to become a leading platform for accessible and effective education.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
-   **Pattern**: Expo Router for file-based navigation, nested layouts, and `@react-navigation/bottom-tabs`.
-   **Component Architecture**: Reusable, themed components (`ThemedView`, `ThemedText`) with light/dark mode support. Animations are handled by React Native Reanimated.
-   **State Management**: React hooks for local state, `AuthContext` for global authentication with session persistence, and `@tanstack/react-query` for data fetching and caching.
-   **Design System**: A centralized `src/constants/DesignSystem.ts` defines UI tokens for colors, typography, spacing, and components. Icons use SF Symbols (iOS) and Ionicons (cross-platform).

### Backend Architecture
-   **Backend-as-a-Service**: Supabase is used for PostgreSQL with Row Level Security (RLS) and Supabase Auth for user authentication.
-   **Data Architecture**: Content is organized hierarchically (modules → topics → lessons → questions/flashcards). User management involves a 3-table chain (`auth.users` → `public.users` → `public.user_profiles`). Progress and session data are stored across related tables.
-   **API Communication**: Supabase Client SDK handles database operations, supporting RESTful patterns and real-time subscriptions, with JWT Bearer token authentication.

### System Design Choices
-   **Registration Flow**: Automated user record creation across `auth.users`, `public.users`, and `public.user_profiles` using database functions to ensure RLS compatibility.
-   **Row Level Security**: RLS policies restrict users to their own data.
-   **Navigation Flow**: `router.replace()` is used for authentication screens to prevent back navigation.
-   **Profile Management**: Comprehensive profile screen with data pre-filling and date picker.
-   **Settings Screen**: Detailed settings for Account, Notifications, App Preferences, and Legal/Support, implemented with cross-platform UI.
-   **Database Schema**: `auth_provider` column in `public.users` tracks authentication method.
-   **Expo Server Configuration**: Configured for Replit cloud environment, exposing Metro bundler.
-   **SSR Fix**: Supabase client is configured for server-side rendering without AsyncStorage errors.
-   **Profile Completion**: A mandatory 2-step flow for new users with edit functionality.
-   **JeevaBot AI**: Integrated AI chatbot with cost tracking and usage limits.
-   **Analytics**: `user_sessions` and `daily_stats` tables provide real-time metrics.
-   **Dynamic Hero Banners**: `dashboard_hero` table for promotional content.
-   **Fixed Module Structure**: Implemented a fixed 3-module structure (Practice, Learning, Mock Exam) using constants and tag-based filtering for questions and flashcards.
-   **Notifications**: `expo-notifications` and `NotificationService` for reminders.
-   **Toast Notifications**: `react-native-toast-message` for non-intrusive feedback.
-   **Settings as Bottom Tab**: Settings are accessible via a bottom tab for improved UX.
-   **Google OAuth Integration**: Utilizes `expo-auth-session`, `expo-web-browser`, `expo-crypto` for Google and Apple OAuth.
-   **In-App Notifications System**: Includes a dedicated API, inbox screen, and real-time unread badge count.
-   **Payment Integration**: Unified payment service routing between Stripe and Razorpay based on user's country, using `@stripe/stripe-react-native`, `react-native-razorpay`, and `expo-localization`.

## External Dependencies

### Core Framework
-   `expo`
-   `expo-router`
-   `react-native`
-   `react-native-web`

### Authentication & Backend
-   `@supabase/supabase-js`
-   `@react-native-async-storage/async-storage`
-   `@tanstack/react-query`
-   `PostgreSQL` (via Supabase)

### Navigation & UI
-   `@react-navigation/native`
-   `@react-navigation/bottom-tabs`
-   `react-native-screens`
-   `react-native-safe-area-context`

### Animation & Interaction
-   `react-native-reanimated`
-   `react-native-gesture-handler`
-   `expo-haptics`

### Media & Assets
-   `expo-image`
-   `expo-font`
-   `@expo/vector-icons`
-   `expo-symbols`

### UI Enhancement
-   `expo-blur`
-   `expo-splash-screen`
-   `expo-status-bar`
-   `expo-linear-gradient`
-   `@react-native-community/datetimepicker`

### Notifications & Feedback
-   `expo-notifications`
-   `react-native-toast-message`

### Web & Linking
-   `expo-web-browser`
-   `expo-linking`

### OAuth & Payments
-   `expo-auth-session`
-   `expo-crypto`
-   `@stripe/stripe-react-native`
-   `react-native-razorpay`
-   `expo-localization`
-   `clsx`
-   `react-native-url-polyfill`