import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration_days: number;
  price_usd: number;
  price_inr?: number;
  features: string[];
  config?: {
    ai_messages_per_day?: number;
    voice_tutoring_sessions?: number;
  };
}

export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlan[]>(
    {
      queryKey: ['subscriptionPlans'],
      queryFn: async () => {
        const { data } = await axios.get(
          'https://qsvjvgsnbslgypykuznd.supabase.co/rest/v1/subscription_plans',
          {
            headers: {
              'Content-Type': 'application/json',
              apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdmpzZ3NuYnNsZ3lweWt1em5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTcxNTc2NTAsImV4cCI6MTcxMjcwOTY1MH0.u3qe7hlEkQ0XYI6ZP3CXsm4H8S2M4wdqFdhgWEKltgM',
            },
          }
        );
        return data || [];
      },
      staleTime: 60 * 60 * 1000,
      gcTime: 2 * 60 * 60 * 1000,
    }
  );
}
