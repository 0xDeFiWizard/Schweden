// Statistiken, Leaderboard, Badges & Muster-Insights.
// WICHTIG: alles wird aus der catches-Collection ABGELEITET (keine Counter
// in der DB) – dadurch gibt es beim Offline-Sync keine Konflikte.

export function memberStats(catches, userId) {
  const mine = catches.filter((c) => c.userId === userId)
  const biggest = mine.reduce((a, c) => ((c.lengthCm ?? 0) > (a?.lengthCm ?? 0) ? c : a), null)
  const species = [...new Set(mine.map((c) => c.species).filter(Boolean))]
  const dawnSessions = mine.filter((c) => {
    const h = new Date(c.caughtAt).getHours()
    return h >= 3 && h <= 8
  }).length
  const bySpecies = {}
  for (const c of mine) bySpecies[c.species] = (bySpecies[c.species] ?? 0) + 1
  return { total: mine.length, biggest, species, dawnSessions, bySpecies }
}

export function leaderboard(catches, members) {
  const rows = members.map((m) => {
    const s = memberStats(catches, m.id)
    return { member: m, ...s }
  })
  return {
    biggestFish: [...rows].sort((a, b) => (b.biggest?.lengthCm ?? 0) - (a.biggest?.lengthCm ?? 0)),
    mostFish: [...rows].sort((a, b) => b.total - a.total),
    mostSpecies: [...rows].sort((a, b) => b.species.length - a.species.length),
  }
}

export function badges(catches, members, userId) {
  const mine = catches.filter((c) => c.userId === userId)
  const all = [...catches].sort((a, b) => new Date(a.caughtAt) - new Date(b.caughtAt))
  const out = []
  if (all.length && all[0].userId === userId) out.push({ icon: '🥇', name: 'Erster Fisch', desc: 'Hat den Trip eröffnet' })
  const pikes = catches.filter((c) => c.species === 'Hecht')
  const biggestPike = pikes.reduce((a, c) => ((c.lengthCm ?? 0) > (a?.lengthCm ?? 0) ? c : a), null)
  if (biggestPike && biggestPike.userId === userId) out.push({ icon: '🐊', name: 'Größter Hecht', desc: `${biggestPike.lengthCm} cm Monster` })
  if (mine.some((c) => new Date(c.caughtAt).getHours() < 5)) out.push({ icon: '🌅', name: 'Frühaufsteher', desc: 'Rute im Wasser vor 5:00' })
  if (mine.some((c) => c.species === 'Zander')) out.push({ icon: '🦈', name: 'Zander-Jäger', desc: 'Den Schwierigen überlistet' })
  if (mine.length >= 5) out.push({ icon: '🎣', name: 'Dauerangler', desc: '5+ Fänge eingetragen' })
  const m = members.find((x) => x.id === userId)
  if (m?.saunaWarrior) out.push({ icon: '🧖', name: 'Saunakrieger', desc: 'Sauna + See-Sprung überlebt' })
  return out
}

// Auto-Muster-Insight: „Deine Hechte kamen bei fallendem Luftdruck & Ostwind"
export function patternInsight(catches, userId) {
  const mine = catches.filter((c) => c.userId === userId && c.weatherSnapshot)
  if (mine.length < 3) return null
  const bySpecies = {}
  for (const c of mine) (bySpecies[c.species] ??= []).push(c)
  const [species, list] = Object.entries(bySpecies).sort((a, b) => b[1].length - a[1].length)[0]
  const falling = list.filter((c) => (c.weatherSnapshot.pressureTrend ?? 0) < 0).length
  const winds = {}
  for (const c of list) winds[c.weatherSnapshot.windDir] = (winds[c.weatherSnapshot.windDir] ?? 0) + 1
  const topWind = Object.entries(winds).sort((a, b) => b[1] - a[1])[0]
  const hours = list.map((c) => new Date(c.caughtAt).getHours())
  const dawn = hours.filter((h) => (h >= 3 && h <= 8) || (h >= 19 && h <= 23)).length
  const parts = []
  if (falling / list.length >= 0.6) parts.push('fallendem Luftdruck')
  if (topWind && topWind[1] / list.length >= 0.5) parts.push(`${topWind[0]}-Wind`)
  if (dawn / list.length >= 0.6) parts.push('Dämmerung')
  if (!parts.length) return null
  const plural = { Hecht: 'Hechte', Barsch: 'Barsche', Zander: 'Zander', Forelle: 'Forellen' }[species] ?? species
  return `Deine ${plural} kamen meist bei ${parts.join(' & ')}. 🎯`
}
