import { useEffect, useState } from 'react'
import { useTrip } from '../data/TripContext'
import { Screen, Card, SectionTitle, Sheet, Field, Fab, Chip } from '../components/ui'
import Avatar from '../components/Avatar'
import { fmtEUR } from '../lib/format'
import { EVERYONE } from './Packing'

export default function Shopping() {
  const { shopping, members, memberById, set, add, del, uid } = useTrip()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const open = shopping.filter((s) => !s.bought)
  const done = shopping.filter((s) => s.bought)
  const estOpen = open.reduce((a, s) => a + (Number(s.estimatedCost) || 0), 0)
  const categories = [...new Set(shopping.map((s) => s.category))]

  // Kauf abschließen: automatisch als Ausgabe ins Budget (Kategorie je nach Artikel).
  // Ausnahme: „Jeder selbst" → jeder zahlt seins, kein gemeinsamer Budget-Eintrag.
  async function markBought(item) {
    const payerId = item.claimedBy ?? uid
    const cost = Number(item.estimatedCost) || 0
    const patch = { bought: true }
    if (cost > 0 && !item.expenseId && item.claimedBy !== EVERYONE) {
      const category = /bier|schnaps|spirituos|alkohol|wein/i.test(item.name) ? 'Alkohol' : 'Essen'
      const expenseId = await addExpense(item, payerId, cost, category)
      patch.expenseId = expenseId
    }
    await set('shopping', item.id, patch)
  }
  async function addExpense(item, payerId, cost, category) {
    return add('expenses', {
      title: `Einkauf: ${item.name}`,
      category,
      amount: cost,
      paidBy: payerId,
      splitAmong: members.map((m) => m.id),
      createdAt: new Date().toISOString(),
      fromShopping: true,
    })
  }

  return (
    <Screen title="Einkaufsliste" subtitle={`${open.length} offen · geschätzt noch ${fmtEUR(estOpen)}`} back>
      <Card className="mb-3 border-wood-400/30 bg-wood-500/10 text-xs">
        🍺 Denk dran: Supermarkt = nur Folköl (3,5%). Alles Stärkere nur im <b>Systembolaget</b> (So zu!) – oder
        schlau aus DE mitbringen. Gekaufte Artikel mit Preis landen automatisch im Budget.
      </Card>

      {categories.map((cat) => {
        const items = open.filter((s) => s.category === cat)
        if (!items.length) return null
        return (
          <div key={cat}>
            <SectionTitle>{cat}</SectionTitle>
            <Card className="divide-y divide-paper-100/5 p-0">
              {items.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      {s.name} <span className="text-mist-500">· {s.quantity} {s.unit}</span>
                    </p>
                    <p className="text-xs text-mist-500">{s.estimatedCost ? `~ ${fmtEUR(s.estimatedCost)}` : 'Preis offen'}</p>
                  </div>
                  {s.claimedBy === EVERYONE ? (
                    <button onClick={() => set('shopping', s.id, { claimedBy: null })} className="flex items-center gap-1.5" title="Jeder bringt sein eigenes mit">
                      <span className="text-base">🙋</span>
                      <span className="text-xs text-paper-300">Jeder selbst</span>
                    </button>
                  ) : s.claimedBy ? (
                    <button onClick={() => set('shopping', s.id, { claimedBy: null })} className="flex items-center gap-1.5">
                      <Avatar member={memberById[s.claimedBy]} size={24} />
                      <span className="text-xs text-paper-300">{memberById[s.claimedBy]?.displayName}</span>
                    </button>
                  ) : (
                    <button onClick={() => set('shopping', s.id, { claimedBy: uid })} className="btn-ghost px-2.5 py-1.5 text-xs">
                      Ich hol&apos;s
                    </button>
                  )}
                  <button onClick={() => markBought(s)} className="btn-fire px-2.5 py-1.5 text-xs">✓ Gekauft</button>
                  <button onClick={() => { setEditItem(s); setSheetOpen(true) }} className="text-xs text-mist-500/60 hover:text-paper-100" aria-label="Bearbeiten">✏️</button>
                  <button onClick={() => del('shopping', s.id)} className="text-xs text-mist-500/60 hover:text-red-400">✕</button>
                </div>
              ))}
            </Card>
          </div>
        )
      })}

      {done.length > 0 && (
        <>
          <SectionTitle>✓ Erledigt</SectionTitle>
          <Card className="divide-y divide-paper-100/5 p-0 opacity-70">
            {done.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-2">
                <span className="flex-1 text-sm text-mist-500 line-through">
                  {s.name} · {s.quantity} {s.unit}
                </span>
                {s.expenseId && <Chip tone="green">im Budget</Chip>}
                <button onClick={() => set('shopping', s.id, { bought: false })} className="text-xs text-mist-500">↩︎</button>
              </div>
            ))}
          </Card>
        </>
      )}

      <Fab onClick={() => { setEditItem(null); setSheetOpen(true) }} />
      <ShoppingSheet
        open={sheetOpen}
        initial={editItem}
        members={members}
        onClose={() => setSheetOpen(false)}
        onSave={async (data) => {
          if (editItem) await set('shopping', editItem.id, data)
          else await add('shopping', { ...data, bought: false })
          setSheetOpen(false)
          setEditItem(null)
        }}
      />
    </Screen>
  )
}

// Anlegen UND Bearbeiten (initial = bestehender Artikel)
function ShoppingSheet({ open, initial, members, onClose, onSave }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState('Stück')
  const [category, setCategory] = useState('Grillgut')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [claimedBy, setClaimedBy] = useState('')

  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? '')
    setQuantity(initial?.quantity != null ? String(initial.quantity) : '1')
    setUnit(initial?.unit ?? 'Stück')
    setCategory(initial?.category ?? 'Grillgut')
    setEstimatedCost(initial?.estimatedCost ? String(initial.estimatedCost) : '')
    setClaimedBy(initial?.claimedBy ?? '')
  }, [open, initial?.id])

  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Artikel bearbeiten ✏️' : 'Artikel hinzufügen'}>
      <Field label="Artikel">
        <input className="input-dark" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Marshmallows" />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Menge">
          <input className="input-dark" type="number" inputMode="decimal" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </Field>
        <Field label="Einheit">
          <input className="input-dark" value={unit} onChange={(e) => setUnit(e.target.value)} />
        </Field>
        <Field label="~ Kosten €">
          <input className="input-dark" type="number" inputMode="decimal" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} />
        </Field>
      </div>
      <Field label="Kategorie">
        <div className="flex flex-wrap gap-2">
          {['Getränke', 'Grillgut', 'Frühstück', 'Snacks', 'Haushalt'].map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`rounded-xl px-3 py-1.5 text-sm ${category === c ? 'btn-fire' : 'btn-ghost'}`}>
              {c}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Wer übernimmt?">
        <select className="input-dark" value={claimedBy} onChange={(e) => setClaimedBy(e.target.value)}>
          <option value="">noch niemand</option>
          <option value={EVERYONE}>🙋 Jeder selbst (jeder bringt sein eigenes mit)</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.displayName}</option>
          ))}
        </select>
      </Field>
      <button
        className="btn-fire w-full py-3"
        disabled={!name.trim()}
        onClick={() =>
          onSave({
            name: name.trim(),
            quantity: Number(quantity) || 1,
            unit,
            category,
            estimatedCost: Number(estimatedCost) || 0,
            claimedBy: claimedBy || null,
          })
        }
      >
        {initial ? 'Änderungen speichern' : 'Hinzufügen'}
      </button>
    </Sheet>
  )
}
