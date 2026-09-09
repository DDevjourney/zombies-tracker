import { MapCard } from './MapCard'
import { getRecord } from '../utils/stats'
import { MAPS } from '../data/maps'
import type { Game, Session } from '../types'

interface MapGridProps {
  game: Game
  sessions: Session[]
  onMapClick: (mapName: string) => void
}

export function MapGrid({ game, sessions, onMapClick }: MapGridProps) {
  const maps = MAPS[game]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 items-start">
      {maps.map(map => (
        <MapCard
          key={map.name}
          mapName={map.name}
          record={getRecord(sessions, game, map.name)}
          onClick={() => onMapClick(map.name)}
        />
      ))}
    </div>
  )
}
