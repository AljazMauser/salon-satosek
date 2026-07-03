import { useBooking } from '../context/BookingContext'

const contactInfo = [
  {
    label: 'Naslov',
    value: 'Nazorjeva ulica 9, 8340 Črnomelj',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: 'Telefon',
    value: '051 651 007',
    href: 'tel:+38651651007',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
      </svg>
    ),
  },
  {
    label: 'E-pošta',
    value: 'satosek@amis.net',
    href: 'mailto:satosek@amis.net',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
]

export default function Contact() {
  const { openBooking } = useBooking()

  return (
    <section id="kontakt" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-dark-800/30">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="text-gold-500 text-xs md:text-sm uppercase tracking-[0.3em] font-medium">
            Stopimo v stik
          </span>
          <h2 className="section-heading mt-3">Kontakt</h2>
          <div className="gold-line mt-4 mb-6" />
          <p className="section-subheading">
            Pokličite nas, pišite ali se oglasite v salonu. Veselimo se vašega obiska.
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactInfo.map((item) => (
            <div key={item.label} className="bg-dark-800/80 border border-dark-700/50 p-6 flex flex-col items-center text-center group hover:border-gold-500/30 transition-all duration-500">
              <div className="w-12 h-12 border border-dark-600 flex items-center justify-center text-gold-500 group-hover:border-gold-500/50 group-hover:text-gold-400 transition-colors duration-300 mb-4">
                {item.icon}
              </div>
              <p className="text-dark-400 text-xs uppercase tracking-wider mb-2">{item.label}</p>
              {item.href ? (
                <a href={item.href} className="text-white hover:text-gold-400 transition-colors duration-300">
                  {item.value}
                </a>
              ) : (
                <p className="text-white">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => openBooking()} className="btn-primary text-center">
            Naročite se prek spleta
          </button>
          <a href="tel:+38651651007" className="btn-outline text-center">
            Pokličite 051 651 007
          </a>
        </div>
      </div>
    </section>
  )
}
