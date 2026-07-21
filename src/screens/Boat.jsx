import { useEffect, useState } from 'react'
import { useTrip } from '../data/TripContext'
import { Screen, Card, SectionTitle, Toggle, ProgressBar, Sheet, Field } from '../components/ui'
import Avatar from '../components/Avatar'

const DEFAULT_CHECKLIST = [
  'Schwimmwesten für alle an Bord',
  'Tank / Benzinkanister geprüft',
  'Paddel als Backup dabei',
  'Lenzstopfen drin & Boot dicht',
  'Leinen + Anker an Bord',
  'Handys wasserdicht verpackt',
  'Wetter & Wind gecheckt',
]

const SLOTS = ['Vormittag', 'Nachmittag', 'Abend/Nacht']

export default function Boat() {
  const { trip, boat, members, memberById, set, updateTrip } = useTrip()
  const [checkSheet, setCheckSheet] = useState(null) // { index } | { index: -1 } für neu
  const rented = trip?.boatRented ?? false
  const checklist = boat?.checklist ?? DEFAULT_CHECKLIST.map((item) => ({ item, checked: false }))
  const fuel = boat?.fuelStatus ?? 100
  const rotation = boat?.rotation ?? []

  const saveBoat = (patch) =>
    set('meta', 'boat', { checklist, fuelStatus: fuel, rotation, lifeJackets: boat?.lifeJackets ?? 6, ...patch })

  return (
    <Screen title="Boot" subtitle={rented ? 'Motorboot gemietet 🛥️' : 'Noch kein Boot gemietet'} back>
      <Card>
        <Toggle
          checked={rented}
          onChange={(v) => updateTrip({ boatRented: v })}
          label="Motorboot ist gemietet"
        />
        <p className="mt-1 text-xs text-mist-500">
          👍 Kleine Motorboote fährt man in Schweden i. d. R. ohne Führerschein. Trotzdem: Westen an, nüchtern fahren.
        </p>
      </Card>

      {rented && (
        <>
          <SectionTitle>⛽ Benzinstatus</SectionTitle>
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <ProgressBar value={fuel} max={100} color={fuel > 30 ? 'var(--color-pine-400)' : 'var(--color-fire-500)'} />
              </div>
              <span className="font-display text-xl">{fuel}%</span>
            </div>
            <div className="mt-3 flex gap-2">
              {[100, 75, 50, 25, 10].map((v) => (
                <button key={v} onClick={() => saveBoat({ fuelStatus: v })} className={`flex-1 rounded-lg py-1.5 text-xs ${fuel === v ? 'btn-fire' : 'btn-ghost'}`}>
                  {v}%
                </button>
              ))}
            </div>
            {fuel <= 25 && <p className="mt-2 text-xs text-fire-400">⚠️ Nachtanken! Circle K in Ljungby (siehe Karte).</p>}
          </Card>

          <SectionTitle right={<button onClick={() => setCheckSheet({ index: -1 })} className="btn-ghost px-2.5 py-1 text-xs">＋ Punkt</button>}>
            ✅ Sicherheitscheck
          </SectionTitle>
          <Card className="divide-y divide-paper-100/5 p-0">
            {checklist.map((c, i) => (
              <div key={i} className="flex w-full items-center gap-3 px-4 py-2.5">
                <button
                  className="flex flex-1 items-center gap-3 text-left"
                  onClick={() =>
                    saveBoat({ checklist: checklist.map((x, j) => (j === i ? { ...x, checked: !x.checked } : x)) })
                  }
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md border text-sm ${c.checked ? 'border-pine-400 bg-pine-400 text-night-950' : 'border-paper-100/25'}`}>
                    {c.checked && '✓'}
                  </span>
                  <span className={`text-sm ${c.checked ? 'text-mist-500 line-through' : ''}`}>{c.item}</span>
                </button>
                <button onClick={() => setCheckSheet({ index: i })} className="text-xs text-mist-500/60 hover:text-paper-100" aria-label="Bearbeiten">✏️</button>
                <button
                  onClick={() => saveBoat({ checklist: checklist.filter((_, j) => j !== i) })}
                  className="text-xs text-mist-500/60 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </Card>

          <SectionTitle>🧭 Wer fährt wann?</SectionTitle>
          <Card className="space-y-3">
            {SLOTS.map((slot) => {
              const entry = rotation.find((r) => r.slot === slot)
              return (
                <div key={slot} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-paper-300">{slot}</span>
                  <select
                    className="input-dark flex-1 py-2 text-sm"
                    value={entry?.userId ?? ''}
                    onChange={(e) =>
                      saveBoat({
                        rotation: [...rotation.filter((r) => r.slot !== slot), ...(e.target.value ? [{ slot, userId: e.target.value }] : [])],
                      })
                    }
                  >
                    <option value="">– offen –</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.displayName}</option>
                    ))}
                  </select>
                  {entry?.userId && <Avatar member={memberById[entry.userId]} size={28} />}
                </div>
              )
            })}
          </Card>
        </>
      )}

      <CheckItemSheet
        state={checkSheet}
        checklist={checklist}
        onClose={() => setCheckSheet(null)}
        onSave={(text) => {
          if (checkSheet.index === -1) {
            saveBoat({ checklist: [...checklist, { item: text, checked: false }] })
          } else {
            saveBoat({ checklist: checklist.map((x, j) => (j === checkSheet.index ? { ...x, item: text } : x)) })
          }
          setCheckSheet(null)
        }}
      />
    </Screen>
  )
}

// Checklisten-Punkt anlegen/umbenennen (state.index === -1 → neu)
function CheckItemSheet({ state, checklist, onClose, onSave }) {
  const [text, setText] = useState('')
  const editing = state && state.index >= 0 ? checklist[state.index] : null

  useEffect(() => {
    if (!state) return
    setText(editing?.item ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.index, Boolean(state)])

  return (
    <Sheet open={Boolean(state)} onClose={onClose} title={editing ? 'Punkt bearbeiten ✏️' : 'Checklisten-Punkt'}>
      <Field label="Was muss gecheckt werden?">
        <input autoFocus className="input-dark" value={text} onChange={(e) => setText(e.target.value)} placeholder="z. B. Ersatzkanister dabei" />
      </Field>
      <button className="btn-fire w-full py-3" disabled={!text.trim()} onClick={() => onSave(text.trim())}>
        {editing ? 'Änderungen speichern' : 'Hinzufügen'}
      </button>
    </Sheet>
  )
}
