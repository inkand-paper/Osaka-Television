'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Simulate loading
    setTimeout(() => {
      if (password === 'osaka2026') {
        localStorage.setItem('adminAuth', 'true')
        router.push('/admin/dashboard')
      } else {
        setError('Incorrect password. Please try again.')
        setLoading(false)
      }
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-600 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 overflow-hidden">
        {/* Red Top Bar */}
        <div className="h-2 bg-gradient-to-r from-red-600 to-red-800"></div>
        
        <div className="p-10 bg-white">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-black to-red-900 rounded-full mb-4">
              <span className="text-5xl">🔐</span>
            </div>
            <h1 className="text-4xl font-bold text-black mb-2">
              OSAKA <span className="text-red-600">Admin</span>
            </h1>
            <p className="text-gray-600 text-lg">Secure Admin Portal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="password" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                Admin Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-2 h-12 text-lg border-2 focus:border-red-600 focus:ring-2 focus:ring-red-200"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                <p className="text-red-600 text-sm font-semibold flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging in...
                </span>
              ) : (
                <span>🔓 Login to Dashboard</span>
              )}
            </Button>
          </form>

          {/* Helper Text */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              <span className="font-semibold">Demo Password:</span> osaka2026
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              For security, change this password in production
            </p>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="h-2 bg-gradient-to-r from-red-800 to-red-600"></div>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-white text-sm">
        <p className="opacity-75">© 2026 OSAKA GROUP • Admin Panel</p>
      </div>
    </div>
  )
}