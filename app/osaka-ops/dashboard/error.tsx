// app/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-6">We're working on fixing this issue.</p>
        <Button onClick={reset} className="bg-red-600 hover:bg-red-700">
          Try again
        </Button>
      </div>
    </div>
  )
}