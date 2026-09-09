import { describe, it, expect } from 'vitest'
import {
  getRecord,
  getHistory,
  isNewRecord,
  getFavoriteMap,
  getBestGlobalRecord,
  getTotalSessions,
  getLeaderboard,
} from './stats'
import type { Session } from '../types'

const S = (overrides: Partial<Session> & Pick<Session, 'map' | 'round' | 'played_at'>): Session => ({
  id: Math.random().toString(),
  game: 'bo1',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

const sessions: Session[] = [
  S({ map: 'Kino der Toten', round: 25, played_at: '2024-01-01' }),
  S({ map: 'Kino der Toten', round: 42, played_at: '2024-02-01' }),
  S({ map: 'Kino der Toten', round: 10, played_at: '2024-03-01' }),
  S({ map: 'Moon', round: 15, played_at: '2024-01-15' }),
  S({ map: 'TranZit', round: 10, played_at: '2024-01-20', game: 'bo2' }),
]

describe('getRecord', () => {
  it('devuelve la sesión con la ronda más alta del mapa', () => {
    const result = getRecord(sessions, 'bo1', 'Kino der Toten')
    expect(result?.round).toBe(42)
  })

  it('devuelve null si no hay sesiones para ese mapa', () => {
    expect(getRecord(sessions, 'bo1', 'Five')).toBeNull()
  })

  it('no mezcla sesiones de distintos juegos', () => {
    expect(getRecord(sessions, 'bo1', 'TranZit')).toBeNull()
  })
})

describe('getHistory', () => {
  it('devuelve las sesiones de un mapa ordenadas por fecha descendente', () => {
    const result = getHistory(sessions, 'bo1', 'Kino der Toten')
    expect(result).toHaveLength(3)
    expect(result[0].played_at).toBe('2024-03-01')
    expect(result[1].played_at).toBe('2024-02-01')
    expect(result[2].played_at).toBe('2024-01-01')
  })

  it('devuelve array vacío si no hay sesiones', () => {
    expect(getHistory(sessions, 'bo1', 'Five')).toEqual([])
  })
})

describe('isNewRecord', () => {
  it('devuelve true si la ronda supera el récord actual', () => {
    expect(isNewRecord(sessions, 'bo1', 'Kino der Toten', 50)).toBe(true)
  })

  it('devuelve false si la ronda no supera el récord', () => {
    expect(isNewRecord(sessions, 'bo1', 'Kino der Toten', 42)).toBe(false)
  })

  it('devuelve true si no hay récord previo', () => {
    expect(isNewRecord(sessions, 'bo1', 'Five', 1)).toBe(true)
  })
})

describe('getFavoriteMap', () => {
  it('devuelve el mapa con más sesiones', () => {
    expect(getFavoriteMap(sessions, 'bo1')).toBe('Kino der Toten')
  })

  it('devuelve null si no hay sesiones', () => {
    expect(getFavoriteMap([], 'bo1')).toBeNull()
  })
})

describe('getBestGlobalRecord', () => {
  it('devuelve el mapa y ronda del récord más alto de todos los mapas', () => {
    expect(getBestGlobalRecord(sessions, 'bo1')).toEqual({
      map: 'Kino der Toten',
      round: 42,
    })
  })

  it('devuelve null si no hay sesiones', () => {
    expect(getBestGlobalRecord([], 'bo1')).toBeNull()
  })
})

describe('getTotalSessions', () => {
  it('cuenta solo las sesiones del juego indicado', () => {
    expect(getTotalSessions(sessions, 'bo1')).toBe(4)
    expect(getTotalSessions(sessions, 'bo2')).toBe(1)
  })
})

describe('getLeaderboard', () => {
  it('ordena los mapas por récord descendente, sin récord al final', () => {
    const maps = ['Moon', 'Kino der Toten', 'Five']
    const result = getLeaderboard(sessions, 'bo1', maps)
    expect(result[0].map).toBe('Kino der Toten')
    expect(result[0].record?.round).toBe(42)
    expect(result[1].map).toBe('Moon')
    expect(result[1].record?.round).toBe(15)
    expect(result[2].map).toBe('Five')
    expect(result[2].record).toBeNull()
  })
})
