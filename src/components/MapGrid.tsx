import { useLayoutEffect, useRef } from 'react'
import { MapCard } from './MapCard'
import { getRecord } from '../utils/stats'
import { MAPS } from '../data/maps'
import { cascadeIn } from '../lib/motion'
import type { Game, Session } from '../types'

export interface RecordFlash {
  map: string
  ts: number
}

interface MapGridProps {
  game: Game
  sessions: Session[]
  onMapClick: (mapName: string) => void
  /** Map name + timestamp of the last new record, to trigger the card celebration. */
  recordFlash: RecordFlash | null
}

export function MapGrid({ game, sessions, onMapClick, recordFlash }: MapGridProps) {
  const maps = MAPS[game]
  const gridRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!gridRef.current) return
    cascadeIn(gridRef.current.querySelectorAll('[data-map-card]'), 50)
  }, [game])

  return (
    <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 items-start">
      {maps.map(map => (
        <MapCard
          key={map.name}
          mapName={map.name}
          record={getRecord(sessions, game, map.name)}
          onClick={() => onMapClick(map.name)}
          flashTs={recordFlash?.map === map.name ? recordFlash.ts : 0}
        />
      ))}
    </div>
  )
}
