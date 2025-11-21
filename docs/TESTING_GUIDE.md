# 🧪 JeevaBot Testing Guide - Cost Controls & Error Handling

## 📋 Overview

This guide covers comprehensive testing for the JeevaBot AI chat system, including cost controls, rate limiting, error handling, and NMC CBT nursing-specific responses.

---

## 🎯 Test Scenarios

### 1. Nursing-Specific Question Testing

Test that JeevaBot provides context-aware, NMC CBT nursing-specific responses.

#### Test Questions:

**A. Medication Dosage Calculation (Numeracy)**
```
Question: "How do I calculate IV flow rate?"

Expected Response:
- Formula: Rate (mL/hr) = Volume (mL) / Time (hours)
- Alternative: Drops/min calculation if using drop factor
- Units reminder (mL, drops, hours)
- Example calculation
- NMC CBT exam context mentioned

Database Check:
✓ chat_messages table: New row with role='user', content='How do I calculate IV flow rate?'
✓ chat_messages table: New row with role='assistant' containing formula
✓ ai_usage_stats table: message_count incremented by 1
```

**B. NMC Code Principles**
```
Question: "Explain the NMC Code principle 'Prioritise People'"

Expected Response:
- 4 key themes of NMC Code mentioned
- Focus on patient dignity, consent, advocacy
- Examples of how it applies to CBT exam scenarios
- Mention of accountability and safeguarding

Database Check:
✓ chat_conversations table: Conversation ID created (if first message)
✓ chat_messages table: Both user and assistant messages saved
✓ ai_usage_stats table: total_tokens incremented
```

**C. UK vs Indian Protocols**
```
Question: "What's the difference between UK and Indian nursing protocols?"

Expected Response:
- NHS standards and NICE guidelines explained
- Safeguarding procedures (UK-specific)
- Infection control differences
- Documentation requirements
- Patient safety focus in UK

Database Check:
✓ Conversation context_data includes userLevel and currentLesson
✓ Response time < 5 seconds
```

**D. Practice Question Strategy**
```
Question: "How many practice questions should I do daily?"

Expected Response:
- Recommendation: 20-30 MCQs per day
- Focus on weak areas first
- Review wrong answers immediately
- Time management for CBT exam (100 questions in 3.5 hours)
- Practice tab mention

Database Check:
✓ AI response references user's practice history (if backend provides context)
```

**E. Exam Preparation**
```
Question: "What's the NMC CBT pass mark and exam format?"

Expected Response:
- Pass mark: 60%
- Format: 100 questions in 3.5 hours (~2 min/question)
- Flag difficult questions strategy
- Mock exam importance
- Review process

Database Check:
✓ All messages saved with accurate timestamps
✓ conversation_id remains consistent across messages
```

---

### 2. Rate Limiting Tests

#### A. Normal Usage (Below Limit)

**Setup:**
```sql
-- Check current usage
SELECT message_count, total_tokens, date
FROM ai_usage_stats
WHERE user_id = '<test-user-id>'
  AND date = CURRENT_DATE;
```

**Test:**
1. Send 5 messages
2. Verify usage badge updates: "5/50"
3. Badge color should be green
4. No warning banner displayed

**Expected UI:**
- ✅ Usage badge shows "5/50" in green
- ✅ No warning banner
- ✅ All messages send successfully
- ✅ Usage stats refresh after each message

---

#### B. Approaching Limit (45+ messages)

**Setup:**
```sql
-- Set message count to 45
INSERT INTO ai_usage_stats (user_id, date, message_count, total_tokens)
VALUES ('<test-user-id>', CURRENT_DATE, 45, 50000)
ON CONFLICT (user_id, date)
DO UPDATE SET message_count = 45, total_tokens = 50000;
```

**Test:**
1. Open JeevaBot screen
2. Verify usage badge shows "45/50" in RED
3. Verify warning banner displays:
   "You're approaching your daily message limit (45/50)"
4. Send 1 message
5. Badge updates to "46/50"

