// Lokaler Fallback-Store (kein Firebase konfiguriert): localStorage + Events.
// Gleiche Semantik wie der Firestore-Adapter: Collections aus Docs mit ids,
// last-write-wins, Benachrichtigung aller Subscriber bei jeder Änderung.

const TRIP_KEY = (id) => `norrfangst:trip:${id}`
const UID_KEY = 'norrfangst:local-uid'

const listeners = new Map() // `${tripId}|${coll}` -> Set<cb>,  `${tripId}|__trip__` für das Trip-Doc

export function localUid() {
  let uid = localStorage.getItem(UID_KEY)
  if (!uid) {
    uid = 'local-' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem(UID_KEY, uid)
  }
  return uid
}

function load(tripId) {
  try {
    return JSON.parse(localStorage.getItem(TRIP_KEY(tripId)) || 'null')
  } catch {
    return null
  }
}

function save(tripId, data) {
  localStorage.setItem(TRIP_KEY(tripId), JSON.stringify(data))
}

function notify(tripId, coll) {
  const data = load(tripId)
  if (coll === '__trip__') {
    listeners.get(`${tripId}|__trip__`)?.forEach((cb) => cb(data?.doc ?? null))
  } else {
    const docs = data?.coll?.[coll] ?? {}
    const items = Object.entries(docs).map(([id, d]) => ({ id, ...d }))
    listeners.get(`${tripId}|${coll}`)?.forEach((cb) => cb(items))
  }
}

// Änderungen aus anderen Tabs übernehmen
window.addEventListener('storage', (e) => {
  if (!e.key?.startsWith('norrfangst:trip:')) return
  const tripId = e.key.replace('norrfangst:trip:', '')
  for (const key of listeners.keys()) {
    if (key.startsWith(`${tripId}|`)) notify(tripId, key.split('|')[1])
  }
})

export function getTrip(tripId) {
  return load(tripId)?.doc ?? null
}

export function createTrip(tripId, tripDoc, collections = {}) {
  const coll = {}
  for (const [name, items] of Object.entries(collections)) {
    coll[name] = {}
    for (const item of items) coll[name][newId()] = item
  }
  save(tripId, { doc: tripDoc, coll })
  notify(tripId, '__trip__')
}

export function putTrip(tripId, patch) {
  const data = load(tripId) ?? { doc: {}, coll: {} }
  data.doc = { ...data.doc, ...patch }
  save(tripId, data)
  notify(tripId, '__trip__')
}

const newId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2)).slice(0, 20)

export function addDoc(tripId, coll, docData) {
  const id = newId()
  setDoc(tripId, coll, id, docData)
  return id
}

export function setDoc(tripId, coll, id, docData) {
  const data = load(tripId) ?? { doc: {}, coll: {} }
  data.coll[coll] ??= {}
  data.coll[coll][id] = { ...(data.coll[coll][id] ?? {}), ...docData }
  save(tripId, data)
  notify(tripId, coll)
}

export function deleteDoc(tripId, coll, id) {
  const data = load(tripId)
  if (!data?.coll?.[coll]) return
  delete data.coll[coll][id]
  save(tripId, data)
  notify(tripId, coll)
}

export function subscribeColl(tripId, coll, cb) {
  const key = `${tripId}|${coll}`
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key).add(cb)
  notify(tripId, coll)
  return () => listeners.get(key)?.delete(cb)
}

export function subscribeTripDoc(tripId, cb) {
  const key = `${tripId}|__trip__`
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key).add(cb)
  cb(getTrip(tripId))
  return () => listeners.get(key)?.delete(cb)
}
