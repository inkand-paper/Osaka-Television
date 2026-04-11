'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Info, LayoutGrid, Image as ImageIcon, PhoneCall } from 'lucide-react'

const navItems = [
  { id: 'home', icon: Home, label: 'HOME' },
  { id: 'about', icon: Info, label: 'ABOUT' },
  { id: 'category', icon: LayoutGrid, label: 'PRODUCTS' },
  { id: 'gallery', icon: ImageIcon, label: 'GALLERY' },
  { id: 'contact', icon: PhoneCall, label: 'CONTACT' },
]

export default function BottomNav() {
  const [activeSection, setActiveSection] = useState('home')
  const isAutomaticScroll = useRef(false)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (isAutomaticScroll.current) return

      const scrollPosition = window.scrollY + window.innerHeight / 2
      const sections = navItems.map(item => document.getElementById(item.id))
      
      let currentSection = 'home'
      sections.forEach((section, index) => {
        if (section && scrollPosition >= section.offsetTop) {
          currentSection = navItems[index].id
        }
      })
      setActiveSection(currentSection)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getHeaderOffset = () => {
    const root = document.documentElement
    return Number.parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 80
  }

  const scrollToId = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      isAutomaticScroll.current = true
      setActiveSection(id)
      
      const offset = getHeaderOffset()
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({ top: y, behavior: 'smooth' })

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
      scrollTimeout.current = setTimeout(() => {
        isAutomaticScroll.current = false
      }, 1000)
    }
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] md:hidden w-[90%] max-w-[400px]">
      <nav className="glass rounded-[2rem] px-4 py-3 shadow-2xl flex items-center justify-between border border-black/[0.05]">
        {navItems.map((item) => {
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => scrollToId(item.id)}
              className="relative p-3 flex flex-col items-center gap-1 group transition-all"
            >
              <div className={`relative z-10 transition-all duration-300 ${isActive ? 'text-black' : 'text-black/20'}`}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              {isActive && (
                <motion.div 
                  layoutId="bottomNavGlow"
                  className="absolute inset-0 bg-black/[0.03] rounded-2xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              {isActive && (
                <motion.div 
                  layoutId="bottomNavDot"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full"
                />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}