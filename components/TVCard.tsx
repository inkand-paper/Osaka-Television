interface TVCardProps {
  name: string
  price: string
  image: string
  onClick?: () => void
}

export default function TVCard({ name, price, image, onClick }: TVCardProps) {
  return (
    <div 
      onClick={onClick}
      className="border border-gray-300 rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white cursor-pointer group"
    >
      {/* TV Image */}
      <div className="bg-gray-100 h-48 flex items-center justify-center p-4 overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
            <p className="text-gray-400 text-sm">No Image</p>
          </div>
        )}
      </div>
      
      {/* TV Details */}
      <div className="p-6 text-center">
        <h4 className="font-bold text-lg mb-3 text-gray-800">{name}</h4>
        <p className="text-3xl text-red-600 font-bold mb-4">{price}</p>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="w-full bg-black hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          View Details
        </button>
      </div>
    </div>
  )
}