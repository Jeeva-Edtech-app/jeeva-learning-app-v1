import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  userId: string;
  content: string;
  conversationId?: string;
  context?: {
    lessonId?: string;
    moduleId?: string;
    timestamp?: string;
  };
}

interface RateLimitStatus {
  allowed: boolean;
  limit: number;
  current: number;
  remaining: number;
}

const MAX_DAILY_MESSAGES = 50;

async function getRateLimit(supabase: any, userId: string): Promise<RateLimitStatus> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('ai_usage_stats')
    .select('message_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching rate limit:', error);
  }

  const current = data?.message_count || 0;
  const remaining = Math.max(0, MAX_DAILY_MESSAGES - current);

  return {
    allowed: current < MAX_DAILY_MESSAGES,
    limit: MAX_DAILY_MESSAGES,
    current,
    remaining,
  };
}

async function updateUsageStats(supabase: any, userId: string, tokens: number) {
  try {
    const cost = tokens * 0.000001;
    
    const { error } = await supabase.rpc('increment_ai_usage', {
      p_user_id: userId,
      p_tokens: tokens,
      p_cost: cost,
    });

    if (error) {
      console.error('Error updating usage stats:', error);
    }
  } catch (error) {
    console.error('Failed to update usage stats:', error);
  }
}

async function callGeminiAPI(prompt: string, apiKey: string): Promise<{ content: string; tokens: number }> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
  const tokens = data.usageMetadata?.totalTokenCount || 0;

  return { content, tokens };
}

async function buildSystemPrompt(supabase: any, userId: string, context?: any): Promise<string> {
  let systemPrompt = `You are JeevaBot, an AI assistant helping Indian nurses prepare for the UK NMC CBT exam.

Your role:
- Answer questions about UK nursing practices, NMC Code, and clinical scenarios tailored to their current study material
- Explain medical concepts clearly and professionally
- Provide exam preparation tips and strategies based on their performance
- Recommend focus areas based on their weak points
- Be supportive and encouraging

Guidelines:
- Keep responses concise and focused (max 200 words unless asked for detail)
- Use simple, professional language
- Reference UK standards and NMC Code when relevant
- If unsure, say so and suggest where to find accurate information
- Always relate your answer to their current studies when possible

`;

  try {
    // Fetch current lesson/module context
    let lessonContext = '';
    if (context?.lessonId) {
      const { data: lesson } = await supabase
        .from('lessons')
        .select('title, content, topic_id')
        .eq('id', context.lessonId)
        .single();

      if (lesson) {
        lessonContext = `\n## Current Lesson:\n**${lesson.title}**\n`;
        
        // Fetch topic info
        if (lesson.topic_id) {
          const { data: topic } = await supabase
            .from('topics')
            .select('title, module_id')
            .eq('id', lesson.topic_id)
            .single();
          
          if (topic) {
            lessonContext += `Topic: ${topic.title}\n`;
            
            // Fetch module info
            if (topic.module_id) {
              const { data: module } = await supabase
                .from('modules')
                .select('title')
                .eq('id', topic.module_id)
                .single();
              
              if (module) {
                lessonContext += `Module: ${module.title}\n`;
              }
            }
          }
        }
      }
    }

    // Fetch user performance data
    let performanceContext = '';
    try {
      // Get recent mock exam results
      const { data: recentExams } = await supabase
        .from('mock_exam_results')
        .select('results_data', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentExams && recentExams.length > 0) {
        const scores = recentExams.map(exam => {
          try {
            const data = typeof exam.results_data === 'string' 
              ? JSON.parse(exam.results_data) 
              : exam.results_data;
            return data.score || 0;
          } catch {
            return 0;
          }
        });
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        performanceContext += `\n## Your Performance:\n- Average Mock Exam Score: ${avgScore}%\n`;
      }

      // Get user analytics
      const { data: analytics } = await supabase
        .from('user_analytics')
        .select('analytics_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (analytics && analytics.length > 0) {
        try {
          const analyticsData = typeof analytics[0].analytics_data === 'string' 
            ? JSON.parse(analytics[0].analytics_data) 
            : analytics[0].analytics_data;
          
          if (analyticsData.lessonsCompleted) {
            performanceContext += `- Lessons Completed: ${analyticsData.lessonsCompleted}\n`;
          }
          if (analyticsData.averageScore) {
            performanceContext += `- Overall Average: ${analyticsData.averageScore}%\n`;
          }
          if (analyticsData.currentStreak) {
            performanceContext += `- Current Study Streak: ${analyticsData.currentStreak} days\n`;
          }
        } catch (e) {
          console.error('Error parsing analytics:', e);
        }
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }

    // Fetch AI recommendations
    let recommendationContext = '';
    try {
      const { data: recommendations } = await supabase
        .from('ai_recommendations')
        .select('recommendation_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (recommendations && recommendations.length > 0) {
        recommendationContext = '\n## Recommended Focus Areas:\n';
        recommendations.forEach((rec, index) => {
          try {
            const recData = typeof rec.recommendation_data === 'string' 
              ? JSON.parse(rec.recommendation_data) 
              : rec.recommendation_data;
            if (recData.reason) {
              recommendationContext += `${index + 1}. ${recData.reason}\n`;
            }
          } catch (e) {
            console.error('Error parsing recommendation:', e);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }

    systemPrompt += lessonContext + performanceContext + recommendationContext;
  } catch (error) {
    console.error('Error building enhanced system prompt:', error);
    // Fall back to basic prompt if there's an error
  }

  return systemPrompt;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestData: ChatRequest = await req.json();
    const { userId, content, conversationId, context } = requestData;

    if (!userId || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId and content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rateLimit = await getRateLimit(supabase, userId);
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Daily message limit reached. Please try again tomorrow.',
          code: 'RATE_LIMIT_EXCEEDED',
          rateLimit,
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let currentConversationId = conversationId;

    if (!currentConversationId) {
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: userId,
          title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
          context_data: context || {},
        })
        .select()
        .single();

      if (convError) throw convError;
      currentConversationId = conversation.id;
    }

    const { data: userMessage, error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'user',
        content,
      })
      .select()
      .single();

    if (userMsgError) throw userMsgError;

    const systemPrompt = await buildSystemPrompt(supabase, userId, context);
    const fullPrompt = `${systemPrompt}\n\nUser: ${content}\n\nAssistant:`;

    console.log('Calling Gemini API with model: gemini-2.5-flash');
    const { content: aiResponse, tokens } = await callGeminiAPI(fullPrompt, geminiApiKey);
    console.log('Gemini API response received, tokens:', tokens, 'content length:', aiResponse.length);

    const { data: aiMessage, error: aiMsgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'assistant',
        content: aiResponse,
      })
      .select()
      .single();

    if (aiMsgError) throw aiMsgError;

    try {
      await updateUsageStats(supabase, userId, tokens);
    } catch (statsError) {
      console.error('Usage stats update failed, but continuing:', statsError);
    }

    const updatedRateLimit = await getRateLimit(supabase, userId);

    return new Response(
      JSON.stringify({
        success: true,
        conversationId: currentConversationId,
        userMessage,
        aiMessage,
        rateLimit: updatedRateLimit,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred processing your request',
        code: 'INTERNAL_ERROR',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
