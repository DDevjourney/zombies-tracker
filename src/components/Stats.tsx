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
      <h2 className="font-display text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>
        Estadísticas
      </h2>

      <div className="flex flex-col gap-3">
        <div className="glass rounded p-5">
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Mejor récord global
          </p>
          {bestRecord ? (
            <>
              <p className="font-score text-5xl leading-none" style={{ color: 'var(--accent)' }}>
                {bestRecord.round}
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                {bestRecord.map}
              </p>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Sin partidas aún</p>
          )}
        </div>

        <div className="glass rounded p-5">
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Mapa favorito
          </p>
          <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            {favoriteMap ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {favoriteMap ? 'Mapa con más partidas' : 'Sin partidas aún'}
          </p>
        </div>

        <div className="glass rounded p-5">
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Total de partidas
          </p>
          <p className="font-score text-5xl leading-none" style={{ color: 'var(--text)' }}>
            {total}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            en {game === 'bo1' ? 'Black Ops 1' : 'Black Ops 2'}
          </p>
        </div>
      </div>
    </div>
  )
}
