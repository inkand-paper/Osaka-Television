'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Toaster } from "@/components/ui/sonner"
import { Menu, X, Home, Image as ImageIcon, Package, Sparkles } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth')
    if (!isAuth) {
      router.push('/admin')
    }
  }, [router])

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    router.push('/admin')
  }

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/dashboard/hero', label: 'Hero Banners', icon: Sparkles },
    { href: '/admin/dashboard/products', label: 'Products', icon: Package },
    { href: '/admin/dashboard/gallery', label: 'Gallery', icon: ImageIcon },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Toaster
        position="bottom-center"
        expand={true}
        richColors
        toastOptions={{
          style: {
            width: '100vw',
            borderRadius: '2px',
            bottom: '0px',
            left: '0px',
            margin: '0px',
          },
          className: "flex justify-center text-lg py-6 font-bold"
        }}
      />

      {/* Top Navigation */}
      <nav className="bg-gradient-to-r from-black to-red-900 text-white shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo & Links */}
            <div className="flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden mr-4 p-2 hover:bg-red-800 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
              
              <Link href="/admin/dashboard">
                <h1 className="text-2xl md:text-3xl font-bold text-white hover:text-red-300 transition cursor-pointer">
                  OSAKA <span className="text-red-400">Admin</span>
                </h1>
              </Link>

              <div className="hidden md:flex space-x-1 ml-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div className={`px-4 py-2 rounded-lg transition font-semibold flex items-center gap-2 ${
                      isActive(link.href) || (link.href !== '/admin/dashboard' && pathname?.includes(link.href))
                        ? 'bg-white text-red-600'
                        : 'text-white hover:bg-red-800'
                      }`}>
                      <link.icon size={18} />
                      {link.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex text-sm bg-red-800 hover:bg-red-700 px-4 py-2 rounded-lg transition font-semibold border border-red-400/30 items-center gap-2"
              >
                🌐 <span className="hidden md:inline">View Site</span>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white text-red-600 hover:bg-gray-100 px-4 md:px-6 py-2 rounded-lg transition font-bold shadow-md text-sm md:text-base flex items-center gap-2"
              >
                <span className="hidden md:inline">Logout</span>
                <span className="md:hidden text-lg">🚪</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-red-800 bg-black/95 backdrop-blur-lg animate-in slide-in-from-top duration-300">
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div className={`px-4 py-4 rounded-xl transition-all font-bold flex items-center gap-4 text-lg ${
                    isActive(link.href) || (link.href !== '/admin/dashboard' && pathname?.includes(link.href))
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-red-900/50 hover:text-white'
                    }`}>
                    <link.icon size={24} />
                    {link.label}
                  </div>
                </Link>
              ))}
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-bold text-gray-300 hover:text-white border border-gray-800 mt-4"
              >
                🌐 View Main Site
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            © 2026 OSAKA GROUP Admin Panel • All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  )
}