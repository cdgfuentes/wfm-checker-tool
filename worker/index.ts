// cloudflare worker, only gets /api/* (see run_worker_first in wrangler.jsonc)
// forwards to warframe.market, the api has no cors headers so browsers cant hit it directly. cors moment
// only 2 routes are allowed (order lookup + sales stats) so its not an open proxy
// orders are cached 30s, stats 1h cause they barely change (30s is enough? I THINK?)
const ORDERS = /^v2\/orders\/item\/[a-z0-9_]+\/top$/;
const STATS = /^v1\/items\/[a-z0-9_]+\/statistics$/;

// orders can have an optional ?rank=N, stats take no query at all
const ORDERS_QUERY = /^(\?rank=\d{1,2})?$/;

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { pathname, search } = new URL(request.url);
    const path = pathname.replace(/^\/api\//, '');

    const isStats = STATS.test(path) && search === '';
    const isOrders = ORDERS.test(path) && ORDERS_QUERY.test(search);
    if (!isStats && !isOrders) {
      return new Response('Not found', { status: 404 });
    }

    const ttl = isStats ? 3600 : 30;
    let upstream: Response;
    try {
      upstream = await fetch(`https://api.warframe.market/${path}${search}`, {
        headers: { Platform: 'pc', Accept: 'application/json' },
        // only cache good replies, never an error or a bot check page
        cf: { cacheTtlByStatus: { '200-299': ttl, '300-599': 0 }, cacheEverything: true },
      } as RequestInit);
    } catch {
      return new Response('upstream unreachable', { status: 502 });
    }

    // a cloudflare bot check comes back as html, dont pass that along as json
    if (!upstream.headers.get('content-type')?.includes('json')) {
      return new Response('bad upstream', { status: 502 });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': upstream.ok ? `public, max-age=${ttl}` : 'no-store',
      },
    });
  },
};
