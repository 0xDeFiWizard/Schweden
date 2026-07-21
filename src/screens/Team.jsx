import { useTrip } from '../data/TripContext'
import { Screen, Card, SectionTitle, Stat, Chip } from '../components/ui'
import Avatar from '../components/Avatar'
import { leaderboard, memberStats, badges } from '../lib/stats'

export default function Team() {
  const { members, catches, uid } = useTrip()
  const lb = leaderboard(catches, members)

  return (
    <Screen title="Team & Ranking" subtitle={`${members.length} Angler am Start`} back>
      <SectionTitle>🏆 Leaderboard</SectionTitle>
      <div className="space-y-2">
        <RankCard title="Größter Fisch" rows={lb.biggestFish} render={(r) => (r.biggest ? `${r.biggest.lengthCm ?? '?'} cm ${r.biggest.species}` : '—')} />
        <RankCard title="Meiste Fische" rows={lb.mostFish} render={(r) => `${r.total} Fänge`} />
        <RankCard title="Meiste Arten" rows={lb.mostSpecies} render={(r) => `${r.species.length} Arten`} />
      </div>

      <SectionTitle>Die Crew</SectionTitle>
      <div className="space-y-3">
        {members.map((m) => (
          <MemberCard key={m.id} m={m} catches={catches} members={members} me={m.id === uid} />
        ))}
      </div>
    </Screen>
  )
}

function RankCard({ title, rows, render }) {
  const medals = ['🥇', '🥈', '🥉']
  const top = rows.slice(0, 3)
  return (
    <Card>
      <p className="font-display mb-2 text-sm uppercase tracking-wide text-wood-400">{title}</p>
      {top.every((r) => !r.total) ? (
        <p className="text-sm text-mist-500">Noch keine Fänge – alles offen!</p>
      ) : (
        <div className="space-y-1.5">
          {top.map((r, i) => (
            <div key={r.member.id} className="flex items-center gap-2 text-sm">
              <span>{medals[i]}</span>
              <Avatar member={r.member} size={26} />
              <span className="flex-1 truncate" style={{ color: r.member.accentColor }}>{r.member.displayName}</span>
              <span className="text-paper-300">{render(r)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function MemberCard({ m, catches, members, me }) {
  const s = memberStats(catches, m.id)
  const bs = badges(catches, members, m.id)
  return (
    <Card className={me ? 'ring-1 ring-fire-500/40' : ''}>
      <div className="flex items-center gap-3">
        <Avatar member={m} size={48} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg" style={{ color: m.accentColor }}>
            {m.displayName} {me && <span className="text-xs text-mist-500">(du)</span>}
          </p>
          <p className="text-xs text-mist-500">
            🚗 {m.car ?? '—'} {m.isDriver && '· Fahrer 🔑'}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <Stat icon="🎣" value={s.total} label="Fänge" accent={m.accentColor} />
        <Stat icon="📏" value={s.biggest ? `${s.biggest.lengthCm}` : '–'} label="größter (cm)" accent={m.accentColor} />
        <Stat icon="🐟" value={s.species.length} label="Arten" accent={m.accentColor} />
        <Stat icon="🌅" value={s.dawnSessions} label="Dämmerung" accent={m.accentColor} />
      </div>
      {bs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {bs.map((b) => (
            <Chip key={b.name} tone="fire">
              {b.icon} {b.name}
            </Chip>
          ))}
        </div>
      )}
    </Card>
  )
}
