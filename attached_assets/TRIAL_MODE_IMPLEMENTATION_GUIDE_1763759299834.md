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

---

### 3.2 Module Navigation with Trial Check

**PracticeModule.tsx - Updated:**

```typescript
import React from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { useTrialMode } from '../context/TrialContext';
import LockedTopicOverlay from '../components/LockedTopicOverlay';

interface Topic {
  id: string;
  name: string;
  subtopics: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

export default function PracticeModule() {
  const { canAccessModule, isContentLocked } = useTrialMode();
  const [topics, setTopics] = React.useState<Topic[]>([]);
  const [selectedLockedTopic, setSelectedLockedTopic] = React.useState<string | null>(null);

  const handleSubtopicPress = (topicId: string, subtopicId: string) => {
    if (!canAccessModule('practice', subtopicId)) {
      setSelectedLockedTopic(subtopicId);
      return;
    }

    // Open subtopic questions
    navigateToSubtopic(topicId, subtopicId);
  };

  return (
    <View>
      <FlatList
        data={topics}
        renderItem={({ item: topic }) => (
          <View>
            <Text>{topic.name}</Text>
            <FlatList
              data={topic.subtopics}
              renderItem={({ item: subtopic }) => {
                const isLocked = isContentLocked('practice', subtopic.id);
                return (
                  <TouchableOpacity
                    onPress={() => handleSubtopicPress(topic.id, subtopic.id)}
                    style={{
                      opacity: isLocked ? 0.5 : 1,
                    }}
                  >
                    <Text>{subtopic.name}</Text>
                    {isLocked && <Text style={{ color: 'red' }}>🔒 Locked</Text>}
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {selectedLockedTopic && (
        <LockedTopicOverlay
          onSubscribe={() => {
            // Navigate to subscription page
            navigation.navigate('Subscription');
          }}
          onClose={() => setSelectedLockedTopic(null)}
        />
      )}
    </View>
  );
}
```

---

### 3.3 Locked Content Overlay Component

**LockedTopicOverlay.tsx:**

```typescript
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LockedTopicOverlayProps {
  onSubscribe: () => void;
  onClose: () => void;
  moduleType?: 'practice' | 'learning' | 'mock_exam';
}

export default function LockedTopicOverlay({
  onSubscribe,
  onClose,
  moduleType = 'practice',
}: LockedTopicOverlayProps) {
  const getLockedMessage = () => {
    switch (moduleType) {
      case 'mock_exam':
        return 'Mock exams are only available with a subscription. Upgrade to practice full exam simulations!';
      case 'learning':
        return 'This learning topic requires a subscription. Upgrade to unlock all learning modules!';
      case 'practice':
      default:
        return 'This practice topic is locked. Subscribe to unlock all practice questions!';
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Lock Icon */}
          <MaterialCommunityIcons
            name="lock"
            size={64}
            color="#FF6B6B"
            style={styles.icon}
          />

          {/* Title */}
          <Text style={styles.title}>This Content is Locked</Text>

          {/* Message */}
          <Text style={styles.message}>{getLockedMessage()}</Text>

          {/* Trial Info (if applicable) */}
          <View style={styles.infoBox}>
            <MaterialCommunityIcons
              name="information"
              size={20}
              color="#0066FF"
            />
            <Text style={styles.infoText}>
              You're in trial mode. Subscribe to unlock all features!
            </Text>
          </View>

          {/* Benefits List */}
          <View style={styles.benefitsList}>
            <BenefitItem text="✓ Unlimited practice questions" />
            <BenefitItem text="✓ Full learning modules" />
            <BenefitItem text="✓ Unlimited mock exams" />
            <BenefitItem text="✓ AI-powered study recommendations" />
            <BenefitItem text="✓ Priority support" />
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={onSubscribe}
          >
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#0066FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#0066FF',
    flex: 1,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 20,
  },
  benefitItem: {
    paddingVertical: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  subscribeButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
});
```

---

### 3.4 Learning Module with Trial Protection

**LearningModule.tsx - Updated:**

