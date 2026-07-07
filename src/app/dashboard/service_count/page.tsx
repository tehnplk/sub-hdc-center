import type { Metadata } from 'next';
import { Send } from 'lucide-react';
import { getDbPool } from '@/lib/db';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'หน่วยบริการส่งข้อมูล',
  description: 'จำนวนหน่วยบริการที่ส่งข้อมูล แยกรายอำเภอและสังกัด',
};

interface DistrictRow {
  code: string;
  name: string;
  moph_all: number;
  moph_sent: number;
  loc_all: number;
  loc_sent: number;
  last_sync: string | null;
}

async function getDistrictRows() {
  const pool = getDbPool();
  const { rows } = await pool.query<DistrictRow>(`
    SELECT
      d.code,
      d.name,
      (SELECT count(*)::int FROM c_hospital h
        WHERE h.amp_code = d.code AND h.is_active
          AND h.hostype_new IN ('18', '5', '7', '8')) AS moph_all,
      (SELECT count(DISTINCT r.hospcode)::int
         FROM data_sync_in s
         CROSS JOIN LATERAL jsonb_to_recordset(s.payload -> 'rows') AS r(hospcode text)
         JOIN c_hospital h ON h.hospcode = r.hospcode
        WHERE s.topic = 'service_count'
          AND h.amp_code = d.code AND h.is_active
          AND h.hostype_new IN ('18', '5', '7', '8')) AS moph_sent,
      (SELECT count(*)::int FROM c_hospital h
        WHERE h.amp_code = d.code AND h.is_active
          AND h.hostype_new = '21') AS loc_all,
      (SELECT count(DISTINCT r.hospcode)::int
         FROM data_sync_in s
         CROSS JOIN LATERAL jsonb_to_recordset(s.payload -> 'rows') AS r(hospcode text)
         JOIN c_hospital h ON h.hospcode = r.hospcode
        WHERE s.topic = 'service_count'
          AND h.amp_code = d.code AND h.is_active
          AND h.hostype_new = '21') AS loc_sent,
      (SELECT to_char(MAX(s.date_time_sync) AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD HH24:MI:SS')
         FROM data_sync_in s
         CROSS JOIN LATERAL jsonb_to_recordset(s.payload -> 'rows') AS r(hospcode text)
         JOIN c_hospital h ON h.hospcode = r.hospcode
        WHERE s.topic = 'service_count'
          AND h.amp_code = d.code) AS last_sync
    FROM c_district d
    ORDER BY d.code
  `);
  return rows;
}

function SentBadge({ sent, all }: { sent: number; all: number }) {
  const tone =
    sent === 0
      ? all === 0
        ? 'text-slate-300'
        : 'bg-slate-100 text-slate-400'
      : sent >= all
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-amber-50 text-amber-700';
  return <span className={`rounded-full px-2 py-0.5 font-semibold ${tone}`}>{sent}</span>;
}

function PercentCell({ sent, all }: { sent: number; all: number }) {
  if (all === 0) return <span className="text-slate-300">-</span>;
  const pct = Math.round((sent / all) * 100);
  const tone =
    pct >= 100 ? 'text-emerald-700' : pct > 0 ? 'text-amber-700' : 'text-slate-400';
  return <span className={`font-semibold ${tone}`}>{pct}%</span>;
}

