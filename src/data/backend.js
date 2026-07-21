// Einheitlicher Daten-Adapter: Firestore (wenn konfiguriert) oder localStorage.
// Beide Modi sind offline-first; Firestore synct automatisch bei Empfang.
import { firebaseEnabled, getFirebase } from '../lib/firebase'
import * as local from '../lib/localdb'

let backendPromise = null

async function buildBackend() {
  if (firebaseEnabled) {
    const { db, fs, uid } = await getFirebase()
    return {
      mode: 'firebase',
      uid,
      async getTrip(tripId) {
        const snap = await fs.getDocFromCache(fs.doc(db, 'trips', tripId)).catch(() => null)
        const s = snap?.exists() ? snap : await fs.getDoc(fs.doc(db, 'trips', tripId)).catch(() => null)
        return s?.exists() ? s.data() : null
      },
      async createTrip(tripId, tripDoc, collections) {
        await fs.setDoc(fs.doc(db, 'trips', tripId), tripDoc)
        for (const [name, items] of Object.entries(collections)) {
          for (const item of items) {
            await fs.addDoc(fs.collection(db, 'trips', tripId, name), item)
          }
        }
      },
      putTrip: (tripId, patch) => fs.setDoc(fs.doc(db, 'trips', tripId), patch, { merge: true }),
      addDoc: async (tripId, coll, data) =>
        (await fs.addDoc(fs.collection(db, 'trips', tripId, coll), data)).id,
      setDoc: (tripId, coll, id, data) =>
        fs.setDoc(fs.doc(db, 'trips', tripId, coll, id), data, { merge: true }),
      deleteDoc: (tripId, coll, id) => fs.deleteDoc(fs.doc(db, 'trips', tripId, coll, id)),
      subscribeColl: (tripId, coll, cb) =>
        fs.onSnapshot(fs.collection(db, 'trips', tripId, coll), (snap) =>
          cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        ),
      subscribeTripDoc: (tripId, cb) =>
        fs.onSnapshot(fs.doc(db, 'trips', tripId), (snap) => cb(snap.exists() ? snap.data() : null)),
    }
  }
  return {
    mode: 'local',
    uid: local.localUid(),
    getTrip: async (tripId) => local.getTrip(tripId),
    createTrip: async (tripId, tripDoc, collections) => local.createTrip(tripId, tripDoc, collections),
    putTrip: async (tripId, patch) => local.putTrip(tripId, patch),
    addDoc: async (tripId, coll, data) => local.addDoc(tripId, coll, data),
    setDoc: async (tripId, coll, id, data) => local.setDoc(tripId, coll, id, data),
    deleteDoc: async (tripId, coll, id) => local.deleteDoc(tripId, coll, id),
    subscribeColl: local.subscribeColl,
    subscribeTripDoc: local.subscribeTripDoc,
  }
}

export function initBackend() {
  backendPromise ??= buildBackend()
  return backendPromise
}

// Sync-freundliche Subscribe-Wrapper (Backend-Init ist asynchron)
export function subscribeColl(tripId, coll, cb) {
  let unsub = () => {}
  let cancelled = false
  initBackend().then((b) => {
    if (!cancelled) unsub = b.subscribeColl(tripId, coll, cb)
  })
  return () => {
    cancelled = true
    unsub()
  }
}

export function subscribeTripDoc(tripId, cb) {
  let unsub = () => {}
  let cancelled = false
  initBackend().then((b) => {
    if (!cancelled) unsub = b.subscribeTripDoc(tripId, cb)
  })
  return () => {
    cancelled = true
    unsub()
  }
}
