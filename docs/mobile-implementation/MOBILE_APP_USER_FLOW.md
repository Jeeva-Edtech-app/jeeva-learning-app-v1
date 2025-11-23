# Mobile App User Flow Documentation

**Jeeva Learning Platform - Mobile Application**

**Date:** November 21, 2025  
**Version:** 1.0  
**Target:** React Native (iOS & Android)

---

## 1. Overview

This document outlines complete user journey flows for the Jeeva Learning mobile app, covering every interaction from app launch to subscription management and learning activities.

---

## 2. Core User Flows

### 2.1 User State Types

```
┌─────────────────────────────────────────┐
│          USER STATE TYPES               │
├─────────────────────────────────────────┤
│ 1. Unauthenticated                      │
│ 2. Trial User (7 days)                  │
│ 3. Subscribed User (Active)             │
│ 4. Expired User (Subscription ended)    │
│ 5. Banned User (TOS violation)          │
└─────────────────────────────────────────┘
```

---

## 3. App Launch Flow

### 3.1 First Time App Launch

```
┌──────────────────┐
│  App Launches    │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────┐
│ Check if User Authenticated? │
└──────────┬───────────┬───────┘
           │           │
           ↓           ↓
        YES          NO
           │           │
           ↓           ↓
    ┌──────────┐   ┌───────────────┐
    │ Load     │   │ Show Login    │
    │ Dashboard│   │ Onboarding    │
    │ Content  │   │ Screen        │
    └──────────┘   └───────────────┘
```

### 3.2 Splash Screen (2-3 seconds)

**UI Elements:**
- Jeeva Logo (centered)
- App name/tagline
- Loading indicator
- Background gradient

**Actions:**
- Check internet connectivity
- Load user session from device storage
- Initialize analytics
- Load app configuration

---

## 4. Authentication Flow

### 4.1 Login/Signup Decision Screen

```
┌────────────────────────────────────────┐
│     Welcome to Jeeva Learning           │
│  "Prepare for UK NMC CBT Exam"         │
├────────────────────────────────────────┤
│                                        │
│  [ Sign Up with Google ]               │
│  [ Sign Up with Apple ]                │
│  [ Sign Up with Email ]                │
│                                        │
│  ─────────── OR ───────────            │
│                                        │
│  Already have account?                 │
│  [ Log In ]                            │
│                                        │
└────────────────────────────────────────┘
```

---

## 5. Trial Mode User Flow

### 5.1 Trial Welcome Screen

```
┌────────────────────────────────────┐
│  🎉 Welcome to Your Free Trial!     │
├────────────────────────────────────┤
│                                    │
│  You have 7 days of full access    │
│  to explore the platform           │
│                                    │
│  ✅ 1 Free Practice Topic          │
│  ✅ 1 Free Learning Topic          │
│  ❌ Mock Exams (Locked)            │
│                                    │
│  📅 Trial Ends: Nov 28, 2025       │
│                                    │
│  [ Start Learning ]                │
│  [ View Plans ] [ Skip Trial ]     │
│                                    │
└────────────────────────────────────┘
```

### 5.2 Trial Status Display (Dashboard Header)

```
┌──────────────────────────────────┐
│ ⭐ Trial: 5 days remaining       │
│ Unlock all features: [Subscribe] │
└──────────────────────────────────┘
```
