import { useQuery } from '@tanstack/react-query';
import { getPerformanceStats } from '@/api/performance';

export function usePerformanceStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['performanceStats', userId],
    queryFn: () => getPerformanceStats(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
