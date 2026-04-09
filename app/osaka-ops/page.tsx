'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { isUserAdmin } from './signup-internal/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionUser, setSessionUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const isAdminRole = user.user_metadata?.role === 'admin'
        const isWhitelisted = await isUserAdmin(user.email)
        
        if (isAdminRole || isWhitelisted) {
          router.push('/osaka-ops/dashboard')
        } else {
          setSessionUser(user)
        }
      }
    }
    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
      } else if (data?.user) {
        const isAdminRole = data.user.user_metadata?.role === 'admin'
        const isWhitelisted = await isUserAdmin(data.user.email)
        if (isAdminRole || isWhitelisted) {
          router.push('/osaka-ops/dashboard')
        } else {
          setError("Access Denied: Your account does not have administrative privileges.")
          setSessionUser(data.user)
        }
      }
    } catch (err) {
      setError('An unexpected system error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSessionUser(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-600 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 overflow-hidden rounded-3xl">
        <div className="h-2 bg-gradient-to-r from-red-600 to-red-800"></div>
        
        <div className="p-10 bg-white">
          {sessionUser && !error.includes("Denied") ? (
            <div className="text-center space-y-6">
               <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
                  <span className="text-5xl">🚫</span>
               </div>
               <h2 className="text-2xl font-black text-black">Unauthorized Access</h2>
               <p className="text-gray-600">You are logged in as <span className="font-bold text-red-600">{sessionUser.email}</span>, but this account is not authorized to access the Osaka Command Center.</p>
               <Button onClick={handleLogout} className="w-full h-14 bg-black text-white font-bold rounded-xl">Sign Out & Try Again</Button>
            </div>
          ) : (
            <>
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
                  <Label htmlFor="email" className="text-gray-700 font-black text-xs uppercase tracking-widest">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@osakagroup.com" className="h-14 text-base border-2 border-gray-100 focus:border-red-600 transition-all rounded-xl font-medium" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-black text-xs uppercase tracking-widest">Secret Key</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-14 text-base border-2 border-gray-100 focus:border-red-600 transition-all rounded-xl" required />
                </div>
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl">
                    <p className="text-red-600 text-sm font-bold flex items-center gap-2"><span>⚠️</span> {error}</p>
                    {sessionUser && <Button onClick={handleLogout} variant="link" className="text-xs text-red-700 p-0 h-auto font-bold mt-2 underline">Sign out {sessionUser.email}</Button>}
                  </div>
                )}
                <Button type="submit" className="w-full h-14 text-lg font-black bg-black hover:bg-gray-900 text-white shadow-xl rounded-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest" disabled={loading}>
                  {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span>Unlock Access →</span>}
                </Button>
                <div className="text-center pt-4">
                  <Link href="/osaka-ops/signup-internal" className="text-sm text-gray-500 hover:text-red-600 transition font-bold italic">
                    Security Provisioning Required? Contact System Admin
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
        <div className="h-2 bg-gradient-to-r from-red-800 to-red-600"></div>
      </Card>
      <div className="absolute bottom-6 text-center text-white text-xs font-bold uppercase tracking-[0.3em] opacity-40">Hardware Level Encryption • OSAKA Secure Core</div>
    </div>
  )
}
