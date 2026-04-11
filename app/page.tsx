'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
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
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Package, Tv, Wind, ChefHat, Sparkles, Mail, Phone, ImageIcon, Clock, Calendar, ArrowRight, X, ChevronDown, Shield, Zap, Maximize, MessageSquare } from "lucide-react"
import GalleryLightbox from '@/components/GalleryLightbox'

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

interface GalleryItem {
  id: string
  image_url: string
  caption: string
  display_order: number
}

const MAIN_CATEGORIES = ['Television', 'Fan', 'Cooker', 'More'];

const TV_SIZES = ['24 inch', '32 inch', '43 inch', '50 inch', '65 inch'];
const TV_MODELS: Record<string, string[]> = {
  "24 inch": ["Basic Frameless", "Basic Double Glass", "Smart Frameless", "Smart Double Glass", "Regular Series", "Gold Series", "Google TV"],
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
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('Television')
  const [selectedSize, setSelectedSize] = useState<string>('32 inch')
  const [selectedModel, setSelectedModel] = useState<string>('All')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showSpecs, setShowSpecs] = useState(false)
  
  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const scrollToId = (id: string) => {
  window.setTimeout(() => {
    const el = document.getElementById(id)
    if (!el) return

    const headerH =
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h')
      ) || 80

    const y = el.getBoundingClientRect().top + window.pageYOffset - headerH
    window.scrollTo({ top: y, behavior: 'smooth' })
  }, 120)
}

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

    scrollToId(targetId)
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
    // Auto scroll to the first sub-chooser (TV size / Fan size).
    if (category === 'Television') scrollToId('tv-size-picker')
    else if (category === 'Fan') scrollToId('fan-size-picker')
    // Cooker has no sub-steps.
    else if (category === 'Cooker') scrollToProductsForCategory(category)
  }

  // When size changes, reset model selection to All
  const handleSizeClick = (size: string) => {
    setSelectedSize(size)
    setSelectedModel('All')
    // Auto scroll to the second sub-chooser (TV series / Fan model).
    if (selectedMainCategory === 'Television') scrollToId('tv-series-picker')
    else if (selectedMainCategory === 'Fan') scrollToId('fan-series-picker')
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

  const fetchGallery = async () => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching gallery:', error)
    } else {
      setGalleryItems(data || [])
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchGallery()
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
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">

      <Navbar />

      
        <main className="bg-white">
          <HeroCarousel onShopNow={(slideTitle) => {
            const titleLower = slideTitle.toLowerCase()
            const matchedProduct = products.find(p => {
              const nameLower = p.name.toLowerCase()
              return titleLower.includes(nameLower) || nameLower.includes(titleLower)
            })
            
            if (matchedProduct) {
              setSelectedProduct(matchedProduct);
            } else {
              scrollToId('category');
            }
          }} />

        {/* ABOUT SECTION */}
        <motion.section 
          id="about" 
          className="py-32 sm:py-48 bg-white relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-black/[0.01] blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 md:gap-32 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-[1px] bg-black/10" />
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-[0.4em]">Corporate Excellence</span>
                </div>
                
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-black mb-12 leading-[0.9] tracking-tighter">
                  INTELLIGENT <br />
                  <span className="text-black/10 italic">ENGINEERING</span>
                </h2>
                
                <div className="space-y-10 text-black/50 text-base md:text-lg leading-relaxed font-medium">
                  <p className="max-w-xl">
                    Forging the future of visual intelligence since 1994. Osaka Group stands at the intersection of monolithic design and pure performance, delivering over 2 million display solutions to a global audience.
                  </p>
                  <div className="flex flex-col gap-4 pt-4 border-l border-black/5 pl-8">
                    <span className="text-[10px] font-bold text-black/20 uppercase tracking-[0.3em]">Operational Milestone</span>
                    <p className="text-black font-bold text-2xl tracking-tight">
                      "32 Years of Precision Innovation."
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5 border border-black/5 group aspect-square lg:aspect-[4/5] xl:aspect-[3/4]">
                  <img
                    src="/assets/images/about/imageAbout.PNG"
                    alt="Engineering"
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-[2000ms] ease-[0.23,1,0.32,1] object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* NEWLY ARRIVED SECTION */}
        {!loading && products.length > 0 && (
        <motion.section 
          id="newly-arrived" 
          className="py-32 sm:py-48 bg-[#f9f9fb] border-y border-black/[0.03]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
                <div>
                   <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 mb-6"
                  >
                    <div className="w-1.5 h-1.5 rounded-full pulse-red" />
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-[0.4em]">Latest Catalog</span>
                  </motion.div>
                  <h2 className="text-4xl md:text-7xl font-black text-black uppercase tracking-tighter leading-none">
                    NEW <span className="text-black/10 italic">RELEASES</span>
                  </h2>
                </div>
                <p className="text-black/30 max-w-sm text-sm font-medium leading-relaxed">
                  Precision-manufactured units incorporating our newest sensory and visual hardware.
                </p>
              </div>

              <div className="flex overflow-x-auto pb-12 snap-x snap-mandatory hide-scroll-bar gap-6 md:gap-8 px-4 -mx-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:mx-0 md:px-0">
                {getLatestProducts().map((product, idx) => (
                  <motion.div 
                    key={`new-${product.id}`} 
                    className="snap-center w-[280px] md:w-auto shrink-0"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <TVCard
                      name={product.name}
                      price={product.original_price ? `MRP  ${product.original_price.toLocaleString()}  ৳` : `MRP  ${product.price.toLocaleString()} ৳`}
                      originalPrice={product.original_price ? `MRP  ${product.price.toLocaleString()}  ৳` : null}
                      discountTag={product.discount_percentage ? product.discount_percentage : 'NEW'}
                      image={product.image_url || ''}
                      onClick={() => setSelectedProduct(product)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* CATEGORY SECTION */}
        <motion.section 
          id="category" 
          className="py-32 sm:py-48 bg-white border-t border-black/[0.03]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 mb-6"
                >
                  <div className="w-1.5 h-1.5 rounded-full pulse-red" />
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-[0.4em]">Integrated Solutions</span>
                </motion.div>
                <h2 className="text-4xl md:text-7xl font-black text-black uppercase tracking-tighter leading-none">
                  THE <span className="text-black/10 italic">COLLECTION</span>
                </h2>
              </div>
              <p className="text-black/30 max-w-sm text-sm font-medium leading-relaxed">
                Discover the technical specifications and unparalleled performance of our certified hardware series.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-32 flex flex-col items-center">
                <div className="w-8 h-[1px] bg-white/20 animate-pulse mb-8" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Querying Database...</p>
              </div>
            ) : (
            <div className="flex flex-col items-center w-full">
                {/* Main Category Selection Tabs - Modern Horizontal Scroll on Mobile */}
                <div className="w-full overflow-x-auto pb-16 hide-scroll-bar">
                  <div className="flex justify-start md:justify-center gap-4 px-4 min-w-max mx-auto">
                    {MAIN_CATEGORIES.map(category => (
                      <motion.button
                        key={category}
                        layout
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMainCategoryClick(category)}
                        className={`px-10 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-500 border ${selectedMainCategory === category
                            ? 'bg-black text-white border-black shadow-2xl'
                            : 'bg-black/[0.01] text-black/40 border-black/5 hover:border-black/10 hover:text-black'
                          }`}
                      >
                        {category}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* TELEVISION SECTION */}
                {selectedMainCategory === 'Television' && (
                  <div className="w-full flex flex-col items-center">
                    {/* TV Size Selection Tabs */}
                    <div
                      id="tv-size-picker"
                      className="w-full max-w-5xl bg-[#f9f9fb] rounded-[2.5rem] p-10 sm:p-14 mb-12 scroll-mt-32 border border-black/5 shadow-inner"
                    >
                      <div className="mb-10 flex items-center gap-4">
                        <div className="w-12 h-px bg-black/10" />
                        <p className="text-[10px] sm:text-xs font-black text-black/40 uppercase tracking-[0.5em]">
                          Selection Matrix / Size
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                        {TV_SIZES.map(size => (
                          <button
                            key={size}
                            onClick={() => handleSizeClick(size)}
                            className={`px-8 py-4 md:px-12 md:py-6 whitespace-nowrap rounded-2xl font-black text-[10px] sm:text-sm transition-all border ${selectedSize === size
                                ? 'bg-black text-white border-black shadow-2xl scale-105'
                                : 'bg-white/50 text-black/30 hover:text-black/60 border-black/5 hover:bg-white'
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* TV Model Selection Tabs */}
                    {TV_MODELS[selectedSize] && TV_MODELS[selectedSize].length > 0 && (
                      <div
                        id="tv-series-picker"
                        className="w-full max-w-5xl bg-[#f9f9fb] rounded-[2.5rem] p-10 sm:p-14 mb-14 sm:mb-24 scroll-mt-32 border border-black/5 shadow-inner"
                      >
                        <div className="mb-10 flex items-center gap-4">
                          <div className="w-12 h-px bg-black/10" />
                          <p className="text-[10px] sm:text-xs font-black text-black/40 uppercase tracking-[0.5em]">
                             Premium Series / Model
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                          <button
                            onClick={() => {
                              setSelectedModel('All')
                              scrollToProductsForCategory(selectedMainCategory)
                            }}
                            className={`px-6 py-3 md:px-12 md:py-5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all border ${
                              selectedModel === 'All'
                                ? 'bg-black text-white border-black shadow-2xl scale-105'
                                : 'bg-white/50 text-black/30 hover:text-black/60 border-black/5 hover:bg-white'
                            }`}
                          >
                            All series
                          </button>

                          {TV_MODELS[selectedSize].map(model => (
                            <button
                              key={model}
                              onClick={() => {
                                setSelectedModel(model)
                                scrollToProductsForCategory(selectedMainCategory)
                              }}
                              className={`px-6 py-3 md:px-12 md:py-5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all border ${
                                selectedModel === model
                                  ? 'bg-black text-white border-black shadow-2xl scale-105'
                                  : 'bg-white/50 text-black/30 hover:text-black/60 border-black/5 hover:bg-white'
                              }`}
                            >
                              {model}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TV Product Grid */}
                    <div id="tv-products" className="w-full scroll-mt-32">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                        {products
                          .filter(p => p.category === selectedSize)
                          .filter(p => selectedModel === 'All' || p.name.includes(selectedModel))
                          .map((product) => (
                            <TVCard
                              key={product.id}
                              name={product.name}
                              price={product.original_price ? `MRP  ${product.original_price.toLocaleString()}  ৳` : `MRP  ${product.price.toLocaleString()}  ৳`}
                              originalPrice={product.original_price ? `MRP  ${product.price.toLocaleString()}  ৳` : null}
                              discountTag={product.discount_percentage}
                              image={product.image_url || ''}
                              onClick={() => setSelectedProduct(product)}
                            />
                          ))}
                      </div>

                      {products.filter(p => p.category === selectedSize && (selectedModel === 'All' || p.name.includes(selectedModel))).length === 0 && (
                        <div className="text-center py-24 sm:py-32 glass rounded-[3rem] border border-white/5 w-full">
                          <Tv className="w-24 h-24 mx-auto text-white/10 mb-8" strokeWidth={1} />
                          <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Inventory Empty</h3>
                          <p className="text-gray-500 max-w-sm mx-auto font-medium">We couldn&apos;t find any active units in the current selection.</p>
                          <button
                            onClick={() => handleSizeClick('32 inch')}
                            className="mt-10 px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-full border border-white/10 transition-all"
                          >
                            Reset Parameters
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
                    <div
                      id="fan-size-picker"
                      className="w-full max-w-5xl bg-[#f9f9fb] rounded-[2.5rem] p-10 sm:p-14 mb-12 scroll-mt-32 border border-black/5 shadow-inner"
                    >
                      <div className="mb-10 flex items-center gap-4">
                        <div className="w-12 h-px bg-black/10" />
                        <p className="text-[10px] sm:text-xs font-black text-black/40 uppercase tracking-[0.5em]">
                           Technical Matrix / Scale
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-4">
                        {FAN_SIZES.map(size => (
                          <button
                            key={size}
                            onClick={() => handleSizeClick(size)}
                            className={`px-10 py-4 md:px-12 md:py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border ${selectedSize === size
                                ? 'bg-black text-white border-black shadow-2xl scale-105'
                                : 'bg-white/50 text-black/30 hover:text-black/60 border-black/5 hover:bg-white'
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fan Model Selection Tabs */}
                    {FAN_MODELS[selectedSize] && FAN_MODELS[selectedSize].length > 0 && (
                      <div
                        id="fan-series-picker"
                        className="w-full max-w-5xl bg-[#f9f9fb] rounded-[2.5rem] p-10 sm:p-14 mb-20 scroll-mt-32 border border-black/5 shadow-inner"
                      >
                         <div className="mb-10 flex items-center gap-4">
                          <div className="w-12 h-px bg-black/10" />
                          <p className="text-[10px] sm:text-xs font-black text-black/40 uppercase tracking-[0.5em]">
                             Series Differentiation
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                          <button
                            onClick={() => {
                              setSelectedModel('All')
                              scrollToProductsForCategory(selectedMainCategory)
                            }}
                            className={`px-10 py-5 rounded-2xl font-bold text-[9px] uppercase tracking-[0.3em] transition-all border ${
                              selectedModel === 'All'
                                ? 'bg-black text-white border-black shadow-2xl scale-105'
                                : 'bg-white/50 text-black/30 hover:text-black/60 border-black/5 hover:bg-white'
                            }`}
                          >
                            Unified Catalog
                          </button>

                          {FAN_MODELS[selectedSize].map(model => (
                            <button
                              key={model}
                              onClick={() => {
                                setSelectedModel(model)
                                scrollToProductsForCategory(selectedMainCategory)
                              }}
                              className={`px-10 py-5 rounded-2xl font-bold text-[9px] uppercase tracking-[0.3em] transition-all border ${
                                selectedModel === model
                                  ? 'bg-black text-white border-black shadow-2xl scale-105'
                                  : 'bg-white/50 text-black/30 hover:text-black/60 border-black/5 hover:bg-white'
                              }`}
                            >
                              {model}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fan Product Grid */}
                    <div id="fan-products" className="w-full scroll-mt-32">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                        {products
                          .filter(p => p.category === selectedSize)
                          .filter(p => selectedModel === 'All' || p.name.includes(selectedModel))
                          .map((product) => (
                            <TVCard
                              key={product.id}
                              name={product.name}
                              price={`MRP  ${product.price.toLocaleString()}  ৳`}
                              originalPrice={product.original_price ? `MRP  ${product.original_price.toLocaleString()}  ৳` : null}
                              discountTag={product.discount_percentage}
                              image={product.image_url || ''}
                              onClick={() => setSelectedProduct(product)}
                            />
                          ))}
                      </div>

                      {products.filter(p => p.category === selectedSize && (selectedModel === 'All' || p.name.includes(selectedModel))).length === 0 && (
                        <div className="text-center py-24 sm:py-32 bg-[#f9f9fb] rounded-[3rem] border border-black/5 w-full">
                          <Wind className="w-24 h-24 mx-auto text-black/5 mb-8" strokeWidth={1} />
                          <h3 className="text-3xl font-black text-black mb-4 uppercase tracking-tighter">Inventory Empty</h3>
                          <p className="text-black/30 max-w-sm mx-auto font-medium">We couldn&apos;t find any active units in the current selection.</p>
                          <button
                            onClick={() => handleSizeClick('16 inch')}
                            className="mt-10 px-10 py-4 bg-black text-white font-black uppercase tracking-widest text-xs rounded-full border border-black/10 transition-all hover:bg-zinc-800"
                          >
                            Reset Parameters
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* COOKER SECTION */}
                {selectedMainCategory === 'Cooker' && (
                  <div className="w-full flex flex-col items-center">
                    <div id="cooker-products" className="w-full mt-4 scroll-mt-32">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                        {products
                          .filter(p => p.category === 'Cooker')
                          .map((product) => (
                            <TVCard
                              key={product.id}
                              name={product.name}
                              price={`MRP  ${product.price.toLocaleString()}  ৳`}
                              originalPrice={product.original_price ? `MRP  ${product.original_price.toLocaleString()}  ৳` : null}
                              discountTag={product.discount_percentage}
                              image={product.image_url || ''}
                              onClick={() => setSelectedProduct(product)}
                            />
                          ))}
                      </div>

                      {products.filter(p => p.category === 'Cooker').length === 0 && (
                        <div className="text-center py-24 sm:py-32 bg-[#f9f9fb] rounded-[2.5rem] border border-black/5 w-full shadow-inner">
                          <ChefHat className="w-16 h-16 mx-auto text-black/10 mb-6" strokeWidth={1} />
                          <h3 className="text-3xl font-black text-black mb-4 uppercase tracking-tighter">Inventory Empty</h3>
                          <p className="text-black/30 max-w-sm mx-auto font-medium">We couldn&apos;t find any active culinary units in our current inventory.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* MORE SECTION */}
                {selectedMainCategory === 'More' && (
                  <div className="text-center py-48 bg-white rounded-[3rem] border border-black/[0.03] w-full max-w-5xl mx-auto my-12 relative overflow-hidden shadow-2xl shadow-black/5">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-black/5 to-transparent" />
                    <Sparkles className="w-24 h-24 mx-auto text-black/[0.02] mb-12" strokeWidth={0.5} />
                    <h2 className="text-4xl md:text-6xl font-black text-black mb-8 uppercase tracking-tighter">FUTURE <span className="text-black/10 text-4xl italic">PROTOCOLS</span></h2>
                    <p className="text-lg text-black/30 max-w-xl mx-auto leading-relaxed font-medium px-8">
                      Our ecosystem is expanding into next-generation sensory and domestic hardware. Initializing roadmap protocols.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.section>

        {/* GALLERY SECTION */}
        <motion.section 
          id="gallery" 
          className="py-32 sm:py-48 bg-white border-t border-black/[0.03]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-32">
              <div className="flex flex-col items-center gap-4 mb-4">
                <span className="text-[10px] font-bold text-black/20 uppercase tracking-[0.5em]">Visionary Artifacts</span>
                <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
              </div>
              <h2 className="text-5xl md:text-8xl font-black text-black uppercase tracking-tighter">
                SPEC <span className="text-black/10 italic">SHOWCASE</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {galleryItems.length > 0 ? (
                  galleryItems.map((item, idx) => (
                    <motion.div 
                      key={item.id} 
                      whileHover={{ scale: 1.02, y: -5 }}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: idx * 0.05, ease: [0.23, 1, 0.32, 1] }}
                      onClick={() => {
                        setLightboxIndex(idx)
                        setIsLightboxOpen(true)
                      }}
                      className="group relative overflow-hidden rounded-[2rem] aspect-square bg-[#f9f9fb] border border-black/[0.03] cursor-zoom-in"
                    >
                      <img 
                        src={item.image_url} 
                        alt={item.caption || "Gallery"} 
                        className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000 ease-[0.23,1,0.32,1]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                        <div>
                          <p className="text-black font-bold text-[10px] tracking-[0.2em] uppercase">{item.caption}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  [1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <div key={item} className="bg-[#f9f9fb] h-64 md:h-80 rounded-[2rem] border border-black/[0.03] border-dashed animate-pulse" />
                  ))
                )}
            </div>
          </div>
        </motion.section>

        {/* CONTACT SECTION */}
        <motion.section 
          id="contact" 
          className="py-32 sm:py-48 bg-white relative border-t border-black/[0.03]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 md:gap-32 items-start">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-[1px] bg-black/10" />
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-[0.4em]">Establish Communication</span>
                </div>
                <h2 className="text-5xl md:text-9xl font-black text-black mb-16 leading-[0.85] tracking-tighter">
                  CONNECT <br />
                  <span className="text-black/10">CENTER</span>
                </h2>
                
                <div className="space-y-16">
                  <div className="flex items-center gap-10">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-black/[0.02] border border-black/5 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-black/40" />
                    </div>
                    <div>
                      <h4 className="text-[9px] font-black text-black/20 uppercase tracking-[0.4em] mb-2">Technical Direct</h4>
                      <p className="text-3xl font-black text-black tracking-[0.1em] leading-none font-mono">01886-469096</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-10">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-black/[0.02] border border-black/5 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-black/40" />
                    </div>
                    <div>
                      <h4 className="text-[9px] font-bold text-black/20 uppercase tracking-[0.4em] mb-2">General Inquiry</h4>
                      <p className="text-xl font-bold text-black tracking-[0.1em] leading-none uppercase">info@osakagroup.com</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-[#f9f9fb] p-10 md:p-20 rounded-[3rem] border border-black/[0.03] relative overflow-hidden shadow-2xl shadow-black/5"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="flex flex-col gap-12">
                  <div className="flex items-center gap-8">
                    <div className="w-1.5 h-1.5 rounded-full pulse-red" />
                    <h3 className="text-2xl font-black text-black uppercase tracking-tighter">Presence</h3>
                  </div>
                  
                  <div className="space-y-12">
                    <div className="flex flex-col gap-4">
                      <h4 className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em]">Core Operations</h4>
                      <p className="text-black/60 text-base leading-relaxed font-medium">
                        Mohammadpur, Kaderabad Housing, Road 5, Block B, House 4, Ground Floor.
                      </p>
                    </div>
 
                    <div className="flex flex-col gap-4">
                      <h4 className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em]">Distribution Node</h4>
                      <p className="text-black/60 text-base leading-relaxed font-medium">
                        Gulistan, Kaptan Bazar Complex - Bldg 2, 2nd Floor, Shop 105 & 106, Dhaka.
                      </p>
                    </div>
 
                    <div className="flex flex-col gap-4">
                      <h4 className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em]">Flagship Outlet</h4>
                      <p className="text-black/60 text-base leading-relaxed font-medium">
                        Elephant Road, Subastu Arcade, Level 3, Shop 308.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      
      

      {/* PRODUCT DETAILS MODAL */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[70vw] w-full p-0 overflow-hidden border border-black/[0.05] bg-white rounded-[2rem] shadow-2xl h-[90vh] sm:h-auto sm:max-h-[85vh]">
          <DialogTitle className="sr-only">Hardware Specification Detail</DialogTitle>
          {selectedProduct && (
            <div className="flex flex-col xl:flex-row h-full overflow-hidden">
              
              {/* Left Side: Specialized Display Stage */}
              <div className="w-full xl:w-[45%] bg-[#f9f9fb] flex items-center justify-center p-8 md:p-12 relative border-b xl:border-b-0 xl:border-r border-black/[0.03] min-h-[250px] sm:min-h-[350px] xl:h-full overflow-hidden">
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-3 items-start text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full pulse-red" />
                    <span className="text-[9px] font-black text-black uppercase tracking-[0.4em]">Operational_Stage</span>
                  </div>
                  {selectedProduct.discount_percentage && (
                    <div className="px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-sm shadow-xl">
                      {selectedProduct.discount_percentage}
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 bg-radial-gradient from-black/[0.03] to-transparent opacity-40 pointer-events-none" />

                {selectedProduct.image_url ? (
                  <motion.img
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full max-h-[200px] sm:max-h-[280px] md:max-h-[400px] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.1)] z-10 hover:scale-[1.03] transition-transform duration-1000"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-black/[0.01] rounded-[2rem] border border-black/5">
                    <Package className="w-12 h-12 text-black/5" strokeWidth={1} />
                  </div>
                )} 
              </div>

              {/* Right Side: High-Precision Documentation */}
              <div className="w-full xl:w-[55%] flex flex-col h-full bg-white relative overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 sm:p-10 md:p-12 xl:p-16 space-y-12">
                  {/* Title & Status Block */}
                  <div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black leading-[0.95] tracking-tight mb-4">
                      {selectedProduct.name}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-[1px] bg-black/20" />
                      <p className="text-[9px] font-bold text-black/30 uppercase tracking-[0.3em]">Code: {selectedProduct.id.slice(0, 8)}</p>
                    </div>
                  </div>

                  {/* Commercial Value & Specifications Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-10 border-y border-black/[0.03]">
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black text-black/20 uppercase tracking-[0.4em]">Commercial Value</h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-none">
                          {(selectedProduct.original_price || selectedProduct.price).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black text-black/30 uppercase tracking-[0.1em]">৳</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black text-black/20 uppercase tracking-[0.4em]">Dimensions</h4>
                      <div className="flex items-baseline gap-2">
                         <p className="text-xl sm:text-2xl font-black text-black tracking-tighter uppercase whitespace-nowrap">{selectedProduct.size || 'Unspecified'}</p>
                         <span className="text-[10px] font-black text-black/30 uppercase tracking-[0.1em]">Class</span>
                      </div>
                    </div>
                  </div>

                  {/* Specifications Accordion */}
                  <div className="space-y-6">
                    <button 
                      onClick={() => setShowSpecs(!showSpecs)}
                      className="w-full flex items-center justify-between py-6 border-b border-black/[0.03] group transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-[1px] bg-black/10" />
                        <span className="text-[10px] font-bold text-black uppercase tracking-[0.3em] group-hover:text-red-600 transition-colors">Technical Parameters</span>
                      </div>
                      <motion.div
                        animate={{ rotate: showSpecs ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={14} className="text-black/20 group-hover:text-black" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {showSpecs && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="py-6 space-y-6">
                            {selectedProduct.description ? (
                              selectedProduct.description.split('\n').map((line: string, i: number) => {
                                const parts = line.split(':');
                                if (parts.length >= 2) {
                                  return (
                                    <div key={i} className="flex justify-between items-center group">
                                      <span className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em]">{parts[0].trim()}</span>
                                      <span className="text-xs font-bold text-black tracking-widest">{parts.slice(1).join(':').trim()}</span>
                                    </div>
                                  );
                                }
                                return (
                                  <div key={i} className="flex gap-4 items-center">
                                    <div className="w-1 h-1 rounded-full bg-black/10" />
                                    <span className="text-xs font-medium text-black/40 leading-relaxed uppercase tracking-widest">{line}</span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center py-8 text-[9px] font-bold text-black/10 uppercase tracking-widest italic">
                                Null Documentation.
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action Deployment */}
                  <div className="flex flex-col gap-4 pt-4 border-t border-black/[0.03] mt-auto">
                    <a 
                      href={`https://wa.me/8801886469096?text=${encodeURIComponent(`Hello OSAKA GROUP!\nInquiry regarding:\n*${selectedProduct.name}*\n\nValue: MRP  ${(selectedProduct.original_price || selectedProduct.price).toLocaleString()}  ৳\nClass: ${selectedProduct.size || 'N/A'}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-black text-white font-black py-5 rounded-xl transition-all hover:bg-zinc-800 hover:shadow-2xl hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px] premium-shadow"
                    >
                      <MessageSquare className="w-4 h-4" /> Initialize Order
                    </a>
                    <a 
                      href="tel:+8801886469096"
                      className="flex-1 bg-black/[0.03] border border-black/10 text-black font-bold py-6 rounded-full transition-all hover:bg-black/[0.06] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px]"
                    >
                      Voice Verification
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* GALLERY LIGHTBOX */}
      <GalleryLightbox 
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={galleryItems.map(item => item.image_url)}
        currentIndex={lightboxIndex}
        setCurrentIndex={setLightboxIndex}
      />

      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, backgroundColor: '#000', color: '#fff' }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 right-8 z-[100] bg-white text-black/40 p-5 rounded-2xl shadow-2xl border border-black/5 md:bottom-10 md:right-32 hidden sm:flex items-center justify-center transition-all duration-300"
      >
        <Package className="w-6 h-6 rotate-180" />
      </motion.button>

      <Footer />
      <SocialLinks />
      <BottomNav />
    </div>
  )
}