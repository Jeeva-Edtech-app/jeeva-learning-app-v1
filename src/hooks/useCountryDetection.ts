import { useState, useEffect } from 'react'
import type { CountryInfo } from '@/types/subscription'

const EXCHANGE_RATES: Record<string, number> = {
  IN: 83.5,
  US: 1,
  GB: 0.79,
  CA: 1.36,
  AU: 1.53,
  NZ: 1.64,
  SG: 1.35,
  AE: 3.67,
  DEFAULT: 1,
}

const PAYMENT_PROVIDERS: Record<string, 'stripe' | 'razorpay'> = {
  IN: 'razorpay',
}

export function useCountryDetection() {
  const [country, setCountry] = useState<CountryInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    detectCountry()
  }, [])

  async function detectCountry() {
    try {
      setLoading(true)

      // Try IP geolocation
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()

      const countryCode = data.country_code || 'US'
      const countryName = data.country_name || 'United States'
      const currency = getCurrencyForCountry(countryCode)
      const paymentProvider = getPaymentProvider(countryCode)

      setCountry({
        countryCode,
        countryName,
        currency,
        paymentProvider,
      })
    } catch (error) {
      console.error('Error detecting country:', error)
      // Default to US
      setCountry({
        countryCode: 'US',
        countryName: 'United States',
        currency: 'usd',
        paymentProvider: 'stripe',
      })
    } finally {
      setLoading(false)
    }
  }

  function getPaymentProvider(countryCode: string): 'stripe' | 'razorpay' {
    return PAYMENT_PROVIDERS[countryCode] || 'stripe'
  }

  function getCurrencyForCountry(countryCode: string): string {
    const currencyMap: Record<string, string> = {
      IN: 'inr',
      US: 'usd',
      GB: 'gbp',
      CA: 'cad',
      AU: 'aud',
      NZ: 'nzd',
      SG: 'sgd',
      AE: 'aed',
    }
    return currencyMap[countryCode] || 'usd'
  }

  function convertPrice(usdPrice: number, countryCode: string = country?.countryCode || 'US'): number {
    const rate = EXCHANGE_RATES[countryCode] || EXCHANGE_RATES.DEFAULT
    return Math.round(usdPrice * rate * 100) / 100
  }

  function formatPrice(usdPrice: number, countryCode?: string): string {
    const cc = countryCode || country?.countryCode || 'US'
    const converted = convertPrice(usdPrice, cc)
    const currency = getCurrencyForCountry(cc)
    const symbol = getCurrencySymbol(currency)
    return `${symbol}${converted}`
  }

  function getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      usd: '$',
      inr: '₹',
      gbp: '£',
      cad: 'C$',
      aud: 'A$',
      nzd: 'NZ$',
      sgd: 'S$',
      aed: 'AED',
    }
    return symbols[currency] || '$'
  }

  return {
    country,
    loading,
    getPaymentProvider,
    getCurrencyForCountry,
    convertPrice,
    formatPrice,
    getCurrencySymbol,
  }
}
