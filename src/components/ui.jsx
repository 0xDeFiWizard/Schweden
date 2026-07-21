import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

export function Screen({ title, subtitle, back, action, children }) {
  const nav = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4"
    >
      <header className="mb-4 flex items-center gap-3">
        {back && (
          <button onClick={() => nav(-1)} className="btn-ghost px-3 py-2 text-sm" aria-label="Zurück">
            ←
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl uppercase tracking-wide text-paper-100">{title}</h1>
          {subtitle && <p className="text-sm text-mist-500">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </motion.div>
  )
}

export function Card({ className = '', children, onClick }) {
  return (
    <div className={`card p-4 ${onClick ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

export function SectionTitle({ children, right }) {
  return (
    <div className="mb-2 mt-6 flex items-center justify-between first:mt-0">
      <h2 className="font-display text-lg uppercase tracking-wider text-wood-400">{children}</h2>
      {right}
    </div>
  )
}

export function Chip({ children, tone }) {
  const tones = {
    green: 'text-pine-300 border-pine-500/40 bg-pine-500/10',
    fire: 'text-fire-400 border-fire-500/40 bg-fire-500/10',
    red: 'text-red-400 border-red-500/40 bg-red-500/10',
    blue: 'text-lake-300 border-lake-400/40 bg-lake-500/15',
  }
  return <span className={`chip ${tones[tone] ?? ''}`}>{children}</span>
}

export function Stat({ label, value, icon, accent }) {
  return (
    <div className="card-inset flex flex-col items-center gap-0.5 px-2 py-3 text-center">
      <span className="text-lg leading-none">{icon}</span>
      <span className="font-display text-xl" style={accent ? { color: accent } : undefined}>
        {value}
      </span>
      <span className="text-[0.65rem] uppercase tracking-wide text-mist-500">{label}</span>
    </div>
  )
}

export function ProgressBar({ value, max, color = 'var(--color-pine-400)' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-night-950/70">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}

export function EmptyState({ icon, title, text }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-8 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="font-display text-lg uppercase tracking-wide">{title}</p>
      {text && <p className="text-sm text-mist-500">{text}</p>}
    </div>
  )
}

export function Fab({ onClick, children = '+' }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="btn-fire fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-3xl leading-none shadow-lg"
      aria-label="Hinzufügen"
    >
      {children}
    </motion.button>
  )
}

export function Sheet({ open, onClose, title, children }) {
  // Portal nach document.body: Screens sind Framer-Motion-Container mit transform
  // (eigener Stacking-Context, fixed verankert sich dort statt am Viewport) und
  // Leaflet-Panes haben z-Indizes bis 1000 – das Sheet muss darüber liegen.
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[1110] mx-auto max-h-[88dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border-t border-wood-400/20 bg-night-800 p-5"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2.5rem)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-paper-100/20" />
            {title && <h2 className="font-display mb-4 text-2xl uppercase tracking-wide">{title}</h2>}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

export function Field({ label, children }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-mist-500">{label}</span>
      {children}
    </label>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 py-1"
    >
      {label && <span className="text-sm">{label}</span>}
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-pine-400' : 'bg-night-950 border border-paper-100/15'}`}
      >
        <motion.span
          className="absolute top-0.5 h-6 w-6 rounded-full bg-paper-100 shadow"
          animate={{ left: checked ? '1.4rem' : '0.15rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </span>
    </button>
  )
}
