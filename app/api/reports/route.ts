import { NextResponse } from 'next/server';

const requiredFields = ['location', 'incidentDate', 'violenceType', 'description'];

export async function POST(request: Request) {
  const form = await request.formData();
  const missing = requiredFields.filter((field) => !String(form.get(field) ?? '').trim());
  if (missing.length > 0) {
    return NextResponse.json({ ok: false, error: 'Missing required report fields', missing }, { status: 400 });
  }

  const report = Object.fromEntries(form.entries());
  return NextResponse.json({ ok: true, message: 'Report received for secure review', reportId: crypto.randomUUID(), report }, { status: 201 });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'Alerta Diversa Américas reports endpoint' });
}
