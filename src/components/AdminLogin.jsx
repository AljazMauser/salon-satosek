import { useState } from 'react'
import { adminLogin } from '../api'

export default function AdminLogin({ onLogin }) {
  const [geslo, setGeslo] = useState('')
  const [napaka, setNapaka] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!geslo.trim()) return

    setLoading(true)
    setNapaka(null)

    try {
      const data = await adminLogin(geslo)
      onLogin(data.token)
    } catch (err) {
      setNapaka(err.message || 'Napačno geslo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10 text-gold-500 mx-auto mb-4"
          >
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
          </svg>
          <h1 className="text-xl font-serif font-bold text-white">Salon Satošek</h1>
          <p className="text-dark-400 text-sm mt-1">Administracija</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-800 border border-dark-700 p-6">
          {napaka && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 text-red-300 text-sm">
              {napaka}
            </div>
          )}

          <label className="block text-dark-400 text-xs uppercase tracking-wider mb-1.5">
            Admin geslo
          </label>
          <input
            type="password"
            value={geslo}
            onChange={(e) => setGeslo(e.target.value)}
            className="w-full bg-dark-900 border border-dark-600 text-white px-3 py-2.5 focus:border-gold-500 outline-none transition-colors mb-4"
            placeholder="Vnesite geslo"
            autoFocus
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center text-sm !py-2.5 disabled:opacity-60"
          >
            {loading ? 'Prijava ...' : 'Prijava'}
          </button>
        </form>

        <p className="text-center text-dark-600 text-xs mt-4">
          Zaščiten dostop za osebje salona.
        </p>
      </div>
    </div>
  )
}
