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
            <div className="flex gap-4">
              <a href="https://facebook.com" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-600 transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href="https://wa.me/8801886469096" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-green-600 transition-all duration-300">
                <MessageCircle size={18} />
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

          {/* Customer Trust */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-red-600 mb-8">Customer Trust</h4>
            <ul className="space-y-4 text-gray-400 font-bold text-sm">
              <li className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-red-600" />
                <span>Genuine Warranty</span>
              </li>
              <li className="flex items-center gap-3">
                <Truck size={16} className="text-red-600" />
                <span>Fast Home Delivery</span>
              </li>
              <li className="flex items-center gap-3">
                <RefreshCw size={16} className="text-red-600" />
                <span>7 Days Replacement</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-red-600 mb-8">HQ Showroom</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <MapPin size={18} className="text-red-600 mt-1 shrink-0" />
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-white transition-colors">
                  Kaptan Bazar Complex -Building 2, Shop no: 106 and 52, (first floor), Nowabpur road, Dhaka.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-red-600 shrink-0" />
                <a href="tel:01886469096" className="text-gray-400 text-sm hover:text-white transition-colors">01886-469096</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-red-600 shrink-0" />
                <a href="mailto:oscar_elec722@yahoo.com" className="text-gray-400 text-sm hover:text-white transition-colors">oscar_elec722@yahoo.com</a>
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