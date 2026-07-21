import { useEffect, useState } from 'react'
import { useTrip } from '../data/TripContext'
import { Screen, Card, SectionTitle, Chip } from '../components/ui'
import { getWeather } from '../lib/weather'
import { biteIndex, hourlyIndex, dailyOutlook, ARTEN_PROFILE, scoreLabel } from '../lib/bissindex'
import { sunTimes, moonInfo, solunarPeriods } from '../lib/solunar'
import { fmtTime } from '../lib/format'

export default function BiteIndex() {
  const { trip } = useTrip()
  const [weather, setWeather] = useState(null)
  const lat = trip?.lat ?? 56.867
  const lng = trip?.lng ?? 14.086
  const now = new Date()

  useEffect(() => {
    getWeather(lat, lng).then(setWeather)
  }, [lat, lng])

  if (!weather?.hourly) {
    return (
      <Screen title="Beißindex" subtitle="Fischaktivität" back>
        <Card className="text-center text-sm text-mist-500">Kein Wetterstand – der Index braucht Wetterdaten (offline: letzter Cache).</Card>
      </Screen>
    )
  }

  const idx = biteIndex(weather, now, lat, lng)
  const hours = hourlyIndex(weather, now, lat, lng)
  const outlook = dailyOutlook(weather, lat, lng, 5)
  const sun = sunTimes(now, lat, lng)
  const moon = moonInfo(now, lat, lng)
  const solunar = solunarPeriods(now, lat, lng)
  const sunriseH = sun.sunrise?.getHours()
  const sunsetH = sun.sunset?.getHours()

  const toneColor = { green: 'text-pine-300', fire: 'text-fire-400', red: 'text-red-400' }[idx.tone] ?? ''

  return (
    <Screen title="Beißindex" subtitle="Fischaktivität · transparent statt Blackbox" back>
      {/* Haupt-Score */}
      <Card className="bg-gradient-to-br from-night-700 to-night-800 text-center">
        <p className="text-xs uppercase tracking-widest text-mist-500">Jetzt gerade</p>
        <p className="font-display my-1 text-7xl text-fire-400">{idx.score}</p>
        <p className={`font-display text-xl ${toneColor}`}>{idx.ampel} {idx.label}</p>
        <p className="mt-2 text-[0.65rem] text-mist-500">Fun-Schätzung aus Wetter + Sonne + Mond – keine Garantie, Fische lesen keine Apps. 😉</p>
      </Card>

      {/* Warum? */}
      <SectionTitle>Warum dieser Wert?</SectionTitle>
      <Card className="divide-y divide-paper-100/5 p-0">
        {idx.factors.map((f, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2">
            <span className={`w-8 text-center font-display text-lg ${f.effect === '+' ? 'text-pine-300' : f.effect === '−' ? 'text-red-400' : 'text-mist-500'}`}>
              {f.effect === '+' ? `+${f.points}` : f.effect === '−' ? f.points : '·'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm">{f.label}</p>
              {f.detail && <p className="text-xs text-mist-500">{f.detail}</p>}
            </div>
          </div>
        ))}
      </Card>

      {/* Tagesverlauf */}
      <SectionTitle>Heute im Verlauf</SectionTitle>
      <Card>
        <div className="flex h-28 items-end gap-[3px]">
          {hours.map((h) => {
            const isNow = h.hour === now.getHours()
            const isDawn = h.hour === sunriseH || h.hour === sunsetH
            return (
              <div key={h.hour} className="flex flex-1 flex-col items-center gap-0.5" title={`${h.hour}:00 → ${h.score}`}>
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${Math.max(6, h.score)}%`,
                    background: isNow
                      ? 'var(--color-fire-500)'
                      : h.score >= 55
                        ? 'var(--color-pine-400)'
                        : h.score >= 35
                          ? 'var(--color-wood-400)'
                          : 'rgba(232,228,216,0.15)',
                  }}
                />
                <span className={`text-[0.5rem] ${isDawn ? 'text-fire-400' : isNow ? 'text-fire-400 font-bold' : 'text-mist-500/60'}`}>
                  {isDawn ? (h.hour === sunriseH ? '🌅' : '🌇') : h.hour % 6 === 0 ? h.hour : ''}
                </span>
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-[0.65rem] text-mist-500">
          🌅 {fmtTime(sun.sunrise)} · 🌇 {fmtTime(sun.sunset)} – Dämmerungsfenster sind die sichersten Bänke.
        </p>
      </Card>

      {/* Artenspezifisch */}
      <SectionTitle>Nach Zielfisch (jetzt)</SectionTitle>
      <div className="space-y-2">
        {Object.entries(ARTEN_PROFILE).map(([key, art]) => {
          const s = biteIndex(weather, now, lat, lng, key)
          const sl = scoreLabel(s.score)
          return (
            <Card key={key} className="flex items-center gap-3">
              <span className="text-3xl">{art.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-display">{art.name} <Chip tone={sl.tone === 'red' ? 'red' : sl.tone}>{sl.ampel} {s.score}</Chip></p>
                <p className="text-xs text-mist-500">{art.hinweis}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Ausblick */}
      <SectionTitle>Nächste Tage</SectionTitle>
      <Card className="divide-y divide-paper-100/5 p-0">
        {outlook.map((d, i) => {
          const sl = scoreLabel(d.bestScore)
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span className="w-16 shrink-0 text-paper-300">
                {i === 0 ? 'Heute' : d.date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'numeric' })}
              </span>
              <span className="flex-1 text-xs text-mist-500">
                bestes Fenster ~ {String(d.bestHour).padStart(2, '0')}:00 Uhr
              </span>
              <Chip tone={sl.tone === 'red' ? 'red' : sl.tone}>{sl.ampel} {d.bestScore}</Chip>
            </div>
          )
        })}
      </Card>

      {/* Solunar mit Erklärung */}
      <SectionTitle>Solunar & Mond</SectionTitle>
      <Card>
        <p className="mb-2 text-sm">{moon.phaseName} · {moon.fraction}% beleuchtet</p>
        <div className="space-y-1.5">
          {solunar.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span>{p.major ? '●' : '○'}</span>
              <span className="flex-1">{p.name}</span>
              <span className="font-display text-paper-300">{fmtTime(p.from)} – {fmtTime(p.to)}</span>
            </div>
          ))}
          {moon.rise && <p className="text-xs text-mist-500">Mondaufgang {fmtTime(moon.rise)}{moon.set ? ` · Monduntergang ${fmtTime(moon.set)}` : ''}</p>}
        </div>
        <div className="card-inset mt-3 p-3 text-xs text-mist-500">
          <b className="text-paper-300">Was ist Solunar?</b> Die Theorie: Fische sind aktiver, wenn der Mond direkt über
          oder unter dem Standort steht (<b>Major</b>, ~2 h) und rund um Mondauf-/-untergang (<b>Minor</b>, ~1 h).
          Wissenschaftlich umstritten, bei Anglern beliebt – wir zählen Major-Zeiten mit kleinem Bonus in den Index.
        </div>
      </Card>
    </Screen>
  )
}
