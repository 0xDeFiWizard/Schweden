import { useEffect, useState } from 'react'
import { useTrip } from '../data/TripContext'
import { Screen, Card, SectionTitle } from '../components/ui'
import {
  getWeather,
  wmoIcon,
  wmoText,
  windDirText,
  pressureTrend,
  nearestHourIndex,
  weatherAge,
} from '../lib/weather'
import { sunTimes } from '../lib/solunar'
import { fmtTime } from '../lib/format'

export default function Weather() {
  const { trip } = useTrip()
  const [weather, setWeather] = useState(null)
  const lat = trip?.lat ?? 56.867
  const lng = trip?.lng ?? 14.086

  useEffect(() => {
    getWeather(lat, lng).then(setWeather)
  }, [lat, lng])

  if (!weather?.current) {
    return (
      <Screen title="Wetter" subtitle="Ryssby, Småland" back>
        <Card className="text-center text-sm text-mist-500">
          Kein Wetterstand verfügbar – offline und noch nichts gecacht. Bei Empfang lädt es automatisch.
        </Card>
      </Screen>
    )
  }

  const cur = weather.current
  const h = weather.hourly
  const d = weather.daily
  const nowIdx = nearestHourIndex(weather)
  const trend = pressureTrend(weather)
  const trendIcon = trend < -1.5 ? '↘︎ fallend' : trend > 1.5 ? '↗︎ steigend' : '→ stabil'
  const trendColor = trend < -1.5 ? 'text-pine-300' : trend > 1.5 ? 'text-fire-400' : 'text-mist-500'
  const sun = sunTimes(new Date(), lat, lng)
  const rainNow = h?.precipitation_probability?.[nowIdx]
  const age = weatherAge()

  return (
    <Screen title="Wetter" subtitle={`Ryssby, Småland${age && age > 45 * 60000 ? ' · Stand: gecacht' : ''}`} back>
      {/* Aktuelle Bedingungen */}
      <Card className="bg-gradient-to-br from-night-700 to-night-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-6xl">{Math.round(cur.temperature_2m)}°</p>
            <p className="text-sm text-paper-300">
              {wmoText(cur.weather_code)} · gefühlt {Math.round(cur.apparent_temperature)}°
            </p>
          </div>
          <span className="text-6xl">{wmoIcon(cur.weather_code)}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="card-inset p-3">
            <p className="text-xs uppercase tracking-wide text-mist-500">Wind</p>
            <p className="mt-1">
              <span className="inline-block" style={{ transform: `rotate(${(cur.wind_direction_10m ?? 0) + 180}deg)` }}>↑</span>{' '}
              {Math.round(cur.wind_speed_10m)} km/h aus {windDirText(cur.wind_direction_10m)}
            </p>
          </div>
          <div className="card-inset p-3">
            <p className="text-xs uppercase tracking-wide text-mist-500">Luftdruck ⭐</p>
            <p className="mt-1">
              {Math.round(cur.surface_pressure)} hPa <span className={trendColor}>{trendIcon}</span>
            </p>
          </div>
          <div className="card-inset p-3">
            <p className="text-xs uppercase tracking-wide text-mist-500">Luftfeuchte</p>
            <p className="mt-1">💧 {cur.relative_humidity_2m != null ? `${Math.round(cur.relative_humidity_2m)}%` : '—'}</p>
          </div>
          <div className="card-inset p-3">
            <p className="text-xs uppercase tracking-wide text-mist-500">Regen-Chance</p>
            <p className="mt-1">🌧️ {rainNow != null ? `${rainNow}%` : '—'}</p>
          </div>
        </div>
        <p className="mt-2 text-[0.65rem] text-mist-500">
          ⭐ Luftdruck-Trend (vs. vor 6 h) ist für Angler die wichtigste Zahl: fallend = oft Beißphase.
        </p>
      </Card>

      {/* Sonne */}
      <Card className="mt-3 flex items-center justify-around text-center">
        <div>
          <p className="text-2xl">🌅</p>
          <p className="font-display text-xl">{fmtTime(sun.sunrise)}</p>
          <p className="text-xs text-mist-500">Sonnenaufgang</p>
        </div>
        <div>
          <p className="text-2xl">🌇</p>
          <p className="font-display text-xl">{fmtTime(sun.sunset)}</p>
          <p className="text-xs text-mist-500">Sonnenuntergang</p>
        </div>
        <div>
          <p className="text-2xl">🎣</p>
          <p className="font-display text-xl">±90 min</p>
          <p className="text-xs text-mist-500">beste Angelzeit</p>
        </div>
      </Card>

      {/* Stündlich (48h) */}
      <SectionTitle>Nächste 48 Stunden</SectionTitle>
      <Card className="p-0">
        <div className="flex gap-1 overflow-x-auto px-3 py-3">
          {h?.time?.slice(nowIdx, nowIdx + 48).map((t, i) => {
            const idx = nowIdx + i
            const hour = new Date(t).getHours()
            return (
              <div key={t} className={`flex w-12 shrink-0 flex-col items-center gap-1 rounded-lg py-2 text-center ${i === 0 ? 'bg-fire-500/15' : hour === 0 ? 'border-l border-paper-100/15' : ''}`}>
                <span className="text-[0.6rem] text-mist-500">{i === 0 ? 'jetzt' : `${String(hour).padStart(2, '0')}h`}</span>
                <span className="text-base">{wmoIcon(h.weather_code?.[idx])}</span>
                <span className="text-xs font-semibold">{Math.round(h.temperature_2m[idx])}°</span>
                <span className={`text-[0.6rem] ${h.precipitation_probability?.[idx] >= 40 ? 'text-lake-300' : 'text-mist-500/60'}`}>
                  {h.precipitation_probability?.[idx] ?? 0}%
                </span>
                <span className="text-[0.6rem] text-mist-500">{Math.round(h.wind_speed_10m[idx])}</span>
              </div>
            )
          })}
        </div>
        <p className="border-t border-paper-100/5 px-3 py-1.5 text-[0.6rem] text-mist-500">
          Zeile 4: Regenwahrscheinlichkeit · Zeile 5: Wind km/h
        </p>
      </Card>

      {/* 7 Tage */}
      <SectionTitle>7-Tage-Ausblick</SectionTitle>
      <Card className="divide-y divide-paper-100/5 p-0">
        {d?.time?.map((t, i) => (
          <div key={t} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <span className="w-16 shrink-0 text-paper-300">
              {i === 0 ? 'Heute' : new Date(t).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'numeric' })}
            </span>
            <span className="text-xl">{wmoIcon(d.weather_code[i])}</span>
            <span className={`w-12 text-xs ${d.precipitation_probability_max[i] >= 40 ? 'text-lake-300' : 'text-mist-500'}`}>
              🌧 {d.precipitation_probability_max[i]}%
            </span>
            <span className="w-14 text-xs text-mist-500">💨 {Math.round(d.wind_speed_10m_max[i])}</span>
            <span className="flex-1 text-right">
              <b>{Math.round(d.temperature_2m_max[i])}°</b>
              <span className="text-mist-500"> / {Math.round(d.temperature_2m_min[i])}°</span>
            </span>
          </div>
        ))}
      </Card>

      <p className="mt-3 text-center text-[0.65rem] text-mist-500">
        Daten: Open-Meteo · wird 30 min gecacht und ist offline als letzter Stand verfügbar
      </p>
    </Screen>
  )
}
