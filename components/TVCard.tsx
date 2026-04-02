import { Package } from 'lucide-react'

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
    <div 
      onClick={onClick}
      className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-red-100 transition-all duration-300 bg-white cursor-pointer group relative flex flex-col h-full"
    >
      {/* Discount Badge */}
      {discountTag && (
        <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] md:text-xs font-black px-3 py-1.5 rounded-full z-10 shadow-lg tracking-wider uppercase">
          {discountTag}
        </div>
      )}

      {/* TV Image */}
      <div className="bg-[#fdfdfd] h-48 md:h-56 flex items-center justify-center p-6 overflow-hidden relative group-hover:bg-gray-50 transition-colors border-b border-gray-50">
        {image ? (
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
          />
        ) : (
          <div className="w-full h-full rounded flex items-center justify-center text-gray-300">
            <Package className="w-16 h-16" strokeWidth={1} />
          </div>
        )}
      </div>
      
      {/* Details */}
      <div className="p-5 md:p-6 text-center flex flex-col flex-1 justify-between">
        <div>
          <h4 className="font-bold text-base md:text-lg mb-2 text-gray-900 line-clamp-2 leading-snug">{name}</h4>
          
          <div className="flex flex-col items-center justify-center mb-5 mt-2">
            {originalPrice && (
              <span className="text-xs md:text-sm text-gray-400 font-bold line-through decoration-gray-300 mb-0.5">
                {originalPrice}
              </span>
            )}
            <p className="text-2xl lg:text-3xl text-red-600 font-black tracking-tighter leading-none">{price}</p>
          </div>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="w-full bg-black hover:bg-gray-800 text-white px-5 py-3 rounded-xl font-bold transition-all active:scale-95 uppercase tracking-widest text-xs shadow-md"
        >
          View Details
        </button>
      </div>
    </div>
  )
}