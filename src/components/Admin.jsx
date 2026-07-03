import { useState, useEffect, useCallback } from 'react'
import { fetchNarocila, updateStatus } from '../api'

const STATUS_BARVE = {
  potrjeno: 'bg-green-500/20 text-green-400 border-green-500/30',
  zakljuceno: 'bg-dark-500/50 text-dark-300 border-dark-600',
  preklicano: 'bg-red-500/20 text-red-400 border-red-500/30 line-through',
}

const STATUS_LABELS = {
  potrjeno: 'Potrjeno',
  zakljuceno: 'Zaključeno',
  preklicano: 'Preklicano',
}

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
  const diff = day === 0 ? -6 : 1 - day // ponedeljek kot začetek
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

export default function Admin({ token, onLogout }) {
  const [tedenOffset, setTedenOffset] = useState(0)
  const [narocila, setNarocila] = useState([])
  const [loading, setLoading] = useState(false)
  const [napaka, setNapaka] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const zacetekTedna = startOfWeek(addDays(new Date(), tedenOffset * 7))
  const dnevi = Array.from({ length: 7 }, (_, i) => addDays(zacetekTedna, i))

  const naloniNarocila = useCallback(async () => {
    setLoading(true)
    setNapaka(null)

    const od = fmtDate(dnevi[0])
    const do_ = fmtDate(dnevi[6])

    try {
      const data = await fetchNarocila(od, do_, token)
      setNarocila(data)
    } catch (err) {
      setNapaka(err.message || 'Napaka pri nalaganju naročil.')
    } finally {
      setLoading(false)
    }
  }, [token, tedenOffset])

  useEffect(() => {
    naloniNarocila()
  }, [naloniNarocila])

  const handleStatusChange = async (narociloId, novStatus) => {
    setActionLoading(narociloId)
    try {
      await updateStatus(narociloId, novStatus, token)
      setNarocila((prev) =>
        prev.map((n) => (n.id === narociloId ? { ...n, status: novStatus } : n))
      )
    } catch (err) {
      setNapaka(err.message || 'Napaka pri posodabljanju statusa.')
    } finally {
      setActionLoading(null)
    }
  }

  const narocilaZaDan = (dan) => narocila.filter((n) => sameDay(new Date(n.datum_ura), dan))

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Admin glava */}
      <header className="bg-dark-800 border-b border-dark-700 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-gold-500"
            >
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
            <h1 className="text-lg font-serif font-bold text-white">
              Satošek <span className="text-dark-400 font-sans text-sm font-normal">— Koledar naročil</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-dark-400 hover:text-gold-400 text-sm transition-colors">
              ← Spletna stran
            </a>
            <button
              onClick={onLogout}
              className="text-dark-400 hover:text-red-400 text-sm transition-colors"
            >
              Odjava
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Navigacija po tednih */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setTedenOffset((o) => o - 1)}
            className="text-dark-400 hover:text-white transition-colors p-1 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-sm">Prejšnji teden</span>
          </button>

          <h2 className="text-white font-serif text-lg">
            {dnevi[0].toLocaleDateString('sl-SI', { day: 'numeric', month: 'long' })}
            {' — '}
            {dnevi[6].toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>

          <button
            onClick={() => setTedenOffset((o) => o + 1)}
            className="text-dark-400 hover:text-white transition-colors p-1 flex items-center gap-1"
          >
            <span className="text-sm">Naslednji teden</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            onClick={() => setTedenOffset(0)}
            className="text-gold-500 hover:text-gold-400 text-sm transition-colors"
          >
            Danes
          </button>
        </div>

        {/* Napaka */}
        {napaka && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 text-red-300 text-sm">
            {napaka}
            <button onClick={() => setNapaka(null)} className="ml-2 underline">Zapri</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-10 text-dark-400">
            <div className="animate-spin w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full mx-auto mb-2" />
            Nalaganje naročil ...
          </div>
        )}

        {/* Koledar */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {dnevi.map((dan) => {
              const isToday = sameDay(dan, new Date())
              const isSunday = dan.getDay() === 0
              const dnevnaNarocila = narocilaZaDan(dan)

              return (
                <div
                  key={fmtDate(dan)}
                  className={`border min-h-[200px] ${
                    isToday ? 'border-gold-500/50 bg-dark-800' : 'border-dark-700 bg-dark-800/50'
                  } ${isSunday ? 'opacity-50' : ''}`}
                >
                  {/* Glava dneva */}
                  <div className={`px-2 py-1.5 text-center border-b ${
                    isToday ? 'border-gold-500/30 bg-gold-500/5' : 'border-dark-700'
                  }`}>
                    <div className="text-[10px] text-dark-500 uppercase">
                      {dan.toLocaleDateString('sl-SI', { weekday: 'short' })}
                    </div>
                    <div className={`text-sm font-bold ${isToday ? 'text-gold-400' : 'text-white'}`}>
                      {dan.getDate()}. {dan.toLocaleDateString('sl-SI', { month: 'short' })}
                    </div>
                  </div>

                  {/* Naročila za ta dan */}
                  <div className="p-1.5 space-y-1.5">
                    {isSunday ? (
                      <p className="text-dark-600 text-xs text-center py-3">Zaprto</p>
                    ) : dnevnaNarocila.length === 0 ? (
                      <p className="text-dark-600 text-xs text-center py-3">Ni naročil</p>
                    ) : (
                      dnevnaNarocila.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2 border text-xs ${STATUS_BARVE[n.status] || STATUS_BARVE.potrjeno}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white">
                              {new Date(n.datum_ura).toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] opacity-70">{n.storitev_trajanje}min</span>
                          </div>
                          <p className="text-white/90 font-medium">{n.stranka_ime} {n.stranka_priimek[0]}.</p>
                          <p className="opacity-70 text-[10px]">{n.storitev_ime}</p>

                          {/* Akcije */}
                          {n.status !== 'preklicano' && (
                            <div className="flex gap-1 mt-2 pt-1.5 border-t border-white/10">
                              {n.status === 'potrjeno' && (
                                <button
                                  onClick={() => handleStatusChange(n.id, 'zakljuceno')}
                                  disabled={actionLoading === n.id}
                                  className="text-[10px] text-dark-400 hover:text-green-400 transition-colors disabled:opacity-50"
                                >
                                  ✓ Zaključi
                                </button>
                              )}
                              <button
                                onClick={() => handleStatusChange(n.id, 'preklicano')}
                                disabled={actionLoading === n.id}
                                className="text-[10px] text-dark-400 hover:text-red-400 transition-colors disabled:opacity-50 ml-auto"
                              >
                                ✕ Prekliči
                              </button>
                            </div>
                          )}

                          {n.opomba && (
                            <p className="text-[10px] opacity-50 mt-1 italic">"{n.opomba}"</p>
                          )}

                          {actionLoading === n.id && (
                            <div className="text-[10px] text-dark-400 mt-1">Posodabljanje...</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Legenda */}
        <div className="flex items-center gap-4 mt-6 text-xs text-dark-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 border border-green-500/30 bg-green-500/20" /> Potrjeno
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 border border-dark-600 bg-dark-500/50" /> Zaključeno
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 border border-red-500/30 bg-red-500/20" /> Preklicano
          </span>
        </div>
      </div>
    </div>
  )
}
