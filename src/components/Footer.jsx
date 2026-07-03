export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-900 border-t border-dark-700/50 py-10 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <a href="#domov" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gold-500"
            >
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
            <span className="text-sm font-serif font-bold text-white tracking-wide">
              Satošek
            </span>
          </a>

          {/* Info */}
          <div className="text-center text-dark-400 text-sm">
            <p>
              &copy; {currentYear} Igor Satošek s.p. — Frizerski salon Satošek.
              Vse pravice pridržane.
            </p>
            <p className="mt-1 text-dark-500 text-xs">
              Nazorjeva ulica 9, 8340 Črnomelj
            </p>
          </div>

          {/* Back to top */}
          <a
            href="#domov"
            className="text-dark-400 hover:text-gold-400 transition-colors duration-300"
            aria-label="Nazaj na vrh"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
