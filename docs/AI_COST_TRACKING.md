# 💰 JeevaBot AI Cost Tracking & Budget Management

## 📊 Overview

This document provides formulas, queries, and strategies for tracking and managing AI costs for the JeevaBot chat system using Google Gemini 1.5 Flash API.

---

## 💵 Pricing Model (October 2025)

### Gemini 1.5 Flash Pricing

| Token Type | Cost per 1,000 tokens |
|-----------|----------------------|
| **Input tokens** | $0.00025 |
| **Output tokens** | $0.00075 |

### Context Caching (If Enabled)
| Cache Type | Cost per 1M tokens |
|-----------|-------------------|
| Cache storage | $4.50 per hour |
| Cache retrieval | $0.0375 |

**Note:** JeevaBot does not currently use context caching.

---

## 📐 Cost Calculation Formulas

### Per-Message Cost

```javascript
// Average conversation breakdown
const totalTokens = 1300; // Example: typical nursing Q&A
const inputTokens = totalTokens * 0.4;  // User prompt + system prompt (~40%)
const outputTokens = totalTokens * 0.6; // AI response (~60%)

// Calculate costs
const inputCost = (inputTokens / 1000) * 0.00025;
const outputCost = (outputTokens / 1000) * 0.00075;
const totalCost = inputCost + outputCost;

// Example result:
// inputTokens = 520
// outputTokens = 780
// inputCost = $0.00013
// outputCost = $0.000585
// totalCost = $0.000715 (~$0.0007 per message)
```

### Daily Cost Projection

```javascript
const messagesPerDay = 50; // Per user limit
const avgTokensPerMessage = 1300;
const totalDailyTokens = messagesPerDay * avgTokensPerMessage; // 65,000 tokens

const dailyInputTokens = totalDailyTokens * 0.4; // 26,000
const dailyOutputTokens = totalDailyTokens * 0.6; // 39,000

const dailyCostPerUser = 
  (dailyInputTokens / 1000 * 0.00025) + 
  (dailyOutputTokens / 1000 * 0.00075);

// Result: ~$0.0358 per user per day
```

### Monthly Cost Projection

```javascript
// Assumptions
const activeUsers = 1000;
const avgMessagesPerUserPerDay = 15;
const daysPerMonth = 30;

const totalMessagesPerMonth = activeUsers * avgMessagesPerUserPerDay * daysPerMonth;
// = 450,000 messages

const totalTokensPerMonth = totalMessagesPerMonth * 1300;
// = 585,000,000 tokens

const monthlyInputTokens = totalTokensPerMonth * 0.4;  // 234M
const monthlyOutputTokens = totalTokensPerMonth * 0.6; // 351M

const monthlyCost = 
  (monthlyInputTokens / 1000 * 0.00025) + 
  (monthlyOutputTokens / 1000 * 0.00075);

// Result: $321.75/month for 1,000 active users
// Per user: $0.32/month
```

---

## 🗄️ Database Tracking

### ai_usage_stats Table Structure

```sql
CREATE TABLE ai_usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  prompt_tokens INTEGER DEFAULT 0,      -- NEW: Track input tokens separately
  completion_tokens INTEGER DEFAULT 0,  -- NEW: Track output tokens separately
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- NOTE: If you have an existing ai_usage_stats table, run this migration:
-- ALTER TABLE ai_usage_stats 
--   ADD COLUMN IF NOT EXISTS prompt_tokens INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS completion_tokens INTEGER DEFAULT 0;
```

### Token Tracking Query

