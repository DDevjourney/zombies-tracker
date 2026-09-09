import type { Session } from '../types'
import { MAP_IMAGES, getRankIcon } from '../data/images'

interface MapCardProps {
  mapName: string
  record: Session | null
  onClick: () => void
}

export function MapCard({ mapName, record, onClick }: MapCardProps) {
  const img = MAP_IMAGES[mapName]
  return (
    <button
      onClick={onClick}
      className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden text-left hover:border-orange-500 transition-colors w-full"
    >
      {img && (
        <div className="w-full aspect-video overflow-hidden">
          <img src={img} alt={mapName} className="w-full h-full object-cover object-top" />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-white font-bold text-sm mb-2 leading-tight">{mapName}</h3>
        {record ? (
          <div className="flex items-center gap-2">
            <img src={getRankIcon(record.round)} alt="rank" className="w-8 h-8 object-contain" />
            <div>
              <p className="text-orange-400 font-mono text-xl font-bold">{record.round}</p>
              <p className="text-gray-500 text-xs">
                {new Date(record.played_at + 'T12:00:00').toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">Sin récord aún</p>
        )}
      </div>
    </button>
  )
}
