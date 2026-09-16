import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { isNewRecord } from '../utils/stats'
import type { Session, NewSession } from '../types'

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSessions() {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error al cargar sesiones:', error)
        setLoading(false)
        return
      }
      setSessions(data ?? [])
      setLoading(false)
    }

    fetchSessions()
  }, [])

  const addSession = useCallback(
    async (newSession: NewSession): Promise<{ isRecord: boolean }> => {
      const willBeRecord = isNewRecord(sessions, newSession.game, newSession.map, newSession.round)

      const { data, error } = await supabase
        .from('sessions')
        .insert(newSession)
        .select()
        .single()

      if (error) throw error

      setSessions(prev => [data as Session, ...prev])
      return { isRecord: willBeRecord }
    },
    [sessions]
  )

  const updateSession = useCallback(
    async (id: string, changes: NewSession): Promise<{ isRecord: boolean }> => {
      const { data, error } = await supabase
        .from('sessions')
        .update(changes)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const updated = data as Session
      // El récord se recalcula sin la versión antigua de esta partida, para que
      // editar a la baja no siga contando el valor anterior.
      const others = sessions.filter(s => s.id !== id)
      const isRecord = isNewRecord(others, updated.game, updated.map, updated.round)

      setSessions(prev => prev.map(s => (s.id === id ? updated : s)))
      return { isRecord }
    },
    [sessions]
  )

  const deleteSession = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) throw error
    setSessions(prev => prev.filter(s => s.id !== id))
  }, [])

  return { sessions, loading, addSession, updateSession, deleteSession }
}
