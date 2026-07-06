import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const pool = getDbPool();
    const { rows } = await pool.query(
      'SELECT id, version, issue, date_time FROM sub_version ORDER BY id DESC',
    );
    return json({ success: true, data: rows });
  } catch (error) {
    console.error('sub-version select failed:', error);
    return json({ success: false, error: 'Unable to fetch data' }, 500);
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return json({ success: false, error: 'JSON body must be an object' }, 400);
  }

  const record = payload as Record<string, unknown>;
  const version = typeof record.version === 'string' ? record.version.trim().slice(0, 50) : '';
  const issue = typeof record.issue === 'string' ? record.issue : null;

  if (!version) {
    return json({ success: false, error: 'version is required' }, 400);
  }

  try {
    const pool = getDbPool();
    const { rows } = await pool.query<{ id: number; date_time: string }>(
      'INSERT INTO sub_version (version, issue) VALUES ($1, $2) RETURNING id, date_time',
      [version, issue],
    );
    return json(
      {
        success: true,
        id: Number(rows[0].id),
        version,
        issue,
        date_time: rows[0].date_time,
      },
      201,
    );
  } catch (error) {
    console.error('sub-version insert failed:', error);
    return json({ success: false, error: 'Unable to store data' }, 500);
  }
}