**Expected UI:**
- ⚠️ Usage badge: RED background, alert icon
- ⚠️ Warning banner: Yellow background with warning icon
- ✅ Message sends successfully
- ✅ Usage auto-refreshes

---

#### C. At Limit (50 messages)

**Setup:**
```sql
-- Set message count to 50 (at limit)
INSERT INTO ai_usage_stats (user_id, date, message_count, total_tokens)
VALUES ('<test-user-id>', CURRENT_DATE, 50, 60000)
ON CONFLICT (user_id, date)
DO UPDATE SET message_count = 50, total_tokens = 60000;
```

**Test:**
1. Open JeevaBot screen
2. Usage badge shows "50/50" in RED
3. Try to send a message
4. Backend returns 429 error
5. Error banner displays:
   "You've reached your daily limit of 50 messages. Try again tomorrow!"

**Expected UI:**
- 🚫 Usage badge: "50/50" RED
- 🚫 Error banner: RED background, specific limit message
- ✅ Input field still editable
- ✅ No fallback AI message added
- ✅ User message NOT added to chat

**Expected API Response:**
```json
{
  "error": "Daily message limit reached",
  "statusCode": 429
}
```

---

### 3. Backend Error Tests

#### A. Service Unavailable (500 Error)

**Simulation:**
- Disable Gemini API key on backend
- Or: Introduce intentional error in backend code

**Test:**
1. Send a message
2. Backend returns 500 status
3. Error banner displays:
   "AI service temporarily unavailable. Please try again in a few minutes."
4. Fallback message added to chat

**Expected UI:**
- ⚠️ Error banner with server error message
- ✅ Fallback message: "I'm having trouble connecting right now..."
- ✅ Can dismiss error banner
- ✅ User can retry

---

#### B. Authentication Error (401/403)

**Simulation:**
- Use expired/invalid session token
- Or: Test with no authentication header

**Test:**
1. Send a message with invalid token
2. Backend returns 401
3. Error displays:
   "Authentication failed. Please sign in again."

**Expected UI:**
- 🔒 Error banner with auth error
- ✅ Suggests signing in again
- ✅ No fallback message (auth error)

---

#### C. Network Error (No Connection)

**Simulation:**
- Enable airplane mode on device
- Or: Use invalid BACKEND_URL

**Test:**
1. Turn off WiFi/cellular
2. Try to send message
3. Error displays:
   "Connection issue. Please check your internet connection."

**Expected UI:**
- 📡 Network-specific error message
- ✅ Fallback message added
- ✅ Can retry when connection restored

---

## 💰 Cost Tracking & Verification

### Token Usage Tracking

**Check token counts:**
```sql
SELECT 
  date,
  SUM(message_count) as total_messages,
  SUM(total_tokens) as total_tokens,
  COUNT(DISTINCT user_id) as unique_users
FROM ai_usage_stats
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY date
ORDER BY date DESC;
```

### Cost Calculation

**Gemini 1.5 Flash Pricing (Oct 2025):**
- Input tokens: $0.00025 per 1,000 tokens
- Output tokens: $0.001 per 1,000 tokens

**Formula:**
```javascript
// Average conversation: ~500 tokens input, ~800 tokens output
const inputTokens = totalTokens * 0.4; // 40% input
const outputTokens = totalTokens * 0.6; // 60% output

const inputCost = (inputTokens / 1000) * 0.00025;
const outputCost = (outputTokens / 1000) * 0.001;
const totalCost = inputCost + outputCost;
```

**Example Calculation:**
```
Daily Usage: 1,000 messages
Average tokens per conversation: 1,300 tokens
Total tokens: 1,300,000

Input tokens (40%): 520,000
Output tokens (60%): 780,000

Input cost: (520,000 / 1000) * 0.00025 = $0.13
Output cost: (780,000 / 1000) * 0.001 = $0.78
Total cost: $0.91/day

Monthly cost (30 days): $27.30
```

### Budget Monitoring Query

