import { useState, type FormEvent } from 'react'
import { MAPS } from '../data/maps'
import type { Game, NewSession } from '../types'

interface AddSessionModalProps {
  game: Game
  defaultMap: string | null
  onAdd: (session: NewSession) => Promise<{ isRecord: boolean }>
  onClose: () => void
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm border border-gray-600">
        {newRecord ? (
          <div className="text-center py-8">
            <p className="text-orange-400 text-3xl font-bold mb-2">¡Nuevo récord!</p>
            <p className="text-white text-xl font-mono">Ronda {savedRound}</p>
            <p className="text-gray-500 mt-1">{map}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-white text-xl font-bold">Añadir partida</h2>

            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-sm">Mapa</label>
              <select
                value={map}
                onChange={e => setMap(e.target.value)}
                className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:border-orange-500"
              >
                {maps.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-sm">Ronda alcanzada</label>
              <input
                type="number"
                min={1}
                value={round}
                onChange={e => setRound(e.target.value)}
                placeholder="Ej: 25"
                required
                className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-sm">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !round}
                className="flex-1 py-2 rounded bg-orange-500 text-white font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
