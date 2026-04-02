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
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Package, Tv, Wind, ChefHat, Sparkles, Mail, Phone } from "lucide-react"

interface Product {
  id: string
  name: string
  category: string
  size: string
  price: number
  description: string
  image_url: string | null
  is_active: boolean
  original_price?: number | null
  discount_percentage?: string | null
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

  const scrollToProductsForCategory = (category: string) => {
    const targetId =
      category === 'Television'
        ? 'tv-products'
        : category === 'Fan'
          ? 'fan-products'
          : category === 'Cooker'
            ? 'cooker-products'
            : null

    if (!targetId) return

    // Wait for the conditional section to render, then smoothly scroll to it.
    window.setTimeout(() => {
      const el = document.getElementById(targetId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

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
    try {
      localStorage.setItem('mainCategory', category)
    } catch {
      // Ignore storage errors (private mode, etc.)
    }
    // For Cooker there is no size/model step, so jump straight to products.
    // For Television/Fan, let the user pick the sub-category first.
    if (category === 'Cooker') scrollToProductsForCategory(category)
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

  useEffect(() => {
    // Restore the last selected category so the navbar can scroll to the right product section.
    try {
      const saved = localStorage.getItem('mainCategory')
      if (!saved) return

      if (saved === 'Television') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedMainCategory(saved)
        setSelectedSize('32 inch')
        setSelectedModel('All')
      } else if (saved === 'Fan') {
        setSelectedMainCategory(saved)
        setSelectedSize('16 inch')
        setSelectedModel('All')
      } else if (saved === 'Cooker' || saved === 'More') {
        setSelectedMainCategory(saved)
        setSelectedSize('')
        setSelectedModel('All')
      }
    } catch {
      // Ignore storage errors.
    }
    // We only want to run this once on first client load.
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
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />

      <main>
        {/* HOME SECTION */}
        <section id="home" className="pt-16">
          <HeroCarousel />
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-20 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-10 md:mb-16">
              About <span className="text-red-600">OSAKA Group</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">Our Story</h3>
                <p className="text-gray-700 text-lg mb-4">
                  OSAKA Group has been at the forefront of bringing premium
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
                <h2 className="text-3xl md:text-5xl font-bold">
                  Newly <span className="text-red-600">Arrived</span>
                </h2>
                <p className="text-gray-600 mt-4 text-lg">Check out our latest products just added to the store!</p>
              </div>

              <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory hide-scroll-bar gap-5 px-4 md:px-0 md:flex-wrap md:justify-center">
                {getLatestProducts().map((product) => (
                  <div 
                    key={`new-${product.id}`} 
                    className="snap-center w-[260px] md:w-[280px] shrink-0 h-full py-2"
                  >
                    <TVCard
                      name={product.name}
                      price={product.original_price ? `৳ ${product.original_price.toLocaleString()}` : `৳ ${product.price.toLocaleString()}`}
                      originalPrice={product.original_price ? `৳ ${product.price.toLocaleString()}` : null}
                      discountTag={product.discount_percentage ? product.discount_percentage : 'NEW'}
                      image={product.image_url || ''}
                      onClick={() => setSelectedProduct(product)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CATEGORY SECTION */}
        <section id="category" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-10 md:mb-16">
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
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
                  {MAIN_CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => handleMainCategoryClick(category)}
                      className={`px-4 py-2 sm:px-7 sm:py-3 md:px-10 md:py-4 whitespace-nowrap rounded-full font-bold text-sm sm:text-base md:text-xl transition-all shadow-sm ${selectedMainCategory === category
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
                    <div className="w-full max-w-3xl bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-8">
                      <div className="mb-4">
                        <p className="text-xs sm:text-sm font-extrabold text-gray-600 uppercase tracking-widest">
                          Pick TV Size
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                        {TV_SIZES.map(size => (
                          <button
                            key={size}
                            onClick={() => handleSizeClick(size)}
                            className={`px-4 py-2 sm:px-7 sm:py-3 md:px-8 md:py-3 whitespace-nowrap rounded-full font-bold text-sm sm:text-base md:text-lg transition-all shadow-sm ${selectedSize === size
                                ? 'bg-gray-800 text-white shadow-md transform scale-105'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* TV Model Selection Tabs */}
                    {TV_MODELS[selectedSize] && TV_MODELS[selectedSize].length > 0 && (
                      <div className="w-full max-w-3xl bg-gray-50 border border-gray-100 rounded-2xl shadow-sm p-5 mb-16">
                        <div className="mb-4">
                          <p className="text-xs sm:text-sm font-extrabold text-gray-600 uppercase tracking-widest">
                            Pick TV Series
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        <button
                          onClick={() => {
                            setSelectedModel('All')
                            scrollToProductsForCategory(selectedMainCategory)
                          }}
                          className={`px-3 py-2 sm:px-5 whitespace-nowrap rounded-xl font-medium text-xs sm:text-sm md:text-base transition-colors ${selectedModel === 'All'
                              ? 'bg-gray-800 text-white shadow-md'
                              : 'bg-transparent text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          All models
                        </button>
                        {TV_MODELS[selectedSize].map(model => (
                          <button
                            key={model}
                            onClick={() => {
                              setSelectedModel(model)
                              scrollToProductsForCategory(selectedMainCategory)
                            }}
                            className={`px-3 py-2 sm:px-5 whitespace-nowrap rounded-xl font-medium text-xs sm:text-sm md:text-base transition-colors ${selectedModel === model
                                ? 'bg-gray-800 text-white shadow-md'
                                : 'bg-transparent text-gray-600 hover:bg-gray-200'
                              }`}
                          >
                            {model}
                          </button>
                        ))}
                        </div>
                      </div>
                    )}

                    {/* TV Product Grid */}
                    <div id="tv-products" className="w-full scroll-mt-24">
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products
                          .filter(p => p.category === selectedSize)
                          .filter(p => selectedModel === 'All' || p.name.includes(selectedModel))
                          .map((product) => (
                            <TVCard
                              key={product.id}
                              name={product.name}
                              price={product.original_price ? `৳ ${product.original_price.toLocaleString()}` : `৳ ${product.price.toLocaleString()}`}
                              originalPrice={product.original_price ? `৳ ${product.price.toLocaleString()}` : null}
                              discountTag={product.discount_percentage}
                              image={product.image_url || ''}
                              onClick={() => setSelectedProduct(product)}
                            />
                          ))}
                      </div>

                      {products.filter(p => p.category === selectedSize && (selectedModel === 'All' || p.name.includes(selectedModel))).length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
                          <Tv className="w-16 h-16 mx-auto text-gray-200 mb-6" strokeWidth={1} />
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
                    <div className="w-full max-w-3xl bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-8">
                      <div className="mb-4">
                        <p className="text-xs sm:text-sm font-extrabold text-gray-600 uppercase tracking-widest">
                          Pick Fan Size
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                        {FAN_SIZES.map(size => (
                          <button
                            key={size}
                            onClick={() => handleSizeClick(size)}
                            className={`px-4 py-2 sm:px-7 sm:py-3 md:px-8 md:py-3 whitespace-nowrap rounded-full font-bold text-sm sm:text-base md:text-lg transition-all shadow-sm ${selectedSize === size
                                ? 'bg-gray-800 text-white shadow-md transform scale-105'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fan Model Selection Tabs */}
                    {FAN_MODELS[selectedSize] && FAN_MODELS[selectedSize].length > 0 && (
                      <div className="w-full max-w-3xl bg-gray-50 border border-gray-100 rounded-2xl shadow-sm p-5 mb-16">
                        <div className="mb-4">
                          <p className="text-xs sm:text-sm font-extrabold text-gray-600 uppercase tracking-widest">
                            Pick Fan Model
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        <button
                          onClick={() => {
                            setSelectedModel('All')
                            scrollToProductsForCategory(selectedMainCategory)
                          }}
                          className={`px-3 py-2 sm:px-5 whitespace-nowrap rounded-xl font-medium text-xs sm:text-sm md:text-base transition-colors ${selectedModel === 'All'
                              ? 'bg-gray-800 text-white shadow-md'
                              : 'bg-transparent text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          All models
                        </button>
                        {FAN_MODELS[selectedSize].map(model => (
                          <button
                            key={model}
                            onClick={() => {
                              setSelectedModel(model)
                              scrollToProductsForCategory(selectedMainCategory)
                            }}
                            className={`px-3 py-2 sm:px-5 whitespace-nowrap rounded-xl font-medium text-xs sm:text-sm md:text-base transition-colors ${selectedModel === model
                                ? 'bg-gray-800 text-white shadow-md'
                                : 'bg-transparent text-gray-600 hover:bg-gray-200'
                              }`}
                          >
                            {model}
                          </button>
                        ))}
                        </div>
                      </div>
                    )}

                    {/* Fan Product Grid */}
                    <div id="fan-products" className="w-full scroll-mt-24">
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products
                          .filter(p => p.category === selectedSize)
                          .filter(p => selectedModel === 'All' || p.name.includes(selectedModel))
                          .map((product) => (
                            <TVCard
                              key={product.id}
                              name={product.name}
                              price={`৳ ${product.price.toLocaleString()}`}
                              originalPrice={product.original_price ? `৳ ${product.original_price.toLocaleString()}` : null}
                              discountTag={product.discount_percentage}
                              image={product.image_url || ''}
                              onClick={() => setSelectedProduct(product)}
                            />
                          ))}
                      </div>

                      {products.filter(p => p.category === selectedSize && (selectedModel === 'All' || p.name.includes(selectedModel))).length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
                          <Wind className="w-16 h-16 mx-auto text-gray-200 mb-6" strokeWidth={1} />
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
                  <div className="w-full flex flex-col items-center">
                    <div id="cooker-products" className="w-full mt-4 scroll-mt-24">
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products
                          .filter(p => p.category === 'Cooker')
                          .map((product) => (
                            <TVCard
                              key={product.id}
                              name={product.name}
                              price={`৳ ${product.price.toLocaleString()}`}
                              originalPrice={product.original_price ? `৳ ${product.original_price.toLocaleString()}` : null}
                              discountTag={product.discount_percentage}
                              image={product.image_url || ''}
                              onClick={() => setSelectedProduct(product)}
                            />
                          ))}
                      </div>

                      {products.filter(p => p.category === 'Cooker').length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
                          <ChefHat className="w-16 h-16 mx-auto text-gray-200 mb-6" strokeWidth={1} />
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Rice Cookers Found</h3>
                          <p className="text-gray-500">We couldn&apos;t find any active rice cookers in our current inventory.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* MORE SECTION */}
                {selectedMainCategory === 'More' && (
                  <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm w-full max-w-4xl mx-auto my-8">
                    <Sparkles className="w-24 h-24 mx-auto text-gray-200 mb-8 mt-4" strokeWidth={1} />
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
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-10 md:mb-16">
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
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-10 md:mb-16">
              Contact <span className="text-red-600">Us</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Get In Touch</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-red-50 p-4 rounded-2xl mr-6 group-hover:bg-red-100 transition-colors">
                      <Mail className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Email</h4>
                      <p className="text-gray-600">info@osakatv.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-red-50 p-4 rounded-2xl mr-6 group-hover:bg-red-100 transition-colors">
                      <Phone className="w-6 h-6 text-red-600" />
                    </div>
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
<Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
  <DialogContent className="max-w-[90vw] md:max-w-[70vw] w-full p-0 overflow-hidden border-none bg-white rounded-3xl shadow-2xl">
    <DialogTitle className="sr-only">Product Details</DialogTitle>
    {selectedProduct && (
      <div className="flex flex-col md:flex-row max-h-[85vh] md:min-h-[60vh] overflow-y-auto">
        
        {/* Left Side: Large Product Display */}
        <div className="w-full md:w-1/2 bg-[#fdfdfd] flex items-center justify-center p-6 md:p-12 relative border-b md:border-b-0 md:border-r border-gray-100 min-h-[250px] md:min-h-0">
          <div className="absolute top-4 left-4 md:top-10 md:left-10 z-10 flex flex-col gap-2 items-start">
             <Badge className="bg-red-600 text-white border-0 px-4 md:px-6 py-1.5 md:py-2 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg">
              OSAKA AUTHENTIC
            </Badge>
            {selectedProduct.discount_percentage && (
               <Badge className="bg-black text-white border-0 px-4 md:px-6 py-1.5 md:py-2 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg">
                 {selectedProduct.discount_percentage}
               </Badge>
            )}
          </div>

          {selectedProduct.image_url ? (
            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.name}
              className="w-full max-h-[200px] md:max-h-[350px] object-contain drop-shadow-xl"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 mb-4">
              <Package className="w-24 h-24 text-gray-200" strokeWidth={1} />
            </div>
          )} 
        </div>

        {/* Right Side: Information */}
        <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-between bg-white">
          <div className="space-y-6 md:space-y-8">
            {/* Title & Status */}
            <div>
              <div className="flex items-center gap-2 text-green-600 font-bold text-[10px] md:text-xs uppercase tracking-[0.3em] mb-3 md:mb-4">
                <CheckCircle2 size={16} strokeWidth={3} className="md:w-[18px] md:h-[18px]" />
                Verified Factory Stock
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
                {selectedProduct.name}
              </h2>
            </div>

            {/* Price & Info Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-8 border-y border-gray-100 py-6 md:py-8">
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-widest mb-1 md:mb-2">Price</p>
                {selectedProduct.original_price && (
                  <div className="text-sm md:text-base text-gray-400 font-bold line-through mb-1">
                    ৳{selectedProduct.price.toLocaleString()}
                  </div>
                )}
                <div className="text-3xl md:text-5xl font-black text-red-600 tracking-tighter">
                  ৳{(selectedProduct.original_price || selectedProduct.price).toLocaleString()}
                </div>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-widest mb-1 md:mb-2">Model Size</p>
                <p className="text-xl md:text-2xl font-black text-gray-800">{selectedProduct.size || 'N/A'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 md:space-y-4">
              <p className="text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">Specifications</p>
              <div className="text-base md:text-lg text-gray-600 leading-relaxed bg-gray-50/50 p-4 md:p-6 rounded-2xl border border-gray-100">
                {selectedProduct.description || "Premium OSAKA technology designed for high performance and energy efficiency."}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-8 md:mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <a 
                href={`https://wa.me/8801886469096?text=${encodeURIComponent(`Hello Osaka Television!\nI would like to order:\n*${selectedProduct.name}*\n\nPrice: ৳${(selectedProduct.original_price || selectedProduct.price).toLocaleString()}\nSize: ${selectedProduct.size || 'N/A'}\n${selectedProduct.image_url ? `\nProduct Image: ${selectedProduct.image_url}` : ''}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-4 md:py-6 rounded-xl md:rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm md:text-base cursor-pointer"
              >
                Order via WhatsApp
              </a>
              <a 
                href="tel:+8801886469096"
                className="bg-black hover:bg-gray-800 text-white font-black py-4 md:py-6 rounded-xl md:rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm md:text-base cursor-pointer"
              >
                Call Expert
              </a>
            </div>
            <div className="flex justify-between mt-6 md:mt-8 opacity-40 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em]">
              <span>Free Delivery</span>
              <span>12 Months Warranty</span>
              <span>Genuine</span>
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