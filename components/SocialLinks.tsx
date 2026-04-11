'use client'

import { motion } from 'framer-motion'
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react'

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#', color: '#1877F2' },
  { name: 'Instagram', icon: Instagram, href: '#', color: '#E4405F' },
  { name: 'Youtube', icon: Youtube, href: '#', color: '#FF0000' },
  { name: 'Twitter', icon: Twitter, href: '#', color: '#1DA1F2' },
]

export default function SocialLinks() {
  return (
    <div className="fixed left-8 bottom-10 z-50 hidden md:flex flex-col gap-8">
      <div className="flex flex-col gap-6 items-center">
        {socialLinks.map((social, i) => (
          <motion.a
            key={social.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 1 }}
            href={social.href}
            whileHover={{ scale: 1.2, x: 5 }}
            className="group relative"
          >
            <social.icon 
              size={18} 
              className="text-black/20 group-hover:text-black transition-colors" 
              strokeWidth={1.5}
            />
            <span className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-[8px] font-bold uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {social.name}
            </span>
          </motion.a>
        ))}
      </div>
      <div className="w-px h-24 bg-black/5 mx-auto" />
    </div>
  )
}