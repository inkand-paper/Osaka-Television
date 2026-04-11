'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'

const navItems = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Products', id: 'category' },
  { label: 'Gallery', id: 'gallery' },
  { label: 'Contact', id: 'contact' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      const sections = navItems.map(item => document.getElementById(item.id))
      const scrollPosition = window.scrollY + 150

      sections.forEach((section, index) => {
        if (section) {
          const { offsetTop, offsetHeight } = section
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(navItems[index].id)
          }
        }
      })
    }

    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const h = headerRef.current.getBoundingClientRect().height
        document.documentElement.style.setProperty('--header-h', `${h}px`)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', updateHeaderHeight)
    updateHeaderHeight()
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateHeaderHeight)
    }
  }, [])

  const getHeaderOffset = () => {
    const root = document.documentElement
    return Number.parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 80
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = getHeaderOffset()
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <header 
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-[100] px-4 sm:px-6 py-6 pointer-events-none"
    >
      <nav className={`
        max-w-7xl mx-auto px-6 py-3 rounded-full transition-all duration-700 pointer-events-auto
        ${isScrolled ? 'glass shadow-xl shadow-black/5 scale-[0.98]' : 'bg-transparent'}
      `}>
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex-shrink-0">
            <a href="#home" className="group flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-black rounded-lg shadow-xl group-hover:rotate-[15deg] transition-transform duration-500">
                <div className="w-3 h-3 bg-white rounded-sm" />
              </div>
              <span className="text-xl font-bold tracking-[-0.05em] text-black">
                OSAKA <span className="font-light text-black/20 italic tracking-normal">Group</span>
              </span>
            </a>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveSection(item.id)
                  setIsMobileMenuOpen(false)
                  scrollToSection(item.id)
                }}
                className={`relative py-1 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                  activeSection === item.id ? 'text-black' : 'text-black/30 hover:text-black/60'
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.span
                    layoutId="navUnderline"
                    className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-black rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </div>

          {/* Contact Trigger */}
          <div className="hidden md:block">
            <button 
              onClick={() => scrollToSection('contact')}
              className="px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 hover:scale-105 transition-all duration-300 flex items-center gap-2 active:scale-95"
            >
              Inquiry <ArrowRight size={12} strokeWidth={3} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-black/40 hover:text-black transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="absolute top-full left-0 right-0 mt-4 glass rounded-[2rem] p-8 md:hidden flex flex-col gap-6 shadow-2xl border border-black/5"
            >
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveSection(item.id)
                    setIsMobileMenuOpen(false)
                    scrollToSection(item.id)
                  }}
                  className={`text-xs font-bold uppercase tracking-[0.25em] transition-colors py-2 ${
                    activeSection === item.id ? 'text-black' : 'text-black/30'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 border-t border-black/5">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    scrollToSection('contact')
                  }}
                  className="w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-xl"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}