'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    console.log("Attempting login for:", email)
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("Auth Error:", authError)
        setError(authError.message)
      } else if (data?.user) {
        console.log("Login successful, redirecting...")
        router.push('/osaka-ops/dashboard')
      } else {
        console.warn("No user data returned")
        setError("Login failed. Please check your credentials.")
      }
    } catch (err) {
      console.error("Unexpected Error during login:", err)
      setError('An unexpected system error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-600 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 overflow-hidden rounded-3xl">
        <div className="h-2 bg-gradient-to-r from-red-600 to-red-800"></div>
        
        <div className="p-10 bg-white">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-black to-red-900 rounded-full mb-4 shadow-xl">
              <span className="text-5xl">🔐</span>
            </div>
            <h1 className="text-4xl font-black text-black mb-2">
              OSAKA <span className="text-red-600">Secure</span>
            </h1>
            <p className="text-gray-500 font-bold tracking-widest text-xs uppercase">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-black text-xs uppercase tracking-widest">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@osakagroup.com"
                className="h-14 text-base border-2 border-gray-100 focus:border-red-600 transition-all rounded-xl font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-black text-xs uppercase tracking-widest">
                Secret Key
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-14 text-base border-2 border-gray-100 focus:border-red-600 transition-all rounded-xl"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl">
                <p className="text-red-600 text-sm font-bold flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-black bg-black hover:bg-gray-900 text-white shadow-xl rounded-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <span>Unlock Access</span>
                  <span className="text-xl">→</span>
                </>
              )}
            </Button>
            <div className="text-center pt-4">
              <Link href="/osaka-ops/signup-internal" className="text-sm text-gray-500 hover:text-red-600 transition font-bold">
                New installation? Create admin account →
              </Link>
            </div>
          </form>
        </div>
        <div className="h-2 bg-gradient-to-r from-red-800 to-red-600"></div>
      </Card>

      <div className="absolute bottom-6 text-center text-white text-xs font-bold uppercase tracking-[0.3em] opacity-40">
        Hardware Level Encryption • OSAKA Secure Core
      </div>
    </div>
  )
}
