import { useState, useEffect, useCallback } from 'react'
import { fetchNarocila, updateStatus, fetchDelovniCas, setDelovniCas, resetDelovniCas } from '../api'

// ---------------------------------------------------------------------------
// Pomožne funkcije
// ---------------------------------------------------------------------------

function fmtDate(d) {
  return d.toISOString().split('T')[0]
}

function addDays(d, n) {
  const nd = new Date(d)
  nd.setDate(nd.getDate() + n)
  return nd
}

function startOfWeek(d) {
  const nd = new Date(d)
  const day = nd.getDay()
  const diff = day === 0 ? -6 : 1 - day
  nd.setDate(nd.getDate() + diff)
  nd.setHours(0, 0, 0, 0)
  return nd
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const STATUS_BARVE = {
  potrjeno: 'bg-green-500/20 text-green-400 border-green-500/30',
  zakljuceno: 'bg-dark-500/50 text-dark-300 border-dark-600',
  preklicano: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const DNI_V_TEDNU = ['Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota', 'Nedelja']

// Generiraj ure na 30-minutne intervale (06:00–22:00)
function generirajUre() {
  const ure = []
  for (let h = 6; h <= 22; h++) {
    for (const m of ['00', '30']) {
      if (h === 22 && m === '30') break // zadnji termin 22:00
      ure.push(`${String(h).padStart(2, '0')}:${m}`)
    }
  }
  return ure
}

const URE_OPCIJE = generirajUre()

// ---------------------------------------------------------------------------
// Admin komponenta
// ---------------------------------------------------------------------------

export default function Admin({ token, onLogout }) {
  const [zavihek, setZavihek] = useState('narocila') // 'narocila' | 'delovni-cas'
  const [tedenOffset, setTedenOffset] = useState(0)
  const [narocila, setNarocila] = useState([])
  const [delovniCasi, setDelovniCasi] = useState([])
  const [loading, setLoading] = useState(false)
  const [napaka, setNapaka] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [shranjeno, setShranjeno] = useState(null)

  // Stanje za urejanje delovnega časa — ključ: datum string, vrednost: {od, do, prost_dan}
  const [urejanje, setUrejanje] = useState({})

  const zacetekTedna = startOfWeek(addDays(new Date(), tedenOffset * 7))
  const dnevi = Array.from({ length: 7 }, (_, i) => addDays(zacetekTedna, i))

  // -----------------------------------------------------------------------
  // Nalaganje podatkov
  // -----------------------------------------------------------------------

  const naloniNarocila = useCallback(async () => {
    setLoading(true)
    setNapaka(null)
    try {
      const data = await fetchNarocila(fmtDate(dnevi[0]), fmtDate(dnevi[6]), token)
      setNarocila(data)
    } catch (err) {
      setNapaka(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, tedenOffset])

  const naloniDelovniCas = useCallback(async () => {
    setLoading(true)
    setNapaka(null)
    try {
      const data = await fetchDelovniCas(fmtDate(dnevi[0]), fmtDate(dnevi[6]), token)
      setDelovniCasi(data)
      // Inicializiraj urejanje iz obstoječih podatkov
      const init = {}
      data.forEach((dc) => {
        init[dc.datum] = {
          od: dc.od || '',
          do: dc.do || '',
          prost_dan: dc.prost_dan,
        }
      })
      setUrejanje(init)
    } catch (err) {
      setNapaka(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, tedenOffset])

  useEffect(() => {
    if (zavihek === 'narocila') naloniNarocila()
    else naloniDelovniCas()
  }, [zavihek, naloniNarocila, naloniDelovniCas])

  // -----------------------------------------------------------------------
  // Handlerji — naročila
  // -----------------------------------------------------------------------

  const handleStatusChange = async (narociloId, novStatus) => {
    setActionLoading(narociloId)
    try {
      await updateStatus(narociloId, novStatus, token)
      setNarocila((prev) =>
        prev.map((n) => (n.id === narociloId ? { ...n, status: novStatus } : n))
      )
    } catch (err) {
      setNapaka(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // -----------------------------------------------------------------------
  // Handlerji — delovni čas
  // -----------------------------------------------------------------------

  const handleUrejanjeChange = (datumStr, field, value) => {
    setUrejanje((prev) => ({
      ...prev,
      [datumStr]: { ...prev[datumStr], [field]: value },
    }))
    setShranjeno(null)
  }

  const handleToggleProstDan = (datumStr) => {
    setUrejanje((prev) => {
      const current = prev[datumStr] || { od: '', do: '', prost_dan: 'N' }
      const novoProstDan = current.prost_dan === 'D' ? 'N' : 'D'
      return {
        ...prev,
        [datumStr]: { ...current, prost_dan: novoProstDan },
      }
    })
    setShranjeno(null)
  }

  const handleShraniDan = async (datumStr) => {
    const podatki = urejanje[datumStr]
    if (!podatki) return

    setActionLoading(datumStr)
    setNapaka(null)
    try {
      if (podatki.prost_dan === 'D') {
        await setDelovniCas(datumStr, { prost_dan: 'D' }, token)
      } else {
        if (!podatki.od || !podatki.do) {
          setNapaka('Vnesi začetek in konec delovnega časa.')
          setActionLoading(null)
          return
        }
        await setDelovniCas(datumStr, { od: podatki.od, do: podatki.do, prost_dan: 'N' }, token)
      }
      setShranjeno(datumStr)
      setTimeout(() => setShranjeno(null), 2000)
    } catch (err) {
      setNapaka(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePonastaviDan = async (datumStr) => {
    setActionLoading(datumStr)
    setNapaka(null)
    try {
      await resetDelovniCas(datumStr, token)
      // Ponovno naloži
      await naloniDelovniCas()
    } catch (err) {
      setNapaka(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const narocilaZaDan = (dan) => narocila.filter((n) => sameDay(new Date(n.datum_ura), dan))

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Glava */}
      <header className="bg-dark-800 border-b border-dark-700 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gold-500">
              <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
            <h1 className="text-lg font-serif font-bold text-white">
              Satošek <span className="text-dark-400 font-sans text-sm font-normal">— Administracija</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-dark-400 hover:text-gold-400 text-sm transition-colors">← Spletna stran</a>
            <button onClick={onLogout} className="text-dark-400 hover:text-red-400 text-sm transition-colors">Odjava</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Navigacija po tednih */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setTedenOffset((o) => o - 1)} className="text-dark-400 hover:text-white transition-colors p-1 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="15 18 9 12 15 6" /></svg>
            <span className="text-sm">Prejšnji teden</span>
          </button>

          <h2 className="text-white font-serif text-lg text-center">
            {dnevi[0].toLocaleDateString('sl-SI', { day: 'numeric', month: 'long' })}
            {' — '}
            {dnevi[6].toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>

          <button onClick={() => setTedenOffset((o) => o + 1)} className="text-dark-400 hover:text-white transition-colors p-1 flex items-center gap-1">
            <span className="text-sm">Naslednji teden</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>
          </button>

          <button onClick={() => setTedenOffset(0)} className="text-gold-500 hover:text-gold-400 text-sm transition-colors">Danes</button>
        </div>

        {/* Zavihki */}
        <div className="flex border-b border-dark-700 mb-6">
          <button
            onClick={() => setZavihek('narocila')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              zavihek === 'narocila' ? 'border-gold-500 text-gold-400' : 'border-transparent text-dark-400 hover:text-white'
            }`}
          >
            📅 Naročila
          </button>
          <button
            onClick={() => setZavihek('delovni-cas')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              zavihek === 'delovni-cas' ? 'border-gold-500 text-gold-400' : 'border-transparent text-dark-400 hover:text-white'
            }`}
          >
            ⏰ Delovni čas
          </button>
        </div>

        {/* Obvestila */}
        {napaka && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
            <span>{napaka}</span>
            <button onClick={() => setNapaka(null)} className="underline text-xs">Zapri</button>
          </div>
        )}
        {shranjeno && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 text-green-300 text-sm">
            ✓ Delovni čas za {shranjeno} shranjen.
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-10 text-dark-400">
            <div className="animate-spin w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full mx-auto mb-2" />
            Nalaganje ...
          </div>
        )}

        {/* ================================================================ */}
        {/* ZAVIHEK: NAROČILA                                                  */}
        {/* ================================================================ */}
        {!loading && zavihek === 'narocila' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {dnevi.map((dan) => {
                const isToday = sameDay(dan, new Date())
                const isSunday = dan.getDay() === 0
                const dnevnaNarocila = narocilaZaDan(dan)

                return (
                  <div key={fmtDate(dan)} className={`border min-h-[200px] ${isToday ? 'border-gold-500/50 bg-dark-800' : 'border-dark-700 bg-dark-800/50'} ${isSunday ? 'opacity-60' : ''}`}>
                    <div className={`px-2 py-1.5 text-center border-b ${isToday ? 'border-gold-500/30 bg-gold-500/5' : 'border-dark-700'}`}>
                      <div className="text-[10px] text-dark-500 uppercase">{dan.toLocaleDateString('sl-SI', { weekday: 'short' })}</div>
                      <div className={`text-sm font-bold ${isToday ? 'text-gold-400' : 'text-white'}`}>{dan.getDate()}. {dan.toLocaleDateString('sl-SI', { month: 'short' })}</div>
                    </div>
                    <div className="p-1.5 space-y-1.5">
                      {isSunday ? (
                        <p className="text-dark-600 text-xs text-center py-3">Nedelja</p>
                      ) : dnevnaNarocila.length === 0 ? (
                        <p className="text-dark-600 text-xs text-center py-3">Ni naročil</p>
                      ) : (
                        dnevnaNarocila.map((n) => (
                          <div key={n.id} className={`p-2 border text-xs ${STATUS_BARVE[n.status] || STATUS_BARVE.potrjeno}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-white">{new Date(n.datum_ura).toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="text-[10px] opacity-70">{n.storitev_trajanje}min</span>
                            </div>
                            <p className="text-white/90 font-medium">{n.stranka_ime} {n.stranka_priimek[0]}.</p>
                            <p className="opacity-70 text-[10px]">{n.storitev_ime}</p>
                            {n.status !== 'preklicano' && (
                              <div className="flex gap-1 mt-2 pt-1.5 border-t border-white/10">
                                {n.status === 'potrjeno' && (
                                  <button onClick={() => handleStatusChange(n.id, 'zakljuceno')} disabled={actionLoading === n.id}
                                    className="text-[10px] text-dark-400 hover:text-green-400 transition-colors disabled:opacity-50">✓ Zaključi</button>
                                )}
                                <button onClick={() => handleStatusChange(n.id, 'preklicano')} disabled={actionLoading === n.id}
                                  className="text-[10px] text-dark-400 hover:text-red-400 transition-colors disabled:opacity-50 ml-auto">✕ Prekliči</button>
                              </div>
                            )}
                            {n.opomba && <p className="text-[10px] opacity-50 mt-1 italic">"{n.opomba}"</p>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-4 mt-6 text-xs text-dark-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 border border-green-500/30 bg-green-500/20" /> Potrjeno</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 border border-dark-600 bg-dark-500/50" /> Zaključeno</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 border border-red-500/30 bg-red-500/20" /> Preklicano</span>
            </div>
          </>
        )}

        {/* ================================================================ */}
        {/* ZAVIHEK: DELOVNI ČAS                                               */}
        {/* ================================================================ */}
        {!loading && zavihek === 'delovni-cas' && (
          <div className="space-y-3">
            <p className="text-dark-400 text-sm mb-4">
              Nastavite delovni čas za vsak dan posebej. Če želite prost dan, kliknite gumb <strong className="text-white">Prost dan</strong>.
              Za povratek na privzeti delovnik kliknite <strong className="text-white">Ponastavi</strong>.
            </p>

            {dnevi.map((dan) => {
              const datumStr = fmtDate(dan)
              const isNedelja = dan.getDay() === 0
              const today = new Date(); today.setHours(0,0,0,0)
              const isPreteklost = dan < today
              const isToday = sameDay(dan, new Date())
              const stanje = urejanje[datumStr] || { od: '', do: '', prost_dan: (isNedelja || isPreteklost) ? 'D' : 'N' }
              const onemogoceno = isNedelja || isPreteklost

              return (
                <div key={datumStr} className={`border p-4 md:p-5 transition-colors ${isToday ? 'border-gold-500/40 bg-dark-800' : 'border-dark-700 bg-dark-800/30'} ${onemogoceno ? 'opacity-50' : ''}`}>
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                    {/* Dan */}
                    <div className="w-full md:w-40 flex-shrink-0">
                      <div className="text-xs text-dark-500 uppercase">
                        {dan.toLocaleDateString('sl-SI', { weekday: 'long' })}
                        {isPreteklost && <span className="ml-1 text-dark-600">(preteklo)</span>}
                      </div>
                      <div className={`text-lg font-serif font-bold ${isToday ? 'text-gold-400' : isPreteklost ? 'text-dark-500' : 'text-white'}`}>
                        {dan.getDate()}. {dan.toLocaleDateString('sl-SI', { month: 'long' })}
                      </div>
                    </div>

                    {/* Nedelja ali preteklost — zaklenjeno */}
                    {onemogoceno ? (
                      <div className="flex-1 flex items-center gap-3">
                        <span className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border bg-dark-700/50 border-dark-600 text-dark-500 flex-shrink-0">
                          🔒 {isNedelja ? 'Prosti dan' : 'Zaklenjeno'}
                        </span>
                        <span className="text-dark-600 text-xs">
                          {isNedelja ? 'Nedelje so vedno zaprte.' : 'Preteklih dni ni mogoče urejati.'}
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Prost dan toggle */}
                        <button
                          onClick={() => handleToggleProstDan(datumStr)}
                          disabled={onemogoceno}
                          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border transition-all flex-shrink-0 ${
                            stanje.prost_dan === 'D'
                              ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20'
                              : 'bg-dark-700 border-dark-600 text-dark-300 hover:border-gold-500/40 hover:text-gold-400'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {stanje.prost_dan === 'D' ? '🔴 Prost dan' : '🟢 Delovni dan'}
                        </button>

                        {/* Časovni vnosi (samo če ni prost dan) */}
                        {stanje.prost_dan === 'N' && (
                          <div className="flex items-center gap-2 md:gap-3 flex-1">
                            <select
                              value={stanje.od}
                              onChange={(e) => handleUrejanjeChange(datumStr, 'od', e.target.value)}
                              className="bg-dark-900 border border-dark-600 text-white px-3 py-2 text-sm w-36 focus:border-gold-500 outline-none transition-colors appearance-none cursor-pointer"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9A96E' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                                paddingRight: '28px',
                              }}
                            >
                              {URE_OPCIJE.map((u) => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                            <span className="text-dark-500 text-sm">do</span>
                            <select
                              value={stanje.do}
                              onChange={(e) => handleUrejanjeChange(datumStr, 'do', e.target.value)}
                              className="bg-dark-900 border border-dark-600 text-white px-3 py-2 text-sm w-36 focus:border-gold-500 outline-none transition-colors appearance-none cursor-pointer"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9A96E' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                                paddingRight: '28px',
                              }}
                            >
                              {URE_OPCIJE.map((u) => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Gumbi */}
                        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                          <button
                            onClick={() => handleShraniDan(datumStr)}
                            disabled={actionLoading === datumStr}
                            className="px-4 py-2 bg-gold-500 text-dark-900 text-xs font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === datumStr ? '...' : 'Shrani'}
                          </button>
                          <button
                            onClick={() => handlePonastaviDan(datumStr)}
                            disabled={actionLoading === datumStr}
                            className="px-3 py-2 border border-dark-600 text-dark-400 text-xs hover:text-white hover:border-dark-400 transition-colors disabled:opacity-50"
                          >
                            Ponastavi
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Info o privzetem delovniku */}
                  {!onemogoceno && (
                    <div className="text-[10px] text-dark-500 mt-2 ml-0 md:ml-40">
                      {dan.getDay() === 6 ? 'Privzeto: 08:00 – 13:00' : 'Privzeto: 08:00 – 19:00'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
