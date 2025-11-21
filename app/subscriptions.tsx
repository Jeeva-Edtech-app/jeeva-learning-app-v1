import { useEffect } from 'react'
import { useRouter } from 'expo-router'

export default function SubscriptionsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to plans screen
    router.replace('/(tabs)/plans' as any)
  }, [router])

  return null
}
