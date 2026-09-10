import { useState, type FormEvent } from 'react'
import { MAPS } from '../data/maps'
import type { Game, NewSession } from '../types'

interface AddSessionModalProps {
  game: Game
  defaultMap: string | null
  onAdd: (session: NewSession) => Promise<{ isRecord: boolean }>
  onClose: () => void
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(2, 5, 18, 0.9)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  padding: '8px 12px',
  width: '100%',
  outline: 'none',
  fontSize: '14px',
}

export function AddSessionModal({ game, defaultMap, onAdd, onClose }: AddSessionModalProps) {
  const maps = MAPS[game]
  const [map, setMap] = useState(defaultMap ?? maps[0].name)
  const [round, setRound] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [newRecord, setNewRecord] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [savedRound, setSavedRound] = useState(0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const result = await onAdd({ game, map, round: Number(round), played_at: date })
      setSavedRound(Number(round))
      if (result.isRecord) {
        setNewRecord(true)
        setTimeout(onClose, 2500)
      } else {
        onClose()
      }
    } catch (err) {
      console.error('Error al guardar la partida:', err)
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div
        className="glass-elevated w-full max-w-sm rounded p-6"
      >
        {newRecord ? (
          <div className="text-center py-8">
            <p className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--danger)', letterSpacing: '0.05em' }}>
              ¡NUEVO RÉCORD!
            </p>
            <p className="font-score text-4xl" style={{ color: 'var(--accent)' }}>
              {savedRound}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{map}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>
              Añadir partida
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Mapa</label>
              <select value={map} onChange={e => setMap(e.target.value)} style={inputStyle}>
                {maps.map(m => (
                  <option key={m.name} value={m.name} style={{ backgroundColor: '#02050f' }}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ronda alcanzada</label>
              <input
                type="number"
                min={1}
                value={round}
                onChange={e => setRound(e.target.value)}
                placeholder="Ej: 25"
                required
                style={inputStyle}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Fecha</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded text-sm font-semibold transition-colors"
                style={{ background: 'rgba(2, 5, 18, 0.6)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !round}
                className="flex-1 py-2 rounded font-display font-bold text-sm disabled:opacity-40"
                style={{ backgroundColor: 'var(--accent)', color: '#02020f', letterSpacing: '0.04em' }}
                onMouseEnter={e => { if (!submitting && round) e.currentTarget.style.backgroundColor = 'var(--accent-dim)' }}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
              >
                {submitting ? 'Guardando...' : 'GUARDAR'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
