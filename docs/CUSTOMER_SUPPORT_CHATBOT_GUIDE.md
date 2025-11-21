# Customer Support Chatbot Implementation Guide

**Version:** 1.0  
**Date:** November 21, 2025  
**Status:** Complete Implementation Guide  
**Status:** Admin Portal Feature

---

## Executive Summary

Menu-driven customer support chatbot with:
- Predefined FAQ categories (expandable menu)
- Bot answers basic questions directly
- Email escalation for complex issues
- Conversation history
- Follow-up capability

---

## 1. Architecture Overview

```
User Opens Chatbot
    ↓
See Main Menu (Categories)
    ↓
User Selects Category
    ↓
See Sub-Questions in Category
    ↓
User Clicks Question
    ↓
├─ Bot Shows Answer (FAQ)
├─ If satisfied → Rate & Close
└─ If not satisfied → Escalate to Email
    ↓
Escalation Path:
├─ Collect: Name, Email, Description
├─ Send via Resend
└─ Show confirmation
```

---

## 2. FAQ Data Structure

```typescript
interface FAQCategory {
  id: string
  name: string
  icon: string
  description: string
  questions: FAQQuestion[]
}

interface FAQQuestion {
  id: string
  categoryId: string
  question: string
  answer: string
  helpful: number // Count of helpful votes
  notHelpful: number // Count of not helpful votes
}

interface ChatMessage {
  id: string
  type: 'user' | 'bot' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    questionId?: string
    categoryId?: string
    isEscalated?: boolean
  }
}

interface EscalationTicket {
  id: string
  userId: string
  userName: string
  userEmail: string
  category: string
  originalQuestion: string
  description: string
  status: 'open' | 'resolved'
  createdAt: Date
  resolvedAt?: Date
}
```

---

## 3. FAQ Categories & Questions

```typescript
const FAQ_DATA: FAQCategory[] = [
  {
    id: 'subscription',
    name: 'Subscriptions',
    icon: '🎁',
    description: 'Questions about plans and subscriptions',
    questions: [
      {
        id: 'sub_1',
        categoryId: 'subscription',
        question: 'How do I renew my subscription?',
        answer: `To renew your subscription:
1. Go to your Dashboard
2. Click "My Subscription" 
3. Click the [RENEW] button
4. Choose your plan
5. Complete payment

Your subscription will be renewed for the selected period. No automatic renewal - you choose when to renew!`
      },
      {
        id: 'sub_2',
        categoryId: 'subscription',
        question: 'Can I change my subscription plan?',
        answer: `Yes, you can change your plan anytime:
1. Go to Dashboard
2. Click "Upgrade" or "Downgrade"
3. Select new plan
4. Payment will be adjusted

Downgrading takes effect on your next renewal.`
      },
      {
        id: 'sub_3',
        categoryId: 'subscription',
        question: 'What happens when my subscription expires?',
        answer: `When your subscription expires:
- You can still see your progress
- Premium features become limited
- You receive a notification 5 days before expiry
- Click [RENEW] when ready to continue`
      },
      {
        id: 'sub_4',
        categoryId: 'subscription',
        question: 'How do I cancel my subscription?',
        answer: `To cancel your subscription:
1. Go to Dashboard
2. Click "My Subscription"
3. Click [CANCEL]

Your subscription remains active until the end of current period. You can renew anytime.`
      }
    ]
  },
  {
    id: 'payment',
    name: 'Payments & Billing',
    icon: '💳',
    description: 'Payment methods, invoices, refunds',
    questions: [
      {
        id: 'pay_1',
        categoryId: 'payment',
        question: 'What payment methods do you accept?',
        answer: `We accept two payment gateways:

**In India:** Razorpay
- UPI (0% fees)
- Debit Card
- Net Banking
- Wallet

**Outside India:** Stripe
- Credit/Debit Card
- Apple Pay
- Google Pay`
      },
      {
        id: 'pay_2',
        categoryId: 'payment',
        question: 'Can I use a coupon code?',
        answer: `Yes! We regularly offer coupon codes:
