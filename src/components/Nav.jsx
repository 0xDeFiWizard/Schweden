import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTrip } from '../data/TripContext'

const TABS = [
  { to: '/', icon: '🏕️', label: 'Start' },
  { to: '/catches', icon: '🎣', label: 'Fänge' },
  { to: '/map', icon: '🗺️', label: 'Karte' },
  { to: '/chat', icon: '💬', label: 'Chat' },
  { to: '/more', icon: '☰', label: 'Mehr' },
]

export default function Nav() {
  const { online, mode } = useTrip()
  return (
    <>
      {!online && (
        <div
          className="fixed inset-x-0 top-0 z-50 bg-wood-500/90 pb-1 text-center text-xs font-semibold text-night-950"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.25rem)' }}
        >
          📡 Offline – Änderungen werden gespeichert und später synchronisiert
        </div>
      )}
      {mode === 'local' && online && (
        <div
          className="fixed inset-x-0 top-0 z-40 truncate bg-lake-500/60 px-3 pb-1 text-center text-[0.65rem] text-paper-100/80"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.25rem)' }}
        >
          Demo-Modus (nur dieses Gerät) · Firebase verbinden für Live-Sync
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-wood-400/15 bg-night-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[0.65rem]"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-glow"
                      className="absolute -top-px h-0.5 w-10 rounded-full bg-fire-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`text-xl ${isActive ? '' : 'opacity-55 grayscale'}`}>{t.icon}</span>
                  <span className={isActive ? 'font-semibold text-fire-400' : 'text-mist-500'}>{t.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
