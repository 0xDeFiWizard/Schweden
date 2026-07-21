import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTrip } from '../data/TripContext'
import { Screen, Card, Sheet, Field, Fab, Chip, EmptyState } from '../components/ui'
import Avatar from '../components/Avatar'
import { getWeather, weatherSnapshot } from '../lib/weather'
import { checkCatch, REGEL_QUELLE } from '../data/regeln'
import { ARTEN } from '../data/lexikon'
import { compressImage } from '../lib/img'
import { fmtTime, fmtDate, plural } from '../lib/format'
import { patternInsight } from '../lib/stats'

const REACTIONS = ['🔥', '💪', '🍺', '😂', '🐋']

export default function Catches() {
  const { catches, memberById, uid, me, add, set, del, trip } = useTrip()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editCatch, setEditCatch] = useState(null) // Fang-Doc im Bearbeiten-Modus
  const [splash, setSplash] = useState(false)

  const sorted = useMemo(
    () => [...catches].sort((a, b) => new Date(b.caughtAt) - new Date(a.caughtAt)),
    [catches]
  )
  const insight = patternInsight(catches, uid)

  return (
    <Screen title="Fangbuch" subtitle={`${plural(catches.length, 'Fang', 'Fänge')} · gemeinsames Logbuch`}>
      {insight && (
        <Card className="mb-3 border-pine-500/40 bg-pine-500/10 text-sm">
          <b>Muster erkannt:</b> {insight}
        </Card>
      )}

      {sorted.length === 0 ? (
        <EmptyState icon="🎣" title="Noch keine Fänge" text="Der erste Eintrag eröffnet das Leaderboard." />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {sorted.map((c) => (
              <CatchCard
                key={c.id}
                c={c}
                member={memberById[c.userId]}
                mine={c.userId === uid}
                onReact={(emoji) => set('catches', c.id, { reactions: { ...(c.reactions ?? {}), [uid]: emoji } })}
                onEdit={() => { setEditCatch(c); setSheetOpen(true) }}
                onDelete={() => del('catches', c.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Fab onClick={() => { setEditCatch(null); setSheetOpen(true) }} />
      <CatchSheet
        open={sheetOpen}
        initial={editCatch}
        onClose={() => setSheetOpen(false)}
        trip={trip}
        me={me}
        onSave={async (data) => {
          if (editCatch) {
            await set('catches', editCatch.id, data)
          } else {
            await add('catches', data)
            setSplash(true)
            setTimeout(() => setSplash(false), 1600)
          }
          setSheetOpen(false)
          setEditCatch(null)
        }}
      />

      <AnimatePresence>
        {splash && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.3, y: 60 }}
              animate={{ scale: [0.3, 1.3, 1], y: [60, -10, 0], rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.8 }}
              className="text-8xl drop-shadow-[0_0_30px_rgba(255,122,41,0.6)]"
            >
              🐟💦
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  )
}

function CatchCard({ c, member, mine, onReact, onEdit, onDelete }) {
  const legal = c.legalCheck
  const reactions = Object.entries(c.reactions ?? {})
  const counts = {}
  for (const [, e] of reactions) counts[e] = (counts[e] ?? 0) + 1
  const name = member?.displayName ?? c.userName ?? '???'
  const accent = member?.accentColor ?? c.userAccent

  return (
    <motion.div layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
      <Card>
        <div className="flex items-center gap-3">
          <Avatar member={member ?? { displayName: name, accentColor: accent, avatar: '🎣' }} size={40} />
          <div className="min-w-0 flex-1">
            <p className="text-sm">
              <b style={{ color: accent }}>{name}</b>{' '}
              <span className="font-display text-base">
                · {c.lengthCm ? `${c.lengthCm} cm ` : ''}{c.species}
                {c.weightKg ? ` · ${c.weightKg} kg` : ''}
              </span>
            </p>
            <p className="text-xs text-mist-500">
              {fmtDate(c.caughtAt)} {fmtTime(c.caughtAt)}
              {c.spotName ? ` · 📍 ${c.spotName}` : ''}
              {c.bait ? ` · 🪱 ${c.bait}` : ''}
            </p>
          </div>
          {mine && (
            <div className="flex gap-2">
              <button onClick={onEdit} className="text-xs text-mist-500 hover:text-paper-100" aria-label="Bearbeiten">
                ✏️
              </button>
              <button onClick={onDelete} className="text-xs text-mist-500 hover:text-red-400" aria-label="Löschen">
                🗑️
              </button>
            </div>
          )}
        </div>

        {c.photoUrl && (
          <img src={c.photoUrl} alt={c.species} className="mt-3 max-h-72 w-full rounded-xl object-cover" />
        )}
        {c.note && <p className="mt-2 text-sm text-paper-300">💬 {c.note}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {legal && (
            <Chip tone={legal.keepable === true ? 'green' : legal.keepable === false ? 'red' : undefined}>
              {legal.keepable === true ? '✅ entnehmbar' : legal.keepable === false ? '❌ zurücksetzen' : '⚠️ Regeln prüfen'}
            </Chip>
          )}
          {c.weatherSnapshot && (
            <Chip tone="blue">
              {Math.round(c.weatherSnapshot.tempC)}° · {c.weatherSnapshot.pressureHpa} hPa
              {c.weatherSnapshot.pressureTrend < 0 ? ' 📉' : c.weatherSnapshot.pressureTrend > 0 ? ' 📈' : ''} ·{' '}
              {c.weatherSnapshot.windDir}-Wind · {c.weatherSnapshot.moonPhase?.split(' ')[1] ?? ''}
            </Chip>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          {REACTIONS.map((e) => (
            <motion.button
              key={e}
              whileTap={{ scale: 1.4 }}
              onClick={() => onReact(e)}
              className={`rounded-full px-2 py-0.5 text-sm ${counts[e] ? 'bg-fire-500/20' : 'bg-night-950/50 opacity-60'}`}
            >
              {e}
              {counts[e] ? <span className="ml-1 text-xs text-paper-300">{counts[e]}</span> : null}
            </motion.button>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}

// Ein Formular für Anlegen UND Bearbeiten (initial = bestehender Fang)
function CatchSheet({ open, initial, onClose, onSave, trip, me }) {
  const [species, setSpecies] = useState('Hecht')
  const [lengthCm, setLengthCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [bait, setBait] = useState('')
  const [spotName, setSpotName] = useState('')
  const [note, setNote] = useState('')
  const [photoUrl, setPhotoUrl] = useState(null)
  const [gps, setGps] = useState(null)
  const [busy, setBusy] = useState(false)

  // Beim Öffnen: Felder aus dem bestehenden Fang vorbefüllen (oder zurücksetzen)
  useEffect(() => {
    if (!open) return
    setSpecies(initial?.species ?? 'Hecht')
    setLengthCm(initial?.lengthCm != null ? String(initial.lengthCm) : '')
    setWeightKg(initial?.weightKg != null ? String(initial.weightKg) : '')
    setBait(initial?.bait ?? '')
    setSpotName(initial?.spotName ?? '')
    setNote(initial?.note ?? '')
    setPhotoUrl(initial?.photoUrl ?? null)
    if (initial) {
      setGps(initial.lat != null ? { lat: initial.lat, lng: initial.lng } : null)
    } else {
      setGps(null)
      fetchGps()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id])

  function fetchGps() {
    navigator.geolocation?.getCurrentPosition(
      (p) => setGps({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { timeout: 8000, maximumAge: 120000 }
    )
  }

  const legal = checkCatch(species, lengthCm ? Number(lengthCm) : null)

  async function save() {
    setBusy(true)
    const base = {
      species,
      lengthCm: lengthCm ? Number(lengthCm) : null,
      weightKg: weightKg ? Number(weightKg) : null,
      photoUrl,
      bait: bait || null,
      spotName: spotName || null,
      note: note || null,
      lat: gps?.lat ?? null,
      lng: gps?.lng ?? null,
      legalCheck: legal,
    }
    if (initial) {
      // Bearbeiten: Zeitstempel + Wetter-Schnappschuss des Originals behalten
      await onSave(base)
    } else {
      const weather = await getWeather(trip?.lat, trip?.lng) // gecacht, geht auch offline
      const now = new Date()
      await onSave({
        ...base,
        userId: me?.id,
        userName: me?.displayName, // denormalisiert, damit der Feed auch ohne Member-Doc lesbar bleibt
        userAccent: me?.accentColor,
        caughtAt: now.toISOString(),
        weatherSnapshot: weatherSnapshot(weather, now),
        reactions: {},
      })
    }
    setBusy(false)
  }

  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Fang bearbeiten ✏️' : 'Neuer Fang 🎣'}>
      <Field label="Fischart">
        <div className="flex flex-wrap gap-2">
          {[...ARTEN.map((a) => a.name), 'Anderes'].map((s) => (
            <button
              key={s}
              onClick={() => setSpecies(s)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${species === s ? 'btn-fire' : 'btn-ghost'}`}
            >
              {ARTEN.find((a) => a.name === s)?.emoji ?? '🐟'} {s}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Länge (cm)">
          <input className="input-dark" type="number" inputMode="decimal" value={lengthCm} onChange={(e) => setLengthCm(e.target.value)} placeholder="78" />
        </Field>
        <Field label="Gewicht (kg)">
          <input className="input-dark" type="number" inputMode="decimal" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="3.4" />
        </Field>
      </div>
      <Field label="Köder">
        <input className="input-dark" value={bait} onChange={(e) => setBait(e.target.value)} placeholder="Gummifisch, Spinner…" />
      </Field>
      <Field label="Spot (Name)">
        <input className="input-dark" value={spotName} onChange={(e) => setSpotName(e.target.value)} placeholder="Schilfkante" />
      </Field>
      <Field label="Notiz">
        <input className="input-dark" value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. Biss direkt an der Kante" />
      </Field>
      <Field label="Foto">
        <div className="flex items-center gap-3">
          <label className="btn-ghost cursor-pointer px-4 py-2 text-sm">
            📷 {photoUrl ? 'Foto ersetzen' : 'Foto aufnehmen'}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (f) setPhotoUrl(await compressImage(f))
              }}
            />
          </label>
          {photoUrl && <img src={photoUrl} alt="Vorschau" className="h-14 w-14 rounded-lg object-cover" />}
          {photoUrl && (
            <button className="text-xs text-mist-500 hover:text-red-400" onClick={() => setPhotoUrl(null)}>
              entfernen
            </button>
          )}
        </div>
      </Field>

      <div className="card-inset mb-3 p-3 text-sm">
        <p>
          {legal.keepable === true && '✅ Darfst du entnehmen'}
          {legal.keepable === false && '❌ Zurücksetzen!'}
          {legal.keepable === null && '⚠️ Maß eintragen / Regeln prüfen'}
        </p>
        <p className="mt-1 text-xs text-mist-500">{legal.note}</p>
        <p className="mt-1 text-[0.65rem] text-wood-400">{REGEL_QUELLE.hinweis}</p>
      </div>

      <div className="mb-3 flex items-center justify-between text-xs text-mist-500">
        <span>📍 GPS: {gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : 'nicht gesetzt'}</span>
        <button className="btn-ghost px-2.5 py-1" onClick={fetchGps}>GPS neu holen</button>
      </div>
      {!initial && (
        <p className="mb-3 text-xs text-mist-500">Wetter, Luftdruck & Mondphase werden automatisch mitgestempelt.</p>
      )}

      <button className="btn-fire w-full py-3 text-lg" disabled={busy} onClick={save}>
        {busy ? 'Speichere…' : initial ? 'Änderungen speichern' : 'Fang eintragen 🔥'}
      </button>
    </Sheet>
  )
}
