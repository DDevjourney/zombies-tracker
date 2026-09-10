import { getLeaderboard } from '../utils/stats'
import { MAPS } from '../data/maps'
import { getRankIcon } from '../data/images'
import type { Game, Session } from '../types'

interface LeaderboardProps {
  game: Game
  sessions: Session[]
}

const POSITION_COLORS: Record<number, string> = {
  0: '#f5c518',
  1: '#b0b8be',
  2: '#cd7f32',
}

export function Leaderboard({ game, sessions }: LeaderboardProps) {
  const mapNames = MAPS[game].map(m => m.name)
  const entries = getLeaderboard(sessions, game, mapNames)

  return (
    <div className="p-4">
      <h2 className="font-display text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>
        Clasificación
      </h2>

      {entries.every(e => e.record === null) && (
        <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          No hay partidas en {game === 'bo1' ? 'Black Ops 1' : 'Black Ops 2'} todavía
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        {entries.map((entry, index) => (
          <div
            key={entry.map}
            className="glass flex items-center gap-4 rounded px-4 py-3"
            style={!entry.record ? { opacity: 0.5 } : {}}
          >
            <span
              className="font-score text-base w-7 text-center"
              style={{ color: entry.record ? (POSITION_COLORS[index] ?? 'var(--text-secondary)') : 'var(--text-muted)' }}
            >
              {index + 1}
            </span>
            <span
              className="flex-1 min-w-0 text-sm leading-tight"
              style={{ color: entry.record ? 'var(--text)' : 'var(--text-muted)' }}
            >
              {entry.map}
            </span>
            {entry.record ? (
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <span className="font-score font-bold" style={{ color: 'var(--accent)' }}>
                    {entry.record.round}
                  </span>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(entry.record.played_at + 'T12:00:00').toLocaleDateString('es-ES')}
                  </p>
                </div>
                <img src={getRankIcon(entry.record.round)} alt="rank" className="w-8 h-8 object-contain" />
              </div>
            ) : (
              <span className="font-score" style={{ color: 'var(--text-muted)' }}>—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