```typescript
import React from 'react';
import { View, FlatList, TouchableOpacity, Text, ProgressBarAndroid } from 'react-native';
import { useTrialMode } from '../context/TrialContext';
import LockedTopicOverlay from '../components/LockedTopicOverlay';

interface LearningTopic {
  id: string;
  code: string; // e.g., "1.1", "2.1"
  name: string;
  description: string;
  isCompleted: boolean;
  isUnlocked: boolean;
}

export default function LearningModule() {
  const { canAccessModule, isContentLocked, isTrialUser } = useTrialMode();
  const [topics, setTopics] = React.useState<LearningTopic[]>([]);
  const [selectedLockedTopic, setSelectedLockedTopic] = React.useState<string | null>(null);

  const handleTopicPress = (topicId: string) => {
    if (!canAccessModule('learning', topicId)) {
      setSelectedLockedTopic(topicId);
      return;
    }

    // Navigate to topic content
    navigateToTopicContent(topicId);
  };

  const renderTopicCard = (topic: LearningTopic) => {
    const isLocked = isContentLocked('learning', topic.id);

    return (
      <TouchableOpacity
        key={topic.id}
        onPress={() => handleTopicPress(topic.id)}
        style={{
          opacity: isLocked ? 0.6 : 1,
          marginVertical: 8,
          padding: 16,
          backgroundColor: isLocked ? '#F5F5F5' : '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isLocked ? '#EEEEEE' : '#DDDDDD',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333' }}>
              {topic.code} - {topic.name}
            </Text>
            <Text style={{ fontSize: 14, color: '#666666', marginTop: 4 }}>
              {topic.description}
            </Text>

            {/* Trial Badge */}
            {isTrialUser && !isLocked && (
              <View
                style={{
                  backgroundColor: '#FFE0B2',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                  marginTop: 8,
                  alignSelf: 'flex-start',
                }}
              >
                <Text style={{ fontSize: 12, color: '#E65100' }}>Free Trial</Text>
              </View>
            )}
          </View>

          {isLocked ? (
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 24 }}>🔒</Text>
            </View>
          ) : topic.isCompleted ? (
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 24 }}>✅</Text>
            </View>
          ) : (
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 24 }}>→</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <FlatList
        data={topics}
        renderItem={({ item }) => renderTopicCard(item)}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      {selectedLockedTopic && (
        <LockedTopicOverlay
          moduleType="learning"
          onSubscribe={() => {
            navigation.navigate('Subscription');
          }}
          onClose={() => setSelectedLockedTopic(null)}
        />
      )}
    </View>
  );
}
```

---

### 3.5 Mock Exam Module - Completely Blocked

