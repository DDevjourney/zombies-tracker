import type { Game } from '../types'

const W = 'https://static.wikia.nocookie.net/callofduty/images'

export const RANK_ICONS = {
  bone:     `${W}/a/aa/Zombie_Rank_1_Icon_BOII.png/revision/latest?cb=20121223023226`,
  skull:    `${W}/4/45/Zombie_Rank_3_Icon_BOII.png/revision/latest?cb=20121223023335`,
  knife:    `${W}/e/ea/Zombie_Rank_5_Icon_BOII.png/revision/latest?cb=20121223023430`,
  shotguns: `${W}/4/4e/Zombie_Rank_7_Icon_BOII.png/revision/latest?cb=20121223024109`,
}

export function getRankIcon(round: number): string {
  if (round >= 31) return RANK_ICONS.shotguns
  if (round >= 21) return RANK_ICONS.knife
  if (round >= 11) return RANK_ICONS.skull
  return RANK_ICONS.bone
}

export const GAME_COVERS: Record<Game, string> = {
  bo1: `${W}/0/02/CoD_Black_Ops_cover.png/revision/latest/scale-to-width-down/211?cb=20120306002815`,
  bo2: `${W}/b/ba/BO2_RP_Boxart.png/revision/latest/scale-to-width-down/243?cb=20120621223442`,
}

export const MAP_IMAGES: Record<string, string> = {
  // BO1
  'Nacht der Untoten': `${W}/b/b5/Night_rezurrection_BO.png/revision/latest/scale-to-width-down/268?cb=20140509151610`,
  'Verrückt': `${W}/d/de/Asylum_rezurrection_BO.png/revision/latest/scale-to-width-down/268?cb=20130427221034`,
  'Shi No Numa': `${W}/2/2b/Swamp_rezurrection_BO.png/revision/latest/scale-to-width-down/268?cb=20130427221656`,
  'Der Riese': `${W}/1/17/Factory_rezurrection_BO.png/revision/latest/scale-to-width-down/268?cb=20130427221447`,
  'Kino der Toten': `${W}/9/97/Kino_Der_Toten_Menu_Selection_BO.png/revision/latest/scale-to-width-down/300?cb=20240710065123`,
  'Five': `${W}/3/34/Five_Menu_Selection_BO.png/revision/latest/scale-to-width-down/267?cb=20240710065748`,
  'Ascension': `${W}/f/fd/Ascension_Menu_Selection_BO.png/revision/latest/scale-to-width-down/300?cb=20240710071357`,
  'Call of the Dead': `${W}/7/78/Call_of_the_Dead_Menu_Selection_BO.png/revision/latest/scale-to-width-down/300?cb=20240710073620`,
  'Shangri-La': `${W}/d/d5/Shangri-La_Menu_Selection_BO.png/revision/latest/scale-to-width-down/300?cb=20240710075204`,
  'Moon': `${W}/c/cc/Moon_Menu_Selection_BO.png/revision/latest/scale-to-width-down/300?cb=20240710075602`,
  // BO2
  'TranZit': `${W}/f/f9/TranZit_lobby_BOII.png/revision/latest/scale-to-width-down/300?cb=20161102222339`,
  'Pueblo': `${W}/f/f8/GRTownSurvival.png/revision/latest/scale-to-width-down/300?cb=20250910155429`,
  'Granja': `${W}/5/5e/GRFarmSurvival.png/revision/latest/scale-to-width-down/300?cb=20250910155625`,
  'Bus Depot': `${W}/1/19/BusDepotSurvival.png/revision/latest/scale-to-width-down/300?cb=20250910155539`,
  'Die Rise': `${W}/6/60/Die_Rise_menu_selection_BO2.png/revision/latest/scale-to-width-down/300?cb=20161102222915`,
  'Mob of the Dead': `${W}/a/aa/Mob_of_the_Dead_menu_selection_BO2.png/revision/latest/scale-to-width-down/300?cb=20161102222825`,
  'Buried': `${W}/7/71/Buried_menu_BOII.png/revision/latest/scale-to-width-down/300?cb=20161102222409`,
  'Origins': `${W}/b/b2/Origins_Lobby_Icon_BO2.png/revision/latest/scale-to-width-down/300?cb=20161102222425`,
  'Nuketown Zombies': `${W}/7/74/Nuketown_menu_selection_BO2.png/revision/latest/scale-to-width-down/300?cb=20161102222934`,
  // BO2 Pena (Grief) — reuse base map images
  'Mob of the Dead (Pena)': `${W}/a/aa/Mob_of_the_Dead_menu_selection_BO2.png/revision/latest/scale-to-width-down/300?cb=20161102222825`,
  'Mob (Pena)': `${W}/a/aa/Mob_of_the_Dead_menu_selection_BO2.png/revision/latest/scale-to-width-down/300?cb=20161102222825`,
  'Pueblo (Pena)': `${W}/f/f8/GRTownSurvival.png/revision/latest/scale-to-width-down/300?cb=20250910155429`,
  'Granja (Pena)': `${W}/5/5e/GRFarmSurvival.png/revision/latest/scale-to-width-down/300?cb=20250910155625`,
  'TranZit (Pena)': `${W}/1/19/BusDepotSurvival.png/revision/latest/scale-to-width-down/300?cb=20250910155539`,
}
