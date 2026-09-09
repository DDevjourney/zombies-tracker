import { getLeaderboard } from '../utils/stats'
import { MAPS } from '../data/maps'
import { getRankIcon } from '../data/images'
import type { Game, Session } from '../types'

interface LeaderboardProps {
  game: Game
  sessions: Session[]
}

const POSITION_COLORS: Record<number, string> = {
  0: 'text-yellow-400',
  1: 'text-gray-300',
  2: 'text-orange-600',
}

export function Leaderboard({ game, sessions }: LeaderboardProps) {
  const mapNames = MAPS[game].map(m => m.name)
  const entries = getLeaderboard(sessions, game, mapNames)

  return (
    <div className="p-4">
      <h2 className="text-white text-xl font-bold mb-4">Clasificación</h2>

      {entries.every(e => e.record === null) && (
        <p className="text-gray-600 text-center py-8">
          No hay partidas registradas en {game === 'bo1' ? 'Black Ops 1' : 'Black Ops 2'} todavía
        </p>
      )}

      <div className="flex flex-col gap-2">
        {entries.map((entry, index) => (
          <div
            key={entry.map}
            className={`flex items-center gap-4 rounded-lg px-4 py-3 ${
              entry.record ? 'bg-gray-800' : 'bg-gray-800/50'
            }`}
          >
            <span
              className={`font-bold text-lg w-8 text-center ${
                POSITION_COLORS[index] ?? 'text-gray-600'
              }`}
            >
              #{index + 1}
            </span>
            <span className={`flex-1 min-w-0 text-sm leading-tight ${entry.record ? 'text-white' : 'text-gray-600'}`}>
              {entry.map}
            </span>
            {entry.record ? (
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <span className="font-mono font-bold text-orange-400">
                    {entry.record.round}
                  </span>
                  <p className="text-gray-600 text-xs">
                    {new Date(entry.record.played_at + 'T12:00:00').toLocaleDateString('es-ES')}
                  </p>
                </div>
                <img src={getRankIcon(entry.record.round)} alt="rank" className="w-8 h-8 object-contain" />
              </div>
            ) : (
              <span className="text-gray-700 font-mono">—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
