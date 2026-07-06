import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5MB

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
      return json({ success: false, error: 'Payload too large (max 5MB)' }, 413);
    }
    payload = JSON.parse(raw);
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (payload === null || typeof payload !== 'object') {
    return json({ success: false, error: 'JSON body must be an object or array' }, 400);
  }

  const record = Array.isArray(payload) ? {} : (payload as Record<string, unknown>);
  const subCenterName =
    typeof record.sub_center_name === 'string' ? record.sub_center_name.slice(0, 255) : null;
  const topic = typeof record.topic === 'string' ? record.topic.slice(0, 255) : null;

  try {
    const pool = getDbPool();
    const { rows } = await pool.query<{ id: string; date_time_sync: string }>(
      'INSERT INTO data_sync_in (payload, sub_center_name, topic) VALUES ($1, $2, $3) RETURNING id, date_time_sync',
      [JSON.stringify(payload), subCenterName, topic],
    );

    return json(
      {
        success: true,
        id: Number(rows[0].id),
        date_time_sync: rows[0].date_time_sync,
      },
      201,
    );
  } catch (error) {
    console.error('data-sync-in insert failed:', error);
    return json({ success: false, error: 'Unable to store data' }, 500);
  }
}