**MockExamModule.tsx - Trial Protection:**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTrialMode } from '../context/TrialContext';
import LockedTopicOverlay from '../components/LockedTopicOverlay';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MockExamModule() {
  const { isTrialUser } = useTrialMode();
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  if (isTrialUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <MaterialCommunityIcons name="lock" size={80} color="#FF6B6B" />
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 16, color: '#333333' }}>
          Mock Exams Locked
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: '#666666',
            textAlign: 'center',
            marginTop: 12,
            lineHeight: 24,
          }}
        >
          Mock exams are only available with a paid subscription. Upgrade now to practice full
          exam simulations!
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: '#0066FF',
            paddingVertical: 14,
            paddingHorizontal: 32,
            borderRadius: 10,
            marginTop: 24,
            width: '100%',
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('Subscription')}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
            Subscribe Now
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            paddingVertical: 12,
            marginTop: 12,
            width: '100%',
            alignItems: 'center',
          }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#0066FF', fontSize: 16, fontWeight: '500' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render normal mock exam interface for paid users
  return <MockExamInterface />;
}
```

---

## 4. Backend Implementation

### 4.1 User Setup on Registration

**Create user trial profile (Node.js/Express):**

```typescript
// POST /api/auth/register
export async function registerUser(req: Request, res: Response) {
  const { email, password, name } = req.body;

  try {
    // Create Supabase user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (authError) throw authError;

    // Get Practice and Learning first subtopics
    const practiceSubtopic = await getPracticeSubtopic(0); // First subtopic
    const learningSubtopic = await getLearningSubtopic(0); // First subtopic

    // Create user profile with trial settings
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        trial_status: 'active',
        trial_start_date: new Date(),
        trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        trial_practice_subtopic_id: practiceSubtopic.id,
        trial_learning_subtopic_id: learningSubtopic.id,
        is_subscribed: false,
        subscription_tier: null,
        has_accessed_practice: false,
        has_accessed_learning: false,
      });

    if (profileError) throw profileError;

    return res.status(201).json({
      message: 'User created successfully',
      userId: authData.user.id,
      trialStatus: 'active',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

---

### 4.2 Trial Status Check Endpoint

**GET /api/trial/status:**

```typescript
export async function getTrialStatus(req: Request, res: Response) {
  const userId = req.user.id;

  try {
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if trial has expired
    const trialExpired = new Date(userProfile.trial_end_date) < new Date();

    const trialStatus = {
      isTrialUser: !userProfile.is_subscribed && userProfile.trial_status === 'active',
      trialStatus: trialExpired ? 'expired' : userProfile.trial_status,
      trialStartDate: userProfile.trial_start_date,
      trialEndDate: userProfile.trial_end_date,
      daysRemaining: Math.ceil(
        (new Date(userProfile.trial_end_date).getTime() - new Date().getTime()) / 
        (24 * 60 * 60 * 1000)
      ),
      freeTopicIdPractice: userProfile.trial_practice_subtopic_id,
      freeTopicIdLearning: userProfile.trial_learning_subtopic_id,
      isSubscribed: userProfile.is_subscribed,
      subscriptionTier: userProfile.subscription_tier,
    };

    return res.json(trialStatus);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

---

### 4.3 Access Control Middleware

**Check if user can access content:**

```typescript
export async function checkContentAccess(req: Request, res: Response, next: NextFunction) {
  const userId = req.user.id;
  const { moduleType, subtopicId } = req.body;

  try {
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // If subscribed, allow all access
    if (userProfile.is_subscribed) {
      return next();
    }

    // Check trial status
    if (userProfile.trial_status !== 'active') {
      return res.status(403).json({ error: 'Trial expired. Please subscribe.' });
    }

    // Check if trial has expired
    const trialExpired = new Date(userProfile.trial_end_date) < new Date();
    if (trialExpired) {
      return res.status(403).json({ error: 'Trial period has expired.' });
    }

    // Check access to modules
    if (moduleType === 'mock_exam') {
      return res.status(403).json({
        error: 'Mock exams require subscription',
        redirect: 'subscription',
      });
    }

    if (moduleType === 'practice') {
      if (subtopicId !== userProfile.trial_practice_subtopic_id) {
        return res.status(403).json({
          error: 'This practice topic is locked in trial mode',
          redirect: 'subscription',
        });
      }
    }

    if (moduleType === 'learning') {
      if (subtopicId !== userProfile.trial_learning_subtopic_id) {
        return res.status(403).json({
          error: 'This learning topic is locked in trial mode',
          redirect: 'subscription',
        });
      }
    }

    return next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

---

### 4.4 Subscription Upgrade Endpoint

**POST /api/subscriptions/upgrade:**

```typescript
export async function upgradeSubscription(req: Request, res: Response) {
  const userId = req.user.id;
  const { planId, paymentMethodId } = req.body;

  try {
    // Process payment with Stripe/Razorpay
    const payment = await processPayment(paymentMethodId, planId);

    if (!payment.success) {
      return res.status(400).json({ error: 'Payment failed' });
    }

    // Get plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    // Create subscription record
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + plan.duration_days);

    const { data: subscription } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        start_date: new Date(),
        end_date: subscriptionEndDate,
        status: 'active',
        payment_id: payment.id,
      });

    // Update user profile - exit trial mode
    await supabase
      .from('user_profiles')
      .update({
        is_subscribed: true,
        subscription_tier: plan.tier,
        trial_status: 'converted',
        trial_practice_subtopic_id: null, // Clear trial restrictions
        trial_learning_subtopic_id: null,
      })
      .eq('id', userId);

    return res.json({
      message: 'Subscription activated',
      subscription,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

---

## 5. Data Model Integration

### 5.1 Supabase Schema

**Add to user_profiles table:**

```sql
-- Alter user_profiles table
ALTER TABLE user_profiles ADD COLUMN trial_status VARCHAR DEFAULT 'active'; -- 'active', 'expired', 'converted', 'skipped'
ALTER TABLE user_profiles ADD COLUMN trial_start_date TIMESTAMP DEFAULT NOW();
ALTER TABLE user_profiles ADD COLUMN trial_end_date TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days');
ALTER TABLE user_profiles ADD COLUMN trial_practice_subtopic_id UUID;
ALTER TABLE user_profiles ADD COLUMN trial_learning_subtopic_id UUID;
ALTER TABLE user_profiles ADD COLUMN has_accessed_practice BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN has_accessed_learning BOOLEAN DEFAULT FALSE;

-- Foreign key constraints
ALTER TABLE user_profiles ADD CONSTRAINT fk_trial_practice_subtopic 
  FOREIGN KEY (trial_practice_subtopic_id) REFERENCES subtopics(id);

ALTER TABLE user_profiles ADD CONSTRAINT fk_trial_learning_subtopic 
  FOREIGN KEY (trial_learning_subtopic_id) REFERENCES subtopics(id);
```

---

### 5.2 RLS Policies for Trial

**Create RLS policies in Supabase:**

```sql
-- Policy: Trial users can only view free topics
CREATE POLICY "trial_users_see_only_free_topics"
ON topics_access FOR SELECT
USING (
  -- If subscribed, see all
  (SELECT is_subscribed FROM user_profiles WHERE id = auth.uid() LIMIT 1)
  OR
  -- Or if it's their free trial topic
  topic_id IN (
    SELECT COALESCE(trial_practice_subtopic_id, trial_learning_subtopic_id)
    FROM user_profiles
    WHERE id = auth.uid()
  )
);

-- Policy: Trial users cannot access mock exams
CREATE POLICY "trial_users_no_mock_exams"
ON mock_exams FOR SELECT
USING (
  (SELECT is_subscribed FROM user_profiles WHERE id = auth.uid() LIMIT 1) = TRUE
);
```

---

## 6. UI/UX Patterns

### 6.1 Trial Badge Display

Show "Free Trial" badge on accessible content:

```typescript
{isTrialUser && !isLocked && (
  <View style={{ backgroundColor: '#FFE0B2', padding: 8, borderRadius: 4 }}>
    <Text style={{ color: '#E65100', fontWeight: '600' }}>⭐ Free Trial</Text>
  </View>
)}
```

---

### 6.2 Lock Icon for Restricted Content

Show lock icon on locked topics:

```typescript
{isLocked && (
  <View style={{ position: 'absolute', top: 8, right: 8 }}>
    <MaterialCommunityIcons name="lock" size={24} color="#FF6B6B" />
  </View>
)}
```

---

### 6.3 Trial Countdown Display

Show remaining trial days in header/dashboard:

```typescript
{isTrialUser && (
  <View style={{ backgroundColor: '#FFF3E0', padding: 12, borderRadius: 8 }}>
    <Text style={{ color: '#E65100' }}>
      📅 Your trial ends in {getRemainingTrialDays()} days
    </Text>
  </View>
)}
```

---

### 6.4 Subscription Incentive Messaging

**On locked content tap:**

```
🔒 This Content is Locked

This practice topic is locked. Subscribe to unlock all practice questions!

✓ Unlimited practice questions
✓ Full learning modules
✓ Unlimited mock exams
✓ AI-powered study recommendations

[Subscribe Now] [Cancel]
```

---

## 7. Navigation Flow Diagram

```
App Launch
    ↓
├─ New User?
│   ├─ Register
│   └─ Create Trial Profile (1 Practice + 1 Learning subtopic)
│       ↓
│       Trial Mode Active ✅
│
└─ Existing User?
    ├─ Check Subscription Status
    └─ Load Trial/Paid Dashboard
```

---

## 8. Testing Checklist

### 8.1 Trial Mode Setup

- [ ] New user automatically gets trial profile
- [ ] Trial start and end dates set correctly
- [ ] Random free subtopics assigned from Practice and Learning
- [ ] Trial status shows as "active" in database

### 8.2 Practice Module Access

- [ ] Free Practice subtopic loads successfully
- [ ] Other Practice subtopics show lock icon
- [ ] Clicking locked Practice topic shows modal
- [ ] Modal has "Subscribe Now" button

### 8.3 Learning Module Access

- [ ] Free Learning subtopic loads successfully
- [ ] Other Learning subtopics show lock icon
- [ ] Clicking locked Learning topic shows modal
- [ ] "Free Trial" badge shows on accessible topic

### 8.4 Mock Exam Blocking

- [ ] Mock Exam module shows full-screen lock message
- [ ] "Subscribe Now" button available
- [ ] No mock exam data loads for trial users
- [ ] Error message when trying to access via API

### 8.5 Subscription Flow

- [ ] User can tap "Subscribe Now" button
- [ ] Navigation to subscription page works
- [ ] After purchase, trial status changes to "converted"
- [ ] is_subscribed flag set to true
- [ ] All modules become accessible
- [ ] Lock icons disappear from UI

### 8.6 Trial Expiration

- [ ] Expired trial shows "Trial Expired" message
- [ ] User cannot access any content
- [ ] Redirect to subscription page on tap
- [ ] All modules locked after 7 days

### 8.7 Edge Cases

- [ ] User skips trial → subscription required immediately
- [ ] User navigates back from subscription page → trial still active
- [ ] User re-purchases after expiry → full access restored
- [ ] Trial user data persisted across app restarts

---

## 9. Configuration Options

### 9.1 Trial Duration (Configurable)

In your config file:

```typescript
export const TRIAL_CONFIG = {
  ENABLED: true,
  DURATION_DAYS: 7,
  FREE_PRACTICE_SUBTOPICS: 1,
  FREE_LEARNING_SUBTOPICS: 1,
  ALLOW_MOCK_EXAM: false,
};
```

---

### 9.2 Customize Lock Message

```typescript
export const LOCK_MESSAGES = {
  practice: 'This practice topic is locked in trial mode. Subscribe to access unlimited practice!',
  learning: 'This learning topic requires a subscription. Upgrade to complete your learning path!',
  mock_exam: 'Mock exams are only available with a subscription. Subscribe to practice full exams!',
};
```

---

## 10. Analytics Events to Track

Log these events for analytics:

```typescript
// Trial mode events
trackEvent('trial_mode_activated', {
  userId,
  timestamp,
  freePracticeTopic: practiceSubtopicId,
  freeLearningTopic: learningSubtopicId,
});

trackEvent('locked_content_attempted', {
  userId,
  moduleType,
  subtopicId,
  timestamp,
});

trackEvent('upgrade_modal_shown', {
  userId,
  moduleType,
  timestamp,
});

trackEvent('subscription_completed', {
  userId,
  planId,
  trialStatus: 'converted',
  timestamp,
});

trackEvent('trial_expired', {
  userId,
  trialEndDate,
  timestamp,
});
```

---

## 11. Common Pitfalls & Solutions

| Issue | Solution |
|-------|----------|
| User can access all topics in trial | Verify RLS policies are applied and middleware is active |
| Lock icon doesn't show | Ensure `isContentLocked()` returns correct boolean |
| Subscription doesn't remove locks | Update `is_subscribed` flag in database |
| Mock exams show for trial users | Add check in MockExamModule before rendering |
| User can bypass via API | Use `checkContentAccess` middleware on all API routes |
| Trial doesn't expire after 7 days | Background job should check and update trial_status |

---

## 12. Future Enhancements

- [ ] Send email reminder 1 day before trial ends
- [ ] Show trial progress bar (days remaining)
- [ ] Allow users to extend trial (manual, admin-only)
- [ ] A/B test different trial durations (5, 7, 14 days)
- [ ] Premium trial with all features for launch period
- [ ] Trial to subscription conversion tracking
- [ ] Re-engage expired trial users with email

---

## 13. Summary

**Trial Mode provides:**
✅ Low-friction onboarding  
✅ Feature discovery for new users  
✅ 1 free Practice subtopic  
✅ 1 free Learning subtopic  
✅ Zero mock exam access  
✅ Clear upgrade path  
✅ Automatic trial setup  
✅ 7-day default duration  

**Implementation touches:**
- Frontend: TrialContext, module components, overlay modal
- Backend: User registration, access control, trial status check
- Database: user_profiles schema extension, RLS policies
- Navigation: Subscription redirect flow

---

© 2025 Jeeva Learning. All Rights Reserved.

**Ready for mobile team implementation!** 🚀
