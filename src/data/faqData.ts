export interface FAQQuestion {
  id: string
  categoryId: string
  question: string
  answer: string
  helpful: number
  notHelpful: number
}

export interface FAQCategory {
  id: string
  name: string
  icon: string
  description: string
  questions: FAQQuestion[]
}

export const FAQ_DATA: FAQCategory[] = [
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

Your subscription will be renewed for the selected period. No automatic renewal - you choose when to renew!`,
        helpful: 0,
        notHelpful: 0,
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

Downgrading takes effect on your next renewal.`,
        helpful: 0,
        notHelpful: 0,
      },
      {
        id: 'sub_3',
        categoryId: 'subscription',
        question: 'What happens when my subscription expires?',
        answer: `When your subscription expires:
- You can still see your progress
- Premium features become limited
- You receive a notification 5 days before expiry
- Click [RENEW] when ready to continue`,
        helpful: 0,
        notHelpful: 0,
      },
      {
        id: 'sub_4',
        categoryId: 'subscription',
        question: 'How do I cancel my subscription?',
        answer: `To cancel your subscription:
1. Go to Dashboard
2. Click "My Subscription"
3. Click [CANCEL]

Your subscription remains active until the end of current period. You can renew anytime.`,
        helpful: 0,
        notHelpful: 0,
      },
    ],
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
- Google Pay`,
        helpful: 0,
        notHelpful: 0,
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

Coupon codes can be percentage off (e.g., 20%) or fixed amount (e.g., $5 off).`,
        helpful: 0,
        notHelpful: 0,
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

Invoices are PDF format with Jeeva branding.`,
        helpful: 0,
        notHelpful: 0,
      },
      {
        id: 'pay_4',
        categoryId: 'payment',
        question: 'Can I get a refund?',
        answer: `Refunds are handled case-by-case. Please contact us with:
- Transaction ID
- Reason for refund
- Any relevant details

We'll review and respond within 2-3 business days.`,
        helpful: 0,
        notHelpful: 0,
      },
    ],
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
- Detailed results`,
        helpful: 0,
        notHelpful: 0,
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

You can retake unlimited times if you don't pass the first time.`,
        helpful: 0,
        notHelpful: 0,
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
- **Attempts:** Unlimited retakes`,
        helpful: 0,
        notHelpful: 0,
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
- Great for familiarization before structured learning`,
        helpful: 0,
        notHelpful: 0,
      },
    ],
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

No payment required for trial!`,
        helpful: 0,
        notHelpful: 0,
      },
      {
        id: 'acc_2',
        categoryId: 'account',
        question: 'Can I use Google/Apple sign-in?',
        answer: `Yes, you can sign in with:
- Google Account
- Apple ID (on iOS)

Or use email + password. All methods link to the same account.`,
        helpful: 0,
        notHelpful: 0,
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

If you don't receive the email, check spam folder.`,
        helpful: 0,
        notHelpful: 0,
      },
      {
        id: 'acc_4',
        categoryId: 'account',
        question: 'How do I delete my account?',
        answer: `To delete your account:
1. Go to Settings → Account
2. Click "Delete Account"
3. Confirm deletion

This will delete all your data including progress. This action cannot be undone.`,
        helpful: 0,
        notHelpful: 0,
      },
    ],
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

Note: JeevaBot usage limits depend on your subscription plan.`,
        helpful: 0,
        notHelpful: 0,
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
- Quiet hours`,
        helpful: 0,
        notHelpful: 0,
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

This helps you track readiness for the real exam.`,
        helpful: 0,
        notHelpful: 0,
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

Available in Premium plans. Check your subscription for details.`,
        helpful: 0,
        notHelpful: 0,
      },
    ],
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
- When it crashes (which screen/action)`,
        helpful: 0,
        notHelpful: 0,
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

If still stuck after 2 minutes, contact support with a screenshot.`,
        helpful: 0,
        notHelpful: 0,
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
4. Restart the app`,
        helpful: 0,
        notHelpful: 0,
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

If still not working, reinstall the app and enable notifications on first launch.`,
        helpful: 0,
        notHelpful: 0,
      },
    ],
  },
]
