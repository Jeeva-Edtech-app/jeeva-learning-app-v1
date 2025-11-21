# Supabase Edge Functions for JeevaBot

This directory contains Supabase Edge Functions that power the AI chatbot functionality.

## Functions

### 1. `chat` - Main chatbot endpoint
Handles sending messages to JeevaBot and receiving AI responses from Gemini.

**Endpoint:** `POST /functions/v1/chat`

**Request:**
```json
{
  "userId": "uuid",
  "content": "User's message",
  "conversationId": "uuid (optional)",
  "context": {
    "lessonId": "uuid (optional)",
    "moduleId": "uuid (optional)"
  }
}
```

**Response:**
```json
{
  "success": true,
  "conversationId": "uuid",
  "userMessage": { /* message object */ },
  "aiMessage": { /* message object */ },
  "rateLimit": {
    "allowed": true,
    "limit": 50,
    "current": 5,
    "remaining": 45
  }
}
```

### 2. `rate-limit` - Check user quota
Returns the user's current AI message usage and remaining quota.

**Endpoint:** `GET /functions/v1/rate-limit/{userId}`

**Response:**
```json
{
  "rateLimit": {
    "allowed": true,
    "limit": 50,
    "current": 5,
    "remaining": 45
  }
}
```

## Deployment

### Prerequisites
1. [Supabase CLI](https://supabase.com/docs/guides/cli) installed
2. Supabase project created
3. Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Steps

1. **Link your Supabase project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

2. **Set environment secrets:**
   ```bash
   supabase secrets set GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Create the database function:**
   Run the SQL migration in your Supabase SQL editor:
   ```bash
   supabase db push
   ```
   
   Or manually run the SQL in `supabase/migrations/increment_usage_stats.sql`

4. **Deploy the functions:**
   ```bash
   supabase functions deploy chat
   supabase functions deploy rate-limit
   ```

5. **Verify deployment:**
   ```bash
   supabase functions list
   ```

## Environment Variables

The Edge Functions require these secrets to be set in Supabase:

- `GEMINI_API_KEY` - Your Google AI API key
- `SUPABASE_URL` - Automatically provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically provided by Supabase

## Testing Locally

1. **Start Supabase locally:**
   ```bash
   supabase start
   ```

2. **Serve functions locally:**
   ```bash
   supabase functions serve
   ```

3. **Test the chat endpoint:**
   ```bash
   curl -i --location --request POST 'http://localhost:54321/functions/v1/chat' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"userId":"test-user-id","content":"Hello JeevaBot!"}'
   ```

## Rate Limiting

- Free users: 50 messages per day
- Tracked in `ai_usage_stats` table
- Resets daily at midnight UTC
- Returns 429 status when limit exceeded

## Cost Control

The chatbot uses Gemini 1.5 Flash which has generous free tier limits:
- 15 requests per minute
- 1 million requests per day
- 1500 requests per day (free tier)

Monitor usage in Google AI Studio dashboard.
