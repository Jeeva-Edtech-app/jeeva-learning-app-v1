import { useQuery } from '@tanstack/react-query';
import { getSubscriptionStatus, getSubscriptionPlans } from '@/api/subscription';

export function useSubscriptionStatus(userId: string | undefined) {
  return useQuery({
    queryKey: ['subscriptionStatus', userId],
    queryFn: () => getSubscriptionStatus(userId!),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: getSubscriptionPlans,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
