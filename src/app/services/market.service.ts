import { Injectable } from '@angular/core';
import { RankFilter, RankStat } from '../models/item.model';
import { RawOrder, ScanSession } from './scan-session';
import { StatsSession } from './stats-session';

// same origin path. ng serve proxies it (proxy.conf.json), prod uses functions/api/[[path]].ts
// api has no cors headers so we cant call it straight from the browser. annoying kaayo
const API = '/api';
const RETRY_DELAY_MS = 1500;
// dont hang forever if the api (or the proxy) stalls
const REQUEST_TIMEOUT_MS = 15000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// might use later idk, probably wont tho. doesnt handle apostrophes btw
export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

@Injectable({ providedIn: 'root' })
export class MarketService {
  private readonly sessions = new Map<string, ScanSession>();
  private readonly statsSessions = new Map<string, StatsSession>();

  // one session per tab so results stay when you switch tabs
  // todo: cache the api responses for a bit? maybe 30s?? hmm..
  session(key: string): ScanSession {
    let session = this.sessions.get(key);
    if (!session) {
      session = new ScanSession((slug, signal, rank) => this.fetchBuyOrders(slug, signal, rank));
      this.sessions.set(key, session);
    }
    return session;
  }

  // same idea for the best sellers + suggested min plat
  stats(key: string): StatsSession {
    let session = this.statsSessions.get(key);
    if (!session) {
      session = new StatsSession((slug, signal) => this.fetchStats(slug, signal));
      this.statsSessions.set(key, session);
    }
    return session;
  }

  private async fetchBuyOrders(
    slug: string,
    signal: AbortSignal,
    rank: RankFilter,
  ): Promise<RawOrder[]> {
    // console.log('fetching', slug); // dont delete yet
    // the api only gives 5 buyers total, mostly rank 5. ask for rank 0 or unranked finds nothing
    const query = rank === 'unranked' ? '?rank=0' : '';
    const json = await this.getJson(`${API}/v2/orders/item/${slug}/top${query}`, signal);
    if (!json?.data) throw new Error(json?.error ?? 'no data');
    const buy = json.data.buy;
    return Array.isArray(buy) ? buy : [];
  }

  // v1 is the only one with sales stats. api sends a lot (~200kb) but it compresses fine
  private async fetchStats(slug: string, signal: AbortSignal): Promise<RankStat[]> {
    const json = await this.getJson(`${API}/v1/items/${slug}/statistics`, signal);
    const raw = json?.payload?.statistics_closed?.['48hours'];
    const entries: { mod_rank?: number; volume: number; median: number }[] = Array.isArray(raw)
      ? raw
      : [];

    // hourly entries -> one row per rank, price is the median weighted by how much sold
    const byRank = new Map<number | null, { volume: number; total: number }>();
    for (const e of entries) {
      const rank = e.mod_rank ?? null;
      const volume = Number(e.volume) || 0;
      const median = Number(e.median) || 0;
      const row = byRank.get(rank) ?? { volume: 0, total: 0 };
      row.volume += volume;
      row.total += median * volume;
      byRank.set(rank, row);
    }
    return [...byRank].map(([rank, { volume, total }]) => ({
      rank,
      volume,
      price: volume ? Math.round(total / volume) : 0,
    }));
  }

  private async getJson(url: string, signal: AbortSignal, retry = true): Promise<any> {
    // older browsers dont have these, then we just skip the timeout
    const timeout =
      typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(REQUEST_TIMEOUT_MS) : null;
    const combined =
      timeout && typeof AbortSignal.any === 'function'
        ? AbortSignal.any([signal, timeout])
        : signal;

    try {
      const resp = await fetch(url, { signal: combined });
      if (resp.status === 429 && retry) {
        await sleep(RETRY_DELAY_MS);
        return await this.getJson(url, signal, false);
      }
      if (!resp.ok) {
        // the worker says why it 502'd in plain text, show that. skip html pages tho
        const isText = resp.headers.get('content-type')?.startsWith('text/plain');
        const why = isText ? (await resp.text().catch(() => '')).slice(0, 120) : '';
        throw new Error(why ? `HTTP ${resp.status}: ${why}` : `HTTP ${resp.status}`);
      }
      if (!resp.headers.get('content-type')?.includes('json')) {
        // got index.html back so /api isn't being proxied (restart ng serve? ambot)
        throw new Error("proxy isn't running, restart ng serve");
      }
      return await resp.json();
    } catch (e) {
      // the timeout fired but the user didnt cancel
      if (timeout?.aborted && !signal.aborted) throw new Error('timed out');
      throw e;
    }
  }
}
