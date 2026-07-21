// ============================================================================
// BEISSINDEX – transparente Heuristik, KEINE Wissenschaft.
// Jeder Faktor ist einzeln benannt, gewichtet und wird in der UI aufgeschlüsselt.
// Gewichte unten in FAKTOR_GEWICHTE zentral anpassbar (z. B. zur Kalibrierung
// gegen reale Vergleichsdaten aus anderen Beißindex-Apps).
//
// Eingang: Open-Meteo-Wetterobjekt (hourly-Arrays) + Datum + Ort (+ optional Art)
// Ausgang: { score 0–100, label, tone, factors[] } – factors erklären das WARUM.
// ============================================================================
import SunCalc from 'suncalc'
import { nearestHourIndex } from './weather'
import { solunarPeriods } from './solunar'

// Zentrale Gewichte (Punkte, die ein Faktor maximal beisteuert/abzieht)
export const FAKTOR_GEWICHTE = {
  druckFallend: 15,
  druckStarkFallend: 20, // > 3 hPa / 6h
  druckSteigend: -10,
  windGut: 10, // 5–20 km/h: Oberfläche gekräuselt, Fisch mutiger
  windZuViel: -15, // > 30 km/h
  bewoelkt: 10, // > 60 % Wolken: gedämpftes Licht
  daemmerung: 15, // ±90 min um Sonnenauf-/-untergang
  mittagsflaute: -10, // 11–15 Uhr bei Sommerhitze
  hitze: -8, // > 27 °C Lufttemperatur
  mondphase: 8, // Voll-/Neumond ± 2 Tage
  solunarMajor: 8, // aktuelle Major-Periode (Monddurchgang)
  nacht: 0, // Basiswert, artspezifisch überschrieben
}

// Artenprofile: Multiplikatoren/Extras auf die Basisfaktoren.
// Quelle: übliche Sommer-Faustregeln, siehe Lexikon – bewusst grob.
export const ARTEN_PROFILE = {
  hecht: {
    name: 'Hecht',
    emoji: '🐊',
    hinweis: 'Dämmerungs-Jäger an Kraut & Schilf; Hitze mag er gar nicht.',
    daemmerung: 1.2, // reagiert stark auf Dämmerung
    hitze: 1.5, // leidet unter warmem Oberflächenwasser
    nachtBonus: -5, // nachts eher mäßig
    druck: 1.0,
    truebesLicht: 1.0,
  },
  barsch: {
    name: 'Barsch',
    emoji: '🐟',
    hinweis: 'Tagsüber in Trupps unterwegs; Wolken + Wind = Barschwetter.',
    daemmerung: 1.0,
    hitze: 0.7, // verträgt Wärme besser
    nachtBonus: -10, // nachts kaum aktiv (Augenjäger, braucht Licht)
    druck: 0.8,
    truebesLicht: 1.3, // bewölkt = ganztags gut
  },
  zander: {
    name: 'Zander',
    emoji: '🦈',
    hinweis: 'Im Hochsommer tief & nachtaktiv – späte Session einplanen.',
    daemmerung: 1.3,
    hitze: 1.0,
    nachtBonus: 15, // Nacht ist SEINE Zeit
    druck: 1.3, // gilt als besonders drucksensibel
    truebesLicht: 1.5, // Lichtscheu: bedeckt hilft deutlich
  },
}

const clamp = (v, lo = 3, hi = 98) => Math.max(lo, Math.min(hi, Math.round(v)))

export function scoreLabel(score) {
  if (score >= 75) return { label: 'Sehr gut – Rute rein!', tone: 'green', ampel: '🟢' }
  if (score >= 55) return { label: 'Gut', tone: 'green', ampel: '🟢' }
  if (score >= 35) return { label: 'Mittel', tone: 'fire', ampel: '🟡' }
  return { label: 'Schlecht – eher Grill & Bier', tone: 'red', ampel: '🔴' }
}

