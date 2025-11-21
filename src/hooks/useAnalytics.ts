import { useQuery } from '@tanstack/react-query';
import { getAnalytics, AnalyticsData } from '@/api/analytics';

export function useAnalytics(days: number = 30) {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', days],
    queryFn: () => getAnalytics(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
