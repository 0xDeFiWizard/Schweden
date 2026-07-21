import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { initBackend, subscribeColl, subscribeTripDoc } from './backend'
import { seedTrip, blankTrip, DEFAULT_TRIP_CODE } from './seed'

const SESSION_KEY = 'norrfangst:session'
const COLLS = ['members', 'catches', 'tasks', 'packing', 'shopping', 'expenses', 'spots', 'schedule', 'chat', 'meta']

const TripCtx = createContext(null)
export const useTrip = () => useContext(TripCtx)

export function TripProvider({ children }) {
  const [session, setSessionState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    } catch {
      return null
    }
  })
  const [backend, setBackend] = useState(null)
  const [trip, setTrip] = useState(null)
  const [online, setOnline] = useState(navigator.onLine)
  const [colls, setColls] = useState(() => Object.fromEntries(COLLS.map((c) => [c, []])))

  useEffect(() => {
    initBackend().then(setBackend)
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const tripId = session?.tripId ?? null

  useEffect(() => {
    if (!backend || !tripId) return
    const unsubs = COLLS.map((c) =>
      subscribeColl(tripId, c, (items) => setColls((prev) => ({ ...prev, [c]: items })))
    )
    unsubs.push(subscribeTripDoc(tripId, setTrip))
    return () => unsubs.forEach((u) => u())
  }, [backend, tripId])

  const setSession = (s) => {
    setSessionState(s)
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    else localStorage.removeItem(SESSION_KEY)
  }

  // Trip-Code eingeben → Trip laden oder (RYSSBY26: mit Seed-Daten) anlegen
  async function joinTrip(codeRaw) {
    const code = codeRaw.trim().toUpperCase()
    if (!code) throw new Error('Trip-Code fehlt')
    const b = await initBackend()
    let existing = await b.getTrip(code)
    if (!existing) {
      const data = code === DEFAULT_TRIP_CODE ? seedTrip() : blankTrip(code)
      await b.createTrip(code, data.trip, data.collections)
      existing = data.trip
    }
    return { tripId: code, trip: existing }
  }

  // Profil anlegen (oder bestehendes übernehmen) → Session speichern
  async function createProfile(joinTripId, profile, adoptMemberId = null) {
    const b = await initBackend()
    if (adoptMemberId && adoptMemberId !== b.uid) {
      await b.deleteDoc(joinTripId, 'members', adoptMemberId)
    }
    await b.setDoc(joinTripId, 'members', b.uid, {
      displayName: profile.displayName,
      avatar: profile.avatar ?? '🎣',
      avatarUrl: profile.avatarUrl ?? null,
      accentColor: profile.accentColor,
      car: profile.car ?? null,
      isDriver: profile.isDriver ?? false,
      arrivalInfo: profile.arrivalInfo ?? '',
      medicalInfo: profile.medicalInfo ?? '',
      joinedAt: new Date().toISOString(),
    })
    setSession({ tripId: joinTripId, uid: b.uid })
  }

  function leaveTrip() {
    setSession(null)
    setTrip(null)
    setColls(Object.fromEntries(COLLS.map((c) => [c, []])))
  }

  // Generische Aktionen (alle offline-fähig, Sync automatisch)
  const add = async (coll, data) => (await initBackend()).addDoc(tripId, coll, data)
  const set = async (coll, id, data) => (await initBackend()).setDoc(tripId, coll, id, data)
  const del = async (coll, id) => (await initBackend()).deleteDoc(tripId, coll, id)
  const updateTrip = async (patch) => (await initBackend()).putTrip(tripId, patch)

  const uid = backend?.uid ?? session?.uid ?? null
  const me = colls.members.find((m) => m.id === uid) ?? null

  const memberById = useMemo(() => {
    const map = {}
    for (const m of colls.members) map[m.id] = m
    return map
  }, [colls.members])

  const value = {
    ready: Boolean(backend),
    mode: backend?.mode ?? 'local',
    online,
    uid,
    tripId,
    trip,
    me,
    memberById,
    ...colls,
    boat: colls.meta.find((d) => d.id === 'boat') ?? null,
    joinTrip,
    createProfile,
    leaveTrip,
    add,
    set,
    del,
    updateTrip,
  }

  return <TripCtx.Provider value={value}>{children}</TripCtx.Provider>
}