// Kernfunktion: Index für einen Zeitpunkt (optional artspezifisch)
export function biteIndex(weather, date = new Date(), lat = 56.867, lng = 14.086, artKey = null) {
  if (!weather?.hourly?.time) return { score: null, label: 'Kein Wetter geladen', factors: [] }
  const G = FAKTOR_GEWICHTE
  const art = artKey ? ARTEN_PROFILE[artKey] : null
  const h = weather.hourly
  const i = nearestHourIndex(weather, date)
  const factors = []
  let score = 50

  const add = (points, label, detail) => {
    score += points
    factors.push({
      label,
      detail,
      points: Math.round(points),
      effect: points > 0.5 ? '+' : points < -0.5 ? '−' : '·',
    })
  }

  // 1) Luftdruck-Trend (jetzt vs. 6 h davor) – der Klassiker
  const p = h.pressure_msl
  const trend = i >= 6 && p ? (p[i] ?? 0) - (p[i - 6] ?? 0) : 0
  const druckFaktor = art?.druck ?? 1
  if (trend < -3) add(G.druckStarkFallend * druckFaktor, 'Luftdruck stark fallend 📉', `${trend.toFixed(1)} hPa/6h – Front im Anmarsch, oft Fressphase`)
  else if (trend < -1.5) add(G.druckFallend * druckFaktor, 'Luftdruck fallend 📉', `${trend.toFixed(1)} hPa/6h`)
  else if (trend > 1.5) add(G.druckSteigend * druckFaktor, 'Luftdruck steigend 📈', `${trend.toFixed(1)} hPa/6h – Fische stellen sich oft um`)
  else add(0, 'Luftdruck stabil', `${trend.toFixed(1)} hPa/6h`)

  // 2) Wind
  const wind = h.wind_speed_10m?.[i] ?? 0
  if (wind >= 5 && wind <= 20) add(G.windGut, 'Gute Brise 🌬️', `${Math.round(wind)} km/h – gekräuselte Oberfläche`)
  else if (wind > 30) add(G.windZuViel, 'Zu viel Wind 💨', `${Math.round(wind)} km/h`)
  else add(0, 'Wenig Wind', `${Math.round(wind)} km/h`)

  // 3) Bewölkung (gedämpftes Licht)
  const cloud = h.cloud_cover?.[i] ?? 0
  if (cloud > 60) add(G.bewoelkt * (art?.truebesLicht ?? 1), 'Bedeckt ☁️', `${Math.round(cloud)} % – gedämpftes Licht`)
  else add(0, 'Eher klar ☀️', `${Math.round(cloud)} % Wolken`)

  // 4) Tageszeit: Dämmerung / Mittagsflaute / Nacht
  const sun = SunCalc.getTimes(date, lat, lng)
  const t = date.getTime()
  const nearSunrise = sun.sunrise && Math.abs(t - sun.sunrise.getTime()) < 90 * 60000
  const nearSunset = sun.sunset && Math.abs(t - sun.sunset.getTime()) < 90 * 60000
  const hour = date.getHours()
  const isNight = sun.sunrise && sun.sunset && (t < sun.sunrise.getTime() - 90 * 60000 || t > sun.sunset.getTime() + 90 * 60000)
  if (nearSunrise || nearSunset) {
    add(G.daemmerung * (art?.daemmerung ?? 1), `Dämmerung ${nearSunrise ? '🌅' : '🌇'}`, 'Prime-Time am Wasser')
  } else if (isNight) {
    add(art?.nachtBonus ?? G.nacht, 'Nacht 🌙', art?.nachtBonus > 0 ? 'Zander-Zeit!' : 'nur wenige Arten aktiv')
  } else if (hour >= 11 && hour <= 15) {
    add(G.mittagsflaute, 'Mittagszeit ☀️', 'im Sommer meist zäh')
  } else {
    add(0, 'Normale Tageszeit', '')
  }

  // 5) Sommerhitze
  const temp = h.temperature_2m?.[i] ?? 18
  if (temp > 27) add(G.hitze * (art?.hitze ?? 1), 'Hitze 🥵', `${Math.round(temp)} °C – Fische stehen tief`)

  // 6) Mondphase (Voll-/Neumond ± ~2 Tage)
  const phase = SunCalc.getMoonIllumination(date).phase
  const nearNewOrFull = phase < 0.07 || phase > 0.93 || Math.abs(phase - 0.5) < 0.07
  if (nearNewOrFull) add(G.mondphase, 'Voll-/Neumond 🌕', 'Solunar-Theorie: mehr Aktivität')

  // 7) Solunar-Major-Periode gerade aktiv?
  const inMajor = solunarPeriods(date, lat, lng).some((per) => per.major && date >= per.from && date <= per.to)
  if (inMajor) add(G.solunarMajor, 'Solunar-Hauptzeit 🌙', 'Monddurchgang – Major-Periode')

  const { label, tone, ampel } = scoreLabel(clamp(score))
  return { score: clamp(score), label, tone, ampel, factors }
}

// Stündlicher Verlauf für einen Tag (0–23 Uhr)
export function hourlyIndex(weather, day = new Date(), lat = 56.867, lng = 14.086, artKey = null) {
  const out = []
  for (let hour = 0; hour < 24; hour++) {
    const d = new Date(day)
    d.setHours(hour, 30, 0, 0)
    out.push({ hour, ...biteIndex(weather, d, lat, lng, artKey) })
  }
  return out
}

// Tages-Ausblick: bestes Zeitfenster + Score pro Tag
export function dailyOutlook(weather, lat = 56.867, lng = 14.086, days = 5) {
  const out = []
  for (let i = 0; i < days; i++) {
    const day = new Date()
    day.setDate(day.getDate() + i)
    const hours = hourlyIndex(weather, day, lat, lng)
    const valid = hours.filter((x) => x.score != null)
    if (!valid.length) continue
    const best = valid.reduce((a, b) => (b.score > a.score ? b : a))
    const avg = Math.round(valid.reduce((s, x) => s + x.score, 0) / valid.length)
    out.push({ date: day, bestHour: best.hour, bestScore: best.score, avg })
  }
  return out
}
