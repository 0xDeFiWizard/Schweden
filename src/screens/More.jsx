import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrip } from '../data/TripContext'
import { Screen, Card, SectionTitle, Sheet, Field, Toggle } from '../components/ui'
import Avatar from '../components/Avatar'
import { ACCENT_COLORS, AVATAR_EMOJIS } from '../lib/format'
import { compressImage } from '../lib/img'

const MODULES = [
  { to: '/weather', icon: '🌤️', label: 'Wetter' },
  { to: '/biteindex', icon: '🎯', label: 'Beißindex' },
  { to: '/fishing', icon: '🎣', label: 'Angel-Modul' },
  { to: '/depthmap', icon: '🌊', label: 'Tiefenkarte' },
  { to: '/team', icon: '🏆', label: 'Team & Ranking' },
  { to: '/planner', icon: '📅', label: 'Tagesplaner' },
  { to: '/packing', icon: '🎒', label: 'Packliste' },
  { to: '/shopping', icon: '🛒', label: 'Einkaufsliste' },
  { to: '/budget', icon: '💰', label: 'Budget' },
  { to: '/tasks', icon: '✅', label: 'Aufgaben' },
  { to: '/boat', icon: '🛥️', label: 'Boot' },
  { to: '/lexicon', icon: '📖', label: 'Lexikon' },
  { to: '/emergency', icon: '🚨', label: 'Notfall & Info' },
]

export default function More() {
  const { trip, me, mode, set, leaveTrip, tripId } = useTrip()
  const [editOpen, setEditOpen] = useState(false)

  const inviteLink = `${location.origin}/?trip=${tripId}`

  return (
    <Screen title="Mehr" subtitle={trip?.name}>
      {me && (
        <Card className="flex items-center gap-4">
          <Avatar member={me} size={56} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl" style={{ color: me.accentColor }}>{me.displayName}</p>
            <p className="text-xs text-mist-500">
              🚗 {me.car ?? '—'} {me.isDriver && '· Fahrer'} {trip?.houseHasSauna && '· 🧖 Sauna verfügbar'}
            </p>
          </div>
          <button className="btn-ghost px-3 py-2 text-sm" onClick={() => setEditOpen(true)}>✏️</button>
        </Card>
      )}

      <SectionTitle>Module</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {MODULES.map((m) => (
          <Link key={m.to} to={m.to}>
            <Card className="flex items-center gap-3 py-3.5">
              <span className="text-2xl">{m.icon}</span>
              <span className="text-sm font-semibold">{m.label}</span>
            </Card>
          </Link>
        ))}
      </div>

      <SectionTitle>Kumpels einladen</SectionTitle>
      <Card>
        <p className="text-sm">
          Trip-Code: <b className="font-display tracking-[0.2em] text-fire-400">{tripId}</b>
        </p>
        <button
          className="btn-ghost mt-2 w-full py-2 text-sm"
          onClick={async () => {
            if (navigator.share) await navigator.share({ title: 'Norrfångst', text: `Komm in unseren Angeltrip! Code: ${tripId}`, url: inviteLink }).catch(() => {})
            else {
              await navigator.clipboard.writeText(inviteLink)
              alert('Invite-Link kopiert!')
            }
          }}
        >
          📤 Invite-Link teilen
        </button>
      </Card>

      <SectionTitle>App</SectionTitle>
      <Card className="space-y-2 text-sm text-paper-300">
        <p>
          {mode === 'firebase'
            ? '☁️ Cloud-Sync aktiv (Firebase) – alle Geräte synchron, offline-fähig.'
            : '📱 Demo-Modus: Daten nur auf diesem Gerät. Für Live-Sync mit allen 6 Jungs Firebase verbinden (siehe README).'}
        </p>
        <p>📲 Als App installieren: Browser-Menü → „Zum Home-Bildschirm hinzufügen". Läuft dann komplett offline.</p>
        <button
          className="btn-ghost mt-1 px-3 py-1.5 text-xs text-red-400"
          onClick={() => { if (confirm('Trip auf diesem Gerät verlassen? (Daten bleiben erhalten)')) leaveTrip() }}
        >
          Trip verlassen
        </button>
      </Card>

      <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} me={me} onSave={(patch) => { set('members', me.id, patch); setEditOpen(false) }} />
    </Screen>
  )
}

function EditProfileSheet({ open, onClose, me, onSave }) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🎣')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [accent, setAccent] = useState(ACCENT_COLORS[0])
  const [car, setCar] = useState('Passat')
  const [isDriver, setIsDriver] = useState(false)
  const [sauna, setSauna] = useState(false)

  // Beim Öffnen mit den aktuellen Profilwerten vorbefüllen (me kann beim
  // ersten Render noch null sein – deshalb nicht nur im useState-Initializer)
  useEffect(() => {
    if (!open) return
    setName(me?.displayName ?? '')
    setAvatar(me?.avatar ?? '🎣')
    setAvatarUrl(me?.avatarUrl ?? null)
    setAccent(me?.accentColor ?? ACCENT_COLORS[0])
    setCar(me?.car ?? 'Passat')
    setIsDriver(me?.isDriver ?? false)
    setSauna(me?.saunaWarrior ?? false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Sheet open={open} onClose={onClose} title="Profil bearbeiten">
      <Field label="Name">
        <input className="input-dark" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Avatar">
        <div className="flex flex-wrap items-center gap-2">
          {AVATAR_EMOJIS.map((e) => (
            <button key={e} onClick={() => { setAvatar(e); setAvatarUrl(null) }} className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${avatar === e && !avatarUrl ? 'bg-fire-500/25 ring-2 ring-fire-500' : 'bg-night-950/60'}`}>
              {e}
            </button>
          ))}
          <label className="btn-ghost cursor-pointer px-3 py-2 text-xs">
            📷
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0]
              if (f) setAvatarUrl(await compressImage(f, 300, 0.7))
            }} />
          </label>
          {avatarUrl && <Avatar member={{ avatarUrl, accentColor: accent }} size={40} />}
        </div>
      </Field>
      <Field label="Farbe">
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map((c) => (
            <button key={c} onClick={() => setAccent(c)} className={`h-9 w-9 rounded-full ${accent === c ? 'ring-2 ring-paper-100 ring-offset-2 ring-offset-night-800' : ''}`} style={{ background: c }} />
          ))}
        </div>
      </Field>
      <Field label="Auto">
        <div className="flex gap-2">
          {['Passat', 'Auto 2'].map((c) => (
            <button key={c} onClick={() => setCar(c)} className={`flex-1 rounded-xl py-2 text-sm ${car === c ? 'btn-fire' : 'btn-ghost'}`}>🚗 {c}</button>
          ))}
        </div>
      </Field>
      <Toggle checked={isDriver} onChange={setIsDriver} label="Ich bin Fahrer" />
      <Toggle checked={sauna} onChange={setSauna} label="🧖 Saunakrieger-Badge (Sauna + See überlebt)" />
      <button
        className="btn-fire mt-3 w-full py-3"
        disabled={!name.trim()}
        onClick={() => onSave({ displayName: name.trim(), avatar, avatarUrl, accentColor: accent, car, isDriver, saunaWarrior: sauna })}
      >
        Speichern
      </button>
    </Sheet>
  )
}
