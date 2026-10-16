const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { webcrypto } = require('node:crypto');
const ts = require('typescript');

const source = readFileSync('app/api/reports/route.ts', 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const route = { exports: {} };
new Function('require', 'module', 'exports', 'crypto', compiled)(
  (name) => {
    assert.equal(name, 'next/server');
    return { NextResponse: { json: (body, init) => Response.json(body, init) } };
  }, route, route.exports, webcrypto,
);
const { POST } = route.exports;
const valid = {
  location: 'Ciudad de México',
  incidentDate: '2024-02-29',
  violenceType: 'physical',
  description: 'Descripción suficientemente larga del caso.',
  contact: 'sensitive@example.test',
};
const request = (data = valid) => new Request('https://example.test/api/reports', {
  method: 'POST', body: new URLSearchParams(data),
});
async function expectError(req, status) {
  const response = await POST(req);
  assert.equal(response.status, status);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.deepEqual(Object.keys(body), ['message']);
  assert.equal(typeof body.message, 'string');
  assert.ok(!JSON.stringify(body).includes(valid.contact));
}

test('success returns only a fresh UUID and fixed message, never submitted data', async () => {
  const ids = [];
  for (let i = 0; i < 2; i++) {
    const response = await POST(request());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.json();
    assert.deepEqual(Object.keys(body).sort(), ['message', 'reportId']);
    assert.match(body.reportId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.equal(body.message, 'Report validated only; not stored or queued for review');
    for (const value of Object.values(valid)) assert.ok(!JSON.stringify(body).includes(value));
    ids.push(body.reportId);
  }
  assert.notEqual(ids[0], ids[1]);
});
test('optional contact and valid multipart work', async () => {
  const data = new FormData();
  for (const [key, value] of Object.entries(valid)) if (key !== 'contact') data.append(key, value);
  assert.equal((await POST(new Request('https://example.test', { method: 'POST', body: data }))).status, 200);
});
test('missing, blank, short, oversized, invalid enum and invalid dates fail', async () => {
  for (const key of ['location', 'incidentDate', 'violenceType', 'description']) {
    const data = { ...valid }; delete data[key];
    await expectError(request(data), 400);
    await expectError(request({ ...valid, [key]: '   ' }), 400);
  }
  for (const [key, value] of [
    ['description', 'short'], ['description', 'x'.repeat(10001)],
    ['location', 'x'.repeat(201)], ['contact', 'x'.repeat(321)],
    ['violenceType', 'invalid'], ['incidentDate', '2023-02-29'],
    ['incidentDate', '2024-02-30'], ['incidentDate', '9999-01-01'],
    ['incidentDate', '0000-01-01'], ['incidentDate', '2024-2-29'],
  ]) await expectError(request({ ...valid, [key]: value }), 400);
});
test('unknown fields and duplicate fields fail', async () => {
  await expectError(request({ ...valid, secret: 'private' }), 400);
  for (const key of Object.keys(valid)) {
    const data = new URLSearchParams(valid); data.append(key, valid[key]);
    await expectError(request(data), 400);
  }
});
test('file fields are rejected rather than coerced', async () => {
  const data = new FormData();
  for (const [key, value] of Object.entries(valid)) data.append(key, value);
  data.set('location', new Blob(['private']), 'evidence.txt');
  await expectError(new Request('https://example.test', { method: 'POST', body: data }), 400);
});
test('malformed multipart and unsupported content types fail safely', async () => {
  await expectError(new Request('https://example.test', {
    method: 'POST', body: 'broken', headers: { 'Content-Type': 'multipart/form-data' },
  }), 400);
  await expectError(new Request('https://example.test', {
    method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' },
  }), 415);
});
test('body size limit is enforced without Content-Length', async () => {
  const req = request({ ...valid, description: 'x'.repeat(65537) });
  assert.equal(req.headers.get('content-length'), null);
  await expectError(req, 413);
});
test('stream read failures return a fixed error', async () => {
  await expectError(new Request('https://example.test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new ReadableStream({ start(controller) { controller.error(new Error('private')); } }),
    duplex: 'half',
  }), 400);
});
