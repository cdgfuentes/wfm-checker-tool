export type Syndicate = 'meridian' | 'hexis' | 'suda' | 'perrin' | 'redveil' | 'newloka';

export const SYNDICATE_NAMES: Record<Syndicate, string> = {
  meridian: 'Steel Meridian',
  hexis: 'Arbiters of Hexis',
  suda: 'Cephalon Suda',
  perrin: 'The Perrin Sequence',
  redveil: 'Red Veil',
  newloka: 'New Loka',
};

// item types, holdfast and hex use these
export const ARCANE = 'Arcane';
export const WEAPON = 'Weapon';

// anything we can look up on warframe.market
export interface TradeItem {
  name: string;
  slug: string;
  // warframe for augments, item type (Arcane / Weapon) for the rest
  group: string;
}

export interface Augment extends TradeItem {
  syndicates: Syndicate[];
}

export type BuyerStatus = 'ingame' | 'online';
export type RankFilter = 'any' | 'unranked';

// might use later idk
export type SortBy = 'plat' | 'name' | 'buyer';

export interface ScanOptions {
  minPlat: number;
  status: BuyerStatus;
  rank: RankFilter;
}

// how one rank of an item sold in the last 48h
export interface RankStat {
  rank: number | null;
  volume: number;
  price: number;
}

export interface ItemStats {
  item: TradeItem;
  ranks: RankStat[];
}

// one row of the best sellers table
export interface TopRow {
  name: string;
  group: string;
  rank: number | null;
  price: number;
  volume: number;
  unrankedPrice: number | null;
}

export interface Hit {
  name: string;
  slug: string;
  platinum: number;
  buyer: string;
  rank: number | null;
  status: string;
}

export interface FetchError {
  name: string;
  group: string;
  slug: string;
  message: string;
}
