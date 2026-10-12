// Stand-in for the downstream Salesforce record API. In memory, no dependencies.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const PORT = Number(process.env.PORT) || 3417;
const SOURCES = ['WebForm', 'LegacyIntegration'];
const records = new Map();

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(status === 204 ? undefined : JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

const filled = (v) => typeof v === 'string' && v.trim() !== '';

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const m = url.pathname.match(/^\/api\/records\/([\w-]+)$/);

  if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true });

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
  }

  if (req.method === 'POST' && url.pathname === '/api/onboarding') {
    let b;
    try {
      b = await readJson(req);
    } catch (e) {
      return send(res, 400, { error: e.message });
    }
    for (const f of ['companyName', 'ownerEmail', 'product']) {
      if (!filled(b[f])) return send(res, 400, { error: `${f} is required` });
    }
    if (!SOURCES.includes(b.source)) {
      return send(res, 400, { error: 'source must be WebForm or LegacyIntegration' });
    }
    // The incident: legacy callers have no taxId. Only the web form must send it.
    if (b.source === 'WebForm' && !filled(b.taxId)) {
      return send(res, 400, { error: 'taxId is required for WebForm submissions' });
    }
    const id = randomUUID();
    const record = {
      id,
      companyName: b.companyName,
      ownerEmail: b.ownerEmail,
      product: b.product,
      taxId: filled(b.taxId) ? b.taxId : null,
      source: b.source,
    };
    records.set(id, record);
    return send(res, 201, record);
  }

  if (m && req.method === 'GET') {
    const r = records.get(m[1]);
    return r ? send(res, 200, r) : send(res, 404, { error: 'not found' });
  }
  if (m && req.method === 'DELETE') {
    return records.delete(m[1]) ? send(res, 204) : send(res, 404, { error: 'not found' });
  }
  send(res, 404, { error: 'not found' });
});

server.listen(PORT, () => console.log(`demo-app listening on ${PORT}`));
