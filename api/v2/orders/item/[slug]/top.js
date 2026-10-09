// /api/v2/orders/item/<slug>/top (optional ?rank=N), cached 30s
const { forward, send } = require('../../../../_lib/proxy');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, 'Method not allowed');

  const slug = String(req.query.slug ?? '');
  if (!/^[a-z0-9_]+$/.test(slug)) return send(res, 404, 'Not found');

  // rank is the only extra thing we let through
  let query = '';
  if (req.query.rank !== undefined) {
    const rank = String(req.query.rank);
    if (!/^\d{1,2}$/.test(rank)) return send(res, 404, 'Not found');
    query = `?rank=${rank}`;
  }

  return forward(res, `v2/orders/item/${slug}/top${query}`, 30);
};
