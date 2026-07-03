import type { RowDataPacket } from 'mysql2';
import type { Metadata } from 'next';
import { Activity, Server } from 'lucide-react';
import { BenchmarkDashboard, type BenchmarkRow } from './benchmark-dashboard';
import { getDbPool } from '@/lib/db';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Benchmark',
  description: 'District benchmark table',
};

interface BenchmarkDbRow extends RowDataPacket {
  id: number;
  district: string;
  district_name: string | null;
  system_on: number;
  hos_moph_all: number;
  hos_moph_send: number;
  hos_loc_all: number;
  hos_loc_send: number;
}

async function getBenchmarkRows() {
  const pool = getDbPool();
  const [rows] = await pool.query<BenchmarkDbRow[]>(`
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
    ORDER BY b.district
  `);

  return rows.map((row) => ({
    id: row.id,
    district: row.district,
    district_name: row.district_name,
    system_on: row.system_on,
    hos_moph_all: row.hos_moph_all,
    hos_moph_send: row.hos_moph_send,
    hos_loc_all: row.hos_loc_all,
    hos_loc_send: row.hos_loc_send,
  })) satisfies BenchmarkRow[];
}

export default async function BenchmarkPage() {
  const rows = await getBenchmarkRows();

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-xl border border-sky-200 bg-white/95 p-5 shadow-[0_14px_35px_rgba(14,165,233,0.12)] md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg shadow-sky-500/25">
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold uppercase text-sky-700">Benchmark</p>
                <h1 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">Benchmark อำเภอ</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-bold text-sky-800">
            <Server className="h-4 w-4 text-sky-600" />
            <span>{rows.length} districts</span>
          </div>
        </header>

        <BenchmarkDashboard initialRows={rows} />
      </div>
    </main>
  );
}
