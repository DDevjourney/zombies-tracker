export type Game = 'bo1' | 'bo2'

export interface MapInfo {
  name: string
  game: Game
}

export interface Session {
  id: string
  game: Game
  map: string
  round: number
  played_at: string
  created_at: string
  /** Rellenados por api/sync-youtube.ts; null si no hay vídeo asociado. */
  video_id?: string | null
  video_url?: string | null
  video_title?: string | null
}

export type NewSession = Omit<Session, 'id' | 'created_at' | 'video_id' | 'video_url' | 'video_title'>
