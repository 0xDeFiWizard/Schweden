import { useEffect, useMemo, useState } from 'react'
import { useTrip } from '../data/TripContext'
import { Screen, Card, SectionTitle, Sheet, Field, Fab, ProgressBar } from '../components/ui'
import Avatar from '../components/Avatar'

const CATEGORIES = ['Angeln', 'Grillen', 'Party', 'Kleidung']
const CAT_ICON = { Angeln: '🎣', Grillen: '🍖', Party: '🍻', Kleidung: '🧥' }

export default function Packing() {
  const { packing, members, memberById, set, add, del, uid } = useTrip()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const packed = packing.filter((p) => p.packed).length
  const unassigned = packing.filter((p) => !p.assignedTo && !p.packed)
  const duplicates = useMemo(() => {
    const seen = {}
    const dupes = new Set()
    for (const p of packing) {
      const key = p.name.trim().toLowerCase()
      if (seen[key]) dupes.add(p.name)
      seen[key] = true
    }
    return [...dupes]
  }, [packing])

  return (
    <Screen title="Packliste" subtitle={`${packed}/${packing.length} gepackt`} back>
      <ProgressBar value={packed} max={packing.length || 1} />

      {(unassigned.length > 0 || duplicates.length > 0) && (
        <Card className="mt-3 border-fire-500/40 bg-fire-500/10 text-sm">
          {unassigned.length > 0 && (
            <p>⚠️ <b>{unassigned.length} Items ohne Verantwortlichen</b> – so vergisst garantiert jemand den Kescher.</p>
          )}
          {duplicates.length > 0 && <p className="mt-1">👯 Doppelt auf der Liste: {duplicates.join(', ')} – wer bringt&apos;s wirklich mit?</p>}
        </Card>
      )}

      {CATEGORIES.map((cat) => {
        const items = packing.filter((p) => p.category === cat)
        if (!items.length) return null
        return (
          <div key={cat}>
            <SectionTitle>
              {CAT_ICON[cat]} {cat}
            </SectionTitle>
            <Card className="divide-y divide-paper-100/5 p-0">
              {items.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                  <button
                    onClick={() => set('packing', p.id, { packed: !p.packed })}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm transition ${p.packed ? 'border-pine-400 bg-pine-400 text-night-950' : 'border-paper-100/25'}`}
                  >
                    {p.packed && '✓'}
                  </button>
                  <span className={`flex-1 text-sm ${p.packed ? 'text-mist-500 line-through' : ''}`}>{p.name}</span>
                  <select
                    className="max-w-28 rounded-lg border border-paper-100/10 bg-night-950/60 px-1.5 py-1 text-xs text-paper-300"
                    value={p.assignedTo ?? ''}
                    onChange={(e) => set('packing', p.id, { assignedTo: e.target.value || null })}
                  >
                    <option value="">niemand ⚠️</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.displayName}</option>
                    ))}
                  </select>
                  {p.assignedTo && <Avatar member={memberById[p.assignedTo]} size={24} />}
                  <button onClick={() => { setEditItem(p); setSheetOpen(true) }} className="text-xs text-mist-500/60 hover:text-paper-100" aria-label="Bearbeiten">✏️</button>
                  <button onClick={() => del('packing', p.id)} className="text-xs text-mist-500/60 hover:text-red-400">✕</button>
                </div>
              ))}
            </Card>
          </div>
        )
      })}

      <Fab onClick={() => { setEditItem(null); setSheetOpen(true) }} />
      <ItemSheet
        open={sheetOpen}
        initial={editItem}
        members={members}
        onClose={() => setSheetOpen(false)}
        onSave={async (data) => {
          if (editItem) await set('packing', editItem.id, data)
          else await add('packing', { ...data, packed: false })
          setSheetOpen(false)
          setEditItem(null)
        }}
      />
    </Screen>
  )
}

// Anlegen UND Bearbeiten (initial = bestehendes Item)
function ItemSheet({ open, initial, members, onClose, onSave }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Angeln')
  const [assignedTo, setAssignedTo] = useState('')

  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? '')
    setCategory(initial?.category ?? 'Angeln')
    setAssignedTo(initial?.assignedTo ?? '')
  }, [open, initial?.id])

  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Item bearbeiten ✏️' : 'Item hinzufügen'}>
      <Field label="Was?">
        <input className="input-dark" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Ersatz-Kescher" />
      </Field>
      <Field label="Kategorie">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`rounded-xl px-3 py-2 text-sm ${category === c ? 'btn-fire' : 'btn-ghost'}`}>
              {CAT_ICON[c]} {c}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Bringt mit">
        <select className="input-dark" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
          <option value="">niemand ⚠️</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.displayName}</option>
          ))}
        </select>
      </Field>
      <button
        className="btn-fire w-full py-3"
        disabled={!name.trim()}
        onClick={() => onSave({ name: name.trim(), category, assignedTo: assignedTo || null })}
      >
        {initial ? 'Änderungen speichern' : 'Hinzufügen'}
      </button>
    </Sheet>
  )
}
