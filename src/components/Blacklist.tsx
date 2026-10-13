import { useState, type FormEvent } from 'react'
import type { BlacklistEntry } from '../types'

interface BlacklistProps {
  entries: BlacklistEntry[]
  onAdd: (names: string[]) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export function Blacklist({ entries, onAdd, onRemove }: BlacklistProps) {
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)

  const q = query.trim().toLowerCase()
  const filtered = q ? entries.filter(e => e.name.toLowerCase().includes(q)) : entries
  const exact = q ? entries.find(e => e.name.toLowerCase() === q) : undefined

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!q || exact) return
    setBusy(true)
    try {
      await onAdd([query])
      setQuery('')
    } catch (err) {
      console.error('Error al añadir a la lista negra:', err)
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(id: string) {
    try {
      await onRemove(id)
    } catch (err) {
      console.error('Error al quitar de la lista negra:', err)
    }
  }

  return (
    <div className="p-4">
      <p className="hud-label">Jugadores a evitar</p>
      <h2 className="font-display text-3xl font-bold mb-4 leading-none mt-1" style={{ color: 'var(--text)' }}>
        Lista negra
      </h2>

      <form onSubmit={handleAdd} className="flex gap-2 mb-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar o añadir un nombre…"
          maxLength={60}
          className="field flex-1 min-w-0"
          aria-label="Buscar o añadir jugador"
        />
        <button type="submit" disabled={busy || !q || !!exact} className="btn btn-primary">
          Añadir
        </button>
      </form>

      {q && (
        <p
          className="text-sm mb-3 font-score"
          style={{ color: exact ? 'var(--danger)' : 'var(--text-muted)' }}
        >
          {exact ? `⚠ ${exact.name} está en la lista negra: sal de la partida` : 'No está en la lista negra'}
        </p>
      )}

      {entries.length === 0 && (
        <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          Todavía no hay nadie en la lista negra
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        {filtered.map(entry => (
          <div key={entry.id} className="glass chamfer flex items-center gap-3 px-4 py-3">
            <span className="flex-1 min-w-0 text-sm break-words" style={{ color: 'var(--text)' }}>
              {entry.name}
            </span>
            <button
              type="button"
              onClick={() => handleRemove(entry.id)}
              className="btn btn-ghost shrink-0"
              aria-label={`Quitar a ${entry.name} de la lista negra`}
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
