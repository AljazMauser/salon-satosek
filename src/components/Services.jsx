const services = [
  {
    title: 'Moško striženje',
    description:
      'Klasično ali moderno striženje, prilagojeno vašemu stilu in obliki obraza. Vključuje umivanje las in oblikovanje.',
    price: '15 €',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
        <path d="M12 11v10" />
        <path d="M8 14h8" />
      </svg>
    ),
  },
  {
    title: 'Žensko striženje',
    description:
      'Natančno in trendovsko striženje za vse dolžine las. Posvetujemo se z vami in svetujemo najboljšo pričesko.',
    price: '25 €',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M12 2v20" />
        <path d="M8 6c0-2.2 1.8-4 4-4s4 1.8 4 4" />
        <path d="M8 6c-4 2-6 6-6 10" />
        <path d="M16 6c4 2 6 6 6 10" />
        <path d="M8 16c0 2.2 1.8 4 4 4s4-1.8 4-4" />
      </svg>
    ),
  },
  {
    title: 'Otroško striženje',
    description:
      'Potrpežljivo in prijazno striženje za najmlajše. Poskrbimo, da se otroci počutijo sproščeno in varno.',
    price: '10 €',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <circle cx="12" cy="8" r="4" />
        <path d="M8 12v8" />
        <path d="M16 12v8" />
        <path d="M6 20h12" />
      </svg>
    ),
  },
  {
    title: 'Barvanje las',
    description:
      'Profesionalno barvanje s kakovostnimi pripravki. Od naravnih odtenkov do drznejših barvnih prehodov.',
    price: 'od 35 €',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    title: 'Nega las',
    description:
      'Globinska nega in obnova las s hranilnimi maskami in tretmaji. Za zdrave, sijoče in močne lase.',
    price: 'od 20 €',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M12 2c-4 0-7 3-7 6 0 4 3 8 7 14 4-6 7-10 7-14 0-3-3-6-7-6Z" />
      </svg>
    ),
  },
]

import { useBooking } from '../context/BookingContext'

export default function Services() {
  const { openBooking } = useBooking()
  return (
    <section id="storitve" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="text-gold-500 text-xs md:text-sm uppercase tracking-[0.3em] font-medium">
            Kaj ponujamo
          </span>
          <h2 className="section-heading mt-3">Naše storitve</h2>
          <div className="gold-line mt-4 mb-6" />
          <p className="section-subheading">
            Pri nas združujemo znanje, izkušnje in strast do frizerstva. Vsaka
            storitev je izvedena z največjo mero pozornosti.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="group bg-dark-800/50 border border-dark-700/50 p-8 md:p-10
                         hover:border-gold-500/30 hover:bg-dark-800
                         transition-all duration-500 flex flex-col items-center text-center"
            >
              <div className="text-gold-500 group-hover:text-gold-400 transition-colors duration-500 mb-5">
                {service.icon}
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3">
                {service.title}
              </h3>
              <p className="text-dark-300 text-sm leading-relaxed mb-5 flex-1">
                {service.description}
              </p>
              <span className="text-2xl font-serif font-bold text-gold-400 group-hover:text-gold-300 transition-colors duration-500">
                {service.price}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <p className="text-dark-400 text-sm mb-4">
            Cene so informativne. Za natančno ponudbo nas kontaktirajte.
          </p>
          <button onClick={() => openBooking()} className="btn-primary">
            Povprašajte po terminu
          </button>
        </div>
      </div>
    </section>
  )
}
