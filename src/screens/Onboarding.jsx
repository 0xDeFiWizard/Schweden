import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTrip } from '../data/TripContext'
import { ACCENT_COLORS, AVATAR_EMOJIS } from '../lib/format'
import { compressImage } from '../lib/img'
import { Field, Toggle } from '../components/ui'
import Avatar from '../components/Avatar'
import { DEFAULT_TRIP_CODE } from '../data/seed'

export default function Onboarding() {
  const { joinTrip, createProfile } = useTrip()
  const [step, setStep] = useState(0)
  const [code, setCode] = useState('')
  const [joined, setJoined] = useState(null) // { tripId, trip, members }
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  // Invite-Link: ?trip=RYSSBY26 direkt beitreten
  useEffect(() => {
    const p = new URLSearchParams(location.search).get('trip')
    if (p) {
      setCode(p.toUpperCase())
      handleJoin(p)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleJoin(c = code) {
    setBusy(true)
    setError(null)
    try {
      const res = await joinTrip(c)
      setJoined(res)
      setStep(1)
    } catch (e) {
      setError(e.message || 'Beitritt fehlgeschlagen')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 pb-10"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 2.5rem)' }}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="mb-2 text-6xl"
        >
          🎣
        </motion.div>
        <h1 className="font-display text-5xl uppercase tracking-wider text-paper-100">Norrfångst</h1>
        <p className="mt-1 text-sm text-mist-500">Der Reisebegleiter für euren Angelurlaub in Småland</p>
      </motion.div>

      <>
        {step === 0 && (
          <motion.div key="code" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="card p-5">
              <Field label="Trip-Code">
                <input
                  className="input-dark text-center font-display text-2xl uppercase tracking-[0.3em]"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder={DEFAULT_TRIP_CODE}
                  maxLength={12}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
              </Field>
              {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
              <button className="btn-fire w-full py-3 text-lg" disabled={busy || !code.trim()} onClick={() => handleJoin()}>
                {busy ? 'Lade…' : 'Trip beitreten →'}
              </button>
              <p className="mt-3 text-center text-xs text-mist-500">
                Kein Passwort, kein Account. Code eingeben, Profil anlegen, fertig.
              </p>
            </div>
          </motion.div>
        )}
        {step === 1 && joined && (
          <ProfileStep key="profile" joined={joined} createProfile={createProfile} />
        )}
      </>
    </div>
  )
}

function ProfileStep({ joined, createProfile }) {
  const { members: liveMembers } = useTripMembers(joined.tripId)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🎣')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [accent, setAccent] = useState(ACCENT_COLORS[0])
  const [car, setCar] = useState('Passat')
  const [isDriver, setIsDriver] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(adoptId = null) {
    if (!name.trim() && !adoptId) return
    setBusy(true)
    const adopted = adoptId ? liveMembers.find((m) => m.id === adoptId) : null
    await createProfile(
      joined.tripId,
      adopted ?? { displayName: name.trim(), avatar, avatarUrl, accentColor: accent, car, isDriver },
      adoptId
    )
  }

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <div className="card p-5">
        <p className="mb-3 text-sm text-pine-300">
          ✓ <b>{joined.trip?.name ?? joined.tripId}</b> gefunden
        </p>
        <Field label="Dein Name">
          <input className="input-dark" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Timo" />
        </Field>
        <Field label="Avatar">
          <div className="flex flex-wrap items-center gap-2">
            {AVATAR_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => { setAvatar(e); setAvatarUrl(null) }}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition ${avatar === e && !avatarUrl ? 'bg-fire-500/25 ring-2 ring-fire-500' : 'bg-night-950/60'}`}
              >
                {e}
              </button>
            ))}
            <label className="btn-ghost cursor-pointer px-3 py-2 text-xs">
              📷 Foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (f) setAvatarUrl(await compressImage(f, 300, 0.7))
                }}
              />
            </label>
            {avatarUrl && <Avatar member={{ avatarUrl, accentColor: accent }} size={40} />}
          </div>
        </Field>
        <Field label="Deine Farbe">
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                className={`h-9 w-9 rounded-full transition ${accent === c ? 'ring-2 ring-paper-100 ring-offset-2 ring-offset-night-800' : ''}`}
                style={{ background: c }}
                aria-label={c}
              />
            ))}
          </div>
        </Field>
        <Field label="Auto">
          <div className="flex gap-2">
            {['Passat', 'Auto 2'].map((c) => (
              <button
                key={c}
                onClick={() => setCar(c)}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold ${car === c ? 'btn-fire' : 'btn-ghost'}`}
              >
                🚗 {c}
              </button>
            ))}
          </div>
        </Field>
        <Toggle checked={isDriver} onChange={setIsDriver} label="Ich bin Fahrer (0,2‰-Grenze in Schweden!)" />
        <button className="btn-fire mt-4 w-full py-3 text-lg" disabled={busy || !name.trim()} onClick={() => submit()}>
          {busy ? 'Speichere…' : 'Los geht’s! 🔥'}
        </button>
        {liveMembers.length > 0 && (
          <div className="mt-5 border-t border-paper-100/10 pt-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-mist-500">Oder bestehendes Profil übernehmen (Handy gewechselt?)</p>
            <div className="flex flex-wrap gap-2">
              {liveMembers.map((m) => (
                <button key={m.id} onClick={() => submit(m.id)} className="btn-ghost flex items-center gap-2 px-3 py-1.5 text-sm">
                  <Avatar member={m} size={24} /> {m.displayName}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Mini-Hook: Mitglieder eines Trips schon vor dem Session-Setzen anzeigen
import { subscribeColl } from '../data/backend'
function useTripMembers(tripId) {
  const [members, setMembers] = useState([])
  useEffect(() => subscribeColl(tripId, 'members', setMembers), [tripId])
  return { members }
}
