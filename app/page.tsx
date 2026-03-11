'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import HeroCarousel from '@/components/HeroCarousel'
import Footer from '@/components/Footer'
import TVCard from '@/components/TVCard'
import SocialLinks from '@/components/SocialLinks'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  category: string
  size: string
  price: number
  description: string
  image_url: string | null
  is_active: boolean
}

const CATEGORY_MODELS: Record<string, string[]> = {
  "24 inch": ["Basic Frameless", "Basic Double Glass", "Smart Frameless", "Smart Double Glass"],
  "32 inch": ["Regular Series", "Gold Series", "Google TV"],
  "43 inch": ["Regular Series", "Gold Series", "Google TV"],
  "50 inch": ["Regular Series", "Gold Series", "Google TV"],
  "65 inch": ["Regular Series", "Gold Series", "Google TV"],
}

const SIZES = ['24 inch', '32 inch', '43 inch', '50 inch', '65 inch'];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>('32 inch')
  const [selectedModel, setSelectedModel] = useState<string>('All')

  // When size changes, reset model selection to All
  const handleSizeClick = (size: string) => {
    setSelectedSize(size)
    setSelectedModel('All')
  }

  useEffect(() => {
    fetchProducts()
  }, [])

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

  const getProductsByCategory = (category: string) => {
    return products.filter(p => p.category === category)
  }

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
              <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/assets/images/about/about-osaka.jpeg"
                  alt="About Osaka"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

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
                {/* Size Selection Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => handleSizeClick(size)}
                      className={`px-8 py-3 rounded-full font-bold text-lg transition-all shadow-sm ${selectedSize === size
                          ? 'bg-red-600 text-white shadow-md transform scale-105'
                          : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Subcategory / Model Selection Tabs */}
                {CATEGORY_MODELS[selectedSize] && CATEGORY_MODELS[selectedSize].length > 0 && (
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
                    {CATEGORY_MODELS[selectedSize].map(model => (
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

                {/* Product Grid */}
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
                        />
                      ))}
                  </div>

                  {products.filter(p => p.category === selectedSize && (selectedModel === 'All' || p.name.includes(selectedModel))).length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
                      <div className="text-6xl mb-4">📺</div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">No TVs Found</h3>
                      <p className="text-gray-500">We couldn't find any active TVs in our current inventory matching your selection.</p>
                      <button
                        onClick={() => handleSizeClick('32 inch')}
                        className="mt-6 px-6 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
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

      <Footer />
      <SocialLinks />
    </div>
  )
}