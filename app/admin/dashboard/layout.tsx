'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Toaster } from "@/components/ui/sonner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth')
    if (!isAuth) {
      router.push('/admin')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    router.push('/admin')
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
            <div className="flex items-center space-x-8">
              <Link href="/admin/dashboard">
                <h1 className="text-3xl font-bold text-white hover:text-red-300 transition cursor-pointer mr-4">
                  OSAKA <span className="text-red-400">Admin</span>
                </h1>
              </Link>

              <div className="hidden md:flex space-x-1">
                <Link href="/admin/dashboard">
                  <div className={`px-4 py-2 rounded-lg transition font-semibold ${isActive('/admin/dashboard')
                      ? 'bg-white text-red-600'
                      : 'text-white hover:bg-red-800'
                    }`}>
                    🏠 Dashboard
                  </div>
                </Link>

                {/* NEW HERO BANNER LINK ADDED HERE */}
                <Link href="/admin/dashboard/hero">
                  <div className={`px-4 py-2 rounded-lg transition font-semibold ${pathname?.includes('/hero')
                      ? 'bg-white text-red-600'
                      : 'text-white hover:bg-red-800'
                    }`}>
                    ✨ Hero Banners
                  </div>
                </Link>

                <Link href="/admin/dashboard/products">
                  <div className={`px-4 py-2 rounded-lg transition font-semibold ${pathname?.includes('/products')
                      ? 'bg-white text-red-600'
                      : 'text-white hover:bg-red-800'
                    }`}>
                    🏷️ Products
                  </div>
                </Link>

                <Link href="/admin/dashboard/gallery">
                  <div className={`px-4 py-2 rounded-lg transition font-semibold ${pathname?.includes('/gallery')
                      ? 'bg-white text-red-600'
                      : 'text-white hover:bg-red-800'
                    }`}>
                    🖼️ Gallery
                  </div>
                </Link>

                <Link href="/admin/dashboard/messages">
                  <div className={`px-4 py-2 rounded-lg transition font-semibold ${pathname?.includes('/messages')
                      ? 'bg-white text-red-600'
                      : 'text-white hover:bg-red-800'
                    }`}>
                    💬 Messages
                  </div>
                </Link>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                target="_blank"
                className="text-sm bg-red-800 hover:bg-red-700 px-4 py-2 rounded-lg transition font-semibold border border-red-400/30"
              >
                🌐 View Site
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white text-red-600 hover:bg-gray-100 px-6 py-2 rounded-lg transition font-bold shadow-lg"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            © 2026 OSAKA Television Admin Panel • All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  )
}