1. During checkout, look for "Have a coupon code?" field
2. Enter your code
3. Click "Apply"
4. See discount applied to total

Coupon codes can be percentage off (e.g., 20%) or fixed amount (e.g., $5 off).`
      },
      {
        id: 'pay_3',
        categoryId: 'payment',
        question: 'How do I get an invoice?',
        answer: `To download your invoice:
1. Go to Dashboard → Payments
2. Find your payment in the list
3. Click the payment row
4. Click "Download Invoice"

Invoices are PDF format with Jeeva branding.`
      },
      {
        id: 'pay_4',
        categoryId: 'payment',
        question: 'Can I get a refund?',
        answer: `Refunds are handled case-by-case. Please contact us with:
- Transaction ID
- Reason for refund
- Any relevant details

We'll review and respond within 2-3 business days.`
      }
    ]
  },
  {
    id: 'content',
    name: 'Learning Content',
    icon: '📚',
    description: 'Practice, Learning, Mock Exams',
    questions: [
      {
        id: 'cnt_1',
        categoryId: 'content',
        question: 'What are the 3 modules?',
        answer: `Jeeva has 3 main learning modules:

**1. Practice Module** - Familiarization
- 9 subtopics
- Free navigation
- Unlimited attempts
- Immediate feedback

**2. Learning Module** - Structured learning
- 21 subtopics
- Sequential unlock (80% pass required)
- Videos, podcasts, lessons
- 10-15 questions per subtopic

**3. Mock Exam Module** - Real simulation
- Full 3:45 exam
- All topics combined
- Timed format
- Detailed results`
      },
      {
        id: 'cnt_2',
        categoryId: 'content',
        question: 'How do I pass the Learning module?',
        answer: `The Learning module requires 80% on each subtopic to unlock the next:

1. Watch video (10-15 min)
2. Listen to podcast/audio (15-20 min)
3. Read lesson (accordion format)
4. Answer assessment questions (10-15 questions)
5. Get 80% to PASS → Unlock next subtopic

You can retake unlimited times if you don't pass the first time.`
      },
      {
        id: 'cnt_3',
        categoryId: 'content',
        question: 'Is the Mock Exam timed?',
        answer: `Yes, the Mock Exam is timed:
- **Duration:** 3 hours 45 minutes (exactly like real NMC CBT)
- **Questions:** All topics combined
- **Navigation:** Can see all questions and mark for review
- **Results:** Detailed breakdown by topic
- **Attempts:** Unlimited retakes`
      },
      {
        id: 'cnt_4',
        categoryId: 'content',
        question: 'Can I practice questions freely?',
        answer: `Yes! The Practice module is completely free:
- 9 subtopics to explore
- Unlimited attempts
- Free navigation (no prerequisites)
- Immediate feedback with explanations
- Great for familiarization before structured learning`
      }
    ]
  },
  {
    id: 'account',
    name: 'Account & Profile',
    icon: '👤',
    description: 'Login, profile, settings',
    questions: [
      {
        id: 'acc_1',
        categoryId: 'account',
        question: 'How do I sign up?',
        answer: `To sign up:
1. Click "Sign Up" on login screen
2. Enter email
3. Create password
4. Complete your profile (name, country)
5. Start your free 7-day trial

No payment required for trial!`
      },
      {
        id: 'acc_2',
        categoryId: 'account',
        question: 'Can I use Google/Apple sign-in?',
        answer: `Yes, you can sign in with:
- Google Account
- Apple ID (on iOS)

Or use email + password. All methods link to the same account.`
      },
      {
        id: 'acc_3',
        categoryId: 'account',
        question: 'How do I reset my password?',
        answer: `To reset your password:
1. On login screen, click "Forgot Password?"
2. Enter your email
3. Check your email for reset link
4. Click link and create new password
5. Log in with new password

If you don't receive the email, check spam folder.`
      },
      {
        id: 'acc_4',
        categoryId: 'account',
        question: 'How do I delete my account?',
        answer: `To delete your account:
1. Go to Settings → Account
2. Click "Delete Account"
3. Confirm deletion

This will delete all your data including progress. This action cannot be undone.`
      }
    ]
  },
  {
    id: 'features',
    name: 'Features & Tools',
    icon: '⚡',
    description: 'JeevaBot, notifications, progress',
    questions: [
      {
        id: 'feat_1',
        categoryId: 'features',
        question: 'What is JeevaBot?',
        answer: `JeevaBot is an AI-powered learning assistant:
- Ask any question about nursing exams
- Get instant answers
- Available 24/7
- Powered by Google Gemini AI

Note: JeevaBot usage limits depend on your subscription plan.`
      },
      {
        id: 'feat_2',
        categoryId: 'features',
        question: 'How do I get notifications?',
        answer: `Notifications alert you about:
- Trial ending
- Subscription expiring
- New content available
- Achievement milestones
- Messages from instructors

Enable in Settings → Notifications to choose:
- Push notifications
- Email notifications
- In-app notifications
- Quiet hours`
      },
      {
        id: 'feat_3',
        categoryId: 'features',
        question: 'How can I see my progress?',
        answer: `View your progress in the Dashboard:
- Overall completion %
- Module progress (Practice, Learning, Mock)
- Subtopic status (completed/in progress/locked)
- Exam scores and trends
- Performance by topic

This helps you track readiness for the real exam.`
      },
      {
        id: 'feat_4',
        categoryId: 'features',
        question: 'Is there a voice tutoring feature?',
        answer: `Yes! Voice tutoring with instructors is available:
- Live 1-on-1 sessions
- Ask questions in real-time
- Get personalized guidance
- Scheduled at your convenience

Available in Premium plans. Check your subscription for details.`
      }
    ]
  },
  {
    id: 'tech',
    name: 'Technical Issues',
    icon: '🔧',
    description: 'App crashes, errors, bugs',
    questions: [
      {
        id: 'tech_1',
        categoryId: 'tech',
        question: 'The app keeps crashing',
        answer: `If the app crashes:

**Quick fixes:**
1. Force close the app
2. Clear app cache (Settings → Apps → Jeeva → Clear Cache)
3. Restart your phone
4. Reinstall the app from app store

If the issue persists, contact support with:
- Your device model
- Android/iOS version
- When it crashes (which screen/action)`
      },
      {
        id: 'tech_2',
        categoryId: 'tech',
        question: 'I see a loading spinner stuck',
        answer: `If something is stuck loading:

**Try:**
1. Go back and retry
2. Close and reopen the app
3. Check your internet connection (WiFi or mobile data)
4. Check if you have at least 100MB free space

If still stuck after 2 minutes, contact support with a screenshot.`
      },
      {
        id: 'tech_3',
        categoryId: 'tech',
        question: 'I cannot download videos/content',
        answer: `To download content:

**Requirements:**
- Internet connection (WiFi recommended)
- At least 200MB free space per video
- Subscription must be active

**If download fails:**
1. Check internet connection
2. Try over WiFi (not mobile data)
3. Clear app cache
4. Restart the app`
      },
      {
        id: 'tech_4',
        categoryId: 'tech',
        question: 'Push notifications not working',
        answer: `If you're not receiving notifications:

**Check these settings:**
1. Go to Settings → Notifications → Jeeva
2. Enable "Allow Notifications"
3. Check quiet hours (Settings → Quiet Hours)
4. Ensure app has permission in device settings

If still not working, reinstall the app and enable notifications on first launch.`
      }
    ]
  }
]
```

---

## 4. Chatbot UI Components

### 4.1 Main Menu Component

```typescript
// ChatbotMenu.tsx
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native'

