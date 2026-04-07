'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function SignupInternal() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
          emailRedirectTo: `${window.location.origin}/osaka-ops`
      }
    })

    if (error) {
      setError(error.message)
    } else {
      alert("Registration successful! Check your email to verify (if enabled) then login.")
      router.push('/osaka-ops')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Create Admin Account</h2>
          <p className="text-gray-500 font-medium tracking-tight">Internal Security Use Only</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold text-gray-700">Official Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="admin@osakagroup.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-2 border-gray-100 focus:border-red-600 transition-all rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold text-gray-700">Strong Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-2 border-gray-100 focus:border-red-600 transition-all rounded-xl"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <Button 
            disabled={loading}
            className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-xl shadow-xl shadow-red-100 transition-all transform active:scale-95"
          >
            {loading ? "Registering..." : "Create Account"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
