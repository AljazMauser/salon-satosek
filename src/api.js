/**
 * API pomočnik za komunikacijo s FastAPI backendom.
 * V produkciji spremeni BASE_URL na pravi URL strežnika.
 */

const BASE_URL = 'http://localhost:8000'

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Napaka pri povezavi s strežnikom.' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }

  return res.json()
}

/** Vrne vse storitve salona. */
export function fetchStoritve() {
  return request('/api/storitve')
}

/** Vrne proste termine za izbran datum in storitev. */
export function fetchProstiTermini(datum, storitevId) {
  return request(`/api/prosti-termini?datum=${datum}&storitev_id=${storitevId}`)
}

/** Ustvari novo naročilo. */
export function createNarocilo(podatki) {
  return request('/api/naroci-se', {
    method: 'POST',
    body: JSON.stringify(podatki),
  })
}

/** Admin: prijava z geslom, vrne žeton. */
export function adminLogin(geslo) {
  return request('/api/admin/prijava', {
    method: 'POST',
    body: JSON.stringify({ geslo }),
  })
}

/** Admin: vrne vsa naročila v obdobju. */
export function fetchNarocila(od, do_, token) {
  return request(`/api/narocila?od=${od}&do=${do_}&admin_token=${token}`)
}

/** Admin: posodobi status naročila. */
export function updateStatus(narociloId, status, token) {
  return request(`/api/narocila/${narociloId}/status?admin_token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
