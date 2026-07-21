import { useEffect, useState } from 'react'
import { useTrip } from '../data/TripContext'
import { Screen, Card, Sheet, Field, Fab, SectionTitle } from '../components/ui'
import Avatar from '../components/Avatar'
import { fmtDate } from '../lib/format'

export default function Tasks() {
  const { tasks, members, memberById, set, add, del, uid } = useTrip()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)

  const open = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))
  const done = tasks.filter((t) => t.status === 'done')

  const TaskRow = ({ t }) => (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <button
        onClick={() => set('tasks', t.id, { status: t.status === 'done' ? 'open' : 'done' })}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm transition ${t.status === 'done' ? 'border-pine-400 bg-pine-400 text-night-950' : 'border-paper-100/25'}`}
      >
        {t.status === 'done' && '✓'}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${t.status === 'done' ? 'text-mist-500 line-through' : ''}`}>{t.title}</p>
        <p className="text-xs text-mist-500">
          {t.category} {t.dueDate && `· bis ${fmtDate(t.dueDate)}`}
          {t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date() && (
            <span className="text-red-400"> · überfällig!</span>
          )}
        </p>
      </div>
      <select
        className="max-w-28 rounded-lg border border-paper-100/10 bg-night-950/60 px-1.5 py-1 text-xs text-paper-300"
        value={t.assignedTo ?? ''}
        onChange={(e) => set('tasks', t.id, { assignedTo: e.target.value || null })}
      >
        <option value="">niemand</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>{m.displayName}</option>
        ))}
      </select>
      {t.assignedTo && <Avatar member={memberById[t.assignedTo]} size={24} />}
      <button onClick={() => { setEditTask(t); setSheetOpen(true) }} className="text-xs text-mist-500/60 hover:text-paper-100" aria-label="Bearbeiten">✏️</button>
      <button onClick={() => del('tasks', t.id)} className="text-xs text-mist-500/60 hover:text-red-400">✕</button>
    </div>
  )

  return (
    <Screen title="Aufgaben" subtitle={`${open.length} offen`} back>
      <Card className="divide-y divide-paper-100/5 p-0">
        {open.length === 0 && <p className="p-4 text-sm text-pine-300">Alles erledigt – ab an den See! 🎣</p>}
        {open.map((t) => <TaskRow key={t.id} t={t} />)}
      </Card>
      {done.length > 0 && (
        <>
          <SectionTitle>✓ Erledigt</SectionTitle>
          <Card className="divide-y divide-paper-100/5 p-0 opacity-70">
            {done.map((t) => <TaskRow key={t.id} t={t} />)}
          </Card>
        </>
      )}
      <Fab onClick={() => { setEditTask(null); setSheetOpen(true) }} />
      <TaskSheet
        open={sheetOpen}
        initial={editTask}
        members={members}
        uid={uid}
        onClose={() => setSheetOpen(false)}
        onSave={async (data) => {
          if (editTask) await set('tasks', editTask.id, data)
          else await add('tasks', data)
          setSheetOpen(false)
          setEditTask(null)
        }}
      />
    </Screen>
  )
}

// Anlegen UND Bearbeiten (initial = bestehende Aufgabe)
function TaskSheet({ open, initial, members, uid, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Orga')
  const [dueDate, setDueDate] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [status, setStatus] = useState('open')

  useEffect(() => {
    if (!open) return
    setTitle(initial?.title ?? '')
    setCategory(initial?.category ?? 'Orga')
    setDueDate(initial?.dueDate ?? '')
    setAssignedTo(initial?.assignedTo ?? uid ?? '')
    setStatus(initial?.status ?? 'open')
  }, [open, initial?.id, uid])

  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Aufgabe bearbeiten ✏️' : 'Aufgabe hinzufügen'}>
      <Field label="Was ist zu tun?">
        <input className="input-dark" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Gaskartuschen besorgen" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Kategorie">
          <select className="input-dark" value={category} onChange={(e) => setCategory(e.target.value)}>
            {['Orga', 'Anreise', 'Angeln', 'Boot', 'Unterkunft', 'Einkauf', 'Party'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Fällig bis">
          <input className="input-dark" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Zuständig">
          <select className="input-dark" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            <option value="">niemand</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.displayName}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select className="input-dark" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="open">offen</option>
            <option value="done">erledigt</option>
          </select>
        </Field>
      </div>
      <button
        className="btn-fire w-full py-3"
        disabled={!title.trim()}
        onClick={() => onSave({ title: title.trim(), category, dueDate: dueDate || null, assignedTo: assignedTo || null, status })}
      >
        {initial ? 'Änderungen speichern' : 'Hinzufügen'}
      </button>
    </Sheet>
  )
}
