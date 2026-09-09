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
}

export type NewSession = Omit<Session, 'id' | 'created_at'>
