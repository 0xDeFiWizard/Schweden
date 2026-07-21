// Sonne/Mond/Solunar – komplett lokal berechnet (suncalc), offline verfügbar.
import SunCalc from 'suncalc'
import { moonPhaseName } from './weather'

export function sunTimes(date, lat, lng) {
  const t = SunCalc.getTimes(date, lat, lng)
  return { sunrise: t.sunrise, sunset: t.sunset, dawn: t.dawn, dusk: t.dusk, goldenHour: t.goldenHour }
}

export function moonInfo(date, lat, lng) {
  const ill = SunCalc.getMoonIllumination(date)
  const times = SunCalc.getMoonTimes(date, lat, lng)
  return {
    phase: ill.phase,
    phaseName: moonPhaseName(ill.phase),
    fraction: Math.round(ill.fraction * 100),
    rise: times.rise ?? null,
    set: times.set ?? null,
  }
}

// Solunar-Perioden (Fun-Schätzung): Major = Monddurchgang oben/unten ±1h,
// Minor = Mondauf-/-untergang ±30min. Transit als Mitte zwischen Auf- und Untergang genähert.
export function solunarPeriods(date, lat, lng) {
  const times = SunCalc.getMoonTimes(date, lat, lng)
  const periods = []
  const push = (name, center, halfMin) => {
    if (!center || isNaN(center)) return
    periods.push({
      name,
      from: new Date(center.getTime() - halfMin * 60000),
      to: new Date(center.getTime() + halfMin * 60000),
      major: halfMin >= 60,
    })
  }
  if (times.rise) push('Minor (Mondaufgang)', times.rise, 30)
  if (times.set) push('Minor (Monduntergang)', times.set, 30)
  if (times.rise && times.set) {
    const a = times.rise.getTime()
    const b = times.set.getTime()
    const transit = new Date((a + b) / 2 + (b < a ? 12.42 * 3600000 / 2 : 0))
    push('Major (Mond oben)', transit, 60)
    push('Major (Mond unten)', new Date(transit.getTime() + 12.42 * 3600000 / 2), 60)
  }
  return periods.sort((x, y) => x.from - y.from)
}

// Beste Angel-Zeitfenster heute: Dämmerung + Solunar kombiniert
export function bestWindows(date, lat, lng) {
  const sun = sunTimes(date, lat, lng)
  const windows = []
  if (sun.sunrise) {
    windows.push({ name: 'Morgendämmerung', from: new Date(sun.sunrise.getTime() - 90 * 60000), to: new Date(sun.sunrise.getTime() + 60 * 60000), icon: '🌅' })
  }
  if (sun.sunset) {
    windows.push({ name: 'Abenddämmerung', from: new Date(sun.sunset.getTime() - 60 * 60000), to: new Date(sun.sunset.getTime() + 90 * 60000), icon: '🌇' })
  }
  for (const p of solunarPeriods(date, lat, lng).filter((p) => p.major)) {
    windows.push({ name: p.name, from: p.from, to: p.to, icon: '🌙' })
  }
  return windows.sort((a, b) => a.from - b.from)
}
