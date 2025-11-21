import * as Localization from 'expo-localization'

export const countryDetectionService = {
  getCountryFromDevice(): string {
    const region = Localization.region
    return region || 'GB'
  },

  async getCountryFromProfile(userId: string): Promise<string> {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('user_profiles')
        .select('country_code')
        .eq('user_id', userId)
        .single()

      if (error || !data?.country_code) {
        return this.getCountryFromDevice()
      }

      return data.country_code
    } catch (error) {
      console.error('Failed to get country from profile:', error)
      return this.getCountryFromDevice()
    }
  },

  async getCountryFromIP(): Promise<string> {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      return data.country_code || 'GB'
    } catch (error) {
      console.error('Failed to get country from IP:', error)
      return this.getCountryFromDevice()
    }
  },

  async getUserCountry(userId?: string): Promise<string> {
    if (userId) {
      const profileCountry = await this.getCountryFromProfile(userId)
      if (profileCountry && profileCountry !== 'GB') return profileCountry
    }

    const deviceCountry = this.getCountryFromDevice()
    if (deviceCountry && deviceCountry !== 'GB') return deviceCountry

    return await this.getCountryFromIP()
  },
}
