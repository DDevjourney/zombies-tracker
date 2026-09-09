import { getRecord, getHistory } from '../utils/stats'
import type { Game, Session } from '../types'

interface MapDetailProps {
  game: Game
  mapName: string
  sessions: Session[]
  onBack: () => void
  onAddSession: () => void
  onDeleteSession: (id: string) => Promise<void>
}

export function MapDetail({ game, mapName, sessions, onBack, onAddSession, onDeleteSession }: MapDetailProps) {
  const record = getRecord(sessions, game, mapName)
  const history = getHistory(sessions, game, mapName)

  return (
    <div>
      <div className="p-4 flex items-center gap-3 border-b border-gray-700">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors text-lg"
        >
          ←
        </button>
        <h2 className="text-white text-xl font-bold">{mapName}</h2>
      </div>

      <div className="p-4">
        {record ? (
          <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-orange-500/40">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Récord actual</p>
            <p className="text-orange-400 font-mono text-5xl font-bold">{record.round}</p>
            <p className="text-gray-500 text-sm mt-2">
              {new Date(record.played_at + 'T12:00:00').toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-6 mb-6 text-center border border-gray-700">
            <p className="text-gray-500">Sin récord en este mapa todavía</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-3">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Historial ({history.length})
          </h3>
          <button
            onClick={onAddSession}
            className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded transition-colors"
          >
            + Añadir
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No hay partidas registradas</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map(session => {
              const isRecord = session.id === record?.id
              return (
                <div
                  key={session.id}
                  className={`flex justify-between items-center px-4 py-3 rounded-lg ${
                    isRecord
                      ? 'bg-orange-500/15 border border-orange-500/40'
                      : 'bg-gray-800 border border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg text-white">
                      {session.round}
                    </span>
                    {isRecord && (
                      <span className="text-xs text-orange-400 font-semibold uppercase tracking-wide">
                        Récord
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm">
                      {new Date(session.played_at + 'T12:00:00').toLocaleDateString('es-ES')}
                    </span>
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors text-sm leading-none"
                      title="Borrar partida"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
