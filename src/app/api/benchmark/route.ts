import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import benchmarkUpdate from '@/lib/benchmark-update.cjs';

const { normalizeBenchmarkUpdate } = benchmarkUpdate as {
  normalizeBenchmarkUpdate: (input: unknown) => {
    id: number;
    field: 'hos_moph_all' | 'hos_moph_send' | 'hos_loc_all' | 'hos_loc_send';
    value: number;
  };
};

export async function POST(request: Request) {
  try {
    const update = normalizeBenchmarkUpdate(await request.json());
    const pool = getDbPool();

    await pool.query(`UPDATE benchmark_district SET ${update.field} = $1 WHERE id = $2`, [update.value, update.id]);

    const { rows } = await pool.query(
      `
        SELECT
          b.id,
          b.district,
          c.name AS district_name,
          b.system_on,
          b.hos_moph_all,
          b.hos_moph_send,
          b.hos_loc_all,
          b.hos_loc_send
        FROM benchmark_district b
        LEFT JOIN c_district c ON b.district = c.code
        WHERE b.id = $1
      `,
      [update.id],
    );

    const [row] = rows;
    if (!row) {
      return NextResponse.json({ error: 'Benchmark row not found' }, { status: 404 });
    }

    return NextResponse.json({ row });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to update benchmark',
      },
      { status: 400 },
    );
  }
}
