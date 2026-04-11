'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { useEffect } from 'react'

interface GalleryLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

export default function GalleryLightbox({
  isOpen,
  onClose,
  images,
  currentIndex,
  setCurrentIndex
}: GalleryLightboxProps) {
  
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const showNext = () => setCurrentIndex((currentIndex + 1) % images.length)
  const showPrev = () => setCurrentIndex((currentIndex - 1 + images.length) % images.length)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-white/95 backdrop-blur-xl p-4 md:p-12"
        >
          {/* Close Trigger */}
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 z-[210] p-4 bg-black text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-2xl"
          >
            <X size={24} />
          </button>

          {/* Navigation Controls */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-12 z-[205] pointer-events-none">
            <button 
              onClick={showPrev}
              className="p-5 bg-white border border-black/5 text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all pointer-events-auto"
            >
              <ChevronLeft size={28} />
            </button>
            <button 
              onClick={showNext}
              className="p-5 bg-white border border-black/5 text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all pointer-events-auto"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Counter/Status */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">Artifact Reference</span>
            <span className="text-xl font-black text-black tracking-widest">{currentIndex + 1} / {images.length}</span>
          </div>

          {/* Image Stage */}
          <motion.div 
            className="relative w-full h-full flex items-center justify-center"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="relative max-w-7xl max-h-[80vh] w-full px-4">
              <img 
                src={images[currentIndex]} 
                alt={`Gallery detail ${currentIndex + 1}`}
                className="w-full h-full object-contain rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-black/5"
              />
              
              {/* Material Detail */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6">
                 <div className="w-1.5 h-1.5 rounded-full pulse-red" />
                 <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] whitespace-nowrap">Operational Visualization_Primary</span>
              </div>
            </div>
          </motion.div>

          {/* Bottom Thumbnails Context */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 px-8 overflow-x-auto hide-scroll-bar">
             {images.map((img, idx) => (
               <button
                 key={idx}
                 onClick={() => setCurrentIndex(idx)}
                 className={`w-12 h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'bg-black w-24' : 'bg-black/10'}`}
               />
             ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
