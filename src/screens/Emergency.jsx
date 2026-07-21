import { useState } from 'react'
import { useTrip } from '../data/TripContext'
import { Screen, Card, SectionTitle, Field } from '../components/ui'
import Avatar from '../components/Avatar'

// Dieser Screen muss IMMER funktionieren – nur lokale/gecachte Daten, kein Netz nötig.
export default function Emergency() {
  const { trip, members, me, set, updateTrip } = useTrip()
  const [editAddress, setEditAddress] = useState(false)
  const [address, setAddress] = useState(trip?.houseAddress ?? '')
  const [medical, setMedical] = useState(me?.medicalInfo ?? '')
  const [editMedical, setEditMedical] = useState(false)

  return (
    <Screen title="Notfall & Info" subtitle="Offline immer verfügbar" back>
      <Card className="border-red-500/40 bg-red-500/10">
        <p className="font-display text-2xl">🚨 Notruf: 112</p>
        <p className="mt-1 text-sm text-paper-300">
          Gilt in ganz Schweden (SOS Alarm). Ärztliche Beratung (nicht akut): <b>1177</b>.
        </p>
      </Card>

      <SectionTitle>📍 Wo seid ihr? (für den 112-Anruf)</SectionTitle>
      <Card>
        {editAddress ? (
          <>
            <Field label="Hausadresse">
              <textarea className="input-dark" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
            <button className="btn-fire px-4 py-2 text-sm" onClick={() => { updateTrip({ houseAddress: address }); setEditAddress(false) }}>
              Speichern
            </button>
          </>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm">{trip?.houseAddress || 'Noch keine Adresse hinterlegt!'}</p>
            <button className="btn-ghost px-2.5 py-1 text-xs" onClick={() => { setAddress(trip?.houseAddress ?? ''); setEditAddress(true) }}>
              ✏️
            </button>
          </div>
        )}
        <p className="mt-2 text-xs text-mist-500">🏥 {trip?.hospital || 'Nächstes Krankenhaus eintragen'}</p>
      </Card>

      <SectionTitle>🚗 Fahrzeuge</SectionTitle>
      <Card className="space-y-1 text-sm">
        {['Passat', 'Auto 2'].map((car) => {
          const crew = members.filter((m) => m.car === car)
          return (
            <p key={car}>
              <b className="text-wood-400">{car}:</b>{' '}
              {crew.length ? crew.map((m) => m.displayName + (m.isDriver ? ' 🔑' : '')).join(', ') : '—'}
            </p>
          )
        })}
        <p className="mt-2 text-xs text-mist-500">🔑 = Fahrer · Schweden: 0,2‰-Grenze! · 🫎 Dämmerung = Elch-Zeit, runter vom Gas.</p>
      </Card>

      <SectionTitle>🩺 Medizinisches (freiwillig)</SectionTitle>
      <Card className="space-y-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 text-sm">
            <Avatar member={m} size={28} />
            <span className="w-24 shrink-0 truncate" style={{ color: m.accentColor }}>{m.displayName}</span>
            <span className="flex-1 text-paper-300">{m.medicalInfo || <span className="text-mist-500">keine Angaben</span>}</span>
          </div>
        ))}
        <div className="border-t border-paper-100/10 pt-3">
          {editMedical ? (
            <>
              <Field label="Deine Angaben (Allergien, Blutgruppe, Medikamente)">
                <input className="input-dark" value={medical} onChange={(e) => setMedical(e.target.value)} placeholder="z. B. Penicillin-Allergie, A+" />
              </Field>
              <button className="btn-fire px-4 py-2 text-sm" onClick={() => { set('members', me.id, { medicalInfo: medical }); setEditMedical(false) }}>
                Speichern
              </button>
            </>
          ) : (
            <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => { setMedical(me?.medicalInfo ?? ''); setEditMedical(true) }}>
              ✏️ Meine Angaben bearbeiten
            </button>
          )}
        </div>
      </Card>

      <SectionTitle>Gut zu wissen</SectionTitle>
      <Card className="space-y-2 text-sm text-paper-300">
        <p>⚡ Giftnotruf Schweden: 010-456 6700 (Giftinformationscentralen)</p>
        <p>🔥 Bei Trockenheit: Feuerverbot (eldningsförbud) checken, bevor das Lagerfeuer brennt.</p>
        <p>💧 Nach dem Sauna-Sprung: nie alleine nachts schwimmen.</p>
        <p>📵 Kein Empfang? Dieser Screen + Karte (gecachte Tiles) funktionieren trotzdem.</p>
      </Card>
    </Screen>
  )
}
