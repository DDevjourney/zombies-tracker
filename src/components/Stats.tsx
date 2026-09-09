import { getFavoriteMap, getBestGlobalRecord, getTotalSessions } from '../utils/stats'
import type { Game, Session } from '../types'

interface StatsProps {
  game: Game
  sessions: Session[]
}

export function Stats({ game, sessions }: StatsProps) {
  const favoriteMap = getFavoriteMap(sessions, game)
  const bestRecord = getBestGlobalRecord(sessions, game)
  const total = getTotalSessions(sessions, game)

  return (
    <div className="p-4">
      <h2 className="text-white text-xl font-bold mb-4">Estadísticas</h2>

      <div className="flex flex-col gap-4">
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
            Mejor récord global
          </p>
          {bestRecord ? (
            <>
              <p className="text-orange-400 font-mono text-4xl font-bold">
                {bestRecord.round}
              </p>
              <p className="text-gray-500 text-sm mt-1">{bestRecord.map}</p>
            </>
          ) : (
            <p className="text-gray-600">Sin partidas aún</p>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
            Mapa favorito
          </p>
          <p className="text-white text-lg font-semibold">
            {favoriteMap ?? <span className="text-gray-600">—</span>}
          </p>
          <p className="text-gray-600 text-xs mt-1">
            {favoriteMap ? 'Mapa con más partidas' : 'Sin partidas aún'}
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
            Total de partidas
          </p>
          <p className="text-white font-mono text-4xl font-bold">{total}</p>
          <p className="text-gray-600 text-xs mt-1">
            en {game === 'bo1' ? 'Black Ops 1' : 'Black Ops 2'}
          </p>
        </div>
      </div>
    </div>
  )
}
