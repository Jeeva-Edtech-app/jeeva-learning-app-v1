import { supabase } from '@/lib/supabase';
import { subDays, formatISO } from 'date-fns';

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  completionRate: number;
  subscriptionRate: number;
  revenueGrowth: number;
  engagementTrends: {
    date: string;
    activeUsers: number;
    sessions: number;
    avgDuration: number;
  }[];
  conversionMetrics: {
    date: string;
    signups: number;
    conversions: number;
    conversionRate: number;
  }[];
}

async function calculateEngagementTrends(startDate: string, endDate: string) {
  try {
    const trends = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const date = formatISO(subDays(new Date(), 6 - i), { representation: 'date' });
        
        try {
          // Active users for this day
          const { count: dayActiveUsers, error: userError } = await supabase
            .from('analytics_sessions')
            .select('user_id', { count: 'exact', head: true })
            .gte('session_start', `${date} 00:00:00`)
            .lte('session_start', `${date} 23:59:59`);
          
          // Total sessions for this day
          const { count: daySessions, error: sessionsError } = await supabase
            .from('analytics_sessions')
            .select('*', { count: 'exact', head: true })
            .gte('session_start', `${date} 00:00:00`)
            .lte('session_start', `${date} 23:59:59`);
          
          // Average duration for this day
          const { data: sessionsData, error: durationError } = await supabase
            .from('analytics_sessions')
            .select('duration_seconds')
            .gte('session_start', `${date} 00:00:00`)
            .lte('session_start', `${date} 23:59:59`)
            .not('duration_seconds', 'is', null);
          
          if (userError || sessionsError || durationError) {
            return {
              date,
              activeUsers: 0,
              sessions: 0,
              avgDuration: 0,
            };
          }
          
          const avgDuration = sessionsData && sessionsData.length > 0
            ? sessionsData.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessionsData.length / 60
            : 0;
          
          return {
            date,
            activeUsers: dayActiveUsers || 0,
            sessions: daySessions || 0,
            avgDuration: Math.round(avgDuration * 10) / 10,
          };
        } catch (error) {
          return {
            date,
            activeUsers: 0,
            sessions: 0,
            avgDuration: 0,
          };
        }
      })
    );
    
    return trends;
  } catch (error) {
    console.warn('Error calculating engagement trends:', error);
    return Array.from({ length: 7 }, (_, i) => ({
      date: formatISO(subDays(new Date(), 6 - i), { representation: 'date' }),
      activeUsers: 0,
      sessions: 0,
      avgDuration: 0,
    }));
  }
}

