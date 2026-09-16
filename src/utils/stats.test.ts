import { describe, it, expect } from 'vitest'
import {
  getRecord,
  getHistory,
  isNewRecord,
  getFavoriteMap,
  getBestGlobalRecord,
  getTotalSessions,
  getLeaderboard,
  todayKey,
  addDays,
  weekdayIndex,
  getProgressPoints,
  getActivityCounts,
  buildMonthGrid,
  monthDaysUpTo,
  getBestOfMonth,
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

describe('todayKey', () => {
  it('formatea la fecha local como YYYY-MM-DD', () => {
    expect(todayKey(new Date(2024, 0, 5))).toBe('2024-01-05')
    expect(todayKey(new Date(2024, 11, 31))).toBe('2024-12-31')
  })
})

describe('addDays', () => {
  it('suma y resta días cruzando meses y años', () => {
    expect(addDays('2024-01-31', 1)).toBe('2024-02-01')
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29')
    expect(addDays('2023-12-31', 1)).toBe('2024-01-01')
    expect(addDays('2024-01-01', 0)).toBe('2024-01-01')
  })
})

describe('weekdayIndex', () => {
  it('usa lunes como primer día de la semana', () => {
    expect(weekdayIndex('2024-01-01')).toBe(0) // lunes
    expect(weekdayIndex('2024-01-06')).toBe(5) // sábado
    expect(weekdayIndex('2024-01-07')).toBe(6) // domingo
  })
})

describe('getProgressPoints', () => {
  it('ordena cronológicamente y acumula el récord', () => {
    const points = getProgressPoints(sessions, 'bo1', 'Kino der Toten')
    expect(points.map(p => p.round)).toEqual([25, 42, 10])
    expect(points.map(p => p.record)).toEqual([25, 42, 42])
    expect(points.map(p => p.isRecord)).toEqual([true, true, false])
  })

  it('devuelve vacío para un mapa sin partidas', () => {
    expect(getProgressPoints(sessions, 'bo1', 'Ascension')).toEqual([])
  })

  it('no mezcla juegos', () => {
    expect(getProgressPoints(sessions, 'bo1', 'TranZit')).toEqual([])
    expect(getProgressPoints(sessions, 'bo2', 'TranZit')).toHaveLength(1)
  })
})

describe('getActivityCounts', () => {
  it('cuenta partidas por día del juego indicado', () => {
    const counts = getActivityCounts(sessions, 'bo1')
    expect(counts['2024-01-01']).toBe(1)
    expect(counts['2024-01-15']).toBe(1)
    expect(counts['2024-01-20']).toBeUndefined() // es de bo2
  })

  it('acumula varias partidas el mismo día', () => {
    const sameDay = [
      S({ map: 'Moon', round: 10, played_at: '2024-05-05' }),
      S({ map: 'Five', round: 12, played_at: '2024-05-05' }),
    ]
    expect(getActivityCounts(sameDay, 'bo1')['2024-05-05']).toBe(2)
  })
})

describe('buildMonthGrid', () => {
  it('genera filas de 7 días de lunes a domingo', () => {
    const grid = buildMonthGrid('2024-01-15')
    expect(grid.every(row => row.length === 7)).toBe(true)
    expect(grid.flat().filter(Boolean)).toHaveLength(31)
  })

  it('rellena con null los huecos antes del día 1', () => {
    // El 1 de marzo de 2024 fue viernes: cuatro huecos por delante.
    const grid = buildMonthGrid('2024-03-20')
    expect(grid[0].slice(0, 4)).toEqual([null, null, null, null])
    expect(grid[0][4]).toBe('2024-03-01')
  })

  it('empieza en el día 1 cuando el mes arranca en lunes', () => {
    expect(buildMonthGrid('2024-01-10')[0][0]).toBe('2024-01-01')
  })

  it('cubre febrero bisiesto entero', () => {
    const dias = buildMonthGrid('2024-02-05').flat().filter(Boolean)
    expect(dias).toHaveLength(29)
    expect(dias[28]).toBe('2024-02-29')
  })

  it('no incluye días de otros meses', () => {
    const dias = buildMonthGrid('2024-06-15').flat().filter(Boolean) as string[]
    expect(dias.every(d => d.startsWith('2024-06'))).toBe(true)
  })
})

describe('monthDaysUpTo', () => {
  it('corta en el día de referencia', () => {
    const dias = monthDaysUpTo('2024-01-10')
    expect(dias[0]).toBe('2024-01-01')
    expect(dias[dias.length - 1]).toBe('2024-01-10')
    expect(dias).toHaveLength(10)
  })
})

describe('getBestOfMonth', () => {
  it('devuelve la ronda más alta del mes natural de referencia', () => {
    expect(getBestOfMonth(sessions, 'bo1', '2024-01-28')?.round).toBe(25)
    expect(getBestOfMonth(sessions, 'bo1', '2024-02-10')?.round).toBe(42)
  })

  it('devuelve null si no hay partidas ese mes', () => {
    expect(getBestOfMonth(sessions, 'bo1', '2024-09-01')).toBeNull()
  })

  it('no mezcla juegos', () => {
    expect(getBestOfMonth(sessions, 'bo2', '2024-01-20')?.map).toBe('TranZit')
  })
})
