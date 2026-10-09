import { computed, signal } from '@angular/core';
import {
  BuyerStatus,
  FetchError,
  Hit,
  RankFilter,
  ScanOptions,
  TradeItem,
} from '../models/item.model';

// warframe.market is about 3 requests a sec. we start one every 350ms but dont wait for the
// reply, so its faster than going one by one (ambot if 350 is the sweet spot hmm..)
const START_INTERVAL_MS = 350;

// might use later idk (stop after X hits so it doesnt go forever??)
const MAX_HITS = 100;

export interface RawOrder {
  platinum?: number;
  rank?: number | null;
  user?: { ingameName?: string; status?: string };
}

export type FetchBuyOrders = (
  slug: string,
  signal: AbortSignal,
  rank: RankFilter,
) => Promise<RawOrder[]>;

// yes there's probably a lib for this. no i dont care
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// everything for one tab's scan (settings, progress, results). the state thingy lol
// lives in MarketService so it survives switching tabs
export class ScanSession {
  // settings
  readonly minPlat = signal(8);
  readonly status = signal<BuyerStatus>('ingame');
  readonly rank = signal<RankFilter>('any');

  // progress + results, naa diri
  readonly running = signal(false);
  readonly hasRun = signal(false);
  readonly progress = signal({ done: 0, total: 0 });
  readonly hits = signal<Hit[]>([]);
  readonly errors = signal<FetchError[]>([]);

  // best offers on top (money first fr)
  readonly sortedHits = computed(() =>
    [...this.hits()].sort((a, b) => b.platinum - a.platinum || a.name.localeCompare(b.name)),
  );

  private controller: AbortController | null = null;

  constructor(private readonly fetchBuyOrders: FetchBuyOrders) {}

  async scan(targets: TradeItem[]): Promise<void> {
    if (this.running()) return;

    const controller = new AbortController();
    this.controller = controller;
    const options: ScanOptions = {
      // the input can be empty (null) or negative if someone types junk
      minPlat: Math.max(0, Number(this.minPlat()) || 0),
      status: this.status(),
      rank: this.rank(),
    };
    this.running.set(true);
    this.hits.set([]);
    this.errors.set([]);
    this.progress.set({ done: 0, total: targets.length });

    const pending: Promise<void>[] = [];
    for (const item of targets) {
      if (controller.signal.aborted) break;
      pending.push(this.check(item, options, controller.signal));
      // await sleep(1000); // too slow prob?
      await sleep(START_INTERVAL_MS);
    }
    await Promise.all(pending);

    this.hasRun.set(true);
    this.running.set(false);
    this.controller = null;
  }

  cancel(): void {
    this.controller?.abort();
  }

  // checks one item. if it throws we just save the error
  private async check(item: TradeItem, options: ScanOptions, abort: AbortSignal) {
    try {
      const orders = await this.fetchBuyOrders(item.slug, abort, options.rank);
      const found = orders
        .filter((o) => this.qualifies(o, options))
        .map<Hit>((o) => ({
          name: item.name,
          slug: item.slug,
          platinum: o.platinum ?? 0,
          buyer: o.user?.ingameName ?? '?',
          rank: o.rank ?? null,
          status: o.user?.status ?? 'unknown',
        }));
      if (found.length) this.hits.update((h) => [...h, ...found]);
    } catch (e) {
      if (abort.aborted) return;
      const message = e instanceof Error ? e.message : 'unknown error';
      // todo: retry the failed ones instead of just listing them??? skill issue
      this.errors.update((errs) => [
        ...errs,
        { name: item.name, group: item.group, slug: item.slug, message },
      ]);
    } finally {
      this.progress.update((p) => ({ ...p, done: p.done + 1 }));
    }
  }

  private qualifies(order: RawOrder, { minPlat, status, rank }: ScanOptions): boolean {
    if ((order.platinum ?? 0) < minPlat) return false;

    const userStatus = order.user?.status;
    const statusOk =
      status === 'ingame'
        ? userStatus === 'ingame'
        : userStatus === 'ingame' || userStatus === 'online';
    if (!statusOk) return false;

    // unranked = stuff you can sell straight from the vendor, no leveling needed
    return rank === 'any' || order.rank == null || order.rank === 0;
  }
}
