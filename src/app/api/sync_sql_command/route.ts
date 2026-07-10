import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { verifyHs256Jwt } from '@/lib/jwt';

export const runtime = 'nodejs';

function unauthorized(message = 'Unauthorized') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } },
  );
}

function authenticate(request: Request) {
  const secret = process.env.SYNC_SQL_JWT_SECRET;
  if (!secret) return { error: 'SYNC_SQL_JWT_SECRET is not configured', status: 500 } as const;

  const authorization = request.headers.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const payload = match ? verifyHs256Jwt(match[1], secret) : null;
  if (!payload) return { error: 'Invalid or missing JWT', status: 401 } as const;

  return { payload } as const;
}

export async function GET(request: Request) {
  const auth = authenticate(request);
  if ('error' in auth) {
    if (auth.status === 500) {
      console.error(auth.error);
      return NextResponse.json({ success: false, error: 'Server authentication is not configured' }, { status: 500 });
    }
    return unauthorized(auth.error);
  }

  const topic = new URL(request.url).searchParams.get('topic')?.trim() || null;
  if (topic && topic.length > 255) {
    return NextResponse.json({ success: false, error: 'topic is too long' }, { status: 400 });
  }

  try {
    const pool = getDbPool();
    const { rows } = await pool.query(
      `SELECT id, topic, topic_group, interval_minute, sql_command, note,
              to_char(d_update AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD HH24:MI:SS') AS d_update
       FROM sql_for_sync_data
       WHERE is_active = TRUE
         AND ($1::text IS NULL OR topic = $1)
       ORDER BY id`,
      [topic],
    );

    return NextResponse.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('sync-sql-command select failed:', error);
    return NextResponse.json({ success: false, error: 'Unable to fetch SQL commands' }, { status: 500 });
  }
}
