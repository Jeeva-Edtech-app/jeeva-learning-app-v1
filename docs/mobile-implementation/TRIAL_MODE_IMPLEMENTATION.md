# Trial Mode Implementation Guide

**Jeeva Learning Platform - Mobile Application**

**Date:** November 21, 2025  
**Version:** 1.0  
**Target:** React Native (iOS & Android)

---

## 1. Overview

Trial Mode allows new users to experience Jeeva Learning with **limited free access** before requiring a paid subscription:

- ✅ **1 free subtopic** in Practice module
- ✅ **1 free subtopic** in Learning module
- ❌ **NO access** to Mock Exam module
- 🔒 **Locked content** redirects to subscription page

---

## 2. Trial Mode Architecture

### 2.1 User States

```
New User
    ↓
Creates Account
    ↓
Enters Trial Mode (Auto-activated)
    ↓
├─ Accesses 1 Practice subtopic (Free)
├─ Accesses 1 Learning subtopic (Free)
├─ Mock Exam blocked
└─ Other subtopics locked
    ↓
Clicks Locked Content
    ↓
Redirect to Subscription Page → Purchase Subscription → Full Access
```

### 2.2 Trial Status in Database

**User Profile Table Addition:**

```typescript
// In your user_profiles table
{
  id: string;
  email: string;
  trial_status: "active" | "expired" | "converted" | "skipped";
  trial_start_date: Date;
  trial_end_date: Date;
  trial_practice_subtopic_id: string | null; // Which Practice subtopic is free
  trial_learning_subtopic_id: string | null; // Which Learning subtopic is free
  is_subscribed: boolean;
  subscription_tier: string | null;
  has_accessed_practice: boolean;
  has_accessed_learning: boolean;
}
```

---

## 3. Frontend Implementation

### 3.1 Trial Mode Context & State

**Create TrialContext.tsx:**

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase'; // Your Supabase client

interface TrialContextType {
  isTrialUser: boolean;
  trialStatus: "active" | "expired" | "converted" | "skipped";
  freeTopicIdPractice: string | null;
  freeTopicIdLearning: string | null;
  canAccessModule: (moduleType: string, topicId: string) => boolean;
  isContentLocked: (moduleType: string, topicId: string) => boolean;
  getRemainingTrialDays: () => number;
  skipTrial: () => Promise<void>;
  upgradePlan: () => void;
}

const TrialContext = createContext<TrialContextType | undefined>(undefined);

export function TrialProvider({ children }: { children: React.ReactNode }) {
  const [isTrialUser, setIsTrialUser] = useState(false);
  const [trialStatus, setTrialStatus] = useState<"active" | "expired" | "converted" | "skipped">("active");
  const [freeTopicIdPractice, setFreeTopicIdPractice] = useState<string | null>(null);
  const [freeTopicIdLearning, setFreeTopicIdLearning] = useState<string | null>(null);

  // Fetch trial status on app load
  useEffect(() => {
    fetchTrialStatus();
  }, []);

  const fetchTrialStatus = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userProfile) {
      setIsTrialUser(!userProfile.is_subscribed && userProfile.trial_status === 'active');
      setTrialStatus(userProfile.trial_status);
      setFreeTopicIdPractice(userProfile.trial_practice_subtopic_id);
      setFreeTopicIdLearning(userProfile.trial_learning_subtopic_id);
    }
  };

  const canAccessModule = (moduleType: string, topicId: string): boolean => {
    // If subscribed, access all
    if (!isTrialUser) return true;

    // If trial expired, deny access
    if (trialStatus === 'expired') return false;

    // Trial user access rules
    switch (moduleType) {
      case 'practice':
        return topicId === freeTopicIdPractice;
      case 'learning':
        return topicId === freeTopicIdLearning;
      case 'mock_exam':
        return false; // Never allowed in trial
      default:
        return false;
    }
  };

  const isContentLocked = (moduleType: string, topicId: string): boolean => {
    return !canAccessModule(moduleType, topicId);
  };

  const getRemainingTrialDays = (): number => {
    if (!isTrialUser) return 0;
    const endDate = new Date(trialStatus === 'active' ? 
      new Date().getTime() + (7 * 24 * 60 * 60 * 1000) : // 7 days trial
      0
    );
    const today = new Date();
    return Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));
  };

  const skipTrial = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase
      .from('user_profiles')
      .update({ trial_status: 'skipped' })
      .eq('id', session.user.id);

    setTrialStatus('skipped');
    setIsTrialUser(false);
  };

  const upgradePlan = () => {
    // Navigate to subscription page
    // This will be handled by calling component
  };

  return (
    <TrialContext.Provider
      value={{
        isTrialUser,
        trialStatus,
        freeTopicIdPractice,
        freeTopicIdLearning,
        canAccessModule,
        isContentLocked,
        getRemainingTrialDays,
        skipTrial,
        upgradePlan,
      }}
    >
      {children}
    </TrialContext.Provider>
  );
}

export function useTrialMode() {
  const context = useContext(TrialContext);
  if (!context) {
    throw new Error('useTrialMode must be used within TrialProvider');
  }
  return context;
}
```
