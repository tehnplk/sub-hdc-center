import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

// ตัวนับจำนวนผู้เข้าใช้งาน — single-row counter (id = 1)

// GET: อ่านยอดปัจจุบัน (ไม่เพิ่ม)
export async function GET() {
  try {
    const pool = getDbPool();
    const { rows } = await pool.query<{ count: string }>(
      'SELECT count FROM visit_count WHERE id = 1'
    );
    return NextResponse.json({ count: Number(rows[0]?.count ?? 0) });
  } catch (error) {
    console.error('visit count read failed:', error);
    return NextResponse.json({ count: 0 });
  }
}

// POST: เพิ่มยอด 1 แล้วคืนยอดใหม่ (upsert กันกรณีแถวหาย)
export async function POST() {
  try {
    const pool = getDbPool();
    const { rows } = await pool.query<{ count: string }>(
      `INSERT INTO visit_count (id, count, updated_at)
       VALUES (1, 1, NOW())
       ON CONFLICT (id)
       DO UPDATE SET count = visit_count.count + 1, updated_at = NOW()
       RETURNING count`
    );
    return NextResponse.json({ count: Number(rows[0]?.count ?? 0) });
  } catch (error) {
    console.error('visit count increment failed:', error);
    return NextResponse.json({ count: 0 });
  }
}
