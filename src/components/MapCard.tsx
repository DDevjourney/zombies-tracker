import { useEffect, useRef } from 'react'
import type { Session } from '../types'
import { MAP_IMAGES, getRankIcon } from '../data/images'
import { animate, reducedMotion, shake, pulseGlow } from '../lib/motion'

interface MapCardProps {
  mapName: string
  record: Session | null
  onClick: () => void
  /** Changes whenever this map gets a new record; 0 means never. */
  flashTs?: number
}

export function MapCard({ mapName, record, onClick, flashTs = 0 }: MapCardProps) {
  const img = MAP_IMAGES[mapName]
  const cardRef = useRef<HTMLButtonElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const roundRef = useRef<HTMLParagraphElement>(null)
  const rankRef = useRef<HTMLImageElement>(null)
  const prevRank = useRef<string | null>(null)

  const rankIcon = record ? getRankIcon(record.round) : null

  useEffect(() => {
    const rankChanged = prevRank.current !== null && prevRank.current !== rankIcon
    prevRank.current = rankIcon
    if (!flashTs || !cardRef.current) return
    shake(cardRef.current, 6)
    if (roundRef.current && !reducedMotion()) {
      animate(roundRef.current, {
        color: ['#cf2929', '#cf2929', '#e8a030'],
        scale: [1.4, 1.4, 1],
        duration: 1000,
        ease: 'outCubic',
      })
    }
    if (rankChanged && rankRef.current) pulseGlow(rankRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashTs, rankIcon])

  function hover(on: boolean) {
    const card = cardRef.current
    if (!card) return
    card.style.borderColor = on ? 'var(--border-strong)' : ''
    if (reducedMotion()) return
    animate(card, { translateY: on ? -4 : 0, duration: 250, ease: 'outCubic' })
    if (imgRef.current) animate(imgRef.current, { scale: on ? 1.06 : 1, duration: 350, ease: 'outCubic' })
  }

  return (
    <button
      ref={cardRef}
      data-map-card
      onClick={onClick}
      className="glass rounded overflow-hidden text-left w-full outline-none"
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
    >
      {img && (
        <div className="w-full aspect-video overflow-hidden">
          <img ref={imgRef} src={img} alt={mapName} className="w-full h-full object-cover object-top" />
        </div>
      )}
      <div className="p-3 pb-4 flex flex-col" style={{ height: '80px' }}>
        <h3 className="text-xs font-semibold mb-2 leading-tight" style={{ color: 'var(--text-secondary)' }}>
          {mapName}
        </h3>
        <div className="flex items-center gap-2 mt-auto">
          {record && rankIcon ? (
            <>
              <img ref={rankRef} src={rankIcon} alt="rank" className="w-7 h-7 object-contain" />
              <div>
                <p
                  ref={roundRef}
                  className="font-score text-lg leading-none origin-left"
                  style={{ color: 'var(--accent)' }}
                >
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
