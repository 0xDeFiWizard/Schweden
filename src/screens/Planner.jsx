import { useEffect, useState } from 'react'
import { useTrip } from '../data/TripContext'
import { Screen, Card, Sheet, Field } from '../components/ui'
import { fmtDateLong } from '../lib/format'

const ICONS = ['🎣', '🍳', '🥩', '🔥', '🧖', '🍻', '🛥️', '🛒', '🚗', '⛴️', '🏡', '🫎', '🃏', '😴']

export default function Planner() {
  const { schedule, set, add } = useTrip()
  const [editDay, setEditDay] = useState(null) // day-Doc
  const [editIndex, setEditIndex] = useState(null) // null = neuer Eintrag, sonst Index im Tag
  const days = [...schedule].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
  const today = new Date().toISOString().slice(0, 10)

  return (
    <Screen title="Tagesplaner" subtitle="Der grobe Fahrplan – nichts ist in Stein gemeißelt" back>
      <div className="space-y-3">
        {days.map((d) => (
          <Card key={d.id} className={d.date === today ? 'ring-1 ring-fire-500/50' : ''}>
            <div className="flex items-center justify-between">
              <p className="font-display text-lg text-wood-400">
                {fmtDateLong(d.date)} {d.date === today && <span className="text-xs text-fire-400">· HEUTE</span>}
              </p>
              <button onClick={() => { setEditDay(d); setEditIndex(null) }} className="btn-ghost px-2.5 py-1 text-xs">＋ Eintrag</button>
            </div>
            <div className="mt-2 space-y-1.5">
              {(d.entries ?? []).map((e, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-12 shrink-0 font-mono text-xs text-mist-500">{e.time}</span>
                  <span className="text-lg">{e.icon}</span>
                  <span className="flex-1">{e.title}</span>
                  <button
                    onClick={() => { setEditDay(d); setEditIndex(i) }}
                    className="text-xs text-mist-500/50 hover:text-paper-100"
                    aria-label="Bearbeiten"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => set('schedule', d.id, { entries: d.entries.filter((_, j) => j !== i) })}
                    className="text-xs text-mist-500/50 hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {(d.entries ?? []).length === 0 && <p className="text-xs text-mist-500">Noch leer – Vorschlag: angeln. 🎣</p>}
            </div>
          </Card>
        ))}
        {days.length === 0 && (
          <button
            className="btn-ghost w-full py-3 text-sm"
            onClick={() => add('schedule', { date: today, entries: [] })}
          >
            ＋ Ersten Tag anlegen
          </button>
        )}
      </div>

      <EntrySheet
        day={editDay}
        editIndex={editIndex}
        onClose={() => { setEditDay(null); setEditIndex(null) }}
        onSave={async (entry) => {
          const entries = [...(editDay.entries ?? [])]
          if (editIndex != null) entries[editIndex] = entry
          else entries.push(entry)
          entries.sort((a, b) => a.time.localeCompare(b.time))
          await set('schedule', editDay.id, { entries })
          setEditDay(null)
          setEditIndex(null)
        }}
      />
    </Screen>
  )
}

// Anlegen UND Bearbeiten (editIndex = Index des bestehenden Eintrags)
function EntrySheet({ day, editIndex, onClose, onSave }) {
  const [time, setTime] = useState('12:00')
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('🎣')
  const editing = day && editIndex != null ? day.entries?.[editIndex] : null

  useEffect(() => {
    if (!day) return
    setTime(editing?.time ?? '12:00')
    setTitle(editing?.title ?? '')
    setIcon(editing?.icon ?? '🎣')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day?.id, editIndex])

  return (
    <Sheet
      open={Boolean(day)}
      onClose={onClose}
      title={`${editing ? 'Eintrag bearbeiten ✏️' : 'Eintrag'} · ${day ? fmtDateLong(day.date) : ''}`}
    >
      <div className="grid grid-cols-3 gap-3">
        <Field label="Uhrzeit">
          <input className="input-dark" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
        <div className="col-span-2">
          <Field label="Was?">
            <input className="input-dark" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Zander-Nachtsession" />
          </Field>
        </div>
      </div>
      <Field label="Icon">
        <div className="flex flex-wrap gap-1.5">
          {ICONS.map((i) => (
            <button key={i} onClick={() => setIcon(i)} className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${icon === i ? 'bg-fire-500/25 ring-2 ring-fire-500' : 'bg-night-950/60'}`}>
              {i}
            </button>
          ))}
        </div>
      </Field>
      <button
        className="btn-fire w-full py-3"
        disabled={!title.trim()}
        onClick={() => onSave({ time, title: title.trim(), icon })}
      >
        {editing ? 'Änderungen speichern' : 'Hinzufügen'}
      </button>
    </Sheet>
  )
}
