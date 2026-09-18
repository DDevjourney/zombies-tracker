import { MAP_IMAGES, getRankIcon } from '../data/images'
import type { Session } from '../types'

interface BestOfMonthProps {
  session: Session
  onClick: () => void
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export function BestOfMonth({ session, onClick }: BestOfMonthProps) {
  const img = MAP_IMAGES[session.map]
  const month = MONTHS[Number(session.played_at.slice(5, 7)) - 1]

  return (
    <button
      onClick={onClick}
      className="glass chamfer w-full text-left flex items-center gap-4 p-3 outline-none"
      style={{ borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-card), 0 0 0 1px rgba(232,160,48,0.08)' }}
    >
      {img && (
        <img
          src={img}
          alt={session.map}
          className="w-20 rounded object-cover object-top shrink-0"
          style={{ aspectRatio: '16/9' }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="hud-label whitespace-nowrap" style={{ color: 'var(--accent)' }}>Mejor de {month}</p>
        <p className="text-sm font-semibold truncate mt-0.5" style={{ color: 'var(--text)' }}>
          {session.map}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {new Date(session.played_at + 'T12:00:00').toLocaleDateString('es-ES')}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-score text-2xl" style={{ color: 'var(--accent)' }}>
          {session.round}
        </span>
        <img src={getRankIcon(session.round)} alt="rank" className="w-9 h-9 object-contain" />
      </div>
    </button>
  )
}
