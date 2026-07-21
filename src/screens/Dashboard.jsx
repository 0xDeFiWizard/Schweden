import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTrip } from '../data/TripContext'
import { getWeather, wmoIcon, wmoText, windDirText } from '../lib/weather'
import { biteIndex } from '../lib/bissindex'
import { bestWindows, moonInfo, sunTimes } from '../lib/solunar'
import { countdownParts, fmtEUR, fmtTime, timeAgo } from '../lib/format'
import { computeBalances } from '../lib/settle'
import { Card, SectionTitle, Chip, ProgressBar } from '../components/ui'
import Avatar from '../components/Avatar'

export default function Dashboard() {
  const { trip, me, members, catches, tasks, shopping, expenses, boat, memberById } = useTrip()
  const [weather, setWeather] = useState(null)
  const lat = trip?.lat ?? 56.867
  const lng = trip?.lng ?? 14.086

  useEffect(() => {
    getWeather(lat, lng).then(setWeather)
  }, [lat, lng])

  const fi = biteIndex(weather, new Date(), lat, lng)
  const openTasks = tasks.filter((t) => t.status !== 'done')
  const openShopping = shopping.filter((s) => !s.bought)
  const totalSpent = expenses.reduce((a, e) => a + (Number(e.amount) || 0), 0)
  const myBalance = me ? (computeBalances(expenses, members.map((m) => m.id))[me.id] ?? 0) : 0
  const latestCatches = [...catches].sort((a, b) => new Date(b.caughtAt) - new Date(a.caughtAt)).slice(0, 3)
  const windows = trip ? bestWindows(new Date(), lat, lng) : []
  const nextWindow = windows.find((w) => w.to > new Date())
  const moon = moonInfo(new Date(), lat, lng)
  const sun = sunTimes(new Date(), lat, lng)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wide">Norrfångst</h1>
          <p className="text-sm text-mist-500">{trip?.location ?? '…'}</p>
        </div>
        {me && (
          <Link to="/more">
            <Avatar member={me} size={44} />
          </Link>
        )}
      </header>

      <Countdown startDate={trip?.startDate} endDate={trip?.endDate} />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link to="/weather">
          <Card className="h-full">
            <p className="text-xs uppercase tracking-wide text-mist-500">Wetter Ryssby →</p>
            {weather?.current ? (
              <>
                <p className="font-display mt-1 text-3xl">
                  {wmoIcon(weather.current.weather_code)} {Math.round(weather.current.temperature_2m)}°
                </p>
                <p className="text-xs text-paper-300">{wmoText(weather.current.weather_code)}</p>
                <p className="mt-1 text-xs text-mist-500">
                  💨 {Math.round(weather.current.wind_speed_10m)} km/h {windDirText(weather.current.wind_direction_10m)} ·{' '}
                  {Math.round(weather.current.surface_pressure)} hPa
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-mist-500">Kein Empfang – letzter Stand fehlt</p>
            )}
          </Card>
        </Link>
        <Link to="/biteindex">
          <Card className="h-full">
            <p className="text-xs uppercase tracking-wide text-mist-500">Beißindex →</p>
            {fi.score != null ? (
              <>
                <p className="font-display mt-1 text-3xl text-fire-400">{fi.score}</p>
                <p className="text-xs text-paper-300">{fi.label}</p>
                <div className="mt-2">
                  <ProgressBar value={fi.score} max={100} color="var(--color-fire-500)" />
                </div>
                <p className="mt-1 text-[0.6rem] text-mist-500">Fun-Schätzung, keine Wissenschaft 😉</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-mist-500">—</p>
            )}
          </Card>
        </Link>
      </div>

      <Link to="/biteindex">
      <Card className="mt-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-mist-500">Fischaktivität heute →</p>
          <span className="text-xs text-mist-500">{moon.phaseName}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <Chip tone="blue">🌅 {fmtTime(sun.sunrise)}</Chip>
          <Chip tone="blue">🌇 {fmtTime(sun.sunset)}</Chip>
          {nextWindow && (
            <Chip tone="fire">
              {nextWindow.icon} Nächstes Fenster: {fmtTime(nextWindow.from)}–{fmtTime(nextWindow.to)}
            </Chip>
          )}
        </div>
      </Card>
      </Link>

      <SectionTitle right={<Link to="/catches" className="text-xs text-lake-300">Alle →</Link>}>
        Letzte Fänge
      </SectionTitle>
      {latestCatches.length === 0 ? (
        <Card className="text-center text-sm text-mist-500">
          Noch nichts im Netz. Der erste Fang gehört dir! 🎣
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {latestCatches.map((c) => {
              const m = memberById[c.userId]
              return (
                <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card className="flex items-center gap-3">
                    <Avatar member={m ?? { displayName: c.userName, accentColor: c.userAccent, avatar: '🎣' }} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        <b style={{ color: m?.accentColor ?? c.userAccent }}>{m?.displayName ?? c.userName}</b> ·{' '}
                        {c.lengthCm ? `${c.lengthCm} cm ` : ''}{c.species}
                      </p>
                      <p className="text-xs text-mist-500">
                        {timeAgo(c.caughtAt)}{c.bait ? ` · ${c.bait}` : ''}
                      </p>
                    </div>
                    {c.photoUrl && <img src={c.photoUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <SectionTitle>Lagebericht</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Link to="/tasks">
          <Card>
            <p className="text-2xl">✅</p>
            <p className="font-display text-xl">{openTasks.length}</p>
            <p className="text-xs text-mist-500">offene Aufgaben</p>
          </Card>
        </Link>
        <Link to="/shopping">
          <Card>
            <p className="text-2xl">🛒</p>
            <p className="font-display text-xl">{openShopping.length}</p>
            <p className="text-xs text-mist-500">offene Einkäufe</p>
          </Card>
        </Link>
        <Link to="/budget">
          <Card>
            <p className="text-2xl">💰</p>
            <p className="font-display text-xl">{fmtEUR(totalSpent)}</p>
            <p className="text-xs text-mist-500">
              ausgegeben · dein Saldo:{' '}
              <span className={myBalance >= 0 ? 'text-pine-300' : 'text-red-400'}>{fmtEUR(myBalance)}</span>
            </p>
          </Card>
        </Link>
        <Link to="/boat">
          <Card>
            <p className="text-2xl">🛥️</p>
            <p className="font-display text-xl">
              {trip?.boatRented ? `${boat?.fuelStatus ?? '–'}% ⛽` : 'kein Boot'}
            </p>
            <p className="text-xs text-mist-500">{trip?.boatRented ? 'Tank' : 'Miete offen?'}</p>
          </Card>
        </Link>
      </div>

      <Card className="mt-3 border-wood-400/30 bg-wood-500/10">
        <p className="text-sm">
          🍺 <b>Systembolaget-Regel:</b> Bier &gt;3,5% & Schnaps gibt&apos;s nur im Systembolaget (So geschlossen,
          Sa früh zu). Besser: Alkohol aus Deutschland mitbringen – billiger & EU-Reisefreimenge.
        </p>
      </Card>
    </div>
  )
}

function Countdown({ startDate, endDate }) {
  const [, tick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])
  if (!startDate) return null
  const parts = countdownParts(startDate + 'T00:00:00')
  const running = !parts && endDate && new Date() <= new Date(endDate + 'T23:59:59')
  return (
    <Card className="bg-gradient-to-br from-night-700 to-night-800 text-center">
      {parts ? (
        <>
          <p className="text-xs uppercase tracking-widest text-wood-400">Abfahrt in</p>
          <div className="mt-1 flex items-end justify-center gap-3">
            {[
              [parts.days, 'Tage'],
              [parts.hours, 'Std'],
              [parts.minutes, 'Min'],
              [parts.seconds, 'Sek'],
            ].map(([v, l]) => (
              <div key={l} className="flex flex-col items-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={v}
                    initial={{ y: -12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 12, opacity: 0 }}
                    className="font-display text-4xl text-fire-400"
                  >
                    {String(v).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[0.6rem] uppercase text-mist-500">{l}</span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-mist-500">28.07. – 01.08.2026 · Ryssby, Småland 🇸🇪</p>
        </>
      ) : running ? (
        <p className="font-display text-2xl text-pine-300">🔥 Ihr seid am See – Petri Heil!</p>
      ) : (
        <p className="font-display text-xl text-mist-500">Trip beendet – bis zum nächsten Jahr 🫎</p>
      )}
    </Card>
  )
}
