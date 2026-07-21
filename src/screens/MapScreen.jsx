import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { useTrip } from '../data/TripContext'
import { Screen, Sheet, Field, Card } from '../components/ui'
import { geocodeAddress } from '../lib/geocode'

export const SPOT_TYPES = {
  unterkunft: { icon: '🏡', label: 'Unterkunft' },
  angelspot: { icon: '🎣', label: 'Angelspot' },
  bootsstelle: { icon: '🛥️', label: 'Bootsstelle' },
  supermarkt: { icon: '🛒', label: 'Supermarkt' },
  systembolaget: { icon: '🍺', label: 'Systembolaget' },
  tankstelle: { icon: '⛽', label: 'Tankstelle' },
  notfall: { icon: '🏥', label: 'Notfall' },
  sehenswuerdigkeit: { icon: '📸', label: 'Sehenswertes' },
}

export default function MapScreen() {
  const { trip, spots, catches, add, set, del, uid, me } = useTrip()
  const mapRef = useRef(null)
  const mapObj = useRef(null)
  const markersRef = useRef([])
  const [filter, setFilter] = useState(null)

  // Spot-Formular: eine Datenquelle für beide Wege (Karten-Tipp ODER Adresse).
  // formSession zählt hoch, wenn ein NEUES Anlegen/Bearbeiten startet – der
  // Karten-Tipp-Roundtrip (Sheet zu → tippen → Sheet auf) behält so die Eingaben.
  const [sheetOpen, setSheetOpen] = useState(false)
  const [pickOnMap, setPickOnMap] = useState(false) // „Tippe auf die Karte…"-Modus
  const [coords, setCoords] = useState(null) // { lat, lng, source: 'Karte' | 'Adresse' }
  const [editingSpot, setEditingSpot] = useState(null)
  const [formSession, setFormSession] = useState(0)
  const pickRef = useRef(false)

  useEffect(() => {
    pickRef.current = pickOnMap
  }, [pickOnMap])

  useEffect(() => {
    if (mapObj.current || !mapRef.current) return
    const map = L.map(mapRef.current, { zoomControl: false }).setView(
      [trip?.lat ?? 56.867, trip?.lng ?? 14.086],
      12
    )
    // Dunkle Tiles – werden vom Service Worker offline gecacht
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    map.on('click', (e) => {
      if (!pickRef.current) return
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng, source: 'Karte' })
      setPickOnMap(false)
      setSheetOpen(true)
    })
    mapObj.current = map
    return () => {
      map.remove()
      mapObj.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Solange das Formular offen ist: Karte komplett stilllegen (kein Pan/Zoom/Klick)
  useEffect(() => {
    const map = mapObj.current
    if (!map) return
    const handlers = [map.dragging, map.scrollWheelZoom, map.doubleClickZoom, map.touchZoom, map.boxZoom, map.keyboard]
    for (const h of handlers) {
      if (!h) continue
      if (sheetOpen) h.disable()
      else h.enable()
    }
  }, [sheetOpen])

  // Marker rendern (Spots + Fänge mit GPS)
  useEffect(() => {
    const map = mapObj.current
    if (!map) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    const items = filter ? spots.filter((s) => s.type === filter) : spots
    for (const s of items) {
      if (s.lat == null) continue
      const t = SPOT_TYPES[s.type] ?? { icon: '📍', label: s.type }
      const marker = L.marker([s.lat, s.lng], {
        icon: L.divIcon({
          className: 'spot-marker',
          html: `<div style="font-size:26px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.7))">${t.icon}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 26],
        }),
      }).addTo(map)
      // Bearbeiten: alle (geteilte Daten). Löschen: eigene + Seed-Spots (addedBy null)
      const deletable = s.addedBy == null || s.addedBy === uid
      marker.bindPopup(
        `<b>${t.icon} ${escapeHtml(s.name)}</b><br/><span style="font-size:12px">${escapeHtml(s.notes ?? '')}</span>` +
          `<br/><a href="#" data-edit="${s.id}" style="color:#7fb0d4;font-size:12px">✏️ Bearbeiten</a>` +
          (deletable ? ` · <a href="#" data-del="${s.id}" style="color:#e05c5c;font-size:12px">Löschen</a>` : '')
      )
      markersRef.current.push(marker)
    }
    if (!filter) {
      for (const c of catches) {
        if (c.lat == null) continue
        const marker = L.marker([c.lat, c.lng], {
          icon: L.divIcon({
            className: 'spot-marker',
            html: `<div style="font-size:20px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.7))">🐟</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 20],
          }),
        }).addTo(map)
        marker.bindPopup(
          `<b>🐟 ${escapeHtml(c.species)} ${c.lengthCm ? c.lengthCm + ' cm' : ''}</b><br/><span style="font-size:12px">${escapeHtml(c.userName ?? '')}</span>`
        )
        markersRef.current.push(marker)
      }
    }
    // Popup-Links (Bearbeiten/Löschen) verdrahten – alter Handler wird ersetzt
    map.off('popupopen')
    map.on('popupopen', (e) => {
      const el = e.popup.getElement()
      const delLink = el?.querySelector('[data-del]')
      if (delLink) {
        delLink.onclick = (ev) => {
          ev.preventDefault()
          del('spots', delLink.dataset.del)
          map.closePopup()
        }
      }
      const editLink = el?.querySelector('[data-edit]')
      if (editLink) {
        editLink.onclick = (ev) => {
          ev.preventDefault()
          const s = spots.find((x) => x.id === editLink.dataset.edit)
          if (!s) return
          map.closePopup()
          setEditingSpot(s)
          setCoords({ lat: s.lat, lng: s.lng, source: 'bestehend' })
          setFormSession((n) => n + 1)
          setSheetOpen(true)
        }
      }
    })
  }, [spots, catches, filter, uid, del])

  return (
    <Screen title="Karte" subtitle="Spots, Versorgung & Fänge – Tiles werden offline gecacht">
      <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setFilter(null)} className={`shrink-0 rounded-full px-3 py-1 text-xs ${!filter ? 'btn-fire' : 'btn-ghost'}`}>
          Alle
        </button>
        {Object.entries(SPOT_TYPES).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(filter === k ? null : k)} className={`shrink-0 rounded-full px-3 py-1 text-xs ${filter === k ? 'btn-fire' : 'btn-ghost'}`}>
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden p-0">
        <div ref={mapRef} className="map-canvas" />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => {
            if (pickOnMap) {
              setPickOnMap(false)
              setSheetOpen(true)
            } else {
              setEditingSpot(null)
              setCoords(null)
              setFormSession((n) => n + 1)
              setSheetOpen(true)
            }
          }}
          className={`${pickOnMap ? 'btn-fire' : 'btn-ghost'} flex-1 py-2.5 text-sm`}
        >
          {pickOnMap ? '📍 Tippe auf die Karte… (zurück zum Formular)' : '+ Eigenen Spot hinzufügen'}
        </button>
      </div>

      <Card className="mt-3 text-xs text-mist-500">
        🫎 <b className="text-paper-300">Elch-Warnung:</b> Bei Dämmerungsfahrten (Einkauf, Nacht-Session) langsam –
        Wildwechsel ist hier real. · 🍺 Systembolaget Ljungby: So geschlossen, Sa nur vormittags.
      </Card>

      <NewSpotSheet
        open={sheetOpen}
        initial={editingSpot}
        session={formSession}
        coords={coords}
        setCoords={setCoords}
        onClose={() => setSheetOpen(false)}
        onPickOnMap={() => {
          // Sheet schließen, Karte freigeben, auf Tipp warten – Formulardaten bleiben erhalten
          setSheetOpen(false)
          setPickOnMap(true)
        }}
        onSave={async (data) => {
          if (editingSpot) await set('spots', editingSpot.id, data)
          else await add('spots', { ...data, addedBy: uid, addedByName: me?.displayName ?? null })
          setCoords(null)
          setEditingSpot(null)
          setSheetOpen(false)
        }}
      />
    </Screen>
  )
}

