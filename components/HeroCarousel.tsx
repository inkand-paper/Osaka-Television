'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
      else setSlides([{ title: "OSAKA Television", description: "Experience the best in visual entertainment", image_url: "/hero1.jpg" }])
      setLoading(false)
    }
    fetchSlides()
  }, [])

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [slides.length, isPaused])

  if (loading) return <div className="h-[600px] bg-black animate-pulse" />

  return (
    <div 
      className="relative h-[600px] bg-black overflow-hidden cursor-grab active:cursor-grabbing group select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
      onMouseDown={onTouchStart}
      onMouseMove={(e) => { e.preventDefault(); onTouchMove(e); }}
      onMouseUp={onTouchEndHandler}
      onMouseLeave={() => { onTouchEndHandler(); setIsPaused(false); }}
      onMouseEnter={() => setIsPaused(true)}
    >
      {slides.map((slide, index) => (
        <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
            <img src={slide.image_url} alt="" className="w-full h-full object-cover" draggable={false} />
          </div>
          <div className="relative z-20 flex items-center h-full px-8 md:px-16 lg:px-24 pointer-events-none">
            <div className="max-w-2xl text-white">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                {slide.title.includes('OSAKA') ? (
                  <>
                    {slide.title.split('OSAKA')[0]} 
                    <span className="text-red-600">OSAKA</span> 
                    {slide.title.split('OSAKA')[1]}
                  </>
                ) : slide.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-10">{slide.description}</p>
              <Link href="#category" className="pointer-events-auto bg-red-600 hover:bg-red-700 px-10 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 inline-block">
                View Product List
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-30">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
              className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-10 bg-red-600' : 'w-2.5 bg-white/50 hover:bg-white/90'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}