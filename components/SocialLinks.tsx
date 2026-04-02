import { Phone } from 'lucide-react'

export default function SocialLinks() {
  return (
    <div className="fixed right-4 bottom-24 md:right-6 md:top-1/2 md:bottom-auto md:-translate-y-1/2 z-50 flex flex-col gap-4">
      
      {/* WhatsApp (Visible on both) */}
      <a
        href="https://wa.me/8801886469096"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl shadow-green-200/50 transition-all hover:scale-110 flex items-center justify-center border-2 border-white"
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.456l4.558-1.433A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm6.087 17.164c-.272.766-1.348 1.402-2.204 1.585-.587.124-1.354.223-3.937-.845-3.308-1.366-5.438-4.728-5.603-4.945-.16-.217-1.332-1.772-1.332-3.382 0-1.61.843-2.403 1.143-2.73.3-.327.654-.409.872-.409.218 0 .436.002.627.011.2.01.47-.076.736.561.272.653.917 2.236.998 2.398.08.163.134.354.027.572-.107.217-.16.354-.32.544-.163.19-.342.424-.489.569-.163.163-.333.34-.143.667.19.327.843 1.388 1.808 2.248 1.243 1.108 2.29 1.452 2.616 1.615.327.163.517.136.707-.082.19-.217.816-.952 1.034-1.28.217-.327.435-.272.734-.163.3.108 1.904.898 2.232 1.062.327.163.545.245.626.38.08.136.08.788-.19 1.554z"></path>
        </svg>
      </a>

      {/* Facebook (Visible only on Desktop) */}
      <a
        href="https://www.facebook.com/oscarintosaka/"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 items-center justify-center border-2 border-white"
        title="Follow us on Facebook"
        aria-label="Follow us on Facebook"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
        </svg>
      </a>

      {/* Phone Call (Visible only on Mobile) */}
      <a
        href="tel:+8801886469096"
        className="md:hidden flex bg-black hover:bg-gray-800 text-white p-4 rounded-full shadow-xl shadow-gray-200/50 transition-all active:scale-95 items-center justify-center border-2 border-white"
        title="Call Us"
        aria-label="Call Us"
      >
        <Phone className="w-6 h-6 fill-current" />
      </a>

    </div>
  )
}