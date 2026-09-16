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

// ---------------------------------------------------------------------------
// Fechas. `played_at` es siempre 'YYYY-MM-DD', así que operamos sobre la cadena
// y usamos UTC internamente para que el cambio de hora no desplace ningún día.
// ---------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, '0')

/** Día de hoy en horario local, como clave 'YYYY-MM-DD'. */
export function todayKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Suma (o resta) días a una clave de fecha. */
export function addDays(key: string, days: number): string {
  const d = new Date(key + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Día de la semana con lunes = 0, domingo = 6. */
export function weekdayIndex(key: string): number {
  return (new Date(key + 'T00:00:00Z').getUTCDay() + 6) % 7
}

export interface ProgressPoint {
  session: Session
  round: number
  /** Récord acumulado hasta esa partida incluida. */
  record: number
  /** La partida batió el récord anterior. */
  isRecord: boolean
}

/**
 * Partidas de un mapa en orden cronológico, con el récord acumulado en cada
 * punto. Es la serie que dibuja la gráfica de progreso.
 */
export function getProgressPoints(sessions: Session[], game: Game, map: string): ProgressPoint[] {
  const ordered = sessions
    .filter(s => s.game === game && s.map === map)
    .sort((a, b) => (a.played_at < b.played_at ? -1 : a.played_at > b.played_at ? 1 : 0))

  let record = 0
  return ordered.map(session => {
    const isRecord = session.round > record
    if (isRecord) record = session.round
    return { session, round: session.round, record, isRecord }
  })
}

/** Número de partidas por día, indexado por clave de fecha. */
export function getActivityCounts(sessions: Session[], game: Game): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const s of sessions) {
    if (s.game !== game) continue
    counts[s.played_at] = (counts[s.played_at] ?? 0) + 1
  }
  return counts
}

/**
 * Rejilla del mes al que pertenece `refKey`: filas de 7 días, de lunes a
 * domingo. Los huecos antes del día 1 y después del último son `null`.
 */
export function buildMonthGrid(refKey: string): Array<Array<string | null>> {
  const firstDay = refKey.slice(0, 8) + '01'
  const lead = weekdayIndex(firstDay)
  const month = refKey.slice(0, 7)

  const cells: Array<string | null> = Array(lead).fill(null)
  for (let day = firstDay; day.startsWith(month); day = addDays(day, 1)) {
    cells.push(day)
  }
  while (cells.length % 7 !== 0) cells.push(null)

  return Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7))
}

/** Días del mes de `refKey` que ya han pasado (o son hoy). */
export function monthDaysUpTo(refKey: string): string[] {
  return buildMonthGrid(refKey)
    .flat()
    .filter((d): d is string => d !== null && d <= refKey)
}

/** Mejor partida del mes natural al que pertenece `refKey`. */
export function getBestOfMonth(
  sessions: Session[],
  game: Game,
  refKey: string = todayKey()
): Session | null {
  const prefix = refKey.slice(0, 7)
  const month = sessions.filter(s => s.game === game && s.played_at.startsWith(prefix))
  if (month.length === 0) return null
  return month.reduce((best, s) => (s.round > best.round ? s : best))
}
