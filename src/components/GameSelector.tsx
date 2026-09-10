import type { Game } from '../types'
import { GAME_COVERS } from '../data/images'

interface GameSelectorProps {
  selected: Game
  onChange: (game: Game) => void
}

export function GameSelector({ selected, onChange }: GameSelectorProps) {
  return (
    <div className="flex gap-4 justify-center p-4">
      {(['bo1', 'bo2'] as Game[]).map(game => (
        <button
          key={game}
          onClick={() => onChange(game)}
          className="relative rounded overflow-hidden transition-all outline-none"
          style={{
            opacity: selected === game ? 1 : 0.4,
            outline: selected === game ? '2px solid var(--accent)' : 'none',
            outlineOffset: '2px',
            transform: selected === game ? 'scale(1.04)' : 'scale(1)',
          }}
          onMouseEnter={e => {
            if (selected !== game) e.currentTarget.style.opacity = '0.65'
          }}
          onMouseLeave={e => {
            if (selected !== game) e.currentTarget.style.opacity = '0.4'
          }}
        >
          <img
            src={GAME_COVERS[game]}
            alt={game === 'bo1' ? 'Black Ops 1' : 'Black Ops 2'}
            className="h-20 w-auto object-cover"
          />
        </button>
      ))}
    </div>
  )
}
