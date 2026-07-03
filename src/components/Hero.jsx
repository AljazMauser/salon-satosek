export default function Hero() {
  return (
    <section
      id="domov"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 z-10" />

      {/* Decorative line pattern */}
      <div className="absolute inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 60px, #C9A96E 60px, #C9A96E 61px)',
        }}
      />

      {/* Content */}
      <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <span className="inline-block text-gold-500 text-xs md:text-sm uppercase tracking-[0.3em] mb-4 font-medium">
            Frizerski salon
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6">
          Vrhunsko frizerstvo
          <br />
          <span className="text-gold-400 italic">v osrčju Črnomlja</span>
        </h1>

        <p className="text-dark-200 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Že vrsto let ustvarjamo pričeske, ki poudarijo vašo edinstvenost.
          Zaupajte našim izkušenim mojstrom in si privoščite trenutek zase.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#kontakt" className="btn-primary text-base md:text-lg">
            Naročite se zdaj
          </a>
          <a
            href="#storitve"
            className="btn-outline text-base md:text-lg"
          >
            Naše storitve
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-6 h-6 text-gold-500/60"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </section>
  )
}
