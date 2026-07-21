# 🎣 Norrfångst – Angelurlaub-Companion (Ryssby 2026)

PWA-Reisebegleiter für den Männer-Angelurlaub in Ryssby, Småland (28.07.–01.08.2026).
Offline-first: Fangbuch, Karte, Budget & Co. funktionieren auch ohne Empfang am See
und synchronisieren automatisch, sobald wieder Netz da ist.

## Schnellstart (lokal)

```bash
npm install
npm run dev        # http://localhost:5183
```

Beim ersten Start: Trip-Code **RYSSBY26** eingeben → Profil anlegen → fertig.
Ohne Firebase-Konfiguration läuft die App im **Demo-Modus** (Daten nur auf diesem
Gerät, localStorage). Alle Features sind nutzbar.

## Live-Sync für alle 6 Leute aktivieren (Firebase, ~10 Minuten)

1. [console.firebase.google.com](https://console.firebase.google.com) → Projekt anlegen (z. B. `norrfangst`).
2. **Authentication** → Sign-in method → **Anonym** aktivieren.
3. **Firestore Database** → Datenbank anlegen (Region `europe-west3`).
4. Regeln: Inhalt von [firestore.rules](firestore.rules) in den Rules-Tab kopieren → Publish.
5. Projekteinstellungen → „Web-App hinzufügen" → Config-Werte kopieren.
6. `.env.example` nach `.env` kopieren und Werte eintragen (bei Vercel: als Environment Variables).
7. Neu bauen/deployen – die App erkennt die Config automatisch und schaltet auf Cloud-Sync um.

Fotos werden client-seitig komprimiert und **im Firestore-Dokument** gespeichert
(Data-URL, ~60–100 KB). Dadurch wandern sie durch dieselbe Offline-Queue wie der
Fang selbst – kein separater Storage-Upload nötig. Firebase Storage kann später
als Upgrade für Full-Res-Fotos ergänzt werden.

## Deployment (Vercel)

```bash
npm run build      # erzeugt dist/
```

Repo zu Vercel verbinden (Framework: Vite) oder `vercel deploy`. Env-Variablen aus `.env` im Vercel-Dashboard setzen. Fertig – installierbar via „Zum Home-Bildschirm hinzufügen".

## Architektur

- **React + Vite + Tailwind 4 + Framer Motion**, installierbare PWA (`vite-plugin-pwa`)
- **Daten-Adapter** [src/data/backend.js](src/data/backend.js): Firestore mit Offline-Persistence
  *oder* localStorage-Fallback – gleiche API, umschaltbar per `.env`
- **Login ohne Reibung**: Trip-Code (`RYSSBY26`) oder Invite-Link (`/?trip=RYSSBY26`) + Anonymous Auth
- **Multi-Trip-fähig**: alles hängt unter `trips/{tripId}` – nächstes Jahr = neuer Code, gleiche App
- **Konfliktfrei offline**: Statistiken/Leaderboard werden aus `catches` **abgeleitet** (keine Counter),
  Rest ist last-write-wins
- **Karte**: Leaflet + Carto-Dark-Tiles, Offline-Tile-Cache über den Service Worker
- **Wetter**: Open-Meteo (kein Key), 30-min-Cache; **Sonne/Mond/Solunar** lokal via `suncalc`
- **Fang-Regeln**: konfigurierbare Richtwerte in [src/data/regeln.js](src/data/regeln.js) –
  bewusst nicht als Fakten hardcodiert, Prüf-Hinweis auf iFiske/Fiskevårdsområde

## Module

Dashboard (Countdown, Angelindex, Feed) · Fangbuch (GPS + Auto-Wetterstempel + Legal-Check +
Reaktionen + Muster-Insights) · Team/Leaderboard/Badges · Packliste (Zuweisung + Konfliktcheck) ·
Einkaufsliste (→ Budget-Auto-Übernahme) · Budget/Settle-Up · Angel-Modul (Solunar, Fiskekort) ·
Karte (eigene Spots, Systembolaget!) · Boot (Checkliste, Tank, Rotation) · Tagesplaner · Chat ·
Notfall (112, offline) · Lexikon & Survival-Tipps
