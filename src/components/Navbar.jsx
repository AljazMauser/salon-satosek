import { useState } from 'react'
import { useBooking } from '../context/BookingContext'

const navLinks = [
  { href: '#domov', label: 'Domov' },
  { href: '#storitve', label: 'Storitve' },
  { href: '#kontakt', label: 'Kontakt' },
  { href: '#lokacija', label: 'Lokacija' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { openBooking } = useBooking()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-md border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#domov" className="flex items-center gap-3 group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7 text-gold-500 group-hover:text-gold-400 transition-colors"
            >
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
            <span className="text-lg md:text-xl font-serif font-bold text-white tracking-wide">
              Satošek
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-dark-200 hover:text-gold-400 transition-colors duration-300 text-sm uppercase tracking-wider"
              >
                {link.label}
              </a>
            ))}
            <button onClick={() => openBooking()} className="btn-primary !py-2 !px-5 text-xs">
              Naroči se
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Odpri meni"
          >
            <span
              className={`block w-6 h-[2px] bg-gold-400 transition-transform duration-300 ${
                menuOpen ? 'rotate-45 translate-y-[6px]' : ''
              }`}
            />
            <span
              className={`block w-6 h-[2px] bg-gold-400 transition-opacity duration-300 ${
                menuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-6 h-[2px] bg-gold-400 transition-transform duration-300 ${
                menuOpen ? '-rotate-45 -translate-y-[6px]' : ''
              }`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-400 ${
            menuOpen ? 'max-h-64 pb-4' : 'max-h-0'
          }`}
        >
          <div className="flex flex-col gap-3 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-dark-200 hover:text-gold-400 transition-colors duration-300 text-sm uppercase tracking-wider py-1"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setMenuOpen(false); openBooking() }}
              className="btn-primary text-center !py-2 !px-5 text-xs mt-1"
            >
              Naroči se
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
