'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Toaster } from "@/components/ui/sonner"
import { Menu, X, Home, Image as ImageIcon, Package, Sparkles, LogOut, ExternalLink, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) setAdminEmail(user.email)
    }
    getUser()
  }, [])

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/osaka-ops')
  }

  const isActive = (path: string) =>
    path === '/osaka-ops/dashboard'
      ? pathname === path
      : pathname?.startsWith(path)

  const navLinks = [
    { href: '/osaka-ops/dashboard', label: 'Dashboard', icon: Home, description: 'Overview & Stats' },
    { href: '/osaka-ops/dashboard/hero', label: 'Hero Banners', icon: Sparkles, description: 'Homepage Carousel' },
    { href: '/osaka-ops/dashboard/products', label: 'Products', icon: Package, description: 'Inventory Management' },
    { href: '/osaka-ops/dashboard/gallery', label: 'Gallery', icon: ImageIcon, description: 'Media Library' },
  ]

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Toaster
        position="bottom-center"
        expand={true}
        richColors
        toastOptions={{
          style: {
            width: '100vw',
            borderRadius: '0px',
            bottom: '0px',
            left: '0px',
            margin: '0px',
          },
          className: "flex justify-center text-base py-5 font-bold"
        }}
      />

      {/* ── Top Navigation Bar ── */}
      <nav
        className="sticky top-0 z-50 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0000 50%, #2d0000 100%)',
          borderBottom: '1px solid rgba(220,38,38,0.25)',
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-[68px]">

            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-red-900/40 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <Link href="/osaka-ops/dashboard" className="flex items-center gap-3 group">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-md group-hover:scale-105 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #7f1d1d)' }}
                >
                  OG
                </div>
                <div className="hidden sm:block">
                  <span className="text-white font-black text-lg tracking-tight leading-none">
                    OSAKA
                  </span>
                  <span className="block text-red-400 text-[10px] font-bold uppercase tracking-[0.2em] leading-none mt-0.5">
                    Command Center
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Pills */}
              <div className="hidden md:flex items-center gap-1 ml-6">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div
                      className={`px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 text-sm ${
                        isActive(link.href)
                          ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <link.icon size={15} />
                      {link.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Admin badge */}
              {adminEmail && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400 font-medium">{adminEmail.split('@')[0]}</span>
                </div>
              )}

              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold border border-white/10"
              >
                <ExternalLink size={14} />
                <span className="hidden md:inline">View Site</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all bg-white text-red-700 hover:bg-gray-100 shadow-md active:scale-95"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t border-red-900/40 backdrop-blur-xl"
            style={{ background: 'rgba(10,10,10,0.97)' }}
          >
            <div className="px-4 py-4 space-y-1.5">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div
                    className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all font-bold ${
                      isActive(link.href)
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-red-900/30 hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive(link.href) ? 'bg-white/20' : 'bg-white/5'}`}>
                      <link.icon size={20} />
                    </div>
                    <div>
                      <div className="text-base">{link.label}</div>
                      <div className={`text-xs font-medium mt-0.5 ${isActive(link.href) ? 'text-red-200' : 'text-gray-500'}`}>
                        {link.description}
                      </div>
                    </div>
                    <ChevronRight size={16} className="ml-auto opacity-50" />
                  </div>
                </Link>
              ))}

              <div className="border-t border-white/10 mt-3 pt-3 space-y-1.5">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-semibold"
                >
                  <ExternalLink size={18} />
                  View Main Site
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all font-semibold"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Breadcrumb Strip ── */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5">
        <div className="max-w-screen-2xl mx-auto flex items-center gap-2 text-xs text-gray-400 font-semibold">
          <Link href="/osaka-ops/dashboard" className="hover:text-red-600 transition-colors">Home</Link>
          {pathname !== '/osaka-ops/dashboard' && (
            <>
              <ChevronRight size={12} />
              <span className="text-gray-700">
                {navLinks.find(l => pathname?.startsWith(l.href) && l.href !== '/osaka-ops/dashboard')?.label}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer
        className="py-5 mt-8 border-t border-gray-200"
        style={{ background: 'linear-gradient(to right, #0a0a0a, #1a0000)' }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500 font-medium">
            © 2026 <span className="text-red-500 font-bold">OSAKA GROUP</span> Command Center • All Rights Reserved
          </p>
          <p className="text-xs text-gray-600 font-medium">
            🔒 Secure Admin Environment
          </p>
        </div>
      </footer>
    </div>
  )
}