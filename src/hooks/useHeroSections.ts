import { useQuery } from '@tanstack/react-query'
import { getActiveHeroSections, HERO_BANNERS_QUERY_KEY } from '@/api/hero'

export function useHeroSections() {
  return useQuery({
    queryKey: HERO_BANNERS_QUERY_KEY,
    queryFn: getActiveHeroSections,
    staleTime: 10 * 60 * 1000,
  })
}
