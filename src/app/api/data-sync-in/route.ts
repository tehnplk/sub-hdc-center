import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5MB

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
      `SELECT id, sub_center_name, topic, payload,
              to_char(date_time_sync AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD HH24:MI:SS') AS date_time_sync
       FROM data_sync_in
       ORDER BY date_time_sync DESC
       LIMIT 10`,
    );
    return json({ success: true, data: rows });
  } catch (error) {
    console.error('data-sync-in select failed:', error);
    return json({ success: false, error: 'Unable to fetch data' }, 500);
  }
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
    typeof record.sub_center_name === 'string' ? record.sub_center_name.trim().slice(0, 255) : '';
  const topic = typeof record.topic === 'string' ? record.topic.trim().slice(0, 255) : '';

  // sub_center_name + topic เป็น unique key ของการ replace — ถ้าขาดจะกันแถวซ้ำไม่ได้
  if (!subCenterName || !topic) {
    return json({ success: false, error: 'sub_center_name and topic are required' }, 400);
  }

  try {
    const pool = getDbPool();
    const { rows } = await pool.query<{ id: string; date_time_sync: string }>(
      `INSERT INTO data_sync_in (payload, sub_center_name, topic) VALUES ($1, $2, $3)
       ON CONFLICT (sub_center_name, topic)
       DO UPDATE SET payload = EXCLUDED.payload, date_time_sync = NOW()
       RETURNING id, date_time_sync`,
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
