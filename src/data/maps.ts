import type { Game, MapInfo } from '../types'

export const MAPS: Record<Game, MapInfo[]> = {
  bo1: [
    { name: 'Nacht der Untoten', game: 'bo1' },
    { name: 'Verrückt', game: 'bo1' },
    { name: 'Shi No Numa', game: 'bo1' },
    { name: 'Der Riese', game: 'bo1' },
    { name: 'Kino der Toten', game: 'bo1' },
    { name: 'Five', game: 'bo1' },
    { name: 'Ascension', game: 'bo1' },
    { name: 'Call of the Dead', game: 'bo1' },
    { name: 'Shangri-La', game: 'bo1' },
    { name: 'Moon', game: 'bo1' },
  ],
  bo2: [
    { name: 'TranZit', game: 'bo2' },
    { name: 'Pueblo', game: 'bo2' },
    { name: 'Granja', game: 'bo2' },
    { name: 'Bus Depot', game: 'bo2' },
    { name: 'Die Rise', game: 'bo2' },
    { name: 'Mob of the Dead', game: 'bo2' },
    { name: 'Buried', game: 'bo2' },
    { name: 'Origins', game: 'bo2' },
    { name: 'Nuketown Zombies', game: 'bo2' },
    { name: 'Mob (Pena)', game: 'bo2' },
    { name: 'Pueblo (Pena)', game: 'bo2' },
    { name: 'Granja (Pena)', game: 'bo2' },
    { name: 'TranZit (Pena)', game: 'bo2' },
  ],
}
