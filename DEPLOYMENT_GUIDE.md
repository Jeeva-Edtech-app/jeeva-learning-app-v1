# 🚀 Deploying JeevaBot Chatbot

Your chatbot is now configured to use Supabase Edge Functions! Follow these steps to deploy it.

## ✅ What's Already Done

- ✅ Edge Functions created (`chat` and `rate-limit`)
- ✅ Mobile app updated to call Edge Functions
- ✅ Gemini AI integration implemented
- ✅ Rate limiting configured (50 messages/day)

## 📋 What You Need to Do

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link Your Project

```bash
supabase link --project-ref qsvjvgsnbslgypykuznd
```

### Step 4: Set Gemini API Key as Secret

Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey), then store it as a Supabase secret (never commit this to your repository):

```bash
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### Step 5: Deploy Database Function

Apply the database migration using Supabase CLI:

```bash
supabase db push
```

This will apply the `increment_usage_stats` function from `supabase/migrations/increment_usage_stats.sql`.

Alternatively, you can run the SQL manually in your Supabase SQL Editor (copy from `supabase/migrations/increment_usage_stats.sql`).

### Step 6: Deploy Edge Functions

```bash
cd supabase/functions
supabase functions deploy chat
supabase functions deploy rate-limit
```

### Step 7: Verify Deployment

```bash
supabase functions list
```

You should see both functions listed as deployed.

### Step 8: Test the Chatbot

1. Restart your Expo app
2. Navigate to the AI Assistant tab
3. Send a test message
4. You should receive a response from JeevaBot!

## 🔍 Troubleshooting

### Issue: Functions not deploying
- Make sure you're logged in: `supabase login`
- Verify project link: `supabase projects list`

### Issue: "GEMINI_API_KEY not configured"
- Set the secret: `supabase secrets set GEMINI_API_KEY=your_key`
- Verify it's set: `supabase secrets list`

### Issue: Rate limit always shows 0 remaining
- Make sure you ran the SQL function in Step 5
- Check the `ai_usage_stats` table exists in your database

### Issue: Chat returns 500 error
- Check function logs: `supabase functions logs chat`
- Verify all environment variables are set
- Ensure database tables exist (chat_conversations, chat_messages, ai_usage_stats)

## 📊 Monitoring

View function logs:
```bash
supabase functions logs chat --tail
```

Check usage stats in your Supabase dashboard under Functions.

## 💰 Cost Control

- Free tier: 50 messages/day per user
- Gemini API: Free tier includes 1500 requests/day
- Monitor usage in Google AI Studio dashboard
- Consider upgrading to paid tiers if you exceed limits

## 🎉 You're Done!

Your chatbot is now live and ready to help students with their NMC exam preparation!
