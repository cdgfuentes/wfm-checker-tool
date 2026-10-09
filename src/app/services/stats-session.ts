import { computed, signal } from '@angular/core';
import { ItemStats, RankStat, TopRow, TradeItem } from '../models/item.model';

// same pacing as the scan, warframe.market is about 3 requests a sec
const START_INTERVAL_MS = 350;
// under this many sales in 48h the price is just noise
const MIN_VOLUME = 5;
const TOP_COUNT = 5;
// buyers usually sit under what stuff really sells for, so suggest a bit lower
const SUGGEST_FACTOR = 0.75;

export type FetchStats = (slug: string, signal: AbortSignal) => Promise<RankStat[]>;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// the highest rank that actually sells (the one people pay for)
function bestRank(ranks: RankStat[]): RankStat | undefined {
  return ranks
    .filter((r) => r.volume >= MIN_VOLUME)
    .sort((a, b) => (b.rank ?? -1) - (a.rank ?? -1))[0];
}

function unrankedOf(ranks: RankStat[]): RankStat | undefined {
  return ranks.find((r) => r.rank === null || r.rank === 0);
}

// prices for one tab's items. lives in MarketService so switching tabs doesnt refetch
export class StatsSession {
  readonly loading = signal(false);
  readonly progress = signal({ done: 0, total: 0 });
  readonly stats = signal<ItemStats[]>([]);

  // top sellers by price, highest first
  readonly top = computed<TopRow[]>(() =>
    this.stats()
      .flatMap(({ item, ranks }) => {
        const best = bestRank(ranks);
        if (!best) return [];
        const unranked = best.rank ? unrankedOf(ranks) : undefined;
        return [
          {
            name: item.name,
            group: item.group,
            rank: best.rank,
            price: best.price,
            volume: best.volume,
            unrankedPrice: unranked ? unranked.price : null,
          },
        ];
      })
      .sort((a, b) => b.price - a.price)
      .slice(0, TOP_COUNT),
  );

  private readonly cache = new Map<string, RankStat[]>();
  private controller: AbortController | null = null;

  constructor(private readonly fetchStats: FetchStats) {}

  // suggested min plat = a bit under the middle price of this tab's items
  // not shown in the ui for now (WIP)
  suggestedMin(unranked: boolean): number | null {
    const prices = this.stats().flatMap(({ ranks }) => {
      const r = unranked ? unrankedOf(ranks) : bestRank(ranks);
      return r && r.volume >= MIN_VOLUME ? [r.price] : [];
    });
    if (prices.length < 3) return null;
    prices.sort((a, b) => a - b);
    return Math.max(1, Math.round(prices[Math.floor(prices.length / 2)] * SUGGEST_FACTOR));
  }

  // stop pricing, ex: the tab changed to something we dont price
  cancel(): void {
    this.controller?.abort();
    this.controller = null;
    this.loading.set(false);
  }

  async load(items: TradeItem[], force = false): Promise<void> {
    this.controller?.abort();
    const controller = new AbortController();
    this.controller = controller;

    if (force) items.forEach((i) => this.cache.delete(i.slug));

    const publish = () => {
      if (controller.signal.aborted) return;
      this.stats.set(
        items.flatMap((item) => {
          const ranks = this.cache.get(item.slug);
          return ranks ? [{ item, ranks }] : [];
        }),
      );
    };
    publish();

    const missing = items.filter((i) => !this.cache.has(i.slug));
    this.progress.set({ done: 0, total: missing.length });
    if (!missing.length) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);

    const pending: Promise<void>[] = [];
    for (const item of missing) {
      if (controller.signal.aborted) break;
      pending.push(this.loadOne(item, controller.signal, publish));
      await sleep(START_INTERVAL_MS);
    }
    await Promise.all(pending);

    if (this.controller === controller) this.loading.set(false);
  }

  private async loadOne(item: TradeItem, abort: AbortSignal, publish: () => void) {
    try {
      this.cache.set(item.slug, await this.fetchStats(item.slug, abort));
      publish();
    } catch {
      // todo: show which ones failed?? for now it just wont be in the list
    } finally {
      if (!abort.aborted) this.progress.update((p) => ({ ...p, done: p.done + 1 }));
    }
  }
}
