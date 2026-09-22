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
          className="btn btn-ghost chamfer"
          style={{ minHeight: 40, padding: '0 0.7rem', borderRadius: 0 }}
          aria-label="Volver a mapas"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <p className="hud-label">{game === 'bo1' ? 'Black Ops 1' : 'Black Ops 2'}</p>
          <h2 className="font-display text-2xl font-bold leading-none mt-0.5" style={{ color: 'var(--text)' }}>
            {mapName}
          </h2>
        </div>
      </div>

      <div className="p-4">
        {record ? (
          <div
            ref={recordRef}
            className="glass chamfer p-6 mb-6"
            style={{ borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-card), 0 0 40px rgba(232,160,48,0.08)' }}
          >
            <p className="hud-label mb-3">Récord actual</p>
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
            {record.video_url && (
              <a
                href={record.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-danger mt-4"
                style={{ minHeight: 38, fontSize: '0.85rem' }}
                title={record.video_title ?? 'Ver vídeo'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 4v16l13-8z"/></svg>
                Ver la partida
              </a>
            )}
          </div>
        ) : (
          <div ref={recordRef} className="glass chamfer p-6 mb-6 text-center">
            <p style={{ color: 'var(--text-muted)' }}>Sin récord en este mapa todavía</p>
          </div>
        )}

        {progress.length >= 2 && <ProgressChart points={progress} />}

        <div className="flex justify-between items-center mb-3">
          <h3 className="hud-label">Historial · {history.length}</h3>
          <button onClick={onAddSession} className="btn btn-primary" style={{ minHeight: 36, padding: '0 0.8rem', fontSize: '0.85rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" aria-hidden><path d="M12 5v14M5 12h14"/></svg>
            Añadir
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
                  className="glass chamfer flex flex-col px-4 py-3"
                  style={isRecord ? {
                    background: 'rgba(207, 41, 41, 0.12)',
                    borderColor: 'rgba(207, 41, 41, 0.4)',
                  } : {}}
                >
                  <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-score text-lg" style={{ color: 'var(--text)' }}>
                      {session.round}
                    </span>
                    {isRecord && (
                      <span
                        className="font-display text-[11px] font-bold tracking-[0.12em] uppercase px-1.5 py-0.5"
                        style={{ color: '#ff5a63', background: 'var(--danger-soft)', border: '1px solid rgba(200,32,42,0.4)' }}
                      >
                        Récord
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(session.played_at + 'T12:00:00').toLocaleDateString('es-ES')}
                    </span>
                    {session.video_url && (
                      <a
                        href={session.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 inline-flex items-center justify-center transition-colors outline-none"
                        style={{ color: '#ff5a63' }}
                        title={session.video_title ?? 'Ver vídeo'}
                        aria-label={`Ver vídeo de la partida de ronda ${session.round}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 4v16l13-8z"/></svg>
                      </a>
                    )}
                    <button
                      onClick={() => onEditSession(session)}
                      className="w-9 h-9 inline-flex items-center justify-center transition-colors outline-none"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      title="Editar partida"
                      aria-label={`Editar partida de ronda ${session.round}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    {confirmId === session.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setConfirmId(null)
                            onDeleteSession(session.id)
                          }}
                          className="btn btn-danger"
                          style={{ minHeight: 32, padding: '0 0.7rem', fontSize: '0.78rem' }}
                          aria-label={`Confirmar borrado de ronda ${session.round}`}
                        >
                          Borrar
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="btn btn-ghost"
                          style={{ minHeight: 32, padding: '0 0.7rem', fontSize: '0.78rem' }}
                          aria-label="Cancelar borrado"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(session.id)}
                        className="w-9 h-9 inline-flex items-center justify-center transition-colors outline-none"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ff5a63')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                        title="Borrar partida"
                        aria-label={`Borrar partida de ronda ${session.round}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    )}
                  </div>
                  </div>
                  {session.note && (
                    <p
                      className="text-sm mt-2 whitespace-pre-wrap break-words"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {session.note}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
