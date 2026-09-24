import type { ProgressPoint } from '../utils/stats'

interface ProgressChartProps {
  points: ProgressPoint[]
}

const W = 600
const H = 160
const PAD = { top: 12, right: 12, bottom: 24, left: 32 }

/** Línea de récord acumulado con puntos por partida. Escala fija en el eje X por índice. */
export function ProgressChart({ points }: ProgressChartProps) {
  const maxRound = Math.max(...points.map(p => p.round), 1)
  const yMax = Math.ceil(maxRound / 5) * 5
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
  const y = (v: number) => PAD.top + innerH - (v / yMax) * innerH

  const recordPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.round)}`).join(' ')
  const ticks = [0, yMax / 2, yMax]
  const first = points[0].session.played_at
  const last = points[points.length - 1].session.played_at
  const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

  return (
    <div className="glass chamfer p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="hud-label">Progreso</p>
        <div className="flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5" style={{ background: 'var(--chart-record)' }} />
            Récord
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--chart-session)' }} />
            Partida
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Progreso de rondas en ${points.length} partidas, récord ${maxRound}`}
      >
        {ticks.map(t => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" />
            <text x={PAD.left - 6} y={y(t) + 4} fontSize="11" textAnchor="end" fill="var(--text-muted)" className="font-score">
              {t}
            </text>
          </g>
        ))}
        <path d={recordPath} fill="none" stroke="var(--chart-record)" strokeWidth="2" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle
            key={p.session.id}
            cx={x(i)}
            cy={y(p.round)}
            r={p.isRecord ? 4.5 : 3}
            fill={p.isRecord ? 'var(--chart-record)' : 'var(--chart-session)'}
            stroke="var(--chart-surface)"
            strokeWidth="1.5"
          >
            <title>{`Ronda ${p.round} · ${fmt(p.session.played_at)}`}</title>
          </circle>
        ))}
        <text x={PAD.left} y={H - 6} fontSize="11" fill="var(--text-muted)">{fmt(first)}</text>
        <text x={W - PAD.right} y={H - 6} fontSize="11" textAnchor="end" fill="var(--text-muted)">{fmt(last)}</text>
      </svg>
    </div>
  )
}
