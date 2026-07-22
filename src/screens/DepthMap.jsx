import { useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Screen, Card } from '../components/ui'
import uebersichtImg from '../assets/ryssbysjon-tiefenkarte.webp'
import messwerteImg from '../assets/ryssbysjon-tiefenkarte-messwerte.webp'

const VIEWS = [
  { key: 'uebersicht', label: 'Übersicht', src: uebersichtImg },
  { key: 'messwerte', label: 'Mit Messwerten', src: messwerteImg },
]

export default function DepthMap() {
  const [view, setView] = useState('uebersicht')
  const [infoOpen, setInfoOpen] = useState(false)
  const active = VIEWS.find((v) => v.key === view)

  return (
    <Screen title="Tiefenkarte · Ryssbysjön" subtitle="Struktur & Tiefen des Sees" back>
      {/* Umschalter Übersicht / Mit Messwerten */}
      <div className="mb-3 flex gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            disabled={!v.src}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              view === v.key ? 'btn-fire' : 'btn-ghost'
            } ${!v.src ? 'opacity-40' : ''}`}
          >
            {v.label}
            {!v.src && <span className="ml-1 text-[0.65rem]">(folgt)</span>}
          </button>
        ))}
      </div>

      {/* Karte mit Pinch-to-Zoom & Pan */}
      <Card className="overflow-hidden p-0">
        {active.src ? (
          <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={6}
            doubleClick={{ mode: 'zoomIn', step: 1.2 }}
            wheel={{ step: 0.15 }}
            pinch={{ step: 5 }}
            centerOnInit
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <div className="relative">
                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '68dvh' }}
                  contentStyle={{ width: '100%', height: '100%' }}
                >
                  <img
                    src={active.src}
                    alt={`Tiefenkarte Ryssbysjön – ${active.label}`}
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                </TransformComponent>
                {/* Zoom-Steuerung */}
                <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
                  <button onClick={() => zoomIn()} className="btn-ghost h-9 w-9 rounded-lg text-lg leading-none" aria-label="Vergrößern">+</button>
                  <button onClick={() => zoomOut()} className="btn-ghost h-9 w-9 rounded-lg text-lg leading-none" aria-label="Verkleinern">−</button>
                  <button onClick={() => resetTransform()} className="btn-ghost h-9 w-9 rounded-lg text-sm leading-none" aria-label="Zurücksetzen">⟲</button>
                </div>
              </div>
            )}
          </TransformWrapper>
        ) : (
          <div className="flex h-[40dvh] flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="text-4xl">🗺️</span>
            <p className="font-display text-lg uppercase tracking-wide">Ansicht folgt</p>
            <p className="text-sm text-mist-500">
              Die beschriftete Version mit allen Einzelmesswerten wird ergänzt, sobald sie vorliegt.
            </p>
          </div>
        )}
      </Card>

      <p className="mt-2 text-center text-xs text-mist-500">
        🤏 Zwei Finger zum Zoomen · ziehen zum Verschieben · Doppeltipp zoomt rein
      </p>

      {/* Kontext-Info, ausklappbar */}
      <button
        onClick={() => setInfoOpen((o) => !o)}
        className="mt-3 flex w-full items-center justify-between rounded-xl border border-wood-400/20 bg-night-800 px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold">ℹ️ Über diese Karte</span>
        <span className="text-mist-500">{infoOpen ? '▲' : '▼'}</span>
      </button>
      {infoOpen && (
        <Card className="mt-2 text-sm text-paper-300">
          <p>
            Diese Tiefenkarte basiert auf einer historischen Vermessung von <b>1937</b> durch den örtlichen
            Fischereiaufseher. Tiefen können sich seither leicht verändert haben, geben aber einen guten
            Anhaltspunkt für die Struktur des Sees.
          </p>
          <p className="mt-2">
            🌊 Tiefste Stelle: <b>ca. 8 m</b>, auf Höhe von <b>Strättö</b>.
          </p>
          <p className="mt-2 text-xs text-mist-500">
            Kompass, Legende und Maßstab sind Teil der Grafik. Fürs Angeln: die tiefe Rinne bei Strättö und die
            Kanten der Flachbereiche sind erfahrungsgemäß die spannendsten Zonen.
          </p>
        </Card>
      )}
    </Screen>
  )
}
