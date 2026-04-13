import { Package } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface TVCardProps {
  name: string
  price: string
  image: string
  originalPrice?: string | null
  discountTag?: string | null
  onClick?: () => void
}

export default function TVCard({ name, price, originalPrice, discountTag, image, onClick }: TVCardProps) {
  return (
    <motion.div 
      layout
      whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="border border-gray-100 rounded-3xl overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:border-red-200 transition-all duration-500 bg-white cursor-pointer group relative flex flex-col h-full"
    >
      {/* Discount Badge */}
      {discountTag && (
        <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] md:text-xs font-black px-4 py-2 rounded-full z-10 shadow-2xl tracking-wider uppercase">
          {discountTag}
        </div>
      )}

      {/* TV Image */}
      <div className="bg-[#fcfcfc] aspect-video flex items-center justify-center p-6 sm:p-8 overflow-hidden relative group-hover:bg-red-50/30 transition-colors duration-500">
        {image ? (
          <div className="relative w-full h-full">
            <Image 
              src={image} 
              alt={name}
              fill
              className="object-contain drop-shadow-2xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          </div>
        ) : (
          <div className="w-full h-full rounded flex items-center justify-center text-gray-200">
            <Package className="w-16 h-16 sm:w-20 sm:h-20" strokeWidth={1} />
          </div>
        )}
      </div>
      
      {/* Details */}
      <div className="p-5 sm:p-8 text-center flex flex-col flex-1 justify-between gap-4">
        <div className="flex-1 flex flex-col justify-between">
          <div className="h-[3.5rem] md:h-[4rem] flex items-center justify-center">
            <h4 className="font-bold text-base sm:text-lg md:text-xl text-gray-900 line-clamp-2 leading-snug tracking-tight group-hover:text-red-600 transition-colors px-1 sm:px-2">
              {name}
            </h4>
          </div>
          
          <div className="min-h-[50px] sm:min-h-[60px] md:min-h-[70px] flex flex-col items-center justify-center mt-1 sm:mt-2 mb-2 sm:mb-4">
            <div className="h-5 flex items-center justify-center">
              {originalPrice ? (
                <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-bold line-through decoration-gray-300">
                  {originalPrice}
                </span>
              ) : (
                <div className="h-5" /> // Spacer for consistency
              )}
            </div>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-red-600 font-bold tracking-tight leading-none flex items-baseline gap-1 mt-0.5 sm:mt-1">
              {price.toString().startsWith('MRP') ? (
                <>
                  <span className="text-[8px] sm:text-[10px] md:text-xs font-bold text-red-600 uppercase">MRP</span>
                  <span>{price.toString().replace('MRP', '').trim()}</span>
                </>
              ) : price}
            </p>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="w-full h-auto flex-shrink-0 bg-black hover:bg-gray-900 text-white px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 rounded-xl sm:rounded-2xl font-black transition-all uppercase tracking-[0.1em] text-[10px] sm:text-xs md:text-sm shadow-lg shadow-black/10 group-hover:shadow-black/20"
        >
          Explore Now
        </motion.button>
      </div>
    </motion.div>
  )
}
