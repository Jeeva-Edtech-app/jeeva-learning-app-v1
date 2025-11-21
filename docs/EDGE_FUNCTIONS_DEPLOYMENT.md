# 🚀 Deploy Supabase Edge Functions (Docker-Free for Replit)

## Problem
Replit doesn't support Docker, so the standard `supabase functions deploy` command fails.

## ✅ Solution: Use `--use-api` Flag

The Supabase CLI supports Docker-free deployment using the Management API.

---

## 📋 Prerequisites

You need a Supabase Access Token:

### Get Your Access Token

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click your profile icon (top-right) → **Access Tokens**
3. Click **Generate New Token**
4. Give it a name (e.g., "Replit Deployment")
5. Copy the token (it won't be shown again!)

### Add Token to Replit Secrets

1. In Replit, click **Tools** → **Secrets**
2. Add a new secret:
   - **Key**: `SUPABASE_ACCESS_TOKEN`
   - **Value**: Your access token

---

## 🚀 Deployment Commands

### Deploy Both Functions

```bash
# Make sure you're in the project root
supabase functions deploy chat --use-api --project-ref qsvjvgsnbslgypykuznd
supabase functions deploy rate-limit --use-api --project-ref qsvjvgsnbslgypykuznd
```

### Set Gemini API Key Secret

Before deploying, ensure your Gemini API key is stored as a Supabase secret:

```bash
# This is already done based on terminal output, but to verify:
supabase secrets list --project-ref qsvjvgsnbslgypykuznd
```

If not set, add it:
```bash
supabase secrets set GEMINI_API_KEY=AIzaSyAp4XRAbjKkOpdPdcEK7cvxLC_Srpwch5A --project-ref qsvjvgsnbslgypykuznd
```

### Verify Deployment

```bash
supabase functions list --project-ref qsvjvgsnbslgypykuznd
```

You should see:
```
┌─────────────┬────────────┬─────────┬────────────────────────┐
│ Function    │ Status     │ Version │ Updated At             │
├─────────────┼────────────┼─────────┼────────────────────────┤
│ chat        │ ACTIVE     │ 1       │ 2024-11-16T04:50:00Z   │
│ rate-limit  │ ACTIVE     │ 1       │ 2024-11-16T04:50:05Z   │
└─────────────┴────────────┴─────────┴────────────────────────┘
```

### View Logs (Troubleshooting)

```bash
supabase functions logs chat --project-ref qsvjvgsnbslgypykuznd
```

---

## 🔄 Update Functions

Whenever you change the Edge Function code, re-deploy:

```bash
supabase functions deploy chat --use-api --project-ref qsvjvgsnbslgypykuznd
```

---

## ⚠️ Important Notes

1. **No Docker Required**: The `--use-api` flag uses the Management API instead of Docker
2. **CLI Version**: Works with Supabase CLI v2.13.3+
3. **Access Token**: Store it securely in Replit Secrets, never commit to Git
4. **Project Ref**: `qsvjvgsnbslgypykuznd` is your Supabase project ID

---

## 🧪 Test After Deployment

1. Restart your Expo app workflow
2. Navigate to the **AI Assistant** tab
3. Send a message: "Hello JeevaBot!"
4. You should get an AI response

If you see "Failed to fetch":
- Check function logs: `supabase functions logs chat --project-ref qsvjvgsnbslgypykuznd`
- Verify deployment: `supabase functions list --project-ref qsvjvgsnbslgypykuznd`
- Check secrets: `supabase secrets list --project-ref qsvjvgsnbslgypykuznd`

---

## 📚 Edge Functions Overview

### `/chat` Function
- Handles AI conversations with Gemini
- Manages chat history in database
- Enforces 50 messages/day rate limit
- Auto-creates conversations
- Returns streaming-compatible responses

### `/rate-limit` Function
- Checks user's daily AI usage
- Returns remaining message count
- Resets at midnight UTC

---

## 🎉 You're Done!

Your chatbot is now deployed and accessible at:
```
https://qsvjvgsnbslgypykuznd.supabase.co/functions/v1/chat
https://qsvjvgsnbslgypykuznd.supabase.co/functions/v1/rate-limit
```
