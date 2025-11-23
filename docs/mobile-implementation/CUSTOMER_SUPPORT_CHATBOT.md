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

Sample structure for FAQ data with subscription, payment, content, account, features, and technical support categories.