export default async function ServiceCountPage() {
  const rows = await getDistrictRows();
  const total = rows.reduce(
    (acc, row) => ({
      moph_all: acc.moph_all + row.moph_all,
      moph_sent: acc.moph_sent + row.moph_sent,
      loc_all: acc.loc_all + row.loc_all,
      loc_sent: acc.loc_sent + row.loc_sent,
    }),
    { moph_all: 0, moph_sent: 0, loc_all: 0, loc_sent: 0 }
  );

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
          <Send className="h-3.5 w-3.5" />
        </span>
        <div>
          <h4 className="text-sm font-bold text-slate-900">หน่วยบริการส่งข้อมูล</h4>
          <p className="text-xs text-slate-500">
            จำนวนหน่วยบริการที่ส่งข้อมูล (topic: service_count) แยกรายอำเภอและสังกัด
          </p>
        </div>
      </header>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <th rowSpan={2} className="px-3 py-2 text-left font-semibold">
                รหัสอำเภอ
              </th>
              <th rowSpan={2} className="border-r border-slate-200 px-3 py-2 text-left font-semibold">
                อำเภอ
              </th>
              <th colSpan={3} className="border-b border-r border-slate-200 px-3 py-1.5 text-center font-semibold text-sky-700">
                สังกัด สธ.
              </th>
              <th colSpan={3} className="border-b border-r border-slate-200 px-3 py-1.5 text-center font-semibold text-amber-700">
                สังกัด อปท.
              </th>
              <th colSpan={3} className="border-b border-r border-slate-200 px-3 py-1.5 text-center font-semibold text-slate-700">
                รวม
              </th>
              <th rowSpan={2} className="px-3 py-2 text-left font-semibold">
                Update Time
              </th>
            </tr>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <th className="px-3 py-1.5 text-center font-medium">หน่วยบริการ (แห่ง)</th>
              <th className="px-3 py-1.5 text-center font-medium">ส่งข้อมูลแล้ว (แห่ง)</th>
              <th className="border-r border-slate-200 px-3 py-1.5 text-center font-medium">%</th>
              <th className="px-3 py-1.5 text-center font-medium">หน่วยบริการ (แห่ง)</th>
              <th className="px-3 py-1.5 text-center font-medium">ส่งข้อมูลแล้ว (แห่ง)</th>
              <th className="border-r border-slate-200 px-3 py-1.5 text-center font-medium">%</th>
              <th className="px-3 py-1.5 text-center font-medium">หน่วยบริการ (แห่ง)</th>
              <th className="px-3 py-1.5 text-center font-medium">ส่งข้อมูลแล้ว (แห่ง)</th>
              <th className="border-r border-slate-200 px-3 py-1.5 text-center font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.code}
                className="border-b border-slate-100 last:border-0 hover:bg-sky-50/50"
              >
                <td className="px-3 py-2 font-mono text-slate-500">{row.code}</td>
                <td className="border-r border-slate-100 px-3 py-2 font-medium text-slate-800">
                  {row.name}
                </td>
                <td className="px-3 py-2 text-center text-slate-700">{row.moph_all}</td>
                <td className="px-3 py-2 text-center">
                  <SentBadge sent={row.moph_sent} all={row.moph_all} />
                </td>
                <td className="border-r border-slate-100 px-3 py-2 text-center">
                  <PercentCell sent={row.moph_sent} all={row.moph_all} />
                </td>
                <td className="px-3 py-2 text-center text-slate-700">{row.loc_all}</td>
                <td className="px-3 py-2 text-center">
                  <SentBadge sent={row.loc_sent} all={row.loc_all} />
                </td>
                <td className="border-r border-slate-100 px-3 py-2 text-center">
                  <PercentCell sent={row.loc_sent} all={row.loc_all} />
                </td>
                <td className="px-3 py-2 text-center text-slate-700">
                  {row.moph_all + row.loc_all}
                </td>
                <td className="px-3 py-2 text-center">
                  <SentBadge sent={row.moph_sent + row.loc_sent} all={row.moph_all + row.loc_all} />
                </td>
                <td className="border-r border-slate-100 px-3 py-2 text-center">
                  <PercentCell sent={row.moph_sent + row.loc_sent} all={row.moph_all + row.loc_all} />
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-500">
                  {row.last_sync ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-700">
              <td className="px-3 py-2" colSpan={2}>
                รวม {rows.length} อำเภอ
              </td>
              <td className="px-3 py-2 text-center">{total.moph_all}</td>
              <td className="px-3 py-2 text-center">{total.moph_sent}</td>
              <td className="border-r border-slate-100 px-3 py-2 text-center">
                <PercentCell sent={total.moph_sent} all={total.moph_all} />
              </td>
              <td className="px-3 py-2 text-center">{total.loc_all}</td>
              <td className="px-3 py-2 text-center">{total.loc_sent}</td>
              <td className="border-r border-slate-100 px-3 py-2 text-center">
                <PercentCell sent={total.loc_sent} all={total.loc_all} />
              </td>
              <td className="px-3 py-2 text-center">{total.moph_all + total.loc_all}</td>
              <td className="px-3 py-2 text-center">{total.moph_sent + total.loc_sent}</td>
              <td className="border-r border-slate-100 px-3 py-2 text-center">
                <PercentCell
                  sent={total.moph_sent + total.loc_sent}
                  all={total.moph_all + total.loc_all}
                />
              </td>
              <td className="px-3 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
