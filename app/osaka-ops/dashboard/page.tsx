'use client'



import { useEffect, useState} from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Package, Image as ImageIcon, Sparkles, TrendingUp, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    totalSlides: 0,
    totalGallery: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    const [products, slides, gallery] = await Promise.all([
      supabase.from('products').select('is_active'),
      supabase.from('hero_slides').select('id'),
      supabase.from('gallery').select('id'),
    ])

    const productData = products.data || []
    setStats({
      totalProducts: productData.length,
      activeProducts: productData.filter(p => p.is_active).length,
      inactiveProducts: productData.filter(p => !p.is_active).length,
      totalSlides: slides.data?.length || 0,
      totalGallery: gallery.data?.length || 0,
    })
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      sub: 'In inventory',
      icon: Package,
      color: 'from-red-600 to-red-800',
      bg: 'bg-red-50',
      iconColor: 'text-red-600',
      border: 'border-red-200',
    },
    {
      label: 'Live Online',
      value: stats.activeProducts,
      sub: 'Visible to customers',
      icon: Eye,
      color: 'from-emerald-500 to-emerald-700',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      border: 'border-emerald-200',
    },
    {
      label: 'Hidden / Inactive',
      value: stats.inactiveProducts,
      sub: 'Not visible on site',
      icon: EyeOff,
      color: 'from-amber-500 to-amber-700',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      border: 'border-amber-200',
    },
    {
      label: 'Hero Slides',
      value: stats.totalSlides,
      sub: 'Homepage banners',
      icon: Sparkles,
      color: 'from-violet-500 to-violet-700',
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      border: 'border-violet-200',
    },
    {
      label: 'Gallery Photos',
      value: stats.totalGallery,
      sub: 'Showroom images',
      icon: ImageIcon,
      color: 'from-sky-500 to-sky-700',
      bg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      border: 'border-sky-200',
    },
  ]

  const quickActions = [
    {
      href: '/osaka-ops/dashboard/products',
      icon: Package,
      title: 'Products',
      description: 'Add, edit, or remove products. Toggle visibility, manage pricing and discount badges.',
      accent: 'from-red-600 to-red-800',
      badge: `${stats.totalProducts} items`,
    },
    {
      href: '/osaka-ops/dashboard/hero',
      icon: Sparkles,
      title: 'Hero Banners',
      description: 'Control the homepage carousel slides — images, titles, and display order.',
      accent: 'from-violet-600 to-violet-800',
      badge: `${stats.totalSlides} slides`,
    },
    {
      href: '/osaka-ops/dashboard/gallery',
      icon: ImageIcon,
      title: 'Photo Gallery',
      description: 'Upload and organize showroom and factory photos displayed on the website.',
      accent: 'from-sky-600 to-sky-800',
      badge: `${stats.totalGallery} photos`,
    },
  ]

  return (
    <div className="space-y-8">

      {/* ── Welcome Banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-10 md:px-10"
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0000 40%, #2d0505 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #dc2626, transparent)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-bold uppercase tracking-widest">All Systems Active</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Welcome back, <span className="text-red-400">Admin</span> 👋
          </h1>
          <p className="text-gray-400 mt-3 text-base md:text-lg font-medium max-w-lg">
            Here&apos;s a live snapshot of your OSAKA GROUP storefront. Manage products, banners, and gallery photos from here.
          </p>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
          <TrendingUp size={14} />
          Live Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((card, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border ${card.border} p-5 shadow-sm hover:shadow-md transition-all group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.bg} p-2.5 rounded-xl`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <div>
                {loading ? (
                  <div className="h-8 w-16 bg-gray-100 animate-pulse rounded-lg mb-1" />
                ) : (
                  <div className="text-3xl font-black text-gray-900 leading-none">{card.value}</div>
                )}
                <div className="text-xs font-bold text-gray-500 mt-1.5">{card.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{card.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href} className="group">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-red-300 hover:shadow-xl transition-all duration-300 h-full">
                {/* Accent top bar */}
                <div className={`h-1.5 bg-gradient-to-r ${action.accent}`} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-xl"
                      style={{ background: 'linear-gradient(135deg, #1a0000, #2d0505)' }}
                    >
                      <action.icon className="w-6 h-6 text-red-400" />
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full">
                      {action.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">
                    {action.description}
                  </p>

                  <div className="flex items-center gap-2 text-red-600 font-bold text-sm group-hover:gap-3 transition-all">
                    Open Manager
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Info Banner ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="bg-amber-100 p-2.5 rounded-xl shrink-0">
          <span className="text-xl">💡</span>
        </div>
        <div>
          <h4 className="font-black text-amber-900 text-sm">Pro Tip</h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            Use the <strong>Products</strong> page to toggle any item between live and hidden without deleting it.
            Use the <strong>Hero Banners</strong> page to refresh your homepage promotions.
          </p>
        </div>
      </div>

    </div>
  )
}