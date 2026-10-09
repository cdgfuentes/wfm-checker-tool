import { TradeItem } from '../models/item.model';

// skipped blueprints, archon shards, adapters, decorations and scenes, not worth it imo (I THINK?)
export const MELEE_ARCANE = 'Melee arcane';
export const NECRAMECH_MOD = 'Necramech mod';

export const CAVIA_ITEMS: TradeItem[] = [
  // melee arcanes
  { group: MELEE_ARCANE, name: 'Melee Retaliation', slug: 'melee_retaliation' },
  { group: MELEE_ARCANE, name: 'Melee Fortification', slug: 'melee_fortification' },
  { group: MELEE_ARCANE, name: 'Melee Exposure', slug: 'melee_exposure' },
  { group: MELEE_ARCANE, name: 'Melee Influence', slug: 'melee_influence' },
  { group: MELEE_ARCANE, name: 'Melee Animosity', slug: 'melee_animosity' },
  { group: MELEE_ARCANE, name: 'Melee Vortex', slug: 'melee_vortex' },

  // necramech mods
  { group: NECRAMECH_MOD, name: 'Necramech Blitz', slug: 'necramech_blitz' },
  { group: NECRAMECH_MOD, name: 'Necramech Enemy Sense', slug: 'necramech_enemy_sense' },
  { group: NECRAMECH_MOD, name: 'Necramech Deflection', slug: 'necramech_deflection' },
  { group: NECRAMECH_MOD, name: 'Necramech Slipstream', slug: 'necramech_slipstream' },
  { group: NECRAMECH_MOD, name: 'Necramech Aviator', slug: 'necramech_aviator' },
  { group: NECRAMECH_MOD, name: 'Necramech Fury', slug: 'necramech_fury' },
  { group: NECRAMECH_MOD, name: 'Necramech Reach', slug: 'necramech_reach' },
  { group: NECRAMECH_MOD, name: 'Necramech Redirection', slug: 'necramech_redirection' },
  { group: NECRAMECH_MOD, name: 'Necramech Augur', slug: 'necramech_augur' },
  { group: NECRAMECH_MOD, name: 'Necramech Rebuke', slug: 'necramech_rebuke' },
  { group: NECRAMECH_MOD, name: 'Necramech Rage', slug: 'necramech_rage' },
  { group: NECRAMECH_MOD, name: 'Necramech Hydraulics', slug: 'necramech_hydraulics' },
  { group: NECRAMECH_MOD, name: 'Necramech Repair', slug: 'necramech_repair' },
  { group: NECRAMECH_MOD, name: 'Necramech Steel Fiber', slug: 'necramech_steel_fiber' },
  { group: NECRAMECH_MOD, name: 'Necramech Continuity', slug: 'necramech_continuity' },
  { group: NECRAMECH_MOD, name: 'Necramech Stretch', slug: 'necramech_stretch' },
  { group: NECRAMECH_MOD, name: 'Necramech Seismic Wave', slug: 'necramech_seismic_wave' },
  { group: NECRAMECH_MOD, name: 'Necramech Streamline', slug: 'necramech_streamline' },
  { group: NECRAMECH_MOD, name: 'Necramech Thrusters', slug: 'necramech_thrusters' },
];
