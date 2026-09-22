import { useEffect, useRef, useState, type FormEvent } from 'react'
import { animate, createTimeline, reducedMotion, shake } from '../lib/motion'
import { getRankIcon } from '../data/images'
import { MAPS } from '../data/maps'
import { todayKey } from '../utils/stats'
import type { Game, NewSession, Session } from '../types'

interface AddSessionModalProps {
  game: Game
  defaultMap: string | null
  onAdd: (session: NewSession) => Promise<{ isRecord: boolean }>
  /** Partida a modificar. Si viene, el modal entra en modo edición. */
  editing?: Session | null
  onUpdate?: (id: string, changes: NewSession) => Promise<{ isRecord: boolean }>
  onClose: () => void
}

export function AddSessionModal({
  game,
  defaultMap,
  onAdd,
  editing,
  onUpdate,
  onClose,
}: AddSessionModalProps) {
  const maps = MAPS[game]
  const isEdit = !!editing
  const [map, setMap] = useState(editing?.map ?? defaultMap ?? maps[0].name)
  const [round, setRound] = useState(editing ? String(editing.round) : '')
  const [date, setDate] = useState(editing?.played_at ?? todayKey())
  const [note, setNote] = useState(editing?.note ?? '')
  const [saved, setSaved] = useState(false)
  const [newRecord, setNewRecord] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [savedRound, setSavedRound] = useState(0)
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const recordRef = useRef<HTMLDivElement>(null)
  const closing = useRef(false)

  useEffect(() => {
    if (reducedMotion() || !backdropRef.current || !panelRef.current) return
    animate(backdropRef.current, { opacity: [0, 1], duration: 200, ease: 'outQuad' })
    animate(panelRef.current, { opacity: [0, 1], scale: [0.9, 1], duration: 300, ease: 'outCubic' })
  }, [])

  useEffect(() => {
    if (!saved || reducedMotion() || !recordRef.current || !panelRef.current) return
    const [title, row] = Array.from(recordRef.current.children) as HTMLElement[]
    const [icon, num] = Array.from(row.children) as HTMLElement[]
    if (newRecord) shake(panelRef.current, 10)
    createTimeline()
      .add(title, { opacity: [0, 1], scale: [1.6, 1], duration: 400, ease: 'outBack(2)' })
      .add(num, { opacity: [0, 1], translateY: [20, 0], duration: 350, ease: 'outCubic' }, '-=150')
      .add(num, { color: [newRecord ? '#cf2929' : '#e8a030', '#e8a030'], duration: 700 })
      .add(icon, {
        opacity: [0, 1],
        scale: [0, 1.5, 1],
        rotate: [-30, 0],
        filter: [
          'drop-shadow(0 0 0px rgba(207,41,41,0))',
          'drop-shadow(0 0 18px rgba(207,41,41,1))',
          'drop-shadow(0 0 6px rgba(207,41,41,0.6))',
        ],
        duration: 900,
        ease: 'outElastic(1, .5)',
      }, '-=800')
  }, [saved, newRecord])

  function close() {
    if (closing.current) return
    if (reducedMotion() || !backdropRef.current || !panelRef.current) {
      onClose()
      return
    }
    closing.current = true
    animate(backdropRef.current, { opacity: 0, duration: 200, ease: 'inQuad' })
    animate(panelRef.current, { opacity: 0, scale: 0.92, duration: 200, ease: 'inQuad', onComplete: onClose })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const trimmedNote = note.trim()
      const changes: NewSession = {
        game,
        map,
        round: Number(round),
        played_at: date,
        note: trimmedNote || null,
      }
      const result = editing && onUpdate
        ? await onUpdate(editing.id, changes)
        : await onAdd(changes)
      setSavedRound(Number(round))
      setNewRecord(result.isRecord)
      setSaved(true)
      setTimeout(close, result.isRecord ? 2500 : 1600)
    } catch (err) {
      console.error('Error al guardar la partida:', err)
      setSubmitting(false)
    }
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
    >
      <div ref={panelRef} className="glass-elevated chamfer w-full max-w-sm p-6" role="dialog" aria-modal="true">
        {saved ? (
          <div ref={recordRef} className="text-center py-8">
            <p
              className="font-display text-3xl font-bold mb-2"
              style={{ color: newRecord ? 'var(--danger)' : 'var(--text)', letterSpacing: '0.05em' }}
            >
              {newRecord ? '¡NUEVO RÉCORD!' : isEdit ? 'PARTIDA ACTUALIZADA' : 'PARTIDA GUARDADA'}
            </p>
            <div className="flex items-center justify-center gap-4">
              <img src={getRankIcon(savedRound)} alt="rank" className="w-16 h-16 object-contain" />
              <p className="font-score text-4xl" style={{ color: 'var(--accent)' }}>
                {savedRound}
              </p>
            </div>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{map}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <p className="hud-label mb-1">{isEdit ? 'Edición' : 'Nueva entrada'}</p>
              <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {isEdit ? 'Editar partida' : 'Añadir partida'}
              </h2>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="hud-label">Mapa</label>
              <select value={map} onChange={e => setMap(e.target.value)} className="field">
                {maps.map(m => (
                  <option key={m.name} value={m.name} style={{ backgroundColor: '#02050f' }}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="hud-label">Ronda alcanzada</label>
              <input
                type="number"
                min={1}
                autoFocus
                value={round}
                onChange={e => setRound(e.target.value)}
                placeholder="Ej: 25"
                required
                className="field font-score text-lg"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="hud-label">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="field"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="hud-label">Nota (opcional)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Ej: partida en solitario, se cayó el juego…"
                rows={3}
                maxLength={500}
                className="field resize-none"
              />
            </div>

            <div className="flex gap-2 mt-1">
              <button type="button" onClick={close} className="btn btn-ghost flex-1">
                Cancelar
              </button>
              <button type="submit" disabled={submitting || !round} className="btn btn-primary flex-1">
                {submitting ? 'Guardando…' : isEdit ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
