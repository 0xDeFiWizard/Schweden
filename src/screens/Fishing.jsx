import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrip } from '../data/TripContext'
import { Screen, Card, SectionTitle, Chip, ProgressBar } from '../components/ui'
import { getWeather, wmoIcon, windDirText } from '../lib/weather'
import { biteIndex } from '../lib/bissindex'
import { sunTimes, moonInfo, bestWindows, solunarPeriods } from '../lib/solunar'
import { fmtTime, plural } from '../lib/format'
import { memberStats } from '../lib/stats'
import { ARTEN } from '../data/lexikon'
import { REGEL_QUELLE } from '../data/regeln'

export default function Fishing() {
  const { trip, uid, catches, updateTrip } = useTrip()
  const [weather, setWeather] = useState(null)
  const lat = trip?.lat ?? 56.867
  const lng = trip?.lng ?? 14.086
  const now = new Date()

  useEffect(() => {
    getWeather(lat, lng).then(setWeather)
  }, [lat, lng])

  const fi = biteIndex(weather, now, lat, lng)
  const sun = sunTimes(now, lat, lng)
  const moon = moonInfo(now, lat, lng)
  const windows = bestWindows(now, lat, lng)
  const solunar = solunarPeriods(now, lat, lng)
  const myStats = memberStats(catches, uid)
  const fiskekortOk = trip?.settings?.fiskekort === true

  return (
    <Screen title="Angeln" subtitle="Ryssbysjön & Umgebung" back>
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-xl">Ryssbysjön</p>
            <p className="text-sm text-mist-500">Hecht · Barsch · Zander (schwierig im Sommer)</p>
          </div>
          <span className="text-3xl">🏞️</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip tone={fiskekortOk ? 'green' : 'red'}>🎫 Fiskekort: {fiskekortOk ? 'gekauft ✓' : 'PFLICHT – noch offen!'}</Chip>
          <button
            onClick={() => updateTrip({ settings: { ...(trip?.settings ?? {}), fiskekort: !fiskekortOk } })}
            className="btn-ghost px-2.5 py-1 text-xs"
          >
            Status ändern
          </button>
        </div>
        <p className="mt-2 text-xs text-mist-500">
          Für fast alle Binnenseen in Schweden Pflicht – Kauf & Fangreports über{' '}
          <a href="https://www.ifiske.se" target="_blank" rel="noreferrer" className="text-lake-300 underline">
            iFiske
          </a>
          . {REGEL_QUELLE.hinweis}
        </p>
      </Card>

      <SectionTitle>Heute am Wasser</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Link to="/biteindex">
          <Card className="h-full">
            <p className="text-xs uppercase tracking-wide text-mist-500">Beißindex →</p>
            <p className="font-display mt-1 text-3xl text-fire-400">{fi.score ?? '–'}</p>
            <p className="text-xs text-paper-300">{fi.label}</p>
            <div className="mt-2"><ProgressBar value={fi.score ?? 0} max={100} color="var(--color-fire-500)" /></div>
            <ul className="mt-2 space-y-0.5 text-[0.65rem] text-mist-500">
              {fi.factors.filter((f) => f.effect !== '·').map((f, i) => (
                <li key={i}>{f.label} ({f.effect}{Math.abs(f.points)})</li>
              ))}
            </ul>
          </Card>
        </Link>
        <Card>
          <p className="text-xs uppercase tracking-wide text-mist-500">Bedingungen</p>
          {weather?.current ? (
            <div className="mt-1 space-y-1 text-sm">
              <p>{wmoIcon(weather.current.weather_code)} {Math.round(weather.current.temperature_2m)}°C</p>
              <p>💨 {Math.round(weather.current.wind_speed_10m)} km/h aus {windDirText(weather.current.wind_direction_10m)}</p>
              <p>🔽 {Math.round(weather.current.surface_pressure)} hPa</p>
              <p>🌅 {fmtTime(sun.sunrise)} · 🌇 {fmtTime(sun.sunset)}</p>
              <p>{moon.phaseName} ({moon.fraction}%)</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-mist-500">Offline – kein Wetterstand</p>
          )}
        </Card>
      </div>

      <SectionTitle>Beste Zeitfenster heute</SectionTitle>
      <Card className="space-y-2">
        {windows.map((w, i) => {
          const active = now >= w.from && now <= w.to
          return (
            <div key={i} className={`flex items-center gap-3 rounded-lg px-2 py-1.5 ${active ? 'bg-fire-500/15' : ''}`}>
              <span className="text-lg">{w.icon}</span>
              <span className="flex-1 text-sm">{w.name}</span>
              <span className={`font-display text-sm ${active ? 'text-fire-400' : 'text-paper-300'}`}>
                {fmtTime(w.from)} – {fmtTime(w.to)}
              </span>
            </div>
          )
        })}
        <p className="text-[0.65rem] text-mist-500">
          Solunar: {solunar.length ? solunar.map((p) => `${p.major ? '●' : '○'} ${fmtTime(p.from)}` ).join(' · ') : '—'} · Fun-Schätzung 😉
        </p>
      </Card>

      <SectionTitle>Fischarten hier</SectionTitle>
      <div className="space-y-2">
        {ARTEN.map((a) => (
          <Card key={a.name} className="flex items-start gap-3">
            <span className="text-3xl">{a.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="font-display">{a.name} <Chip tone={a.schwierigkeit.startsWith('Gut') ? 'green' : 'fire'}>{a.schwierigkeit}</Chip></p>
              <p className="mt-1 text-xs text-paper-300">{a.sommer}</p>
              <p className="mt-1 text-xs text-mist-500">🪱 {a.koeder.slice(0, 3).join(', ')} · ⏰ {a.zeit}</p>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-2 text-right text-xs">
        <Link to="/lexicon" className="text-lake-300">Ganzes Lexikon + Survival-Tipps →</Link>
      </p>

      <SectionTitle>Deine Statistik</SectionTitle>
      <Card>
        {myStats.total === 0 ? (
          <p className="text-sm text-mist-500">Noch kein Fang eingetragen – dein Moment kommt. 🎣</p>
        ) : (
          <div className="flex flex-wrap gap-4 text-sm">
            <span>🎣 {plural(myStats.total, 'Fang', 'Fänge')}</span>
            <span>📏 größter: {myStats.biggest?.lengthCm ?? '–'} cm {myStats.biggest?.species}</span>
            <span>🐟 {plural(myStats.species.length, 'Art', 'Arten')}</span>
            <span>🌅 {myStats.dawnSessions} in der Dämmerung</span>
          </div>
        )}
      </Card>
    </Screen>
  )
}
