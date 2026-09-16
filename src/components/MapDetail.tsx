import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getRecord, getHistory, getProgressPoints } from '../utils/stats'
import { animate, cascadeIn, reducedMotion } from '../lib/motion'
import { ProgressChart } from './ProgressChart'
import type { Game, Session } from '../types'

interface MapDetailProps {
  game: Game
  mapName: string
  sessions: Session[]
  onBack: () => void
  onAddSession: () => void
  onEditSession: (session: Session) => void
  onDeleteSession: (id: string) => Promise<void>
}

export function MapDetail({
  game,
  mapName,
  sessions,
  onBack,
  onAddSession,
  onEditSession,
  onDeleteSession,
}: MapDetailProps) {
  const record = getRecord(sessions, game, mapName)
  const history = getHistory(sessions, game, mapName)
  const progress = getProgressPoints(sessions, game, mapName)
  const recordRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  // The inline confirmation auto-dismisses after a few seconds.
  useEffect(() => {
    if (!confirmId) return
    const t = window.setTimeout(() => setConfirmId(null), 4000)
    return () => clearTimeout(t)
  }, [confirmId])

  useLayoutEffect(() => {
    if (recordRef.current && !reducedMotion()) {
      animate(recordRef.current, { opacity: [0, 1], translateY: [12, 0], duration: 400, ease: 'outCubic' })
    }
    if (listRef.current) cascadeIn(listRef.current.children, 45)
  }, [mapName])

  return (
    <div>
      <div
        className="p-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={onBack}
          className="text-lg transition-colors outline-none"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          ←
        </button>
        <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>
          {mapName}
        </h2>
      </div>

      <div className="p-4">
        {record ? (
          <div
            ref={recordRef}
            className="glass rounded p-6 mb-6"
            style={{ borderColor: 'var(--border-strong)' }}
          >
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              Récord actual
            </p>
            <p className="font-score text-6xl leading-none" style={{ color: 'var(--accent)' }}>
              {record.round}
            </p>
            <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
              {new Date(record.played_at + 'T12:00:00').toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        ) : (
          <div ref={recordRef} className="glass rounded p-6 mb-6 text-center">
            <p style={{ color: 'var(--text-muted)' }}>Sin récord en este mapa todavía</p>
          </div>
        )}

        {progress.length >= 2 && <ProgressChart points={progress} />}

        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Historial ({history.length})
          </h3>
          <button
            onClick={onAddSession}
            className="font-display text-sm px-3 py-1 rounded transition-colors font-semibold"
            style={{ backgroundColor: 'var(--accent)', color: '#02020f', letterSpacing: '0.03em' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-dim)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            + Añadir
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            No hay partidas registradas
          </p>
        ) : (
          <div ref={listRef} className="flex flex-col gap-1.5">
            {history.map(session => {
              const isRecord = session.id === record?.id
              return (
                <div
                  key={session.id}
                  className="glass flex justify-between items-center px-4 py-3 rounded"
                  style={isRecord ? {
                    background: 'rgba(207, 41, 41, 0.12)',
                    borderColor: 'rgba(207, 41, 41, 0.4)',
                  } : {}}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-score text-lg" style={{ color: 'var(--text)' }}>
                      {session.round}
                    </span>
                    {isRecord && (
                      <span className="text-xs font-semibold" style={{ color: 'var(--danger)' }}>
                        Récord
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(session.played_at + 'T12:00:00').toLocaleDateString('es-ES')}
                    </span>
                    <button
                      onClick={() => onEditSession(session)}
                      className="text-sm leading-none transition-colors outline-none"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      title="Editar partida"
                      aria-label={`Editar partida de ronda ${session.round}`}
                    >
                      ✎
                    </button>
                    {confirmId === session.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setConfirmId(null)
                            onDeleteSession(session.id)
                          }}
                          className="text-xs font-semibold px-2 py-1 rounded outline-none"
                          style={{ backgroundColor: 'var(--danger)', color: '#fff' }}
                          aria-label={`Confirmar borrado de ronda ${session.round}`}
                        >
                          Borrar
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-xs px-2 py-1 rounded outline-none"
                          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                          aria-label="Cancelar borrado"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(session.id)}
                        className="text-sm leading-none transition-colors outline-none"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                        title="Borrar partida"
                        aria-label={`Borrar partida de ronda ${session.round}`}
                      >
                        ✕
                      </button>
                    )}
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
