/**
 * Lógica pura de emparejar vídeos de YouTube con partidas. Sin dependencias
 * de red ni de Supabase, para poder probarla y reutilizarla desde la función
 * serverless.
 */

export interface YouTubeVideo {
  id: string
  title: string
  /** ISO 8601, tal y como lo devuelve la API. */
  publishedAt: string
}

export interface SyncableSession {
  id: string
  /** YYYY-MM-DD */
  played_at: string
  created_at: string
  video_id: string | null
}

export interface VideoAssignment {
  sessionId: string
  video: YouTubeVideo
}

/** Días de margen entre la partida y la subida del vídeo. */
export const MAX_DAYS_AFTER_GAME = 7

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Empareja vídeos (del más nuevo al más viejo) con la partida más reciente
 * que aún no tenga vídeo. Un vídeo solo se asigna si se publicó el mismo día
 * de la partida o hasta MAX_DAYS_AFTER_GAME días después, para no colgar un
 * vídeo antiguo a una partida nueva ni al revés.
 */
export function pairVideosWithSessions(
  videos: YouTubeVideo[],
  sessions: SyncableSession[]
): VideoAssignment[] {
  const alreadyAssigned = new Set(sessions.map(s => s.video_id).filter(Boolean))
  const free = sessions
    .filter(s => !s.video_id)
    .sort((a, b) => {
      if (a.played_at !== b.played_at) return a.played_at < b.played_at ? 1 : -1
      return a.created_at < b.created_at ? 1 : -1
    })

  const newestFirst = [...videos].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
  const result: VideoAssignment[] = []

  for (const video of newestFirst) {
    if (alreadyAssigned.has(video.id)) continue
    const published = new Date(video.publishedAt).getTime()

    const idx = free.findIndex(s => {
      const played = new Date(s.played_at + 'T00:00:00Z').getTime()
      const diff = published - played
      return diff >= 0 && diff <= (MAX_DAYS_AFTER_GAME + 1) * DAY_MS
    })
    if (idx === -1) continue

    const [session] = free.splice(idx, 1)
    result.push({ sessionId: session.id, video })
    alreadyAssigned.add(video.id)
  }

  return result
}

export function videoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}
