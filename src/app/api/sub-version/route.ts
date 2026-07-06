import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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

export async function PUT(request: Request) {
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
  const id = Number(record.id);
  const version = typeof record.version === 'string' ? record.version.trim().slice(0, 50) : null;
  const issue = typeof record.issue === 'string' ? record.issue : null;

  if (!Number.isInteger(id) || id <= 0) {
    return json({ success: false, error: 'id is required' }, 400);
  }
  if (!version && issue === null) {
    return json({ success: false, error: 'version or issue is required' }, 400);
  }

  try {
    const pool = getDbPool();
    const { rows } = await pool.query(
      `UPDATE sub_version
       SET version = COALESCE($2, version), issue = COALESCE($3, issue)
       WHERE id = $1
       RETURNING id, version, issue, date_time`,
      [id, version, issue],
    );

    if (rows.length === 0) {
      return json({ success: false, error: 'Record not found' }, 404);
    }
    return json({ success: true, ...rows[0] });
  } catch (error) {
    console.error('sub-version update failed:', error);
    return json({ success: false, error: 'Unable to update data' }, 500);
  }
}