interface Props {
  categories: FAQCategory[]
  onSelectCategory: (category: FAQCategory) => void
}

export function ChatbotMenu({ categories, onSelectCategory }: Props) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>How can we help?</Text>
      <Text style={styles.subtitle}>Choose a category below</Text>

      <View style={styles.grid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryButton}
            onPress={() => onSelectCategory(category)}
          >
            <Text style={styles.icon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryDesc}>{category.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24
  },
  grid: {
    gap: 12,
    marginBottom: 24
  },
  categoryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  icon: {
    fontSize: 32,
    marginBottom: 8
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  categoryDesc: {
    fontSize: 12,
    color: '#999'
  }
})
```

### 4.2 Questions List Component

```typescript
// QuestionsList.tsx
export function QuestionsList({ questions, onSelectQuestion, onBack }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {questions.map((q) => (
          <TouchableOpacity
            key={q.id}
            style={styles.questionButton}
            onPress={() => onSelectQuestion(q)}
          >
            <Text style={styles.question}>{q.question}</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backButton: {
    color: '#007aff',
    fontSize: 16,
    fontWeight: '600'
  },
  list: {
    flex: 1
  },
  questionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  question: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    fontWeight: '500'
  },
  arrow: {
    color: '#ccc',
    fontSize: 20,
    marginLeft: 8
  }
})
```

### 4.3 Answer Display Component

```typescript
// AnswerDisplay.tsx
import { useState } from 'react'
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native'

interface Props {
  question: FAQQuestion
  onBack: () => void
  onEscalate: () => void
}

export function AnswerDisplay({ question, onBack, onEscalate }: Props) {
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.question}>{question.question}</Text>

        <View style={styles.answerBox}>
          <Text style={styles.answer}>{question.answer}</Text>
        </View>

        {/* Helpful/Not Helpful */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackLabel}>Was this helpful?</Text>
          <View style={styles.feedbackButtons}>
            <TouchableOpacity
              style={[
                styles.feedbackButton,
                isHelpful === true && styles.feedbackButtonActive
              ]}
              onPress={() => setIsHelpful(true)}
            >
              <Text style={styles.feedbackButtonText}>👍 Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.feedbackButton,
                isHelpful === false && styles.feedbackButtonActive
              ]}
              onPress={() => setIsHelpful(false)}
            >
              <Text style={styles.feedbackButtonText}>👎 No</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Escalate Option */}
        {isHelpful === false && (
          <View style={styles.escalateBox}>
            <Text style={styles.escalateTitle}>Need more help?</Text>
            <Text style={styles.escalateText}>
              Contact our support team via email for personalized assistance.
            </Text>
            <TouchableOpacity
              style={styles.escalateButton}
              onPress={onEscalate}
            >
              <Text style={styles.escalateButtonText}>📧 Contact Support</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backButton: {
    color: '#007aff',
    fontSize: 16,
    fontWeight: '600'
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  answerBox: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#007aff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24
  },
  answer: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22
  },
  feedbackSection: {
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 8
  },
  feedbackButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center'
  },
  feedbackButtonActive: {
    backgroundColor: '#f0f0f0',
    borderColor: '#007aff'
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  escalateBox: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24
  },
  escalateTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  escalateText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20
  },
  escalateButton: {
    backgroundColor: '#ffc107',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  escalateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  }
})
```

### 4.4 Email Escalation Form

```typescript
// EscalationForm.tsx
import { useState } from 'react'
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert
} from 'react-native'

