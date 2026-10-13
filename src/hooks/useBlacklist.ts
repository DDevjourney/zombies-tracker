import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { BlacklistEntry } from '../types'

export function useBlacklist() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEntries() {
      const { data, error } = await supabase
        .from('blacklist')
        .select('*')
        .order('name', { ascending: true })

      if (error) console.error('Error al cargar la lista negra:', error)
      else setEntries(data ?? [])
      setLoading(false)
    }

    fetchEntries()
  }, [])

  /** Añade los nombres que aún no estén (sin distinguir mayúsculas). */
  const addNames = useCallback(
    async (names: string[]): Promise<void> => {
      const known = new Set(entries.map(e => e.name.toLowerCase()))
      const fresh: string[] = []
      for (const raw of names) {
        const name = raw.trim()
        if (!name || known.has(name.toLowerCase())) continue
        known.add(name.toLowerCase())
        fresh.push(name)
      }
      if (fresh.length === 0) return

      const { data, error } = await supabase
        .from('blacklist')
        .insert(fresh.map(name => ({ name })))
        .select()

      if (error) throw error

      setEntries(prev =>
        [...prev, ...(data as BlacklistEntry[])].sort((a, b) => a.name.localeCompare(b.name))
      )
    },
    [entries]
  )

  const removeEntry = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from('blacklist').delete().eq('id', id)
    if (error) throw error
    setEntries(prev => prev.filter(e => e.id !== id))
  }, [])

  return { entries, loading, addNames, removeEntry }
}
