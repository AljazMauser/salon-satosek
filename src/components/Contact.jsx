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

const workingHours = [
  { day: 'Ponedeljek – Petek', hours: '08:00 – 19:00' },
  { day: 'Sobota', hours: '08:00 – 13:00' },
  { day: 'Nedelja in prazniki', hours: 'Zaprto', muted: true },
]

export default function Contact() {
  return (
    <section id="kontakt" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-dark-800/30">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="text-gold-500 text-xs md:text-sm uppercase tracking-[0.3em] font-medium">
            Stopimo v stik
          </span>
          <h2 className="section-heading mt-3">Kontakt in delovni čas</h2>
          <div className="gold-line mt-4 mb-6" />
          <p className="section-subheading">
            Pokličite nas, pišite ali se oglasite v salonu. Veselimo se vašega obiska.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact info */}
          <div>
            <h3 className="text-2xl font-serif font-semibold text-white mb-8">
              Kontaktni podatki
            </h3>
            <div className="space-y-6">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-10 h-10 border border-dark-600 flex items-center justify-center text-gold-500 group-hover:border-gold-500/50 group-hover:text-gold-400 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-dark-400 text-xs uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-white hover:text-gold-400 transition-colors duration-300 text-base md:text-lg"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-white text-base md:text-lg">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Working hours */}
          <div>
            <h3 className="text-2xl font-serif font-semibold text-white mb-8">
              Delovni čas
            </h3>
            <div className="bg-dark-800/80 border border-dark-700/50 p-8">
              <div className="space-y-4">
                {workingHours.map((entry) => (
                  <div
                    key={entry.day}
                    className="flex items-center justify-between py-3 border-b border-dark-700/50 last:border-b-0"
                  >
                    <span className={`text-sm md:text-base ${entry.muted ? 'text-dark-500' : 'text-dark-200'}`}>
                      {entry.day}
                    </span>
                    <span
                      className={`font-semibold text-sm md:text-base ${
                        entry.muted ? 'text-dark-500' : 'text-gold-400'
                      }`}
                    >
                      {entry.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick CTA */}
            <div className="mt-8 text-center lg:text-left">
              <a href="tel:+38651651007" className="btn-primary w-full sm:w-auto text-center">
                <span className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
                  </svg>
                  Pokličite 051 651 007
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
