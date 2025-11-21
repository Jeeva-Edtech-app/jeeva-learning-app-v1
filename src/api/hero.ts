import { supabase } from '@/lib/supabase'
import { QueryClient } from '@tanstack/react-query'

export interface HeroSection {
  id: string
  title: string
  subtitle: string | null
  image_url: string | null
  cta_text: string | null
  cta_link: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export const HERO_BANNERS_QUERY_KEY = ['hero-banners']

/**
 * Fetch all active hero sections ordered by display_order
 */
export async function getActiveHeroSections(): Promise<HeroSection[]> {
  const { data, error } = await supabase
    .from('hero_sections')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching hero sections:', error)
    throw error
  }

  console.log('Hero sections fetched:', JSON.stringify(data, null, 2))
  return data || []
}

/**
 * Preload hero banners during app initialization
 * This runs BEFORE the home screen renders for instant display
 */
export async function preloadHeroBanners(queryClient: QueryClient): Promise<void> {
  try {
    await queryClient.prefetchQuery({
      queryKey: HERO_BANNERS_QUERY_KEY,
      queryFn: getActiveHeroSections,
      staleTime: 10 * 60 * 1000,
    })
    console.log('✅ Hero banners preloaded successfully')
  } catch (error) {
    console.warn('⚠️ Failed to preload hero banners:', error)
  }
}

/**
 * Fetch a single hero section by ID
 */
export async function getHeroSectionById(id: string): Promise<HeroSection | null> {
  const { data, error } = await supabase
    .from('hero_sections')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching hero section:', error)
    return null
  }

  return data
}
