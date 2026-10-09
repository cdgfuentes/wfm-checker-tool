import { RankStat, TradeItem } from '../models/item.model';
import { StatsSession } from './stats-session';

const item = (slug: string): TradeItem => ({ name: slug.toUpperCase(), slug, group: 'Arcane' });

const DATA: Record<string, RankStat[]> = {
  // sells well at rank 5, junk at rank 0
  a: [
    { rank: 0, volume: 100, price: 3 },
    { rank: 5, volume: 50, price: 40 },
  ],
  // rank 5 only sold 3 times so it shouldnt count
  b: [
    { rank: 0, volume: 10, price: 2 },
    { rank: 5, volume: 3, price: 99 },
  ],
  // not rankable (blueprint)
  c: [{ rank: null, volume: 20, price: 8 }],
};

describe('StatsSession', () => {
  let session: StatsSession;

  beforeEach(async () => {
    session = new StatsSession(async (slug) => DATA[slug]);
    await session.load([item('a'), item('b'), item('c')]);
  });

  it('ranks by price at the highest rank that really sells', () => {
    const top = session.top();
    expect(top.map((r) => [r.name, r.price, r.rank])).toEqual([
      ['A', 40, 5],
      ['C', 8, null],
      ['B', 2, 0],
    ]);
    // only ranked items show an unranked price
    expect(top[0].unrankedPrice).toBe(3);
    expect(top[1].unrankedPrice).toBeNull();
  });

  it('suggests a bit under the middle price', () => {
    expect(session.suggestedMin(false)).toBe(6); // middle of 2, 8, 40 is 8, x0.75
    expect(session.suggestedMin(true)).toBe(2); // middle of 2, 3, 8 is 3, x0.75
  });

  it('wont suggest anything with too little data', async () => {
    const small = new StatsSession(async (slug) => DATA[slug]);
    await small.load([item('a')]);
    expect(small.suggestedMin(false)).toBeNull();
  });
});
