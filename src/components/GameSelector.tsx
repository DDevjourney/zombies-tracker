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
          className={`relative rounded-lg overflow-hidden transition-all ${
            selected === game
              ? 'ring-2 ring-orange-500 scale-105'
              : 'opacity-50 hover:opacity-75'
          }`}
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