**Daily usage per user:**
```sql
SELECT 
  user_id,
  date,
  message_count,
  total_tokens,
  -- Calculate actual costs (if prompt_tokens/completion_tokens are tracked)
  ROUND((prompt_tokens / 1000.0) * 0.00025, 6) as input_cost_usd,
  ROUND((completion_tokens / 1000.0) * 0.00075, 6) as output_cost_usd,
  ROUND(
    ((prompt_tokens / 1000.0) * 0.00025) + 
    ((completion_tokens / 1000.0) * 0.00075), 
    6
  ) as total_cost_usd
  
  -- FALLBACK: If you only have total_tokens (40/60 split estimate):
  -- ROUND((total_tokens * 0.4 / 1000.0) * 0.00025, 6) as input_cost_usd,
  -- ROUND((total_tokens * 0.6 / 1000.0) * 0.00075, 6) as output_cost_usd,
  -- ROUND(
  --   ((total_tokens * 0.4 / 1000.0) * 0.00025) + 
  --   ((total_tokens * 0.6 / 1000.0) * 0.00075), 
  --   6
  -- ) as total_cost_usd
FROM ai_usage_stats
WHERE date = CURRENT_DATE
ORDER BY total_cost_usd DESC
LIMIT 20;
```

**Aggregate cost summary:**
```sql
SELECT 
  date,
  COUNT(DISTINCT user_id) as active_users,
  SUM(message_count) as total_messages,
  SUM(total_tokens) as total_tokens,
  SUM(prompt_tokens) as total_prompt_tokens,
  SUM(completion_tokens) as total_completion_tokens,
  ROUND(
    ((SUM(prompt_tokens) / 1000.0) * 0.00025) + 
    ((SUM(completion_tokens) / 1000.0) * 0.00075), 
    2
  ) as daily_cost_usd
  
  -- FALLBACK if only total_tokens available:
  -- ROUND(
  --   ((SUM(total_tokens) * 0.4 / 1000.0) * 0.00025) + 
  --   ((SUM(total_tokens) * 0.6 / 1000.0) * 0.00075), 
  --   2
  -- ) as daily_cost_usd
FROM ai_usage_stats
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;
```

**Top spenders (current month):**
```sql
SELECT 
  u.email,
  aus.user_id,
  SUM(aus.message_count) as total_messages,
  SUM(aus.prompt_tokens) as total_prompt_tokens,
  SUM(aus.completion_tokens) as total_completion_tokens,
  ROUND(
    ((SUM(aus.prompt_tokens) / 1000.0) * 0.00025) + 
    ((SUM(aus.completion_tokens) / 1000.0) * 0.00075), 
    4
  ) as monthly_cost_usd
  
  -- FALLBACK if only total_tokens available:
  -- ROUND(
  --   ((SUM(aus.total_tokens) * 0.4 / 1000.0) * 0.00025) + 
  --   ((SUM(aus.total_tokens) * 0.6 / 1000.0) * 0.00075), 
  --   4
  -- ) as monthly_cost_usd
FROM ai_usage_stats aus
JOIN auth.users u ON u.id = aus.user_id
WHERE aus.date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY u.email, aus.user_id
ORDER BY monthly_cost_usd DESC
LIMIT 50;
```

---

## 🎯 Budget Controls

### Rate Limiting Strategy

**Current Implementation:**
- **Per-user daily limit:** 50 messages
- **Enforced at:** Backend API level
- **Reset:** Midnight UTC daily

**Cost Impact:**
```
Maximum cost per user per day: $0.036
Maximum cost per user per month: $1.08 (30 days × $0.036)

With 1,000 active users hitting daily limit:
Maximum monthly cost: $1,080
```

### Budget Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| **Daily spend** | $20 | $30 | Temporarily disable new chats |
| **Weekly spend** | $140 | $200 | Review top users, adjust limits |
| **Monthly spend** | $500 | $750 | Trigger admin alert |
| **Per-user daily** | 45 msgs | 50 msgs | Show warning / Block |

### Cost Optimization Strategies

1. **Reduce System Prompt Length**
   - Current: ~300 tokens
   - Optimized: ~150 tokens
   - Savings: 30% input cost reduction

2. **Cache Common Responses**
   - Store responses to frequently asked questions (e.g., "What is NMC CBT?")
   - Cache duration: 24 hours
   - Savings: 80% for cached responses

