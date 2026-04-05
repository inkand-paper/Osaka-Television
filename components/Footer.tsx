import { Facebook, MessageCircle, Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="relative bg-[#050505] text-white pt-20 pb-10 overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Corner */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black tracking-tighter text-white">
              OSAKA <span className="text-red-600">GROUP</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Redefining the standards of home electronics in Bangladesh. We bring you premium technology designed for durability, efficiency, and the ultimate user experience.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://facebook.com/oscarintosaka/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border-2 border-transparent bg-blue-600 flex items-center justify-center hover:scale-110 hover:border-white transition-all duration-300 shadow-lg shadow-blue-600/30">
                <Facebook size={24} className="text-white fill-current" />
              </a>
              <a href="https://wa.me/8801886469096" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border-2 border-transparent bg-green-500 flex items-center justify-center hover:scale-110 hover:border-white transition-all duration-300 shadow-lg shadow-green-500/30">
                <MessageCircle size={24} className="text-white fill-current" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-red-600 mb-8">Navigation</h4>
            <ul className="space-y-4 text-gray-400 font-bold text-sm">
              <li><a href="#home" className="hover:text-white transition-colors">Digital Showroom</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Our Legacy</a></li>
              <li><a href="#category" className="hover:text-white transition-colors">All Products</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Visual Gallery</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Get in Touch</a></li>
            </ul>
          </div>


          {/* Contact Details */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-red-600 mb-8">Showrooms</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-3 group">
                <MapPin size={18} className="text-red-600 mt-1 shrink-0" />
                <div className="text-gray-400 text-sm leading-relaxed group-hover:text-white transition-colors">
                  <strong className="text-white block mb-1">Corporate Office:</strong>
                  মহম্মদপুর, কাদেরাবাদ হাউসিং, রোড ৫, ব্লক বি, বাসা ৪, গ্রাউন্ড ফ্লোর । 
                  <a href="tel:01886469096" className="block mt-1 font-bold text-red-500 hover:text-white">📲 01886469096</a>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <MapPin size={18} className="text-red-600 mt-1 shrink-0" />
                <div className="text-gray-400 text-sm leading-relaxed group-hover:text-white transition-colors">
                  <strong className="text-white block mb-1">Wholesale Center:</strong>
                  গুলিস্তান, কাপ্তান বাজার কম্পলেক্স -ভবন ২, ২য় তলা, দোকান নং- ১০৫ (105) & ১০৬ (106), নওয়াবপুর রোড, ঢাকা।
                  <a href="tel:01934009834" className="block mt-1 font-bold text-red-500 hover:text-white">📲 01934009834</a>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <MapPin size={18} className="text-red-600 mt-1 shrink-0" />
                <div className="text-gray-400 text-sm leading-relaxed group-hover:text-white transition-colors">
                  <strong className="text-white block mb-1">Sales Center:</strong>
                  এলিফ্যান্ট রোড, আইসিটি ভবন (সুভাসতু আর্কেড), লেভেল ৩, দোকান নং: ৩০৮ (308)।
                  <a href="tel:01401111245" className="block mt-1 font-bold text-red-500 hover:text-white">📲 01401111245</a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest">
            &copy; 2026 OSAKA GROUP. AUTHORIZED GLOBAL STORE.
          </p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <a href="#" className="hover:text-red-600">Privacy Policy</a>
            <a href="#" className="hover:text-red-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}