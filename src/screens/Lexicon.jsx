import { useTrip } from '../data/TripContext'
import { Screen, Card, SectionTitle, Chip } from '../components/ui'
import { ARTEN, SURVIVAL_TIPPS } from '../data/lexikon'
import { FANG_REGELN, REGEL_QUELLE } from '../data/regeln'

export default function Lexicon() {
  useTrip()
  return (
    <Screen title="Lexikon" subtitle="Fischarten, Köder & Survival" back>
      <SectionTitle>🐟 Fischarten</SectionTitle>
      <div className="space-y-3">
        {ARTEN.map((a) => {
          const regel = FANG_REGELN[a.name]
          return (
            <Card key={a.name}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{a.emoji}</span>
                <div>
                  <p className="font-display text-xl">{a.name}</p>
                  <Chip tone={a.schwierigkeit.startsWith('Gut') ? 'green' : 'fire'}>{a.schwierigkeit}</Chip>
                </div>
              </div>
              <p className="mt-3 text-sm text-paper-300">{a.sommer}</p>
              <div className="card-inset mt-3 space-y-1 p-3 text-xs">
                <p>🪱 <b>Köder:</b> {a.koeder.join(', ')}</p>
                <p>⏰ <b>Beste Zeit:</b> {a.zeit}</p>
                <p>💡 {a.tipp}</p>
                {regel && (
                  <p className="text-wood-400">
                    📏 Richtwert: {regel.minSizeCm ? `min ${regel.minSizeCm} cm` : 'kein Mindestmaß'}
                    {regel.maxSizeCm ? ` · Entnahme bis ${regel.maxSizeCm} cm` : ''} – {REGEL_QUELLE.hinweis}
                  </p>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <SectionTitle>🏕️ Survival & Outdoor</SectionTitle>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SURVIVAL_TIPPS.map((t) => (
          <Card key={t.title} className="flex items-start gap-3">
            <span className="text-2xl">{t.icon}</span>
            <div>
              <p className="font-display text-sm">{t.title}</p>
              <p className="text-xs text-paper-300">{t.text}</p>
            </div>
          </Card>
        ))}
      </div>
    </Screen>
  )
}
