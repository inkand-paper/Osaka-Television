'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Hero3D from './Hero3D'
import gsap from 'gsap'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
  title: string;
  description: string;
  image_url: string;
  show_3d_highlight?: boolean;
}

interface HeroCarouselProps {
  onShopNow?: (slideTitle: string) => void;
}

export default function HeroCarousel({ onShopNow }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const actionRef = useRef<HTMLDivElement>(null)

  const animateContent = () => {
    if (!titleRef.current || !descRef.current || !actionRef.current) return
    
    const tl = gsap.timeline()
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 30, skewY: 2 }, 
      { opacity: 1, y: 0, skewY: 0, duration: 0.8, ease: "expo.out" }
    )
    tl.fromTo(descRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
      "-=0.5"
    )
    tl.fromTo(actionRef.current, 
      { opacity: 0, scale: 0.95 }, 
      { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    )
  }

  useEffect(() => {
    if (!loading) animateContent()
  }, [currentSlide, loading])

  useEffect(() => {
    const fetchSlides = async () => {
      const { data } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (data && data.length > 0) setSlides(data)
      else setSlides([{ title: "PRECISION VISION", description: "Engineered for the elite. Discover the future of visual intelligence.", image_url: "/hero1.jpg" }])
      setLoading(false)
    }
    fetchSlides()
  }, [])

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 8000)
    return () => clearInterval(timer)
  }, [slides.length, isPaused])

  if (loading) return (
    <div className="h-[70vh] md:h-[90vh] bg-white flex items-center justify-center">
      <div className="w-1.5 h-1.5 bg-black rounded-full animate-ping" />
    </div>
  )

  const nextSlide = () => setCurrentSlide((s) => (s + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((s) => (s - 1 + slides.length) % slides.length)

  return (
    <section 
      id="home"
      className="relative h-[75vh] sm:h-[85vh] md:h-screen bg-white overflow-hidden group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 3D Visual Layer */}
      {slides[currentSlide]?.show_3d_highlight && (
        <div className="absolute inset-0 z-0 opacity-10">
          <Hero3D />
        </div>
      )}

      {/* Background Media */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={slides[currentSlide].image_url} 
            alt="" 
            className="w-full h-full object-cover" 
          />
          {/* Technical Overlay for Sharpness */}
          <div className="absolute inset-0 bg-white/15 backdrop-blur-[1px]" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-20">
        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="w-12 h-[1.5px] bg-black/10" />
            <span className="text-[10px] font-bold text-black/40 uppercase tracking-[0.4em]">
              Operational Excellence 0{currentSlide + 1}
            </span>
          </motion.div>

          <h1 
            ref={titleRef}
            className="text-5xl sm:text-7xl md:text-9xl font-black mb-10 leading-[0.9] tracking-[-0.04em] text-black"
          >
            {slides[currentSlide].title}
          </h1>

          <p 
            ref={descRef}
            className="text-sm sm:text-lg md:text-xl text-black/60 mb-14 max-w-xl leading-relaxed font-medium"
          >
            {slides[currentSlide].description}
          </p>

          <div ref={actionRef} className="flex flex-wrap gap-6 items-center">
            <button 
              onClick={() => onShopNow?.(slides[currentSlide].title)}
              className="px-10 py-5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-all duration-500 shadow-2xl shadow-black/10 flex items-center gap-3 active:scale-95"
            >
              Access Intelligence <ArrowRight size={14} strokeWidth={3} />
            </button>
            <a 
              href="#category"
              className="group px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 hover:text-black transition-colors flex items-center gap-2"
            >
              Explore Systems <div className="w-8 h-[1px] bg-black/10 group-hover:bg-black group-hover:w-12 transition-all duration-500" />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 left-0 right-0 z-20 px-6 md:px-12 lg:px-24 flex items-end justify-between pointer-events-none">
        {/* Progress System */}
        <div className="flex flex-col gap-6 pointer-events-auto">
          <div className="flex gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-[2px] transition-all duration-700 ${i === currentSlide ? 'w-16 bg-black' : 'w-4 bg-black/10'}`}
              />
            ))}
          </div>
          <div className="flex gap-4">
            <button onClick={prevSlide} className="p-2 text-black/20 hover:text-black transition-colors cursor-pointer">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextSlide} className="p-2 text-black/20 hover:text-black transition-colors cursor-pointer">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex flex-col items-end gap-2">
            <span className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em]">System Status</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-black tracking-widest italic">NOMINAL</span>
              <div className="w-1.5 h-1.5 rounded-full pulse-red" />
            </div>
          </div>
        </div>
      </div>

      {/* Technical Sidebar Indicator */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-40 w-[1.5px] bg-black/5" />
    </section>
  )
}