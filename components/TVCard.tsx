'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

interface TVCardProps {
  name: string;
  price: string;
  originalPrice?: string | null;
  image: string;
  discountTag?: string | null;
  onClick: () => void;
}

export default function TVCard({ name, price, originalPrice, image, discountTag, onClick }: TVCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -8 }}
      className="group relative bg-[#f9f9fb] rounded-[2rem] p-6 cursor-pointer border border-black/[0.03] transition-all hover:shadow-2xl hover:shadow-black/5 hover:bg-white"
    >
      {/* Hardware Designation Header */}
      <div className="flex justify-between items-start mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full pulse-red" />
            <span className="text-[10px] font-bold text-black uppercase tracking-[0.3em]">Hardware</span>
          </div>
          <p className="text-[9px] font-bold text-black/30 uppercase tracking-[0.2em]">CERTIFIED_SERIES</p>
        </div>
        {discountTag && (
          <div className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
            {discountTag}
          </div>
        )}
      </div>

      {/* Product Image Stage */}
      <div className="relative h-56 sm:h-64 mb-10 flex items-center justify-center">
        <div className="absolute inset-0 bg-radial-gradient from-black/[0.02] to-transparent opacity-50" />
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          src={image}
          alt={name}
          className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] z-10 group-hover:scale-105 transition-transform duration-700"
        />
      </div>

      {/* Information Layer */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-black text-black leading-tight tracking-tight group-hover:text-red-600 transition-colors">
            {name}
          </h3>
          <div className="w-6 h-[1.5px] bg-black/10 transition-all group-hover:w-12 group-hover:bg-red-600" />
        </div>

        <div className="flex items-end justify-between">
          <div className="space-y-1">
            {originalPrice && (
              <p className="text-[10px] font-bold text-black/20 line-through tracking-wider">
                {originalPrice}
              </p>
            )}
            <p className="text-xl font-black text-black tracking-tight">{price}</p>
          </div>
          
          <div className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </div>

      {/* Technical Sidebar Detail */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-px h-8 bg-black/5" />
        <span className="text-[8px] font-bold text-black/20 vertical-text uppercase tracking-widest">Specifications</span>
        <div className="w-px h-8 bg-black/5" />
      </div>
    </motion.div>
  )
}