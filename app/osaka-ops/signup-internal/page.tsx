'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { validateRegistrationKey } from './actions'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function SignupInternal() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [regKey, setRegKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Security Check: Validate key via Server Action
    const isValid = await validateRegistrationKey(regKey)
    if (!isValid) {
      setError("Invalid Registration Key. Access Denied.")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
          data: {
            role: 'admin'
          },
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900 via-black to-black"></div>
      </div>

      <Card className="w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl relative z-10 border-0">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-red-600 rounded-2xl mb-4 shadow-lg shadow-red-200">
            <span className="text-3xl">🛡️</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Create Admin Account</h2>
          <p className="text-gray-500 font-medium tracking-tight">Internal Security Use Only</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold text-gray-700 text-xs uppercase tracking-widest">Official Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="admin@osakagroup.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-2 border-gray-100 focus:border-red-600 transition-all rounded-xl font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold text-gray-700 text-xs uppercase tracking-widest">Strong Password</Label>
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

          <div className="space-y-2">
            <Label htmlFor="regKey" className="font-bold text-red-600 text-xs uppercase tracking-widest flex items-center gap-2">
              <span>Registration Key</span>
              <span className="text-[10px] bg-red-100 px-2 py-0.5 rounded-full">REQUIRED</span>
            </Label>
            <Input 
              id="regKey" 
              type="password" 
              placeholder="Security Key"
              value={regKey}
              onChange={(e) => setRegKey(e.target.value)}
              className="h-12 border-2 border-red-50 focus:border-red-600 transition-all rounded-xl"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <Button 
            disabled={loading}
            className="w-full h-14 bg-black hover:bg-zinc-900 text-white font-black text-lg rounded-xl shadow-xl transition-all transform active:scale-95 uppercase tracking-widest"
          >
            {loading ? "Verifying..." : "Authorize Account"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
