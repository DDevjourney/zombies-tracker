import type { Game } from '../types'
import { GAME_COVERS } from '../data/images'

interface GameSelectorProps {
  selected: Game
  onChange: (game: Game) => void
}

export function GameSelector({ selected, onChange }: GameSelectorProps) {
  return (
    <div className="flex gap-3 justify-center p-4" role="tablist" aria-label="Juego">
      {(['bo1', 'bo2'] as Game[]).map(game => {
        const active = selected === game
        const label = game === 'bo1' ? 'Black Ops 1' : 'Black Ops 2'
        return (
          <button
            key={game}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(game)}
            className="chamfer relative overflow-hidden outline-none flex items-center gap-3 pr-4"
            style={{
              background: active ? 'rgba(232,160,48,0.10)' : 'rgba(14,12,12,0.7)',
              border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border-soft)'}`,
              boxShadow: active ? 'var(--shadow-accent)' : 'none',
              opacity: active ? 1 : 0.55,
              transition: 'opacity 250ms, box-shadow 250ms, border-color 250ms, background 250ms',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.opacity = '0.8' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.opacity = '0.55' }}
          >
            <img src={GAME_COVERS[game]} alt="" className="h-16 w-auto object-cover" />
            <span className="text-left">
              <span className="block font-display text-base font-bold leading-none" style={{ color: active ? 'var(--accent)' : 'var(--text)' }}>
                {label}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
