// /api/v1/items/<slug>/statistics, cached 1h cause sales barely change
const { forward, send } = require('../../../_lib/proxy');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, 'Method not allowed');

  const slug = String(req.query.slug ?? '');
  if (!/^[a-z0-9_]+$/.test(slug)) return send(res, 404, 'Not found');

  return forward(res, `v1/items/${slug}/statistics`, 3600);
};
