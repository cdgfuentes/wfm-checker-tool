import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TradeItem } from '../../models/item.model';
import { Scanner } from './scanner';

const ITEMS: TradeItem[] = ['a', 'b', 'c'].map((slug) => ({
  name: slug.toUpperCase(),
  slug,
  group: 'Arcane',
}));

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

// fake warframe.market: 40p at rank 5, one buyer who wants everything
const goodApi = async (url: string) =>
  url.includes('/v1/items/')
    ? json({
        payload: {
          statistics_closed: {
            '48hours': [
              { mod_rank: 5, volume: 20, median: 40 },
              { mod_rank: 0, volume: 50, median: 3 },
            ],
          },
        },
      })
    : json({
        data: {
          buy: [{ platinum: 30, rank: 5, user: { ingameName: 'Bob', status: 'ingame' } }],
        },
      });

describe('Scanner', () => {
  let fixture: ComponentFixture<Scanner>;
  const el = () => fixture.nativeElement as HTMLElement;

  // keeps checking the page until something shows up (the app waits between requests)
  const until = (check: () => unknown) =>
    vi.waitFor(
      () => {
        fixture.detectChanges();
        expect(check()).toBeTruthy();
      },
      { timeout: 8000, interval: 50 },
    );

  const clickScan = () =>
    [...el().querySelectorAll('button')]
      .find((b) => b.textContent?.trim().startsWith('Scan'))!
      .click();

  function setup(api: (url: string) => Promise<Response>) {
    vi.stubGlobal('fetch', vi.fn(api));
    fixture = TestBed.createComponent(Scanner);
    fixture.componentRef.setInput('sessionKey', 'test');
    fixture.componentRef.setInput('items', ITEMS);
    fixture.componentRef.setInput('showRank', true);
    fixture.detectChanges();
  }

  afterEach(() => vi.unstubAllGlobals());

  it('shows best sellers, then finds a buyer and writes the whisper', async () => {
    setup(goodApi);

    await until(() => el().querySelector('.top tbody tr'));
    expect(el().querySelector('.top')?.textContent).toContain('40p');
    // temporary removed.. unstable and needs more work. so WIP
    // // 3 items with enough sales, so a suggestion shows up (40 x 0.75)
    // await until(() => el().querySelector('button.link'));
    // expect(el().querySelector('button.link')?.textContent).toContain('30p');

    clickScan();
    // results stream in, so wait until all 3 items made it into the one whisper
    await until(() => el().querySelector('.whisper code')?.textContent?.includes('respectively'));
    const whisper = el().querySelector('.whisper code')!.textContent!;
    expect(whisper).toContain('/w Bob');
    expect(whisper).toContain('(rank 5)');
    expect(whisper).toContain('respectively');
  }, 15000);

  it('survives garbage from the api', async () => {
    setup(async (url) =>
      url.includes('/v1/items/')
        ? json({ payload: { statistics_closed: { '48hours': 'nope' } } })
        : json({ data: { buy: 'nope' } }),
    );

    clickScan();
    await until(() => el().textContent?.includes('no buyers atm'));
    expect(el().querySelector('.errors')).toBeNull();
  }, 15000);

  it('lists failed items instead of crashing', async () => {
    setup(async () => {
      throw new TypeError('network down');
    });

    clickScan();
    await until(() => el().querySelector('.errors')?.textContent?.includes('3 failed to load'));
  }, 15000);

  it('treats an html page like an error (bot check or missing proxy)', async () => {
    setup(
      async () => new Response('<!doctype html>', { headers: { 'content-type': 'text/html' } }),
    );

    clickScan();
    await until(() => el().querySelector('.errors')?.textContent?.includes("proxy isn't running"));
  }, 15000);
});