3. **Progressive Rate Limits**
   - Free users: 10 messages/day
   - Premium users: 50 messages/day
   - Unlimited tier: 200 messages/day

4. **Smart Fallback Responses**
   - Detect simple/FAQ questions
   - Serve pre-written answers for basic queries
   - Only use AI for complex nursing scenarios

---

## 📈 Monitoring Dashboards

### Daily Cost Report (SQL View)

```sql
CREATE OR REPLACE VIEW daily_ai_cost_report AS
SELECT 
  date,
  COUNT(DISTINCT user_id) as active_users,
  SUM(message_count) as total_messages,
  ROUND(AVG(message_count), 2) as avg_messages_per_user,
  SUM(prompt_tokens) as total_prompt_tokens,
  SUM(completion_tokens) as total_completion_tokens,
  ROUND(AVG(prompt_tokens + completion_tokens), 2) as avg_tokens_per_user,
  ROUND(
    ((SUM(prompt_tokens) / 1000.0) * 0.00025) + 
    ((SUM(completion_tokens) / 1000.0) * 0.00075), 
    2
  ) as daily_cost_usd,
  ROUND(
    (((SUM(prompt_tokens) / 1000.0) * 0.00025) + 
    ((SUM(completion_tokens) / 1000.0) * 0.00075)) / 
    NULLIF(COUNT(DISTINCT user_id), 0), 
    4
  ) as cost_per_user_usd
  
  -- FALLBACK if only total_tokens available (legacy schema):
  -- SUM(total_tokens) as total_tokens,
  -- ROUND(AVG(total_tokens), 2) as avg_tokens_per_user,
  -- ROUND(
  --   ((SUM(total_tokens) * 0.4 / 1000.0) * 0.00025) + 
  --   ((SUM(total_tokens) * 0.6 / 1000.0) * 0.00075), 
  --   2
  -- ) as daily_cost_usd,
  -- ROUND(
  --   (((SUM(total_tokens) * 0.4 / 1000.0) * 0.00025) + 
  --   ((SUM(total_tokens) * 0.6 / 1000.0) * 0.00075)) / 
  --   NULLIF(COUNT(DISTINCT user_id), 0), 
  --   4
  -- ) as cost_per_user_usd
FROM ai_usage_stats
GROUP BY date
ORDER BY date DESC;
```

### Key Performance Indicators (KPIs)

```sql
-- Today's snapshot
SELECT 
  'Today' as period,
  COUNT(DISTINCT user_id) as users,
  SUM(message_count) as messages,
  ROUND(
    ((SUM(prompt_tokens) / 1000.0) * 0.00025) + 
    ((SUM(completion_tokens) / 1000.0) * 0.00075), 
    2
  ) as cost_usd
FROM ai_usage_stats
WHERE date = CURRENT_DATE

UNION ALL

-- This week
SELECT 
  'This Week',
  COUNT(DISTINCT user_id),
  SUM(message_count),
  ROUND(
    ((SUM(prompt_tokens) / 1000.0) * 0.00025) + 
    ((SUM(completion_tokens) / 1000.0) * 0.00075), 
    2
  )
FROM ai_usage_stats
WHERE date >= CURRENT_DATE - INTERVAL '7 days'

UNION ALL

-- This month
SELECT 
  'This Month',
  COUNT(DISTINCT user_id),
  SUM(message_count),
  ROUND(
    ((SUM(prompt_tokens) / 1000.0) * 0.00025) + 
    ((SUM(completion_tokens) / 1000.0) * 0.00075), 
    2
  )
FROM ai_usage_stats
WHERE date >= DATE_TRUNC('month', CURRENT_DATE);

-- FALLBACK for legacy schema (only total_tokens):
-- Replace prompt_tokens with (total_tokens * 0.4)
-- Replace completion_tokens with (total_tokens * 0.6)
```

---

## 🚨 Alert System

### Budget Alert Triggers

**Backend cron job (runs every 6 hours):**

