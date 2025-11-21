import { supabase } from '@/lib/supabase'

export interface Module {
  id: string
  title: string
  description: string
  thumbnail_url: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export const getModules = async (): Promise<Module[]> => {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching modules:', error)
    throw error
  }
  
  return data || []
}

export const getModuleById = async (id: string): Promise<Module | null> => {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  
  if (error) {
    console.error('Error fetching module:', error)
    throw error
  }
  
  return data
}