```sql
-- Daily cost estimate
SELECT 
  date,
  user_id,
  message_count,
  total_tokens,
  -- Estimated input cost (40% of tokens)
  ROUND((total_tokens * 0.4 / 1000.0) * 0.00025, 4) as input_cost,
  -- Estimated output cost (60% of tokens)
  ROUND((total_tokens * 0.6 / 1000.0) * 0.001, 4) as output_cost,
  -- Total estimated cost
  ROUND(
    ((total_tokens * 0.4 / 1000.0) * 0.00025) + 
    ((total_tokens * 0.6 / 1000.0) * 0.001), 
    4
  ) as total_cost
FROM ai_usage_stats
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC, total_cost DESC;
```

### Cost Alerts

**Set up monitoring:**
1. Daily budget: $5.00 max
2. Weekly budget: $30.00 max
3. Monthly budget: $120.00 max

**Alert triggers:**
- Send email when daily cost > $4.00 (80% of limit)
- Disable new conversations when > $5.00
- Admin notification when 90% of weekly budget

---

## 🔍 Test Execution Checklist

### Pre-Test Setup
- [ ] Backend API running with valid Gemini API key
- [ ] EXPO_PUBLIC_BACKEND_URL set correctly
- [ ] Database tables exist: chat_conversations, chat_messages, ai_usage_stats
- [ ] Test user account created and authenticated

### Functional Tests
- [ ] Send 5 nursing-specific questions
- [ ] Verify responses are context-aware
- [ ] Check database updates (messages, stats)
- [ ] Confirm usage badge displays correctly

### Rate Limiting Tests
- [ ] Test at 0 messages (safe - green)
- [ ] Test at 30 messages (warning - yellow)
- [ ] Test at 45 messages (danger - red + warning banner)
- [ ] Test at 50 messages (blocked - 429 error)

### Error Handling Tests
- [ ] Test 500 error (service unavailable)
- [ ] Test 401 error (auth failed)
- [ ] Test network error (offline mode)
- [ ] Verify error messages are user-friendly
- [ ] Confirm fallback responses work

### Cost Tracking Tests
- [ ] Query ai_usage_stats after messages
- [ ] Calculate estimated costs
- [ ] Verify token counts are reasonable
- [ ] Check cost projections

### UI/UX Tests
- [ ] Usage badge updates after messages
- [ ] Warning banner appears at 45+ messages
- [ ] Error banner dismissible
- [ ] Typing indicator shows during API call
- [ ] Auto-scroll to new messages

---

## 📊 Expected Results Summary

### Happy Path
- ✅ Messages send in 2-4 seconds
- ✅ Responses are nursing-specific and accurate
- ✅ Usage badge updates automatically
- ✅ Database records all interactions
- ✅ Costs stay under budget

### Error Handling
- ✅ Rate limit: Clear message, no crash
- ✅ Server error: Fallback response, retry option
- ✅ Auth error: Sign in prompt
- ✅ Network error: Connection message

### Cost Controls
- ✅ 50 message limit enforced
- ✅ Token usage tracked accurately
- ✅ Costs calculated correctly
- ✅ No surprise API bills

---

## 🚨 Troubleshooting

### Issue: Usage badge shows 0/50 always
**Solution:** Check `ai_usage_stats` table exists and backend is updating it

### Issue: No error message on 429
**Solution:** Verify error handling in `useChatbot.ts` checks `response.status === 429`

### Issue: Backend returns wrong error format
**Solution:** Ensure backend sends `{ error: "message" }` in JSON

### Issue: Cost calculations seem high
**Solution:** 
1. Check if responses are too long (>1000 tokens)
2. Verify token counts in database
3. Review backend prompt engineering

---

## ✅ Test Sign-Off

**Tester:** ___________________  
**Date:** ___________________  
**Version:** ___________________  

**Test Results:**
- [ ] All nursing questions answered correctly
- [ ] Rate limiting works (0, 30, 45, 50 messages)
- [ ] Error handling functional (429, 500, 401, network)
- [ ] Cost tracking accurate
- [ ] UI displays correctly
- [ ] Database updates verified

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Ready for Production:** ☐ YES  ☐ NO (explain why)

---

**Last Updated:** October 24, 2025  
**Document Version:** 1.0
