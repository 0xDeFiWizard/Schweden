export const fmtEUR = (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n ?? 0)

export const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '—'

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }) : '—'

export const fmtDateLong = (d) =>
  d ? new Date(d).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'

export function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return 'gerade eben'
  if (min < 60) return `vor ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `vor ${h} h`
  return fmtDate(d)
}

// Countdown-Bausteine bis zu einem Datum
export function countdownParts(target) {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

export const ACCENT_COLORS = [
  '#ff7a29', '#3fae72', '#4e7fa5', '#c89b6c', '#e05c5c', '#b07fd4', '#e8c94e', '#5ccfc4',
]

export const AVATAR_EMOJIS = ['🎣', '🐊', '🦈', '🍺', '🔥', '🧖', '🛥️', '🫎', '🌲', '🍖', '🎸', '🃏']
