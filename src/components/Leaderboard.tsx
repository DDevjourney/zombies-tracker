import { useLayoutEffect, useRef } from 'react'
import { getLeaderboard } from '../utils/stats'
import { MAPS } from '../data/maps'
import { getRankIcon } from '../data/images'
import { animate, cascadeIn, countUp, reducedMotion } from '../lib/motion'
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

  const listRef = useRef<HTMLDivElement>(null)
  const positions = useRef<Map<string, number>>(new Map())
  const lastGame = useRef<Game | null>(null)

  // FLIP: remember each row's top before render, then slide from old to new position.
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const rows = Array.from(list.children) as HTMLElement[]

    if (lastGame.current !== game) {
      lastGame.current = game
      cascadeIn(rows, 40)
      rows.forEach(row => {
        const el = row.querySelector<HTMLElement>('[data-round]')
        if (el) countUp(el, Number(el.dataset.round), 1000)
      })
    } else if (!reducedMotion()) {
      rows.forEach(row => {
        const key = row.dataset.map ?? ''
        const prevTop = positions.current.get(key)
        const newTop = row.getBoundingClientRect().top
        if (prevTop !== undefined && Math.abs(prevTop - newTop) > 1) {
          animate(row, { translateY: [prevTop - newTop, 0], duration: 500, ease: 'outCubic' })
        }
      })
    }

    positions.current = new Map(rows.map(r => [r.dataset.map ?? '', r.getBoundingClientRect().top]))
  })

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

      <div ref={listRef} className="flex flex-col gap-1.5">
        {entries.map((entry, index) => (
          <div
            key={entry.map}
            data-map={entry.map}
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
                  <span data-round={entry.record.round} className="font-score font-bold" style={{ color: 'var(--accent)' }}>
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