async function calculateConversionMetrics(startDate: string, endDate: string) {
  const metrics = await Promise.all(
    Array.from({ length: 7 }, async (_, i) => {
      const date = formatISO(subDays(new Date(), 6 - i), { representation: 'date' });
      
      // Signups for this day
      const { count: daySignups } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${date} 00:00:00`)
        .lte('created_at', `${date} 23:59:59`);
      
      // Conversions (users with subscriptions) for this day
      const { count: dayConversions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('created_at', `${date} 00:00:00`)
        .lte('created_at', `${date} 23:59:59`);
      
      const conversionRate = (daySignups || 0) > 0 
        ? Math.round(((dayConversions || 0) / (daySignups || 1)) * 100 * 10) / 10
        : 0;
      
      return {
        date,
        signups: daySignups || 0,
        conversions: dayConversions || 0,
        conversionRate,
      };
    })
  );
  
  return metrics;
}

async function calculateAvgSessionDuration(startDate: string, endDate: string) {
  try {
    const { data: allSessions, error } = await supabase
      .from('analytics_sessions')
      .select('duration_seconds')
      .gte('session_start', startDate)
      .lte('session_start', endDate)
      .not('duration_seconds', 'is', null);
    
    if (error) {
      console.warn('Could not fetch session duration:', error.message);
      return 0;
    }
    
    const averageSessionDuration = allSessions && allSessions.length > 0
      ? allSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / allSessions.length / 60
      : 0;
    
    return Math.round(averageSessionDuration * 10) / 10;
  } catch (error) {
    console.warn('Error calculating session duration:', error);
    return 0;
  }
}

async function calculateRevenueGrowth() {
  const currentMonth = new Date();
  const lastMonth = subDays(currentMonth, 30);
  
  // Get premium subscriptions from last 30 days
  const { count: currentCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gte('created_at', formatISO(lastMonth, { representation: 'date' }));
  
  // Get premium subscriptions from 30-60 days ago
  const { count: previousCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gte('created_at', formatISO(subDays(lastMonth, 30), { representation: 'date' }))
    .lt('created_at', formatISO(lastMonth, { representation: 'date' }));
  
  const revenueGrowth = (previousCount || 0) > 0 
    ? Math.round((((currentCount || 0) - (previousCount || 0)) / (previousCount || 1)) * 100 * 10) / 10
    : 0;
  
  return revenueGrowth;
}

export async function getAnalytics(days: number = 30): Promise<AnalyticsData> {
  try {
    const endDate = formatISO(new Date(), { representation: 'date' });
    const startDate = formatISO(subDays(new Date(), days), { representation: 'date' });

    // Fetch all data in parallel for better performance
    const [
      usersData,
      profilesData,
      completionsData,
      engagementTrends,
      conversionMetrics,
      averageSessionDuration,
      revenueGrowth,
      sessionsCount,
    ] = await Promise.all([
      // Total users
      supabase.from('users').select('id', { count: 'exact', head: true }),
      
      // Active users (with profiles)
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      
      // Learning completions
      supabase
        .from('learning_completions')
        .select('*', { count: 'exact', head: true })
        .gte('completed_at', startDate)
        .lte('completed_at', endDate),
      
      // Engagement trends
      calculateEngagementTrends(startDate, endDate),
      
      // Conversion metrics
      calculateConversionMetrics(startDate, endDate),
      
      // Average session duration
      calculateAvgSessionDuration(startDate, endDate),
      
      // Revenue growth
      calculateRevenueGrowth(),
      
      // Total sessions - wrapped to handle RLS errors gracefully
      (async () => {
        try {
          return await supabase
            .from('analytics_sessions')
            .select('*', { count: 'exact', head: true })
            .gte('session_start', startDate)
            .lte('session_start', endDate);
        } catch (error) {
          console.warn('Could not fetch sessions count:', error);
          return { count: 0 };
        }
      })(),
    ]);

    // Calculate subscription rate
    const { count: premiumCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const subscriptionRate = (usersData.count || 0) > 0
      ? Math.round(((premiumCount || 0) / (usersData.count || 1)) * 100 * 10) / 10
      : 0;

    // Calculate completion rate
    const { count: totalLessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const completionRate = (totalLessons || 0) > 0
      ? Math.round(((completionsData.count || 0) / (totalLessons || 1)) * 100 * 10) / 10
      : 0;

    return {
      totalUsers: usersData.count || 0,
      activeUsers: profilesData.count || 0,
      totalSessions: sessionsCount.count || 0,
      averageSessionDuration,
      completionRate,
      subscriptionRate,
      revenueGrowth,
      engagementTrends,
      conversionMetrics,
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    
    // Return default values if there's an error
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalSessions: 0,
      averageSessionDuration: 0,
      completionRate: 0,
      subscriptionRate: 0,
      revenueGrowth: 0,
      engagementTrends: Array.from({ length: 7 }, (_, i) => ({
        date: formatISO(subDays(new Date(), 6 - i), { representation: 'date' }),
        activeUsers: 0,
        sessions: 0,
        avgDuration: 0,
      })),
      conversionMetrics: Array.from({ length: 7 }, (_, i) => ({
        date: formatISO(subDays(new Date(), 6 - i), { representation: 'date' }),
        signups: 0,
        conversions: 0,
        conversionRate: 0,
      })),
    };
  }
}

// Helper function to track user session
export async function trackUserSession(userId: string, durationSeconds: number) {
  try {
    const sessionEnd = new Date();
    const sessionStart = new Date(sessionEnd.getTime() - durationSeconds * 1000);

    await supabase.from('user_sessions').insert({
      user_id: userId,
      session_start: sessionStart.toISOString(),
      session_end: sessionEnd.toISOString(),
      duration_seconds: durationSeconds,
    });

    return { success: true };
  } catch (error) {
    console.error('Error tracking session:', error);
    return { success: false, error };
  }
}
