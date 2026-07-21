// Fang-Regeln als KONFIGURIERBARE Datenquelle – bewusst NICHT als Fakten hardcodiert.
// Werte sind Richtwerte; verbindlich sind die Regeln des örtlichen
// Fiskevårdsområde (Angelkarte via iFiske). verified bleibt false, bis vor Ort geprüft.

export const REGEL_QUELLE = {
  verified: false,
  hinweis: 'Richtwerte! Verbindliche Mindestmaße & Schonzeiten vor Ort prüfen: iFiske / Fiskevårdsområde Ryssbysjön.',
  link: 'https://www.ifiske.se',
}

export const FANG_REGELN = {
  Hecht: { minSizeCm: 45, maxSizeCm: 90, note: 'Übliches Entnahmefenster 45–90 cm, große Rogner zurücksetzen.' },
  Zander: { minSizeCm: 45, maxSizeCm: null, note: 'Richtwert Mindestmaß 45 cm.' },
  Barsch: { minSizeCm: null, maxSizeCm: null, note: 'Meist kein Mindestmaß – Bestand trotzdem schonen.' },
  Forelle: { minSizeCm: 50, maxSizeCm: null, note: 'Richtwert 50 cm, oft Schonzeiten beachten.' },
}

// Legal-Check für einen Fang: keepable true/false/null (null = unbekannt, selbst prüfen)
export function checkCatch(species, lengthCm) {
  const rule = FANG_REGELN[species]
  if (!rule) {
    return { keepable: null, minSizeCm: null, note: 'Keine Regel hinterlegt – vor Ort prüfen (iFiske).' }
  }
  let keepable = true
  const parts = []
  if (rule.minSizeCm != null) {
    parts.push(`Mindestmaß ${rule.minSizeCm} cm`)
    if (lengthCm != null && lengthCm < rule.minSizeCm) keepable = false
  }
  if (rule.maxSizeCm != null) {
    parts.push(`Entnahme bis ${rule.maxSizeCm} cm`)
    if (lengthCm != null && lengthCm > rule.maxSizeCm) keepable = false
  }
  if (lengthCm == null) keepable = null
  return {
    keepable,
    minSizeCm: rule.minSizeCm,
    note: `${parts.join(', ') || 'Kein Maß hinterlegt'} · ${rule.note} (Richtwert – vor Ort prüfen!)`,
  }
}
