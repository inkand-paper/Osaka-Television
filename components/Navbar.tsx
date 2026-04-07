'use client'

import { useState, useEffect, useRef } from 'react'
import { Home, Info, LayoutGrid, Image as ImageIcon, PhoneCall } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home')
  const isAutomaticScroll = useRef(false)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  const scrollToProducts = () => {
    let savedCategory = 'Television'
    try {
      savedCategory = localStorage.getItem('mainCategory') || 'Television'
    } catch {
      // Ignore storage errors.
    }

    const targetId =
      savedCategory === 'Television'
        ? 'tv-products'
        : savedCategory === 'Fan'
          ? 'fan-products'
          : savedCategory === 'Cooker'
            ? 'cooker-products'
            : 'tv-products'

    const el = document.getElementById(targetId)
    if (el) {
      isAutomaticScroll.current = true
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
      scrollTimeout.current = setTimeout(() => {
        isAutomaticScroll.current = false
      }, 1000)
    }
  }

  const handleManualNav = (id: string) => {
    setActiveSection(id)
    isAutomaticScroll.current = true

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => {
      isAutomaticScroll.current = false
    }, 1000)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (isAutomaticScroll.current) return

      const sections = ['home', 'about', 'category', 'gallery', 'contact']
      let currentIdx = 0

      for (let i = 0; i < sections.length; i++) {
        const element = document.getElementById(sections[i])
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= window.innerHeight / 3) {
            currentIdx = i
          }
        }
      }
      setActiveSection(sections[currentIdx])
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    }
  }, [])

  const navItems = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'about', label: 'About', Icon: Info },
    { id: 'category', label: 'Products', Icon: LayoutGrid },
    { id: 'gallery', label: 'Gallery', Icon: ImageIcon },
    { id: 'contact', label: 'Contact', Icon: PhoneCall },
  ]

  return (
    <>
      {/* ─── Fixed Top Header ─────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 w-full z-[100] flex flex-col shadow-lg border-b border-white/5 transform-gpu will-change-transform"
        /* Push content below the notch on iPhones */
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* ── Marquee bar ── */}
        <div className="bg-red-600 overflow-hidden">
          <div className="h-8 sm:h-9 md:h-10 flex items-center">
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
              className="whitespace-nowrap flex gap-8 xs:gap-12 sm:gap-16 md:gap-24 text-[10px] xs:text-[11px] md:text-sm font-black uppercase tracking-[0.25em] md:tracking-[0.3em] text-black"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex gap-2 sm:gap-4 items-center shrink-0">
                  <span>Wholesale</span>
                  <span className="opacity-40">•</span>
                  <span>Retail</span>
                  <span className="opacity-40">•</span>
                  <span>Corporate Deals</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Brand / Desktop nav bar ── */}
        <nav className="bg-black/90 backdrop-blur-2xl transition-all duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">

              {/* Logo */}
              <div className="flex-shrink-0">
                <a href="#home" className="group flex items-center gap-2">
                  <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter text-white group-hover:text-red-500 transition-all duration-300 group-hover:scale-105 inline-block">
                    OSAKA <span className="text-red-600">GROUP</span>
                  </span>
                </a>
              </div>

              {/* Desktop menu — hidden on mobile */}
              <div className="hidden md:flex items-center space-x-8 lg:space-x-10">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      handleManualNav(item.id)
                      if (item.id === 'category') {
                        e.preventDefault()
                        scrollToProducts()
                      }
                    }}
                    className={`relative py-2 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                      activeSection === item.id
                        ? 'text-red-500'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                    {activeSection === item.id && (
                      <motion.span
                        layoutId="navUnderline"
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                ))}
              </div>

              {/* Mobile right — intentionally empty; nav is at the bottom */}
              <div className="md:hidden" />
            </div>
          </div>
        </nav>
      </header>

      {/* ─── Mobile Bottom Navigation ─────────────────────────────────── */}
      {/*
        pb-safe  →  respects iPhone home-indicator via env(safe-area-inset-bottom).
        Make sure your global CSS / tailwind.config includes:
          theme.extend.padding = { safe: 'env(safe-area-inset-bottom)' }
        OR replace `pb-safe` with an inline style shown below.
      */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] transform-gpu will-change-transform"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <div className="flex justify-between items-center px-1 xs:px-2 sm:px-4 py-1.5 sm:py-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.id
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  handleManualNav(item.id)
                  if (item.id === 'category') {
                    e.preventDefault()
                    scrollToProducts()
                  }
                }}
                /* min-w-0 + flex-1 keeps all 5 items evenly distributed on tiny screens */
                className={`relative flex flex-col flex-1 min-w-0 items-center p-1.5 sm:p-2 rounded-xl transition-all touch-manipulation ${
                  isActive
                    ? 'text-red-600'
                    : 'text-gray-400 hover:text-red-600 active:bg-red-50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavBg"
                    className="absolute inset-0 bg-red-50 rounded-xl"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  {/* Slightly smaller icon on very small screens */}
                  <item.Icon
                    size={20}
                    className="sm:w-[22px] sm:h-[22px]"
                    strokeWidth={2.5}
                  />
                  <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none truncate w-full text-center">
                    {item.label}
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      </nav>
    </>
  )
}