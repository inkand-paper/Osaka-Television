import { Package } from 'lucide-react'
import { motion } from 'framer-motion'

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
      <div className="bg-[#fcfcfc] h-52 md:h-64 flex items-center justify-center p-8 overflow-hidden relative group-hover:bg-red-50/30 transition-colors duration-500">
        {image ? (
          <motion.img 
            src={image} 
            alt={name}
            className="w-full h-full object-contain drop-shadow-2xl"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }} // smooth easeOut
          />
        ) : (
          <div className="w-full h-full rounded flex items-center justify-center text-gray-200">
            <Package className="w-20 h-20" strokeWidth={1} />
          </div>
        )}
      </div>
      
      {/* Details */}
      <div className="p-6 md:p-8 text-center flex flex-col flex-1 justify-between">
        <div>
          <h4 className="font-bold text-lg md:text-xl mb-3 text-gray-900 line-clamp-2 leading-tight tracking-tight group-hover:text-red-600 transition-colors">{name}</h4>
          
          <div className="flex flex-col items-center justify-center mb-6 mt-2">
            {originalPrice && (
              <span className="text-xs md:text-sm text-gray-400 font-bold line-through decoration-gray-300 mb-1">
                {originalPrice}
              </span>
            )}
            <p className="text-3xl lg:text-4xl text-red-600 font-black tracking-tighter leading-none">{price}</p>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="w-full bg-black hover:bg-gray-900 text-white px-6 py-4 rounded-2xl font-black transition-all uppercase tracking-[0.1em] text-xs shadow-lg shadow-black/10 group-hover:shadow-black/20"
        >
          Explore Now
        </motion.button>
      </div>
    </motion.div>
  )
}