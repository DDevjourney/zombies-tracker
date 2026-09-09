import type { Game, Session } from '../types'

export function getRecord(sessions: Session[], game: Game, map: string): Session | null {
  const mapSessions = sessions.filter(s => s.game === game && s.map === map)
  if (mapSessions.length === 0) return null
  return mapSessions.reduce((best, s) => (s.round > best.round ? s : best))
}

export function getHistory(sessions: Session[], game: Game, map: string): Session[] {
  return sessions
    .filter(s => s.game === game && s.map === map)
    .sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime())
}

export function isNewRecord(sessions: Session[], game: Game, map: string, round: number): boolean {
  const record = getRecord(sessions, game, map)
  return record === null || round > record.round
}

export function getFavoriteMap(sessions: Session[], game: Game): string | null {
  const gameSessions = sessions.filter(s => s.game === game)
  if (gameSessions.length === 0) return null
  const counts: Record<string, number> = {}
  for (const s of gameSessions) {
    counts[s.map] = (counts[s.map] ?? 0) + 1
  }
  return Object.entries(counts).reduce(
    (best, [map, count]) => (count > best[1] ? [map, count] : best),
    ['', 0] as [string, number]
  )[0]
}

export function getBestGlobalRecord(
  sessions: Session[],
  game: Game
): { map: string; round: number } | null {
  const gameSessions = sessions.filter(s => s.game === game)
  if (gameSessions.length === 0) return null
  const best = gameSessions.reduce((b, s) => (s.round > b.round ? s : b))
  return { map: best.map, round: best.round }
}

export function getTotalSessions(sessions: Session[], game: Game): number {
  return sessions.filter(s => s.game === game).length
}

export function getLeaderboard(
  sessions: Session[],
  game: Game,
  maps: string[]
): Array<{ map: string; record: Session | null }> {
  return maps
    .map(map => ({ map, record: getRecord(sessions, game, map) }))
    .sort((a, b) => {
      if (a.record === null && b.record === null) return 0
      if (a.record === null) return 1
      if (b.record === null) return -1
      return b.record.round - a.record.round
    })
}
