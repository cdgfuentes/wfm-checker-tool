// shared bits for the vercel functions (same job as worker/index.ts)
// the folder starts with _ so vercel doesnt treat it like a route
// warframe.market has no cors headers and blocks cloudflare workers (403), so this lives on vercel

// tell them who we are (I THINK this helps?)
const USER_AGENT =
  'wfm-checker-tool (personal project, https://github.com/cdgfuentes/wfm-checker-tool)';

function send(res, status, body, headers = {}) {
  res.statusCode = status;
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  res.end(body);
}

// ttl = how many seconds vercel can keep the reply, so a bunch of scans dont spam the api
async function forward(res, path, ttl) {
  let upstream;
  try {
    upstream = await fetch(`https://api.warframe.market/${path}`, {
      headers: { Platform: 'pc', Accept: 'application/json', 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return send(res, 502, 'upstream unreachable');
  }

  // a bot check comes back as html, dont pass that along as json
  const type = upstream.headers.get('content-type') ?? 'no content-type';
  if (!type.includes('json')) {
    return send(res, 502, `bad upstream: HTTP ${upstream.status}, ${type}`);
  }

  // only cache good replies
  const cache = upstream.ok ? `public, max-age=${ttl}, s-maxage=${ttl}` : 'no-store';
  return send(res, upstream.status, await upstream.text(), {
    'Content-Type': 'application/json',
    'Cache-Control': cache,
  });
}

module.exports = { forward, send };
