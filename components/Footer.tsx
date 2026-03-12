import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-red-600 mb-4">OSAKA Television</h3>
            <p className="text-gray-400">
              Quality televisions for your home and office.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-red-600 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-red-600">Home</Link></li>
              <li><Link href="/about" className="hover:text-red-600">About</Link></li>
              <li><Link href="/gallery" className="hover:text-red-600">Gallery</Link></li>
              <li><Link href="/category" className="hover:text-red-600">Category</Link></li>
              <li><Link href="/contact" className="hover:text-red-600">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-red-600 mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@osakatv.com</li>
              <li>Phone: +880 123 456 7890</li>
              <li>Address: Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2026 OSAKA Television. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}