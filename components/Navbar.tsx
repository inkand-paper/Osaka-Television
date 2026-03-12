
export default function Navbar() {
  return (
    <nav className="bg-black text-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <a href="#home" className="text-2xl font-bold text-red-600">
              OSAKA Television
            </a>
          </div>

          <div className="hidden md:flex space-x-8">
            <a href="#home" className="hover:text-red-600 transition">
              Home
            </a>
            <a href="#about" className="hover:text-red-600 transition">
              About
            </a>
            <a href="#category" className="hover:text-red-600 transition">
              Category
            </a>
            <a href="#gallery" className="hover:text-red-600 transition">
              Gallery
            </a>
            <a href="#contact" className="hover:text-red-600 transition">
              Contact
            </a>
          </div>

          <div className="md:hidden">
            <button className="text-white hover:text-red-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}