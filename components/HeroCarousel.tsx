'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface Slide {
  title: string;
  description: string;
  image_url: string;
}

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  // Swipe/Drag state setup
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const minSwipeDistance = 50 

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setTouchEnd(null)
    if ('targetTouches' in e) {
        setTouchStart(e.targetTouches[0].clientX)
    } else {
        setTouchStart((e as React.MouseEvent).clientX)
    }
  }

  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if ('targetTouches' in e) {
        setTouchEnd(e.targetTouches[0].clientX)
    } else if (touchStart !== null) {
        setTouchEnd((e as React.MouseEvent).clientX)
    }
  }

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && slides.length > 1) {
      setCurrentSlide(s => (s + 1) % slides.length) // Next
    }
    if (isRightSwipe && slides.length > 1) {
      setCurrentSlide(s => (s - 1 + slides.length) % slides.length) // Prev
    }
    setTouchStart(null)
    setTouchEnd(null)
  }

  useEffect(() => {
    const fetchSlides = async () => {
      const { data } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (data && data.length > 0) setSlides(data)
      else setSlides([{ title: "OSAKA GROUP", description: "Experience the best in visual entertainment", image_url: "/hero1.jpg" }])
      setLoading(false)
    }
    fetchSlides()
  }, [])

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [slides.length, isPaused])

  if (loading) return <div className="h-[500px] md:h-[600px] bg-black animate-pulse" />

  return (
    <div 
      className="relative h-[500px] md:h-[600px] bg-black overflow-hidden cursor-grab active:cursor-grabbing group select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
      onMouseDown={onTouchStart}
      onMouseMove={(e) => { e.preventDefault(); onTouchMove(e); }}
      onMouseUp={onTouchEndHandler}
      onMouseLeave={() => { onTouchEndHandler(); setIsPaused(false); }}
      onMouseEnter={() => setIsPaused(true)}
    >
      <AnimatePresence mode="wait">
        {slides.map((slide, index) => (
          index === currentSlide && (
            <motion.div 
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-10" />
                <motion.img 
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 10 }}
                  src={slide.image_url} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  draggable={false} 
                />
              </div>
              <div className="relative z-20 flex items-center h-full px-8 md:px-16 lg:px-24 pointer-events-none">
                <div className="max-w-2xl text-white">
                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-2xl text-gray-200 mb-10 leading-relaxed font-medium"
                  >
                    {slide.description}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex gap-4 pointer-events-auto"
                  >
                    <a 
                      href="#category" 
                      className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-red-900/20"
                    >
                      Shop Now
                    </a>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Navigation Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-10 bg-red-600' : 'w-2 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}