```javascript
// Check daily spend
const todaySpend = await calculateDailySpend();

if (todaySpend > 30) {
  // CRITICAL: Disable new chats
  await disableNewConversations();
  await sendAdminAlert('CRITICAL: Daily budget exceeded', todaySpend);
} else if (todaySpend > 20) {
  // WARNING: Send alert only
  await sendAdminAlert('WARNING: Daily budget approaching limit', todaySpend);
}

// Check monthly spend
const monthSpend = await calculateMonthlySpend();

if (monthSpend > 750) {
  await sendAdminAlert('CRITICAL: Monthly budget exceeded', monthSpend);
} else if (monthSpend > 500) {
  await sendAdminAlert('WARNING: Monthly budget at 67%', monthSpend);
}
```

### Email Alert Template

```
Subject: [JeevaBot AI] Budget Alert - {LEVEL}

Daily Spend: ${todaySpend}
Monthly Spend: ${monthSpend}
Budget Remaining: ${budgetRemaining}

Active Users Today: {activeUsers}
Messages Sent Today: {messageCount}
Avg Cost Per User: ${avgCostPerUser}

Top 5 Users:
1. user@example.com - $0.25 (32 messages)
2. ...

Action Required: {actionRequired}

View Dashboard: {dashboardUrl}
```

---

## 📊 Cost Breakdown Examples

### Scenario 1: Light Usage (100 users, 5 msgs/day avg)

```
Users: 100
Messages/user/day: 5
Total messages/day: 500
Total tokens/day: 650,000

Daily cost: $0.36
Monthly cost: $10.75
```

### Scenario 2: Moderate Usage (500 users, 15 msgs/day avg)

```
Users: 500
Messages/user/day: 15
Total messages/day: 7,500
Total tokens/day: 9,750,000

Daily cost: $5.36
Monthly cost: $160.88
```

### Scenario 3: Heavy Usage (1,000 users, 30 msgs/day avg)

```
Users: 1,000
Messages/user/day: 30
Total messages/day: 30,000
Total tokens/day: 39,000,000

Daily cost: $21.45
Monthly cost: $643.50
```

### Scenario 4: Premium Launch (5,000 users, 20 msgs/day avg)

```
Users: 5,000
Messages/user/day: 20
Total messages/day: 100,000
Total tokens/day: 130,000,000

Daily cost: $71.50
Monthly cost: $2,145.00
```

---

## 🔧 Implementation Checklist

### Backend Cost Tracking
- [x] ai_usage_stats table created
- [x] Token counting implemented in API
- [x] Daily reset mechanism (rate limit)
- [ ] Backend cron job for budget alerts
- [ ] Admin dashboard for cost monitoring

### Mobile App Controls
- [x] Usage indicator showing X/50 messages
- [x] Warning banner at 45+ messages
- [x] Error handling for 429 (rate limit)
- [x] useUsageStats hook with auto-refresh
- [ ] In-app upgrade prompt for premium tier

### Monitoring & Alerts
- [ ] Daily cost report view created
- [ ] Email alerts configured
- [ ] Slack/Discord webhook for critical alerts
- [ ] Monthly cost trend analysis
- [ ] Per-user cost attribution

---

## 📌 Recommendations

### Short-Term (Next 30 Days)
1. Monitor actual token usage vs. estimates
2. Track cost per user and identify outliers
3. Implement backend budget alerts
4. Create admin cost dashboard

### Medium-Term (Next 90 Days)
1. Introduce tiered rate limits (Free: 10, Premium: 50, Unlimited: 200)
2. Cache common nursing Q&A responses
3. Optimize system prompts to reduce token count
4. A/B test response quality vs. token usage

### Long-Term (6+ Months)
1. Implement semantic search for pre-written content
2. Fine-tune smaller model for basic nursing questions
3. Revenue optimization: Calculate LTV vs. AI costs
4. Consider self-hosted open-source models for cost reduction

---

**Last Updated:** October 24, 2025  
**Document Version:** 1.0  
**Pricing Source:** [Google AI Pricing](https://ai.google.dev/pricing)