interface Props {
  question: string
  onSubmit: (data: EscalationData) => void
  onCancel: () => void
}

export function EscalationForm({ question, onSubmit, onCancel }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !description.trim()) {
      Alert.alert('Validation', 'Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      await onSubmit({
        name,
        email,
        description,
        originalQuestion: question
      })
      Alert.alert('Success', 'Your request has been sent. We\'ll respond within 24 hours.')
    } catch (error) {
      Alert.alert('Error', 'Failed to send request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Contact Support</Text>
      <Text style={styles.description}>
        We'll get back to you as soon as possible
      </Text>

      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us more about your issue..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            editable={!loading}
          />
        </View>

        {/* Original Question Reference */}
        <View style={styles.referenceBox}>
          <Text style={styles.referenceLabel}>Your Question:</Text>
          <Text style={styles.referenceText}>{question}</Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Sending...' : 'Send Support Request'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24
  },
  fieldGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10
  },
  referenceBox: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007aff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  referenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007aff',
    marginBottom: 4
  },
  referenceText: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic'
  },
  submitButton: {
    backgroundColor: '#007aff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600'
  }
})
```

---

## 5. Chatbot Page (Main Container)

```typescript
// ChatbotPage.tsx
import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { ChatbotMenu } from './ChatbotMenu'
import { QuestionsList } from './QuestionsList'
import { AnswerDisplay } from './AnswerDisplay'
import { EscalationForm } from './EscalationForm'
import { sendEscalationEmail } from '@/services/supportService'
import { FAQ_DATA } from './faqData'

