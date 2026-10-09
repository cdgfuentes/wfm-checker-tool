import { ARCANE, TradeItem, WEAPON } from '../models/item.model';

// stuff the Holdfasts sell that's on warframe.market
// skipped ephemera, voidshells, sentinel skins, scenes and decorations
// todo: add incarnon?? maybe?idk
export const HOLDFAST_ITEMS: TradeItem[] = [
  // arcanes
  { group: ARCANE, name: 'Eternal Eradicate', slug: 'eternal_eradicate' },
  { group: ARCANE, name: 'Cascadia Accuracy', slug: 'cascadia_accuracy' },
  { group: ARCANE, name: 'Fractalized Reset', slug: 'fractalized_reset' },
  { group: ARCANE, name: 'Molt Vigor', slug: 'molt_vigor' },
  { group: ARCANE, name: 'Emergence Savior', slug: 'emergence_savior' },
  { group: ARCANE, name: 'Eternal Onslaught', slug: 'eternal_onslaught' },
  { group: ARCANE, name: 'Cascadia Flare', slug: 'cascadia_flare' },
  { group: ARCANE, name: 'Cascadia Empowered', slug: 'cascadia_empowered' },
  { group: ARCANE, name: 'Molt Efficiency', slug: 'molt_efficiency' },
  { group: ARCANE, name: 'Emergence Renewed', slug: 'emergence_renewed' },
  { group: ARCANE, name: 'Molt Reconstruct', slug: 'molt_reconstruct' },
  { group: ARCANE, name: 'Eternal Logistics', slug: 'eternal_logistics' },
  { group: ARCANE, name: 'Cascadia Overcharge', slug: 'cascadia_overcharge' },
  { group: ARCANE, name: 'Emergence Dissipate', slug: 'emergence_dissipate' },
  { group: ARCANE, name: 'Molt Augmented', slug: 'molt_augmented' },

  // zariman weapon blueprints
  { group: WEAPON, name: 'Laetum Blueprint', slug: 'laetum_blueprint' },
  { group: WEAPON, name: 'Innodem Blueprint', slug: 'innodem_blueprint' },
  { group: WEAPON, name: 'Phenmor Blueprint', slug: 'phenmor_blueprint' },
  { group: WEAPON, name: 'Felarx Blueprint', slug: 'felarx_blueprint' },
  { group: WEAPON, name: 'Praedos Blueprint', slug: 'praedos_blueprint' },
];
