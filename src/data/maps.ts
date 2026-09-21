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
    // Lanzamiento (Green Run + Nuketown) — noviembre 2012
    { name: 'TranZit', game: 'bo2' },
    { name: 'Bus Depot', game: 'bo2' },
    { name: 'Granja', game: 'bo2' },
    { name: 'Pueblo', game: 'bo2' },
    { name: 'Nuketown Zombies', game: 'bo2' },
    // DLC
    { name: 'Die Rise', game: 'bo2' },       // Revolution — feb 2013
    { name: 'Mob of the Dead', game: 'bo2' }, // Uprising — abr 2013
    { name: 'Buried', game: 'bo2' },         // Vengeance — jul 2013
    { name: 'Origins', game: 'bo2' },        // Apocalypse — ago 2013
    // Grief (Pena), mismo orden de DLC que sus mapas base
    { name: 'TranZit (Pena)', game: 'bo2' }, // Bus Depot — lanzamiento
    { name: 'Granja (Pena)', game: 'bo2' },  // lanzamiento
    { name: 'Pueblo (Pena)', game: 'bo2' },  // lanzamiento
    { name: 'Mob (Pena)', game: 'bo2' },     // Uprising
    { name: 'Buried (Pena)', game: 'bo2' },  // Vengeance
  ],
}
