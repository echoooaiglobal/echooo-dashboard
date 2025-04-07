'use client'

import { useEffect } from 'react'

export default function TestAPICall() {
  useEffect(() => {
    const testAPI = async () => {
      console.log('🟢 [Client] Making API call...')
      try {
        const res = await fetch('/api/discover/influencers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true })
        })
        const data = await res.json()
        console.log('🟢 [Client] API response:', data)
      } catch (error) {
        console.error('🔴 [Client] API error:', error)
      }
    }
    testAPI()
  }, [])

  return <div>Check browser console for API test results</div>
}