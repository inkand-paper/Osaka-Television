'use client'

import { useState, useEffect, useRef } from 'react'
import { Home, Info, LayoutGrid, Image as ImageIcon, PhoneCall } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home')
  const isAutomaticScroll = useRef(false)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const h = headerRef.current.getBoundingClientRect().height
        document.documentElement.style.setProperty('--header-h', `${h}px`)
      }
    }
    
    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)
    
    return () => window.removeEventListener('resize', updateHeaderHeight)
  }, [])

  const getHeaderOffset = () => {
    const header = headerRef.current
    const h = header ? header.getBoundingClientRect().height : 80
    return h
  }

  const scrollToProducts = () => {
    const savedCategory =
      typeof window !== 'undefined' && localStorage.getItem('mainCategory')
        ? localStorage.getItem('mainCategory')
        : 'Television'

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
      const offset = getHeaderOffset()
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({ top: y, behavior: 'smooth' })

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
      scrollTimeout.current = setTimeout(() => {
        isAutomaticScroll.current = false
      }, 1100)
    }
  }

  const handleManualNav = (id: string) => {
    setActiveSection(id)
    isAutomaticScroll.current = true

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => {
      isAutomaticScroll.current = false
    }, 900)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (isAutomaticScroll.current) return

      const sections = ['home', 'about', 'category', 'gallery', 'contact']
      let currentIdx = 0
      const scrollPosition = window.scrollY + window.innerHeight / 2

      for (let i = 0; i < sections.length; i++) {
        const element = document.getElementById(sections[i])
        if (element && element.offsetTop <= scrollPosition) {
          currentIdx = i
        }
      }

      setActiveSection(sections[currentIdx])
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'about', label: 'About', Icon: Info },
    { id: 'category', label: 'Products', Icon: LayoutGrid },
    { id: 'gallery', label: 'Gallery', Icon: ImageIcon },
    { id: 'contact', label: 'Contact', Icon: PhoneCall },
  ]

  return (
    <header
      ref={(el) => {
        headerRef.current = el
      }}
      className="fixed left-0 w-full z-[100] flex flex-col shadow-lg border-b border-white/5"
      style={{
        top: '0px',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Marquee bar */}
      <div className="bg-red-600 overflow-hidden">
        <div className="h-8 sm:h-9 md:h-10 flex items-center">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
            className="whitespace-nowrap flex gap-8 xs:gap-12 sm:gap-16 md:gap-24 text-[10px] xs:text-[11px] md:text-sm font-black uppercase tracking-[0.25em] md:tracking-[0.3em] text-white"
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
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

      {/* Brand / Desktop nav bar */}
      <nav className="bg-black/95 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            <div className="flex-shrink-0">
              <a href="#home" className="group flex items-center gap-2">
                <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter text-white group-hover:text-red-500 transition-all duration-300 group-hover:scale-105 inline-block">
                  OSAKA <span className="text-red-600">GROUP</span>
                </span>
              </a>
            </div>

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
                    } else {
                      const el = document.getElementById(item.id)
                      if (el) {
                        e.preventDefault()
                        const offset = getHeaderOffset()
                        const y = el.getBoundingClientRect().top + window.pageYOffset - offset
                        window.scrollTo({ top: y, behavior: 'smooth' })
                      }
                    }
                  }}
                  className={`relative py-2 text-sm font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                    activeSection === item.id ? 'text-red-500' : 'text-gray-300 hover:text-white'
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

            <div className="md:hidden" />
          </div>
        </div>
      </nav>
    </header>
  )
}