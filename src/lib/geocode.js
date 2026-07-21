// Adress-Suche über Nominatim (OpenStreetMap) – kostenlos, kein API-Key.
// Usage Policy: max. 1 Request/Sekunde (Drossel unten), Ergebnisse werden
// gecacht. Identifikation erfolgt über den Referer der App; ein eigener
// User-Agent-Header ist aus dem Browser heraus nicht setzbar (forbidden header).

const CACHE_KEY = 'norrfangst:geocode'
let lastRequestAt = 0

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

// → { lat, lng, label } | null (kein Treffer)
export async function geocodeAddress(query) {
  const q = query.trim()
  if (!q) return null
  const cache = readCache()
  const key = q.toLowerCase()
  if (cache[key]) return cache[key]

  const wait = Math.max(0, lastRequestAt + 1100 - Date.now())
  if (wait) await new Promise((r) => setTimeout(r, wait))
  lastRequestAt = Date.now()

  // viewbox (Südschweden) als Bias, bounded=0 → Rest der Welt bleibt findbar
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=de' +
    '&viewbox=12.5,58.2,16.5,55.9&bounded=0&q=' +
    encodeURIComponent(q)
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Adress-Suche fehlgeschlagen (HTTP ${res.status})`)
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null

  const hit = { lat: Number(data[0].lat), lng: Number(data[0].lon), label: data[0].display_name }
  cache[key] = hit
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  return hit
}
