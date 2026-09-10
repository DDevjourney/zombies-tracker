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
      className="glass rounded overflow-hidden text-left w-full transition-all outline-none group"
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '')}
    >
      {img && (
        <div className="w-full aspect-video overflow-hidden">
          <img
            src={img}
            alt={mapName}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-3 pb-4 flex flex-col" style={{ height: '80px' }}>
        <h3 className="text-xs font-semibold mb-2 leading-tight" style={{ color: 'var(--text-secondary)' }}>
          {mapName}
        </h3>
        <div className="flex items-center gap-2 mt-auto">
          {record ? (
            <>
              <img src={getRankIcon(record.round)} alt="rank" className="w-7 h-7 object-contain" />
              <div>
                <p className="font-score text-lg leading-none" style={{ color: 'var(--accent)' }}>
                  {record.round}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {new Date(record.played_at + 'T12:00:00').toLocaleDateString('es-ES')}
                </p>
              </div>
            </>
          ) : (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sin récord</p>
          )}
        </div>
      </div>
    </button>
  )
}
