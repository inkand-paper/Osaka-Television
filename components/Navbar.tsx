'use client'

import { useState, useEffect } from 'react'
import { Home, Info, LayoutGrid, Image as ImageIcon, PhoneCall } from 'lucide-react'

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home')

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
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const handleScroll = () => {
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
    <>
      {/* Top Navbar */}
      <nav className="bg-black text-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <a href="#home" className="text-2xl font-black tracking-tight text-white hover:text-red-500 transition-colors">
                OSAKA <span className="text-red-600">Television</span>
              </a>
            </div>

            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <a 
                  key={item.id} 
                  href={`#${item.id}`} 
                  onClick={(e) => {
                    if (item.id === 'category') {
                      e.preventDefault()
                      setActiveSection(item.id)
                      scrollToProducts()
                      return
                    }
                    setActiveSection(item.id)
                  }}
                  className={`font-medium transition-colors ${
                    activeSection === item.id ? 'text-red-600' : 'text-white hover:text-red-400'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="md:hidden flex items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Official</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Built for Mobile: Bottom App-like Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] pb-safe flex justify-between items-center px-4 py-2">
        {navItems.map((item) => {
          const isActive = activeSection === item.id
          return (
            <a 
              key={item.id}
              href={`#${item.id}`} 
              onClick={(e) => {
                if (item.id === 'category') {
                  e.preventDefault()
                  setActiveSection(item.id)
                  scrollToProducts()
                  return
                }
                setActiveSection(item.id)
              }}
              className={`flex flex-col flex-1 items-center p-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 shadow-sm' 
                  : 'text-gray-400 hover:text-red-600 active:bg-red-50'
              }`}
            >
              <item.Icon size={22} strokeWidth={2.5} />
              <span className="text-[9px] mt-1 font-bold uppercase tracking-wider">{item.label}</span>
            </a>
          )
        })}
      </nav>
    </>
  )
}