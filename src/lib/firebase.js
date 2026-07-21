// Firebase wird nur geladen, wenn eine Konfiguration vorhanden ist (VITE_FB_*).
// Ohne Konfiguration läuft die App im lokalen Demo-Modus (localStorage).
const cfg = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
}

export const firebaseEnabled = Boolean(cfg.apiKey && cfg.projectId && cfg.appId)

let instance = null

export async function getFirebase() {
  if (!firebaseEnabled) return null
  if (instance) return instance
  const [{ initializeApp }, fs, auth] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore'),
    import('firebase/auth'),
  ])
  const app = initializeApp(cfg)
  // Offline-Persistence: Schreibvorgänge am See landen lokal und syncen später.
  const db = fs.initializeFirestore(app, {
    localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }),
  })
  const a = auth.getAuth(app)
  await auth.setPersistence(a, auth.indexedDBLocalPersistence)
  const cred = await auth.signInAnonymously(a)
  instance = { app, db, fs, uid: cred.user.uid }
  return instance
}
