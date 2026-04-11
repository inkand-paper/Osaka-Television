'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { LayoutDashboard, Package, ImageIcon, Monitor, ArrowRight, CheckCircle, AlertCircle, Clock } from 'lucide-react'

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
    fetchStats()
  }, [])

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-black via-[#111] to-red-950 p-12 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full -mr-20 -mt-20" />
        <div className="relative z-10">
          <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">
            System <span className="text-red-500">Command</span>
          </h1>
          <p className="text-xl text-white/40 max-w-lg font-medium">
            Operational dashboard for OSAKA GROUP. Monitor inventory levels and brand presence in real-time.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Inventory Units', value: stats.totalProducts, detail: 'Total catalog count', icon: Package, color: 'text-white' },
          { label: 'Live Broadcast', value: stats.activeProducts, detail: 'Currently public', icon: CheckCircle, color: 'text-green-500' },
          { label: 'In Maintenance', value: stats.inactiveProducts, detail: 'Hidden from site', icon: AlertCircle, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all duration-500">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{stat.label}</p>
              <p className={`text-6xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-bold text-gray-400 mt-2">{stat.detail}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl group-hover:bg-red-50 transition-colors">
              <stat.icon className={`w-10 h-10 ${stat.color.includes('white') ? 'text-gray-900' : stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Command Center (Quick Actions) */}
      <div className="space-y-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Command Center</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Products', desc: 'Manage TV, Fan, and Cooker inventory.', link: '/osaka-ops/dashboard/products', icon: Monitor, gradient: 'from-orange-50 to-red-50' },
            { title: 'Imagery', desc: 'Sync high-res photography to the gallery.', link: '/osaka-ops/dashboard/gallery', icon: ImageIcon, gradient: 'from-blue-50 to-indigo-50' },
            { title: 'Hero Engine', desc: 'Control cinematic homepage banners.', link: '/osaka-ops/dashboard/hero', icon: LayoutDashboard, gradient: 'from-purple-50 to-pink-50' },
          ].map((action, i) => (
            <Link href={action.link} key={i}>
              <div className={`p-10 rounded-[2.5rem] bg-gradient-to-br ${action.gradient} border-2 border-transparent hover:border-red-600/20 hover:shadow-2xl transition-all duration-500 cursor-pointer group h-full flex flex-col`}>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform duration-500">
                  <action.icon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight group-hover:text-red-600 transition-colors">{action.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{action.desc}</p>
                <div className="mt-auto pt-8 flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-widest">
                  ACCESS MODULE <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Logs Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">System Logs</h2>
          <span className="text-[10px] font-black text-white bg-red-600 px-4 py-1 rounded-full uppercase tracking-widest">Live Monitor</span>
        </div>
        <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center animate-pulse">
            <Clock className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Activity tracking initialization...</p>
        </div>
      </div>
    </div>
  )
}