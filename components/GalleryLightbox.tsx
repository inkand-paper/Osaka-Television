'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useCallback } from 'react'

interface GalleryLightboxProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  currentIndex: number
  setCurrentIndex: (index: number) => void
}

export default function GalleryLightbox({
  isOpen,
  onClose,
  images,
  currentIndex,
  setCurrentIndex
}: GalleryLightboxProps) {
  
  const handleNext = useCallback(() => {
    setCurrentIndex((currentIndex + 1) % images.length)
  }, [currentIndex, images.length, setCurrentIndex])

  const handlePrev = useCallback(() => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length)
  }, [currentIndex, images.length, setCurrentIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handleNext, handlePrev])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 md:p-10 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[210] p-2 hover:bg-white/10 rounded-full"
          >
            <X size={32} />
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-[210] p-4 bg-white/5 hover:bg-white/10 rounded-full hidden md:block"
              >
                <ChevronLeft size={40} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-[210] p-4 bg-white/5 hover:bg-white/10 rounded-full hidden md:block"
              >
                <ChevronRight size={40} />
              </button>
            </>
          )}

          {/* Image Container */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-5xl w-full h-full flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={images[currentIndex]} 
              alt="Gallery Preview" 
              className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
              draggable={false}
            />
            
            {/* Mobile Swipe Simulation Info (Optional) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs font-bold uppercase tracking-widest md:hidden">
              Tap left/right to navigate
            </div>
            
            {/* Image Counters */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white font-black text-sm tracking-widest opacity-50">
              {currentIndex + 1} / {images.length}
            </div>
          </motion.div>
          
          {/* Mobile Tap Areas */}
          <div className="md:hidden absolute inset-0 flex z-[205] pointer-events-none">
            <div 
              className="flex-1 pointer-events-auto" 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
            />
            <div 
              className="flex-1 pointer-events-auto" 
              onClick={(e) => { e.stopPropagation(); handleNext(); }} 
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
