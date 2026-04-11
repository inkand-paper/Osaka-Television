'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Mail, Phone, MapPin, Shield, Zap, Globe } from 'lucide-react'

const footerLinks = [
  {
    title: 'Selection',
    links: [
      { name: 'Hardware Stack', href: '#category' },
      { name: 'Display Intelligence', href: '#home' },
      { name: 'Technical Spec', href: '#gallery' },
      { name: 'Core Systems', href: '#about' }
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'Corporate Info', href: '#about' },
      { name: 'Global Presence', href: '#contact' },
      { name: 'Safety Protocols', href: '#' },
      { name: 'Support Node', href: '#contact' }
    ]
  }
]

export default function Footer() {
  return (
    <footer className="bg-[#f9f9fb] pt-32 pb-16 border-t border-black/[0.03] relative overflow-hidden">
      {/* Structural Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-4 gap-20 mb-32">
          {/* Brand Identity */}
          <div className="lg:col-span-2 space-y-12">
            <div>
               <a href="#home" className="group flex items-center gap-4 mb-8">
                <div className="w-10 h-10 flex items-center justify-center bg-black rounded-xl">
                  <div className="w-4 h-4 bg-white rounded-sm" />
                </div>
                <span className="text-2xl font-black tracking-[-0.05em] text-black">
                  OSAKA <span className="font-light text-black/20 italic tracking-normal">Group</span>
                </span>
              </a>
              <p className="text-black/40 text-lg leading-relaxed max-w-sm font-medium">
                Pioneering the next generation of visual hardware and sensory display systems. Engineered for global excellence.
              </p>
            </div>

            <div className="flex flex-wrap gap-8">
              {[
                { icon: Shield, label: 'Certified' },
                { icon: Zap, label: 'High-Spec' },
                { icon: Globe, label: 'Global' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon size={16} className="text-black/20" />
                  <span className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          {footerLinks.map((column, i) => (
            <div key={i} className="space-y-10">
              <h4 className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">{column.title}</h4>
              <ul className="space-y-6">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <a 
                      href={link.href} 
                      className="text-black/40 hover:text-black transition-colors text-sm font-bold tracking-tight inline-flex items-center gap-2 group"
                    >
                      {link.name}
                      <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Closing Layer */}
        <div className="pt-16 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            {[
              { icon: Phone, label: '01886-469096' },
              { icon: Mail, label: 'INFO@OSAKAGROUP.COM' },
              { icon: MapPin, label: 'DHAKA, BANGLADESH' }
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <span className="text-[8px] font-black text-black/20 uppercase tracking-[0.3em] flex items-center gap-2">
                  <item.icon size={10} />
                </span>
                <p className="text-[10px] font-bold text-black/60 tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">
            © 2024 OSAKA GROUP <span className="mx-4 text-black/5">|</span> PRECISION HARDWARE
          </p>
        </div>
      </div>
    </footer>
  )
}