type Screen = 'menu' | 'questions' | 'answer' | 'escalate'

interface State {
  screen: Screen
  selectedCategory: FAQCategory | null
  selectedQuestion: FAQQuestion | null
}

export function ChatbotPage() {
  const [state, setState] = useState<State>({
    screen: 'menu',
    selectedCategory: null,
    selectedQuestion: null
  })

  function handleSelectCategory(category: FAQCategory) {
    setState({
      screen: 'questions',
      selectedCategory: category,
      selectedQuestion: null
    })
  }

  function handleSelectQuestion(question: FAQQuestion) {
    setState({
      screen: 'answer',
      selectedCategory: state.selectedCategory,
      selectedQuestion: question
    })
  }

  function handleEscalate() {
    setState((prev) => ({
      ...prev,
      screen: 'escalate'
    }))
  }

  async function handleSubmitEscalation(data: EscalationData) {
    await sendEscalationEmail(data)
    // Go back to menu
    setState({
      screen: 'menu',
      selectedCategory: null,
      selectedQuestion: null
    })
  }

  function handleBack() {
    if (state.screen === 'questions') {
      setState({
        screen: 'menu',
        selectedCategory: null,
        selectedQuestion: null
      })
    } else if (state.screen === 'answer') {
      setState({
        screen: 'questions',
        selectedCategory: state.selectedCategory,
        selectedQuestion: null
      })
    } else if (state.screen === 'escalate') {
      setState({
        screen: 'answer',
        selectedCategory: state.selectedCategory,
        selectedQuestion: state.selectedQuestion
      })
    }
  }

  return (
    <View style={styles.container}>
      {state.screen === 'menu' && (
        <ChatbotMenu
          categories={FAQ_DATA}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {state.screen === 'questions' && state.selectedCategory && (
        <QuestionsList
          questions={state.selectedCategory.questions}
          onSelectQuestion={handleSelectQuestion}
          onBack={handleBack}
        />
      )}

      {state.screen === 'answer' && state.selectedQuestion && (
        <AnswerDisplay
          question={state.selectedQuestion}
          onBack={handleBack}
          onEscalate={handleEscalate}
        />
      )}

      {state.screen === 'escalate' && state.selectedQuestion && (
        <EscalationForm
          question={state.selectedQuestion.question}
          onSubmit={handleSubmitEscalation}
          onCancel={handleBack}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
})
```

---

## 6. Support Service (Email Escalation)

```typescript
// supportService.ts
import { supabase } from '@/lib/supabase'

interface EscalationData {
  name: string
  email: string
  description: string
  originalQuestion: string
}

export async function sendEscalationEmail(data: EscalationData) {
  try {
    // Save to database
    const { error: dbError } = await supabase
      .from('support_tickets')
      .insert({
        user_name: data.name,
        user_email: data.email,
        category: 'customer_support',
        original_question: data.originalQuestion,
        description: data.description,
        status: 'open',
        created_at: new Date()
      })

    if (dbError) throw dbError

    // Send email via backend
    const response = await fetch('https://your-api.com/api/support/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'support@jeeva.app', // Your support email
        name: data.name,
        userEmail: data.email,
        question: data.originalQuestion,
        description: data.description
      })
    })

    if (!response.ok) throw new Error('Failed to send email')

    return { success: true }
  } catch (error) {
    console.error('Error sending escalation:', error)
    throw error
  }
}
```

---

## 7. Backend Email Endpoint

```typescript
// server/routes/support.ts
import express from 'express'
import { resend } from '@/lib/resend'

const router = express.Router()

router.post('/send-email', async (req, res) => {
  try {
    const { to, name, userEmail, question, description } = req.body

    const emailBody = `
      New Support Request from Customer

      Name: ${name}
      Email: ${userEmail}
      
      Original Question: ${question}
      
      Description:
      ${description}
      
      Please respond to: ${userEmail}
    `

    await resend.emails.send({
      from: 'support@jeeva.app',
      to: to,
      subject: `New Customer Support Request from ${name}`,
      html: `
        <h2>New Support Ticket</h2>
        <p><strong>From:</strong> ${name} (${userEmail})</p>
        <p><strong>Original Question:</strong> ${question}</p>
        <h3>Issue Description:</h3>
        <p>${description}</p>
        <hr>
        <p>Reply to: <a href="mailto:${userEmail}">${userEmail}</a></p>
      `
    })

    res.json({ success: true, message: 'Email sent' })
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json({ error: 'Failed to send email' })
  }
})

export default router
```

---

## 8. Database Schema

```sql
-- Support Tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name VARCHAR NOT NULL,
  user_email VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  original_question TEXT,
  description TEXT NOT NULL,
  status VARCHAR DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  response TEXT
);

