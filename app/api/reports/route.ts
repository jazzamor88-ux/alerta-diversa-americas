import { NextResponse } from 'next/server';

const MAX_BODY_BYTES = 64 * 1024;
const limits = { location: 200, incidentDate: 10, violenceType: 32, description: 10000, contact: 320 };
const violenceTypes = new Set(['physical', 'threats', 'institutional', 'online']);

// Validate every entry before accepting it; never coerce files to strings.
function isValidReport(form: FormData) {
  for (const [key, value] of form.entries()) {
    if (!Object.prototype.hasOwnProperty.call(limits, key) || typeof value !== 'string') return false;
  }
  for (const [key, maxLength] of Object.entries(limits)) {
    const values = form.getAll(key);
    if (values.length > 1) return false;
    if (key === 'contact' && values.length === 0) continue;
    const value = values[0];
    if (typeof value !== 'string' || value.length > maxLength) return false;
    const trimmed = value.trim();
    if (key !== 'contact' && !trimmed) return false;
    if (key === 'description' && trimmed.length < 20) return false;
    if (key === 'violenceType' && !violenceTypes.has(value)) return false;
    if (key === 'incidentDate') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
      const date = new Date(value + 'T00:00:00.000Z');
      if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
      if (value > new Date().toISOString().slice(0, 10)) return false;
    }
  }
  return true;
}

export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  const contentType = request.headers.get('content-type') ?? '';
  const mediaType = contentType.split(';')[0].trim().toLowerCase();
  if (mediaType !== 'application/x-www-form-urlencoded' && mediaType !== 'multipart/form-data') {
    return NextResponse.json({ message: 'Unsupported form content type' }, { status: 415, headers });
  }

  // Enforce the limit on actual bytes, including chunked requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({ message: 'Invalid report form' }, { status: 400, headers });
  const chunks: Uint8Array[] = [];
  let size = 0;
  let form: FormData;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return NextResponse.json({ message: 'Report form too large' }, { status: 413, headers });
      }
      chunks.push(value);
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    form = await new Response(body, { headers: { 'Content-Type': contentType } }).formData();
  } catch {
    return NextResponse.json({ message: 'Invalid report form' }, { status: 400, headers });
  } finally {
    reader.releaseLock();
  }

  if (!isValidReport(form)) {
    return NextResponse.json({ message: 'Invalid report fields' }, { status: 400, headers });
  }

  // Prototype only: no persistence, review queue or publication is implemented.
  return NextResponse.json({
    reportId: crypto.randomUUID(),
    message: 'Report validated only; not stored or queued for review',
  }, { status: 200, headers });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'Alerta Diversa Américas reports endpoint' });
}
