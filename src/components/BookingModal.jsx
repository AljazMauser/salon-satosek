import { useState, useEffect, useCallback } from 'react'
import { useBooking } from '../context/BookingContext'
import { fetchStoritve, fetchProstiTermini, createNarocilo } from '../api'

const KORAKI = ['Storitev', 'Termin', 'Podatki', 'Pregled']
const DNI_V_TEDNU = ['NED', 'PON', 'TOR', 'SRE', 'ČET', 'PET', 'SOB']
const MESECI = [
  'Januar', 'Februar', 'Marec', 'April', 'Maj', 'Junij',
  'Julij', 'Avgust', 'September', 'Oktober', 'November', 'December',
]

// ---------------------------------------------------------------------------
// Pomožne funkcije
// ---------------------------------------------------------------------------

function fmtDate(d) {
  return d.toISOString().split('T')[0]
}

function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(d, n) {
  const nd = new Date(d)
  nd.setDate(nd.getDate() + n)
  return nd
}

function isSunday(d) {
  return d.getDay() === 0
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// ---------------------------------------------------------------------------
// Komponenta
// ---------------------------------------------------------------------------

export default function BookingModal() {
  const { bookingOpen, preselectedService, closeBooking } = useBooking()

  // Korak
  const [korak, setKorak] = useState(1)

  // Podatki
  const [storitve, setStoritve] = useState([])
  const [izbranaStoritev, setIzbranaStoritev] = useState(null)

  // Koledar
  const [koledarOffset, setKoledarOffset] = useState(0) // 0 = ta teden
  const [izbranDatum, setIzbranDatum] = useState(null)
  const [prostiTermini, setProstiTermini] = useState([])
  const [izbranTermin, setIzbranTermin] = useState(null)
  const [terminiLoading, setTerminiLoading] = useState(false)

  // Obrazec
  const [ime, setIme] = useState('')
  const [priimek, setPriimek] = useState('')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')
  const [opomba, setOpomba] = useState('')

  // Status
  const [loading, setLoading] = useState(false)
  const [napaka, setNapaka] = useState(null)
  const [uspeh, setUspeh] = useState(false)
  const [oddaja, setOddaja] = useState(false)

  // -----------------------------------------------------------------------
  // Naloži storitve ob odprtju
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!bookingOpen) return
    setLoading(true)
    setNapaka(null)

    fetchStoritve()
      .then((data) => {
        setStoritve(data)
        // Če je bila storitev predizbrana, jo izberi
        if (preselectedService) {
          const found = data.find((s) => s.id === preselectedService)
          if (found) {
            setIzbranaStoritev(found)
            setKorak(2)
          }
        }
      })
      .catch(() => setNapaka('Napaka pri nalaganju storitev. Preverite povezavo s strežnikom.'))
      .finally(() => setLoading(false))
  }, [bookingOpen, preselectedService])

  // -----------------------------------------------------------------------
  // Naloži proste termine, ko sta izbrana datum in storitev
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!izbranDatum || !izbranaStoritev) {
      setProstiTermini([])
      return
    }

    setTerminiLoading(true)
    fetchProstiTermini(fmtDate(izbranDatum), izbranaStoritev.id)
      .then((data) => setProstiTermini(data.prosti_termini))
      .catch(() => setNapaka('Napaka pri nalaganju terminov.'))
      .finally(() => setTerminiLoading(false))
  }, [izbranDatum, izbranaStoritev])

  // Resetiraj izbiro termina, ko se spremeni datum
  useEffect(() => {
    setIzbranTermin(null)
  }, [izbranDatum, izbranaStoritev])

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------
  const izberiStoritev = (s) => {
    setIzbranaStoritev(s)
    setNapaka(null)
  }

  const naprej = () => {
    if (korak === 1 && !izbranaStoritev) return
    if (korak === 2 && !izbranTermin) return
    if (korak === 3) {
      if (!ime.trim() || !priimek.trim() || !tel.trim() || !email.trim()) {
        setNapaka('Prosimo, izpolnite vsa obvezna polja (ime, priimek, telefon, e-pošta).')
        return
      }
      if (!email.includes('@')) {
        setNapaka('Prosimo, vnesite veljaven e-poštni naslov.')
        return
      }
    }
    setNapaka(null)
    setKorak((k) => Math.min(k + 1, 4))
  }

  const nazaj = () => {
    setNapaka(null)
    setKorak((k) => Math.max(k - 1, 1))
  }

  const potrdiNarocilo = async () => {
    setOddaja(true)
    setNapaka(null)

    try {
      await createNarocilo({
        stranka_ime: ime.trim(),
        stranka_priimek: priimek.trim(),
        stranka_tel: tel.trim(),
        stranka_email: email.trim(),
        storitev_id: izbranaStoritev.id,
        datum: fmtDate(izbranDatum),
        ura: izbranTermin,
        opomba: opomba.trim() || null,
      })
      setUspeh(true)
    } catch (err) {
      setNapaka(err.message || 'Napaka pri oddaji naročila. Poskusite znova.')
    } finally {
      setOddaja(false)
    }
  }

  const zapriInResetiraj = () => {
    setKorak(1)
    setIzbranaStoritev(null)
    setIzbranDatum(null)
    setIzbranTermin(null)
    setProstiTermini([])
    setIme('')
    setPriimek('')
    setTel('')
    setEmail('')
    setOpomba('')
    setNapaka(null)
    setUspeh(false)
    setKoledarOffset(0)
    closeBooking()
  }

  // -----------------------------------------------------------------------
  // Koledar — generiraj 14 dni
  // -----------------------------------------------------------------------
  const koledarDnevi = []
  const start = addDays(today(), koledarOffset * 14)
  for (let i = 0; i < 14; i++) {
    const d = addDays(start, i)
    if (!isSunday(d)) {
      koledarDnevi.push(d)
    }
  }

  // -----------------------------------------------------------------------
  // Ne prikaži nič, če ni odprto
  // -----------------------------------------------------------------------
  if (!bookingOpen) return null

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={zapriInResetiraj} />

      {/* Modal */}
      <div className="relative bg-dark-800 border border-dark-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Glava */}
        <div className="sticky top-0 z-10 bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-serif font-semibold text-white">
            {uspeh ? 'Naročilo potrjeno' : 'Naročanje na termin'}
          </h2>
          <button
            onClick={zapriInResetiraj}
            className="text-dark-400 hover:text-white transition-colors p-1"
            aria-label="Zapri"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Telo */}
        <div className="p-6">
          {/* Uspeh */}
          {uspeh ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-6 border-2 border-gold-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-gold-500">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif font-bold text-gold-400 mb-3">
                Hvala za vaše naročilo!
              </h3>
              <p className="text-dark-300 mb-1">
                {ime} {priimek} — {izbranaStoritev?.ime}
              </p>
              <p className="text-dark-300 mb-6">
                {izbranDatum?.toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ob {izbranTermin}
              </p>
              <p className="text-dark-400 text-sm mb-8">
                Na vaš e-poštni naslov bomo poslali potrditev. V primeru sprememb vas bomo kontaktirali.
              </p>
              <button onClick={zapriInResetiraj} className="btn-primary">
                Zapri
              </button>
            </div>
          ) : (
            <>
              {/* Stepper */}
              <div className="flex items-center justify-center mb-10">
                {KORAKI.map((label, i) => (
                  <div key={label} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                          i + 1 <= korak
                            ? 'bg-gold-500 text-dark-900'
                            : 'bg-dark-700 text-dark-400'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className={`text-[10px] mt-1 uppercase tracking-wider ${
                        i + 1 <= korak ? 'text-gold-400' : 'text-dark-500'
                      }`}>
                        {label}
                      </span>
                    </div>
                    {i < KORAKI.length - 1 && (
                      <div
                        className={`w-8 md:w-12 h-[1px] mx-1 mt-[-14px] transition-colors duration-300 ${
                          i + 1 < korak ? 'bg-gold-500' : 'bg-dark-700'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Napaka */}
              {napaka && (
                <div className="mb-6 p-3 bg-red-900/30 border border-red-500/30 text-red-300 text-sm">
                  {napaka}
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="text-center py-10 text-dark-400">
                  <div className="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full mx-auto mb-3" />
                  Nalaganje ...
                </div>
              )}

              {/* === KORAK 1: Izbira storitve === */}
              {!loading && korak === 1 && (
                <div>
                  <p className="text-dark-300 text-sm mb-6">Izberite želeno storitev:</p>
                  <div className="grid grid-cols-1 gap-3">
                    {storitve.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => izberiStoritev(s)}
                        className={`text-left p-4 border transition-all duration-300 ${
                          izbranaStoritev?.id === s.id
                            ? 'border-gold-500 bg-gold-500/10'
                            : 'border-dark-600 hover:border-dark-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-white font-medium">{s.ime}</span>
                            <span className="text-dark-400 text-sm ml-3">{s.trajanje_minut} min</span>
                          </div>
                          <span className="text-gold-400 font-semibold text-lg">{s.cena} €</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* === KORAK 2: Izbira termina === */}
              {!loading && korak === 2 && (
                <div>
                  <p className="text-dark-300 text-sm mb-2">
                    <span className="text-gold-400 font-medium">{izbranaStoritev?.ime}</span>
                    {' '}({izbranaStoritev?.trajanje_minut} min, {izbranaStoritev?.cena} €)
                  </p>

                  {/* Koledar — navigacija */}
                  <div className="flex items-center justify-between mb-3 mt-4">
                    <button
                      onClick={() => setKoledarOffset((o) => o - 1)}
                      disabled={koledarOffset === 0}
                      className="text-dark-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <span className="text-white text-sm font-medium">
                      {MESECI[start.getMonth()]} {start.getFullYear()}
                    </span>
                    <button
                      onClick={() => setKoledarOffset((o) => o + 1)}
                      className="text-dark-400 hover:text-white transition-colors p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>

                  {/* Koledar — dnevi */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {DNI_V_TEDNU.map((d) => (
                      <div key={d} className="text-center text-[10px] text-dark-500 uppercase py-1">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {/* Prazni zamiki */}
                    {(() => {
                      const firstDay = koledarDnevi[0]?.getDay()
                      const blanks = []
                      // Prikazujemo 14 dni; postavi jih v pravilne stolpce
                      for (let i = 0; i < firstDay; i++) {
                        blanks.push(<div key={`blank-${i}`} />)
                      }
                      return blanks
                    })()}
                    {koledarDnevi.map((d) => {
                      const datumStr = fmtDate(d)
                      const isSelected = izbranDatum && sameDay(d, izbranDatum)
                      const isPast = d < today()
                      const isSat = d.getDay() === 6

                      return (
                        <button
                          key={datumStr}
                          disabled={isPast}
                          onClick={() => setIzbranDatum(d)}
                          className={`py-2 text-sm rounded transition-all duration-200 ${
                            isSelected
                              ? 'bg-gold-500 text-dark-900 font-bold'
                              : isPast
                              ? 'text-dark-600 cursor-not-allowed'
                              : isSat
                              ? 'text-gold-400/70 hover:bg-dark-700'
                              : 'text-dark-200 hover:bg-dark-700'
                          }`}
                        >
                          {d.getDate()}
                        </button>
                      )
                    })}
                  </div>

                  {/* Legenda sobota */}
                  <p className="text-[10px] text-dark-500 mt-1 mb-4">
                    <span className="text-gold-400/70">Zlata</span> = sobota (08:00–13:00). Nedelje so izpuščene.
                  </p>

                  {/* Časovni sloti */}
                  {izbranDatum && (
                    <div>
                      <p className="text-dark-400 text-xs uppercase tracking-wider mb-3">
                        Prosti termini — {izbranDatum.toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      {terminiLoading ? (
                        <div className="text-center py-4 text-dark-400 text-sm">Nalaganje terminov ...</div>
                      ) : prostiTermini.length === 0 ? (
                        <p className="text-dark-500 text-sm py-4">Za izbrani datum ni prostih terminov.</p>
                      ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                          {prostiTermini.map((t) => (
                            <button
                              key={t}
                              onClick={() => setIzbranTermin(t)}
                              className={`py-2 text-sm border transition-all duration-200 ${
                                izbranTermin === t
                                  ? 'border-gold-500 bg-gold-500 text-dark-900 font-semibold'
                                  : 'border-dark-600 text-dark-200 hover:border-dark-400'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* === KORAK 3: Vnos podatkov === */}
              {!loading && korak === 3 && (
                <div>
                  <p className="text-dark-300 text-sm mb-6">Vnesite svoje kontaktne podatke:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-dark-400 text-xs uppercase tracking-wider mb-1">
                        Ime *
                      </label>
                      <input
                        type="text"
                        value={ime}
                        onChange={(e) => setIme(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-600 text-white px-3 py-2.5 focus:border-gold-500 outline-none transition-colors"
                        placeholder="Vaše ime"
                      />
                    </div>
                    <div>
                      <label className="block text-dark-400 text-xs uppercase tracking-wider mb-1">
                        Priimek *
                      </label>
                      <input
                        type="text"
                        value={priimek}
                        onChange={(e) => setPriimek(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-600 text-white px-3 py-2.5 focus:border-gold-500 outline-none transition-colors"
                        placeholder="Vaš priimek"
                      />
                    </div>
                    <div>
                      <label className="block text-dark-400 text-xs uppercase tracking-wider mb-1">
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        value={tel}
                        onChange={(e) => setTel(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-600 text-white px-3 py-2.5 focus:border-gold-500 outline-none transition-colors"
                        placeholder="npr. 051 123 456"
                      />
                    </div>
                    <div>
                      <label className="block text-dark-400 text-xs uppercase tracking-wider mb-1">
                        E-pošta *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-600 text-white px-3 py-2.5 focus:border-gold-500 outline-none transition-colors"
                        placeholder="vase@email.si"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-dark-400 text-xs uppercase tracking-wider mb-1">
                        Opomba (neobvezno)
                      </label>
                      <textarea
                        value={opomba}
                        onChange={(e) => setOpomba(e.target.value)}
                        rows={3}
                        className="w-full bg-dark-900 border border-dark-600 text-white px-3 py-2.5 focus:border-gold-500 outline-none transition-colors resize-none"
                        placeholder="Dodatne želje ali opombe ..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* === KORAK 4: Pregled === */}
              {!loading && korak === 4 && (
                <div>
                  <p className="text-dark-300 text-sm mb-6">Preglejte podatke in potrdite naročilo:</p>
                  <div className="bg-dark-900 border border-dark-600 p-5 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-dark-400">Storitev:</span>
                      <span className="text-white font-medium">{izbranaStoritev?.ime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Trajanje:</span>
                      <span className="text-white">{izbranaStoritev?.trajanje_minut} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Cena:</span>
                      <span className="text-gold-400 font-semibold">{izbranaStoritev?.cena} €</span>
                    </div>
                    <hr className="border-dark-700" />
                    <div className="flex justify-between">
                      <span className="text-dark-400">Datum in ura:</span>
                      <span className="text-white font-medium">
                        {izbranDatum?.toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ob {izbranTermin}
                      </span>
                    </div>
                    <hr className="border-dark-700" />
                    <div className="flex justify-between">
                      <span className="text-dark-400">Stranka:</span>
                      <span className="text-white">{ime} {priimek}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Telefon:</span>
                      <span className="text-white">{tel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">E-pošta:</span>
                      <span className="text-white">{email}</span>
                    </div>
                    {opomba && (
                      <div className="flex justify-between">
                        <span className="text-dark-400">Opomba:</span>
                        <span className="text-white text-right max-w-[60%]">{opomba}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === Gumbi za navigacijo === */}
              {!loading && !uspeh && (
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-dark-700">
                  <button
                    onClick={korak === 1 ? zapriInResetiraj : nazaj}
                    className="text-dark-400 hover:text-white transition-colors text-sm"
                  >
                    {korak === 1 ? 'Prekliči' : '← Nazaj'}
                  </button>

                  {korak < 4 ? (
                    <button
                      onClick={naprej}
                      disabled={
                        (korak === 1 && !izbranaStoritev) ||
                        (korak === 2 && !izbranTermin)
                      }
                      className="btn-primary !py-2.5 !px-6 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Naprej
                    </button>
                  ) : (
                    <button
                      onClick={potrdiNarocilo}
                      disabled={oddaja}
                      className="btn-primary !py-2.5 !px-6 disabled:opacity-60"
                    >
                      {oddaja ? 'Oddajanje ...' : 'Potrdi naročilo'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