-- FAQ for Admin Management
CREATE TABLE faq_categories (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  icon VARCHAR,
  description VARCHAR,
  display_order INT,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE faq_questions (
  id VARCHAR PRIMARY KEY,
  category_id VARCHAR NOT NULL REFERENCES faq_categories(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  helpful_count INT DEFAULT 0,
  not_helpful_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 9. Integration Steps

1. **Add to Navigation**
   ```typescript
   import { ChatbotPage } from '@/pages/ChatbotPage'
   
   <Tab.Screen 
     name="Support" 
     component={ChatbotPage}
     options={{ title: 'Help & Support' }}
   />
   ```

2. **Add FAQ Badge to Help Icon**
   ```typescript
   <TouchableOpacity onPress={() => navigation.navigate('Support')}>
     <HelpIcon />
     <Badge>3</Badge> {/* Unresolved tickets */}
   </TouchableOpacity>
   ```

3. **Test Flow**
   - Open support
   - Select category
   - Click question
   - See answer
   - Mark helpful/not helpful
   - Escalate if needed

---

## 10. Implementation Checklist

- [ ] Copy FAQ data
- [ ] Create ChatbotMenu component
- [ ] Create QuestionsList component
- [ ] Create AnswerDisplay component
- [ ] Create EscalationForm component
- [ ] Create ChatbotPage container
- [ ] Create supportService for email
- [ ] Create backend email endpoint
- [ ] Create database schema
- [ ] Integrate chatbot into navigation
- [ ] Test menu navigation
- [ ] Test answer display
- [ ] Test email escalation
- [ ] Test feedback (helpful/not helpful)

---

## 11. Summary

| Component | Purpose |
|-----------|---------|
| ChatbotMenu | Category selection |
| QuestionsList | Show Q&As in category |
| AnswerDisplay | Show answer + feedback |
| EscalationForm | Collect email details |
| supportService | Send escalation email |
| Backend endpoint | Send via Resend |

**Status:** ✅ Complete Implementation Guide  
**Ready for Development:** Yes  
**Backend Integration:** Resend email service (already configured)
