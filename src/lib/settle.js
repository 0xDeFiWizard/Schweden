// Budget: Salden + „Wer schuldet wem"-Ausgleich (Splitwise-Prinzip)

export function computeBalances(expenses, memberIds) {
  const bal = Object.fromEntries(memberIds.map((id) => [id, 0]))
  for (const e of expenses) {
    const amount = Number(e.amount) || 0
    if (!amount || !e.paidBy) continue
    const split = e.splitAmong?.length ? e.splitAmong : memberIds
    if (!split.length) continue
    const share = amount / split.length
    bal[e.paidBy] = (bal[e.paidBy] ?? 0) + amount
    for (const id of split) bal[id] = (bal[id] ?? 0) - share
  }
  return bal
}

// Greedy-Ausgleich: minimale Anzahl Überweisungen (praktisch ausreichend)
export function settleUp(balances) {
  const debtors = []
  const creditors = []
  for (const [id, v] of Object.entries(balances)) {
    if (v < -0.01) debtors.push({ id, amount: -v })
    else if (v > 0.01) creditors.push({ id, amount: v })
  }
  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)
  const transfers = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount)
    transfers.push({ from: debtors[i].id, to: creditors[j].id, amount: Math.round(pay * 100) / 100 })
    debtors[i].amount -= pay
    creditors[j].amount -= pay
    if (debtors[i].amount < 0.01) i++
    if (creditors[j].amount < 0.01) j++
  }
  return transfers
}

export const EXPENSE_CATEGORIES = ['Unterkunft', 'Sprit', 'Fähre', 'Boot', 'Alkohol', 'Essen', 'Angelkarten', 'Sonstiges']
