import type { Metadata } from 'next';
import { Activity } from 'lucide-react';
import { getDbPool } from '@/lib/db';
import { AutoRefresh } from './auto-refresh';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'ตรวจสอบการเชื่อมต่อ',
  description: 'สถานะการเชื่อมต่อล่าสุดของศูนย์ข้อมูล',
};

// ถือว่า online หากมีข้อมูล sync เข้ามาภายใน 2 ชั่วโมง
const ONLINE_WINDOW_SECONDS = 7200;

interface CheckRow {
  district_code: string;
  district_name: string;
  sub_center_name: string | null;
  version: string | null;
  last_sync: string | null;
  seconds_ago: number | null;
}

async function getCheckRows() {
  const pool = getDbPool();
  const { rows } = await pool.query<CheckRow>(`
    SELECT
      d.code AS district_code,
      d.name AS district_name,
      sc.sub_center_name,
      s.version,
      to_char(s.last_sync AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD HH24:MI:SS') AS last_sync,
      EXTRACT(EPOCH FROM (now() - s.last_sync))::int AS seconds_ago
    FROM c_district d
    LEFT JOIN c_sub_center sc ON sc.district_code = d.code
    LEFT JOIN (
      SELECT sub_center_name, date_time_sync AS last_sync, payload ->> 'version' AS version
      FROM data_sync_in
      WHERE topic = 'check'
    ) s ON s.sub_center_name = sc.sub_center_name
    ORDER BY d.code
  `);
  return rows;
}

function agoText(seconds: number | null) {
  if (seconds === null) return '-';
  if (seconds < 60) return `${seconds} วินาทีที่แล้ว`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(seconds / 86400)} วันที่แล้ว`;
}

export default async function CheckPage() {
  const rows = await getCheckRows();
  const onlineCount = rows.filter(
    (row) => row.seconds_ago !== null && row.seconds_ago <= ONLINE_WINDOW_SECONDS
  ).length;
  const centerCount = rows.filter((row) => row.sub_center_name !== null).length;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Activity className="h-3.5 w-3.5" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-900">ตรวจสอบการเชื่อมต่อ</h4>
            <p className="text-xs text-slate-500">
              online {onlineCount} / {centerCount} ศูนย์ (นับจากการ sync ภายใน 2 ชั่วโมง)
            </p>
          </div>
        </div>
        <AutoRefresh intervalSeconds={30} />
      </header>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="px-3 py-2 font-semibold">#</th>
              <th className="px-3 py-2 font-semibold">อำเภอ</th>
              <th className="px-3 py-2 font-semibold">ชื่อศูนย์ข้อมูล</th>
              <th className="px-3 py-2 font-semibold">เวอร์ชัน</th>
              <th className="px-3 py-2 font-semibold">สถานะ</th>
              <th className="px-3 py-2 font-semibold">sync ล่าสุด</th>
              <th className="px-3 py-2 font-semibold">ผ่านมาแล้ว</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const online =
                row.seconds_ago !== null && row.seconds_ago <= ONLINE_WINDOW_SECONDS;
              return (
                <tr
                  key={row.district_code}
                  className="border-b border-slate-100 last:border-0 hover:bg-emerald-50/40"
                >
                  <td className="px-3 py-2 text-slate-400">{index + 1}</td>
                  <td className="px-3 py-2 font-medium text-slate-800">{row.district_name}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {row.last_sync === null ? (
                      <span className="text-slate-300">ยังไม่เชื่อมต่อกับจังหวัด</span>
                    ) : (
                      row.sub_center_name
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {row.version ? (
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 font-mono font-semibold text-sky-700">
                        {row.version}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {row.last_sync === null ? (
                      <span className="text-slate-300">-</span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold ${
                          online ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {online ? (
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          </span>
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        )}
                        {online ? 'online' : 'offline'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{row.last_sync ?? '-'}</td>
                  <td className="px-3 py-2 text-slate-500">{agoText(row.seconds_ago)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
