import { useQuery } from '@tanstack/react-query';

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

const SAMPLE_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    duration_days: 30,
    price_usd: 9.99,
    price_inr: 799,
    features: [
      '✓ Unlimited practice questions',
      '✓ Full learning modules',
      '✓ Mock exams',
    ],
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    duration_days: 90,
    price_usd: 24.99,
    price_inr: 1999,
    features: [
      '✓ Unlimited practice questions',
      '✓ Full learning modules',
      '✓ Unlimited mock exams',
      '✓ Priority support',
    ],
  },
  {
    id: 'annual',
    name: 'Annual Plan',
    duration_days: 365,
    price_usd: 99.99,
    price_inr: 7999,
    features: [
      '✓ Unlimited practice questions',
      '✓ Full learning modules',
      '✓ Unlimited mock exams',
      '✓ Priority support',
      '✓ Lifetime updates',
    ],
  },
];

export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlan[]>(
    {
      queryKey: ['subscriptionPlans'],
      queryFn: async () => {
        return SAMPLE_PLANS;
      },
      staleTime: 60 * 60 * 1000,
      gcTime: 2 * 60 * 60 * 1000,
    }
  );
}
