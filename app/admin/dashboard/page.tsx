'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0
  })

  const fetchStats = async () => {
    const { data } = await supabase.from('products').select('is_active')
    
    if (data) {
      setStats({
        totalProducts: data.length,
        activeProducts: data.filter(p => p.is_active).length,
        inactiveProducts: data.filter(p => !p.is_active).length
      })
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats()
  }, [])

  return (
    <div>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-black to-red-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 mb-8 rounded-lg">
        <h1 className="text-5xl font-bold text-white mb-3">
          Welcome Back! 👋
        </h1>
        <p className="text-xl text-gray-300">
          Manage your OSAKA Television products and content
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-8 border-l-4 border-red-600 bg-white shadow-lg hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2 uppercase tracking-wide">Total Products</p>
              <p className="text-5xl font-bold text-red-600">{stats.totalProducts}</p>
              <p className="text-xs text-gray-500 mt-2">All product models</p>
            </div>
            <div className="bg-red-100 p-6 rounded-full">
              <span className="text-5xl">📺</span>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-l-4 border-green-600 bg-white shadow-lg hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2 uppercase tracking-wide">Active Products</p>
              <p className="text-5xl font-bold text-green-600">{stats.activeProducts}</p>
              <p className="text-xs text-gray-500 mt-2">Currently visible</p>
            </div>
            <div className="bg-green-100 p-6 rounded-full">
              <span className="text-5xl">✅</span>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-l-4 border-yellow-600 bg-white shadow-lg hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2 uppercase tracking-wide">Messages</p>
              <p className="text-5xl font-bold text-yellow-600">0</p>
              <p className="text-xs text-gray-500 mt-2">Contact inquiries</p>
            </div>
            <div className="bg-yellow-100 p-6 rounded-full">
              <span className="text-5xl">💬</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/dashboard/products">
            <Card className="p-8 hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-red-600 bg-gradient-to-br from-white to-red-50 group">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏷️</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-red-600 transition">
                Manage Products
              </h3>
              <p className="text-gray-600">Add, edit, or remove products from your inventory</p>
              <div className="mt-4 text-red-600 font-semibold group-hover:underline">
                Go to Products →
              </div>
            </Card>
          </Link>

          <Link href="/admin/dashboard/gallery">
            <Card className="p-8 hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-red-600 bg-gradient-to-br from-white to-blue-50 group">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🖼️</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-red-600 transition">
                Manage Gallery
              </h3>
              <p className="text-gray-600">Upload and organize your company photos</p>
              <div className="mt-4 text-red-600 font-semibold group-hover:underline">
                Go to Gallery →
              </div>
            </Card>
          </Link>

          <Link href="/admin/dashboard/messages">
            <Card className="p-8 hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-red-600 bg-gradient-to-br from-white to-yellow-50 group">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">💬</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-red-600 transition">
                View Messages
              </h3>
              <p className="text-gray-600">Check customer inquiries and feedback</p>
              <div className="mt-4 text-red-600 font-semibold group-hover:underline">
                Go to Messages →
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-lg">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
        </div>
        <div className="p-8 text-center text-gray-500">
          <span className="text-4xl mb-4 block">📊</span>
          <p>Activity tracking coming soon...</p>
        </div>
      </Card>
    </div>
  )
}