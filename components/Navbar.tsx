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
    handleScroll() // Trigger once on mount
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
      {/* Unified Top Header (Marquee + Logo Bar) */}
      <header className="fixed top-0 left-0 w-full z-[100] flex flex-col shadow-lg border-b border-white/5">
        {/* Top Bar (Marquee) - Notch Friendly */}
        <div className="bg-red-600 text-white overflow-hidden py-2 flex items-center pt-[env(safe-area-inset-top,8px)]">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
            className="whitespace-nowrap flex gap-10 sm:gap-20 text-[9px] md:text-xs font-black uppercase tracking-[0.3em] px-4"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex gap-2 sm:gap-4 items-center">
                <span>Wholesale</span>
                <span className="opacity-40">•</span>
                <span>Retail</span>
                <span className="opacity-40">•</span>
                <span>Corporate Deals</span>
                
              </div>
            ))}
          </motion.div>
        </div>

        {/* Brand Bar / Main Navbar */}
        <nav className="bg-black/90 backdrop-blur-2xl transition-all duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <div className="flex-shrink-0">
                <a href="#home" className="group flex items-center gap-2">
                  <span className="text-xl md:text-2xl font-black tracking-tighter text-white group-hover:text-red-500 transition-all duration-300 transform group-hover:scale-105">
                    OSAKA <span className="text-red-600">GROUP</span>
                  </span>
                </a>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-10">
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
                      activeSection === item.id ? 'text-red-500' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                    {activeSection === item.id && (
                      <motion.span 
                        layoutId="navUnderline"
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-full" 
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                ))}
              </div>

              {/* Mobile Right Section (Icons if needed) */}
              <div className="md:hidden flex items-center h-full">
                {/* Optional: Add a call icon or search icon here for mobile top right if desired */}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Built for Mobile: Bottom App-like Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] pb-safe flex justify-between items-center px-4 py-2">
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
              className={`relative flex flex-col flex-1 items-center p-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-red-600' 
                  : 'text-gray-400 hover:text-red-600 active:bg-red-50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavBg"
                  className="absolute inset-0 bg-red-50 rounded-xl"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <item.Icon size={22} strokeWidth={2.5} />
                <span className="text-[9px] mt-1 font-bold uppercase tracking-wider">{item.label}</span>
              </div>
            </a>
          )
        })}
      </nav>
    </>
  )
}