// Open-Meteo (kein API-Key) mit localStorage-Cache für Offline-Betrieb.
import SunCalc from 'suncalc'

const CACHE_KEY = 'norrfangst:weather:v2' // v2: + Luftfeuchtigkeit
const MAX_AGE_MS = 30 * 60 * 1000

export const WMO = {
  0: ['Klar', '☀️'], 1: ['Meist klar', '🌤️'], 2: ['Teils bewölkt', '⛅'], 3: ['Bedeckt', '☁️'],
  45: ['Nebel', '🌫️'], 48: ['Reifnebel', '🌫️'],
  51: ['Niesel', '🌦️'], 53: ['Niesel', '🌦️'], 55: ['Niesel', '🌧️'],
  61: ['Leichter Regen', '🌦️'], 63: ['Regen', '🌧️'], 65: ['Starkregen', '🌧️'],
  66: ['Eisregen', '🌧️'], 67: ['Eisregen', '🌧️'],
  71: ['Schnee', '🌨️'], 73: ['Schnee', '🌨️'], 75: ['Schnee', '❄️'], 77: ['Griesel', '🌨️'],
  80: ['Schauer', '🌦️'], 81: ['Schauer', '🌧️'], 82: ['Starke Schauer', '⛈️'],
  85: ['Schneeschauer', '🌨️'], 86: ['Schneeschauer', '🌨️'],
  95: ['Gewitter', '⛈️'], 96: ['Gewitter+Hagel', '⛈️'], 99: ['Gewitter+Hagel', '⛈️'],
}
export const wmoText = (code) => WMO[code]?.[0] ?? '—'
export const wmoIcon = (code) => WMO[code]?.[1] ?? '🌡️'

export function windDirText(deg) {
  if (deg == null) return '—'
  const dirs = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

export async function getWeather(lat = 56.867, lng = 14.086) {
  const cached = readCache()
  if (cached && Date.now() - cached.ts < MAX_AGE_MS) return cached.data
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover' +
      '&hourly=temperature_2m,precipitation_probability,pressure_msl,wind_speed_10m,wind_direction_10m,cloud_cover,weather_code' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max' +
      '&timezone=Europe%2FStockholm&forecast_days=7'
    const res = await fetch(url)
    if (!res.ok) throw new Error('weather http ' + res.status)
    const data = await res.json()
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
    return data
  } catch {
    return cached?.data ?? null // offline: letzter Stand
  }
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
  } catch {
    return null
  }
}

export function weatherAge() {
  const c = readCache()
  return c ? Date.now() - c.ts : null
}

// Luftdruck-Trend: jetzt vs. vor 6 Stunden (hPa)
export function pressureTrend(weather) {
  const h = weather?.hourly
  if (!h?.time) return 0
  const nowIdx = nearestHourIndex(weather)
  if (nowIdx < 6) return 0
  return (h.pressure_msl[nowIdx] ?? 0) - (h.pressure_msl[nowIdx - 6] ?? 0)
}

export function nearestHourIndex(weather, date = new Date()) {
  const h = weather?.hourly
  if (!h?.time) return 0
  const target = date.getTime()
  let best = 0
  let bestDiff = Infinity
  for (let i = 0; i < h.time.length; i++) {
    const diff = Math.abs(new Date(h.time[i]).getTime() - target)
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  }
  return best
}

// Hinweis: Der frühere fishingIndex lebt jetzt ausgebaut in lib/bissindex.js
// (transparente Faktoren, Artenprofile, Stunden-/Tagesverlauf).

// Wetter-Schnappschuss für einen Fang (auto-gestempelt)
export function weatherSnapshot(weather, date = new Date()) {
  if (!weather?.current) return null
  const i = nearestHourIndex(weather, date)
  const h = weather.hourly
  const moon = SunCalc.getMoonIllumination(date)
  return {
    tempC: h?.temperature_2m?.[i] ?? weather.current.temperature_2m,
    windKmh: h?.wind_speed_10m?.[i] ?? weather.current.wind_speed_10m,
    windDir: windDirText(h?.wind_direction_10m?.[i] ?? weather.current.wind_direction_10m),
    pressureHpa: Math.round(h?.pressure_msl?.[i] ?? weather.current.surface_pressure ?? 0),
    pressureTrend: Math.round(pressureTrend(weather) * 10) / 10,
    moonPhase: moonPhaseName(moon.phase),
    cloudCover: h?.cloud_cover?.[i] ?? weather.current.cloud_cover,
  }
}

export function moonPhaseName(phase) {
  if (phase < 0.03 || phase > 0.97) return 'Neumond 🌑'
  if (phase < 0.22) return 'Zunehmende Sichel 🌒'
  if (phase < 0.28) return 'Erstes Viertel 🌓'
  if (phase < 0.47) return 'Zunehmend 🌔'
  if (phase < 0.53) return 'Vollmond 🌕'
  if (phase < 0.72) return 'Abnehmend 🌖'
  if (phase < 0.78) return 'Letztes Viertel 🌗'
  return 'Abnehmende Sichel 🌘'
}
