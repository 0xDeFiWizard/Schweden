import { useEffect, useState } from 'react'
import { useTrip } from '../data/TripContext'
import { Screen, Card, SectionTitle, Sheet, Field, Fab } from '../components/ui'
import Avatar from '../components/Avatar'
import { computeBalances, settleUp, EXPENSE_CATEGORIES } from '../lib/settle'
import { fmtEUR, fmtDate } from '../lib/format'

const CAT_ICON = {
  Unterkunft: '🏡', Sprit: '⛽', Fähre: '⛴️', Boot: '🛥️', Alkohol: '🍺', Essen: '🥩', Angelkarten: '🎫', Sonstiges: '📦',
}

export default function Budget() {
  const { expenses, members, memberById, add, set, del, uid } = useTrip()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editExpense, setEditExpense] = useState(null)

  const total = expenses.reduce((a, e) => a + (Number(e.amount) || 0), 0)
  const perHead = members.length ? total / members.length : 0
  const balances = computeBalances(expenses, members.map((m) => m.id))
  const transfers = settleUp(balances)
  const byCat = {}
  for (const e of expenses) byCat[e.category] = (byCat[e.category] ?? 0) + (Number(e.amount) || 0)
  const sorted = [...expenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <Screen title="Budget" subtitle={`${fmtEUR(total)} gesamt · ~${fmtEUR(perHead)} pro Kopf`} back>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(byCat).map(([cat, sum]) => (
          <Card key={cat} className="flex items-center gap-2 p-3">
            <span className="text-xl">{CAT_ICON[cat] ?? '📦'}</span>
            <div>
              <p className="text-xs text-mist-500">{cat}</p>
              <p className="font-display">{fmtEUR(sum)}</p>
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle>Salden</SectionTitle>
      <Card className="divide-y divide-paper-100/5 p-0">
        {members.map((m) => {
          const b = balances[m.id] ?? 0
          return (
            <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
              <Avatar member={m} size={30} />
              <span className="flex-1 text-sm" style={{ color: m.accentColor }}>
                {m.displayName} {m.id === uid && <span className="text-xs text-mist-500">(du)</span>}
              </span>
              <span className={`font-display ${b >= 0 ? 'text-pine-300' : 'text-red-400'}`}>
                {b >= 0 ? '+' : ''}{fmtEUR(b)}
              </span>
            </div>
          )
        })}
      </Card>

      {transfers.length > 0 && (
        <>
          <SectionTitle>Wer schuldet wem?</SectionTitle>
          <Card className="space-y-2">
            {transfers.map((t, i) => (
              <p key={i} className="text-sm">
                <b style={{ color: memberById[t.from]?.accentColor }}>{memberById[t.from]?.displayName ?? '?'}</b>
                {' → '}
                <b style={{ color: memberById[t.to]?.accentColor }}>{memberById[t.to]?.displayName ?? '?'}</b>
                {': '}
                <span className="font-display text-fire-400">{fmtEUR(t.amount)}</span>
              </p>
            ))}
          </Card>
        </>
      )}

      <SectionTitle>Alle Ausgaben</SectionTitle>
      <Card className="divide-y divide-paper-100/5 p-0">
        {sorted.length === 0 && <p className="p-4 text-sm text-mist-500">Noch keine Ausgaben.</p>}
        {sorted.map((e) => (
          <div key={e.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="text-lg">{CAT_ICON[e.category] ?? '📦'}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{e.title}</p>
              <p className="text-xs text-mist-500">
                {memberById[e.paidBy]?.displayName ?? '?'} hat gezahlt · {fmtDate(e.createdAt)} ·{' '}
                {e.splitAmong?.length ?? members.length} Leute
              </p>
            </div>
            <span className="font-display">{fmtEUR(e.amount)}</span>
            <button onClick={() => { setEditExpense(e); setSheetOpen(true) }} className="text-xs text-mist-500/60 hover:text-paper-100" aria-label="Bearbeiten">✏️</button>
            {e.paidBy === uid && (
              <button onClick={() => del('expenses', e.id)} className="text-xs text-mist-500/60 hover:text-red-400">✕</button>
            )}
          </div>
        ))}
      </Card>

      <Fab onClick={() => { setEditExpense(null); setSheetOpen(true) }} />
      <ExpenseSheet
        open={sheetOpen}
        initial={editExpense}
        onClose={() => setSheetOpen(false)}
        members={members}
        uid={uid}
        onSave={async (data) => {
          if (editExpense) await set('expenses', editExpense.id, data)
          else await add('expenses', { ...data, createdAt: new Date().toISOString() })
          setSheetOpen(false)
          setEditExpense(null)
        }}
      />
    </Screen>
  )
}

// Anlegen UND Bearbeiten (initial = bestehende Ausgabe)
function ExpenseSheet({ open, initial, onClose, onSave, members, uid }) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Essen')
  const [paidBy, setPaidBy] = useState(uid)
  const [splitAmong, setSplitAmong] = useState(null) // null = alle

  useEffect(() => {
    if (!open) return
    setTitle(initial?.title ?? '')
    setAmount(initial?.amount != null ? String(initial.amount) : '')
    setCategory(initial?.category ?? 'Essen')
    setPaidBy(initial?.paidBy ?? uid)
    setSplitAmong(initial?.splitAmong ?? null)
  }, [open, initial?.id, uid])

  const split = splitAmong ?? members.map((m) => m.id)
  const toggleSplit = (id) => {
    const next = split.includes(id) ? split.filter((x) => x !== id) : [...split, id]
    setSplitAmong(next)
  }

  return (
    <Sheet open={open} onClose={onClose} title="Ausgabe hinzufügen">
      <Field label="Titel">
        <input className="input-dark" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Fähre Rostock–Trelleborg" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Betrag (€)">
          <input className="input-dark" type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="120" />
        </Field>
        <Field label="Bezahlt von">
          <select className="input-dark" value={paidBy ?? ''} onChange={(e) => setPaidBy(e.target.value)}>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.displayName}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Kategorie">
        <div className="flex flex-wrap gap-2">
          {EXPENSE_CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`rounded-xl px-3 py-1.5 text-sm ${category === c ? 'btn-fire' : 'btn-ghost'}`}>
              {CAT_ICON[c]} {c}
            </button>
          ))}
        </div>
      </Field>
      <Field label={`Aufteilen auf (${split.length})`}>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => toggleSplit(m.id)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm ${split.includes(m.id) ? 'btn-fire' : 'btn-ghost opacity-60'}`}
            >
              <Avatar member={m} size={20} ring={false} /> {m.displayName}
            </button>
          ))}
        </div>
      </Field>
      <button
        className="btn-fire w-full py-3"
        disabled={!title.trim() || !Number(amount) || !split.length}
        onClick={() => onSave({ title: title.trim(), amount: Number(amount), category, paidBy, splitAmong: split })}
      >
        {initial ? 'Änderungen speichern' : 'Speichern'}
      </button>
    </Sheet>
  )
}
