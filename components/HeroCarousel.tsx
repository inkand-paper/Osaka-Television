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
    if (slides.length <= 1) return
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (loading) return <div className="h-[600px] bg-black animate-pulse" />

  return (
    <div className="relative h-[600px] bg-black overflow-hidden">
      {slides.map((slide, index) => (
        <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
            <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-20 flex items-center h-full px-8 md:px-16 lg:px-24">
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
              <Link href="#category" className="bg-red-600 hover:bg-red-700 px-10 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 inline-block">
                View Product List
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}