function NewSpotSheet({ open, initial, session, coords, setCoords, onClose, onPickOnMap, onSave }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('angelspot')
  const [notes, setNotes] = useState('')
  const [address, setAddress] = useState('')
  const [geoState, setGeoState] = useState({ status: 'idle' }) // idle | loading | found | notfound | error
  const [busy, setBusy] = useState(false)

  // Prefill nur bei NEUER Formular-Session (Anlegen/Bearbeiten gestartet) –
  // nicht beim Wiederöffnen nach dem Karten-Tipp, sonst gehen Eingaben verloren.
  useEffect(() => {
    setName(initial?.name ?? '')
    setType(initial?.type ?? 'angelspot')
    setNotes(initial?.notes ?? '')
    setAddress('')
    setGeoState({ status: 'idle' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  async function searchAddress() {
    if (!address.trim()) return
    setGeoState({ status: 'loading' })
    try {
      const hit = await geocodeAddress(address)
      if (!hit) {
        setGeoState({ status: 'notfound' })
        return
      }
      setCoords({ lat: hit.lat, lng: hit.lng, source: 'Adresse' })
      setGeoState({ status: 'found', label: hit.label })
    } catch (e) {
      setGeoState({ status: 'error', message: e.message })
    }
  }

  async function save() {
    setBusy(true)
    try {
      await onSave({ name: name.trim(), type, notes, lat: coords.lat, lng: coords.lng })
      setName('')
      setNotes('')
      setAddress('')
      setGeoState({ status: 'idle' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Spot bearbeiten ✏️' : 'Neuer Spot 📍'}>
      <Field label="Name">
        <input autoFocus className="input-dark" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Geheime Barschkante" />
      </Field>
      <Field label="Typ">
        <div className="flex flex-wrap gap-2">
          {Object.entries(SPOT_TYPES).map(([k, v]) => (
            <button key={k} onClick={() => setType(k)} className={`rounded-xl px-3 py-1.5 text-sm ${type === k ? 'btn-fire' : 'btn-ghost'}`}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Notiz">
        <input className="input-dark" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Was macht den Spot besonders?" />
      </Field>

      <Field label="Position">
        <div className="card-inset space-y-3 p-3">
          {coords ? (
            <p className="text-sm text-pine-300">
              ✓ {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}{' '}
              <span className="text-xs text-mist-500">(per {coords.source})</span>
            </p>
          ) : (
            <p className="text-sm text-mist-500">Noch keine Position gewählt.</p>
          )}
          <button type="button" onClick={onPickOnMap} className="btn-ghost w-full py-2 text-sm">
            🗺️ Auf der Karte tippen
          </button>
          <div className="flex gap-2">
            <input
              className="input-dark flex-1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
              placeholder="…oder Adresse/Ort, z. B. ICA Ljungby"
            />
            <button type="button" onClick={searchAddress} disabled={geoState.status === 'loading' || !address.trim()} className="btn-ghost px-4 text-sm">
              {geoState.status === 'loading' ? '…' : '🔎'}
            </button>
          </div>
          {geoState.status === 'found' && (
            <p className="text-xs text-pine-300">Gefunden: {geoState.label}</p>
          )}
          {geoState.status === 'notfound' && (
            <p className="text-xs text-fire-400">
              Nichts gefunden – anders formulieren (Ort dazu, z. B. „…, Ljungby") oder oben auf der Karte tippen.
            </p>
          )}
          {geoState.status === 'error' && (
            <p className="text-xs text-red-400">{geoState.message} – offline? Dann auf der Karte tippen.</p>
          )}
        </div>
      </Field>

      <button className="btn-fire w-full py-3" disabled={!name.trim() || !coords || busy} onClick={save}>
        {busy ? 'Speichere…' : 'Spot speichern'}
      </button>
    </Sheet>
  )
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}
