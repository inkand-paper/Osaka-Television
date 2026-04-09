// components/BottomNav.tsx
'use client'

import { Home, Info, LayoutGrid, Image as ImageIcon, PhoneCall } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export default function BottomNav() {
  const [activeSection, setActiveSection] = useState('home')
  const isAutomaticScroll = useRef(false)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  const getHeaderOffset = () => {
    const headerH = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h')
    ) || 80
    return headerH
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
      const offset = getHeaderOffset()
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const handleNavClick = (id: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    setActiveSection(id)
    
    if (id === 'category') {
      e.preventDefault()
      scrollToProducts()
      return
    }

    const el = document.getElementById(id)
    if (el) {
      e.preventDefault()
      const offset = getHeaderOffset()
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const handleScroll = () => {
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
    <nav 
      className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-100 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
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
              onClick={(e) => handleNavClick(item.id, e)}
              className={`relative flex flex-col flex-1 min-w-0 items-center p-1.5 sm:p-2 rounded-xl transition-all duration-200 touch-manipulation cursor-pointer ${
                isActive ? 'text-red-600' : 'text-gray-400 active:bg-red-50'
              }`}
            >
              <div
                className={`absolute inset-0 rounded-xl transition-opacity duration-200 bg-red-50 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <item.Icon size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none truncate w-full text-center">
                  {item.label}
                </span>
              </div>
            </a>
          )
        })}
      </div>
    </nav>
  )
}