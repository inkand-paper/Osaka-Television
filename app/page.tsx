'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import HeroCarousel from '@/components/HeroCarousel'
import Footer from '@/components/Footer'
import TVCard from '@/components/TVCard'
import SocialLinks from '@/components/SocialLinks'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

interface Product {
  id: string
  name: string
  category: string
  size: string
  price: number
  description: string
  image_url: string | null
  is_active: boolean
  created_at?: string
}

const MAIN_CATEGORIES = ['Television', 'Fan', 'Cooker', 'More'];

const TV_SIZES = ['24 inch', '32 inch', '43 inch', '50 inch', '65 inch'];
const TV_MODELS: Record<string, string[]> = {
  "24 inch": ["Basic Frameless", "Basic Double Glass", "Smart Frameless", "Smart Double Glass"],
  "32 inch": ["Regular Series", "Gold Series", "Google TV"],
  "43 inch": ["Regular Series", "Gold Series", "Google TV"],
  "50 inch": ["Regular Series", "Gold Series", "Google TV"],
  "65 inch": ["Regular Series", "Gold Series", "Google TV"],
}

const FAN_SIZES = ['12 inch', '16 inch', '18 inch'];
const FAN_MODELS: Record<string, string[]> = {
  "12 inch": ["Table Fan - Rechargeable"],
  "16 inch": ["Table Fan - Rechargeable", "Stand Fan - Rechargeable"],
  "18 inch": ["Stand Fan - Rechargeable"]
}
export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('Television')
  const [selectedSize, setSelectedSize] = useState<string>('32 inch')
  const [selectedModel, setSelectedModel] = useState<string>('All')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleMainCategoryClick = (category: string) => {
    setSelectedMainCategory(category)
    if (category === 'Television') {
      setSelectedSize('32 inch')
    } else if (category === 'Fan') {
      setSelectedSize('16 inch')
    } else {
      setSelectedSize('')
    }
    setSelectedModel('All')
  }

  // When size changes, reset model selection to All
  const handleSizeClick = (size: string) => {
    setSelectedSize(size)
    setSelectedModel('All')
  }

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts()
  }, [])

  // Get the latest 5 products for the "Newly Arrived" section using the `id` field if `created_at` isn't available
  // Fallback to sorting by id descending since they're typically serial or UUIDv7. 
  const getLatestProducts = () => {
    const sorted = [...products].sort((a, b) => {
       if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
       }
       // Fallback sort using ids since UUIDs might not contain time but often do (e.g. UUIDv7)
       // Or if IDs are standard we can just rely on the end of the array if inserted chronologically
       return b.id.localeCompare(a.id);
    });
    return sorted.slice(0, 5);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {/* HOME SECTION */}
        <section id="home" className="pt-16">
          <HeroCarousel />
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-20 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl font-bold text-center mb-16">
              About <span className="text-red-600">OSAKA Television</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">Our Story</h3>
                <p className="text-gray-700 text-lg mb-4">
                  OSAKA Television has been at the forefront of bringing premium television
                  solutions to homes and businesses across Bangladesh.
                </p>
                <p className="text-gray-700 text-lg">
                  Our commitment to quality and innovation has made us a trusted name.
                  We offer a comprehensive range from 24 inch to 65 inch.
                </p>
              </div>
              <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center overflow-hidden shadow-xl">
                <img
                  src="/assets/images/about/about-osaka.jpeg"
                  alt="About Osaka"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* NEWLY ARRIVED SECTION */}
        {!loading && products.length > 0 && (
          <section id="newly-arrived" className="py-20 bg-gradient-to-br from-red-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <span className="bg-red-100 text-red-700 font-bold px-4 py-2 rounded-full uppercase tracking-widest text-sm mb-4 inline-block">Flash Release</span>
                <h2 className="text-5xl font-bold">
                  Newly <span className="text-red-600">Arrived</span>
                </h2>
                <p className="text-gray-600 mt-4 text-lg">Check out our latest products just added to the store!</p>
              </div>

              <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory hide-scroll-bar gap-6 px-4 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:gap-4 lg:gap-6">
                {getLatestProducts().map((product) => (
                  <div 
                    key={`new-${product.id}`} 
                    className="snap-center min-w-[280px] md:min-w-0 md:w-full shrink-0 cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-transform hover:-translate-y-2 hover:shadow-xl group relative overflow-hidden h-full flex flex-col">
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md">
                        NEW
                      </div>
                      <div className="aspect-square w-full rounded-xl bg-gray-50 mb-4 overflow-hidden flex items-center justify-center">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" 
                          />
                        ) : (
                          <span className="text-4xl">📦</span>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 justify-between">
                        <div>
                           <p className="text-xs text-gray-400 font-bold uppercase mb-1">{product.category}</p>
                           <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight">
                             {product.name}
                           </h3>
                        </div>
                        <p className="text-xl font-bold text-red-600 mt-4 border-t pt-3">
                          ৳ {product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CATEGORY SECTION */}
        <section id="category" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl font-bold text-center mb-16">
              Our <span className="text-red-600">Categories</span>
            </h2>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-xl text-gray-600">Loading products...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Main Category Selection Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  {MAIN_CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => handleMainCategoryClick(category)}
                      className={`px-10 py-4 rounded-full font-bold text-xl transition-all shadow-sm ${selectedMainCategory === category
                          ? 'bg-red-600 text-white shadow-lg transform scale-105'
                          : 'bg-white text-gray-800 hover:bg-red-50 hover:text-red-600 border-2 border-gray-200'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* TELEVISION SECTION */}
                {selectedMainCategory === 'Television' && (
                  <div className="w-full flex flex-col items-center">
                    {/* TV Size Selection Tabs */}
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                      {TV_SIZES.map(size => (
                        <button
                          key={size}
                          onClick={() => handleSizeClick(size)}
                          className={`px-8 py-3 rounded-full font-bold text-lg transition-all shadow-sm ${selectedSize === size
                              ? 'bg-gray-800 text-white shadow-md transform scale-105'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>

                    {/* TV Model Selection Tabs */}
                    {TV_MODELS[selectedSize] && TV_MODELS[selectedSize].length > 0 && (
                      <div className="flex flex-wrap justify-center gap-3 mb-16 bg-gray-100 p-2 rounded-2xl">
                        <button
                          onClick={() => setSelectedModel('All')}
                          className={`px-6 py-2 rounded-xl font-medium transition-colors ${selectedModel === 'All'
                              ? 'bg-gray-800 text-white shadow-md'
                              : 'bg-transparent text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          All models
                        </button>
                        {TV_MODELS[selectedSize].map(model => (
                          <button
                            key={model}
                            onClick={() => setSelectedModel(model)}
                            className={`px-6 py-2 rounded-xl font-medium transition-colors ${selectedModel === model
                                ? 'bg-gray-800 text-white shadow-md'
                                : 'bg-transparent text-gray-600 hover:bg-gray-200'
                              }`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* TV Product Grid */}
                    <div className="w-full">
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products
                          .filter(p => p.category === selectedSize)
                          .filter(p => selectedModel === 'All' || p.name.includes(selectedModel))
                          .map((product) => (
                            <TVCard
                              key={product.id}
                              name={product.name}
                              price={`৳ ${product.price.toLocaleString()}`}
                              image={product.image_url || ''}
                              onClick={() => setSelectedProduct(product)}
                            />
                          ))}
                      </div>

                      {products.filter(p => p.category === selectedSize && (selectedModel === 'All' || p.name.includes(selectedModel))).length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
                          <div className="text-6xl mb-4">📺</div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">No TVs Found</h3>
                          <p className="text-gray-500">We couldn&apos;t find any active TVs in our current inventory matching your selection.</p>
                          <button
                            onClick={() => handleSizeClick('32 inch')}
                            className="mt-6 px-6 py-2 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Reset Filters
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FAN SECTION */}
                {selectedMainCategory === 'Fan' && (
                  <div className="w-full flex flex-col items-center">
                    {/* Fan Size Selection Tabs */}
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                      {FAN_SIZES.map(size => (
                        <button
                          key={size}
                          onClick={() => handleSizeClick(size)}
                          className={`px-8 py-3 rounded-full font-bold text-lg transition-all shadow-sm ${selectedSize === size
                              ? 'bg-gray-800 text-white shadow-md transform scale-105'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>

                    {/* Fan Model Selection Tabs */}
                    {FAN_MODELS[selectedSize] && FAN_MODELS[selectedSize].length > 0 && (
                      <div className="flex flex-wrap justify-center gap-3 mb-16 bg-gray-100 p-2 rounded-2xl">
                        <button
                          onClick={() => setSelectedModel('All')}
                          className={`px-6 py-2 rounded-xl font-medium transition-colors ${selectedModel === 'All'
                              ? 'bg-gray-800 text-white shadow-md'
                              : 'bg-transparent text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          All models
                        </button>
                        {FAN_MODELS[selectedSize].map(model => (
                          <button
                            key={model}
                            onClick={() => setSelectedModel(model)}
                            className={`px-6 py-2 rounded-xl font-medium transition-colors ${selectedModel === model
                                ? 'bg-gray-800 text-white shadow-md'
                                : 'bg-transparent text-gray-600 hover:bg-gray-200'
                              }`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Fan Product Grid */}
                    <div className="w-full">
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products
                          .filter(p => p.category === selectedSize)
                          .filter(p => selectedModel === 'All' || p.name.includes(selectedModel))
                          .map((product) => (
                            <TVCard
                              key={product.id}
                              name={product.name}
                              price={`৳ ${product.price.toLocaleString()}`}
                              image={product.image_url || ''}
                              onClick={() => setSelectedProduct(product)}
                            />
                          ))}
                      </div>

                      {products.filter(p => p.category === selectedSize && (selectedModel === 'All' || p.name.includes(selectedModel))).length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
                          <div className="text-6xl mb-4">💨</div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Fans Found</h3>
                          <p className="text-gray-500">We couldn&apos;t find any active fans in our current inventory matching your selection.</p>
                          <button
                            onClick={() => handleSizeClick('16 inch')}
                            className="mt-6 px-6 py-2 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Reset Filters
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* COOKER SECTION */}
                {selectedMainCategory === 'Cooker' && (
                  <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm w-full max-w-4xl mx-auto my-8">
                    <div className="text-8xl mb-8 animate-bounce mt-4">🍳</div>
                    <h3 className="text-4xl font-bold text-gray-800 mb-4">Rice Cookers</h3>
                    <p className="text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                      Our premium line of cookers will be introduced very soon! Stay tuned.
                    </p>
                  </div>
                )}

                {/* MORE SECTION */}
                {selectedMainCategory === 'More' && (
                  <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm w-full max-w-4xl mx-auto my-8">
                    <div className="text-8xl mb-8 mt-4">✨</div>
                    <h3 className="text-4xl font-bold text-gray-800 mb-4">More Categories</h3>
                    <p className="text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                      We are always expanding. Later we will decide on more exciting products!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section id="gallery" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl font-bold text-center mb-16">
              Our <span className="text-red-600">Gallery</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="bg-gray-200 h-64 rounded-lg flex items-center justify-center hover:shadow-xl transition group overflow-hidden">
                  <div className="text-gray-400 group-hover:scale-110 transition-transform duration-500">
                    Photo {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-20 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl font-bold text-center mb-16">
              Contact <span className="text-red-600">Us</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Get In Touch</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-red-100 p-3 rounded-full text-red-600 mr-4">📧</div>
                    <div>
                      <h4 className="font-bold text-gray-900">Email</h4>
                      <p className="text-gray-600">info@osakatv.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-red-100 p-3 rounded-full text-red-600 mr-4">📞</div>
                    <div>
                      <h4 className="font-bold text-gray-900">Phone</h4>
                      <p className="text-gray-600">+880 1XXX-XXXXXX</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <form className="space-y-4">
                  <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" placeholder="Your Name" />
                  <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" placeholder="Email Address" />
                  <textarea className="w-full px-4 py-3 border border-gray-200 rounded-lg h-32 focus:ring-2 focus:ring-red-500 focus:outline-none" placeholder="Write your message here..."></textarea>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-bold transition-colors shadow-md transform active:scale-95">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

   {/* PRODUCT DETAILS MODAL */}
{/* PRODUCT DETAILS MODAL */}
<Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
  {/* Changed max-w-5xl to max-w-[70vw] and added min-h for that 2/3rd feel */}
  <DialogContent className="max-w-[85vw] md:max-w-[70vw] w-full min-h-[60vh] p-0 overflow-hidden border-none bg-white rounded-3xl shadow-2xl">
    {selectedProduct && (
      <div className="flex flex-col md:flex-row min-h-[60vh]">
        
        {/* Left Side: Large Product Display (Equal 50%) */}
        <div className="md:w-1/2 bg-[#fdfdfd] flex items-center justify-center p-12 relative border-r border-gray-100">
          <div className="absolute top-10 left-10">
             <Badge className="bg-red-600 text-white border-0 px-6 py-2 text-xs font-black uppercase tracking-widest shadow-lg">
              OSAKA AUTHENTIC
            </Badge>
          </div>
          
          

          {selectedProduct.image_url ? (

            <img

              src={selectedProduct.image_url}

              alt={selectedProduct.name}

              className="w-full max-h-[350px] object-contain drop-shadow-xl"

            />

          ) : (

            <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">

              <span className="text-6xl">📦</span>

            </div>

          )} 
        </div>

        {/* Right Side: Information (Equal 50%) */}
        <div className="md:w-1/2 p-12 md:p-16 flex flex-col justify-between bg-white">
          <div className="space-y-8">
            {/* Title & Status */}
            <div>
              <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-[0.3em] mb-4">
                <CheckCircle2 size={18} strokeWidth={3} />
                Verified Factory Stock
              </div>
              <h2 className="text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
                {selectedProduct.name}
              </h2>
            </div>

            {/* Price & Info Grid */}
            <div className="grid grid-cols-2 gap-8 border-y border-gray-100 py-8">
              <div>
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-2">Price</p>
                <div className="text-5xl font-black text-red-600 tracking-tighter">
                  ৳{selectedProduct.price.toLocaleString()}
                </div>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-2">Model Size</p>
                <p className="text-2xl font-black text-gray-800">{selectedProduct.size || 'N/A'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Specifications</p>
              <div className="text-lg text-gray-600 leading-relaxed bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                {selectedProduct.description || "Premium OSAKA technology designed for high performance and energy efficiency."}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-12">
            <div className="grid grid-cols-2 gap-5">
              <button className="bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-6 rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest">
                Order via WhatsApp
              </button>
              <button className="bg-black hover:bg-gray-800 text-white font-black py-6 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest">
                Call Expert
              </button>
            </div>
            <div className="flex justify-between mt-8 opacity-40 text-[10px] font-bold uppercase tracking-[0.2em]">
              <span>Free Delivery</span>
              <span>12 Months Warranty</span>
              <span>Genuine Product</span>
            </div>
          </div>
        </div>

      </div>
    )}
  </DialogContent>
</Dialog>

      <Footer />
      <SocialLinks />
    </div>
  )
}