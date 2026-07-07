import type { Metadata } from 'next';
import { Send } from 'lucide-react';
import { getDbPool } from '@/lib/db';
import { ServiceTable, type DistrictRow, type HospitalRow } from './service-table';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'หน่วยบริการส่งข้อมูลเข้าศูนย์ข้อมูลระดับอำเภอ',
  description: 'จำนวนหน่วยบริการที่ส่งข้อมูล แยกรายอำเภอและสังกัด',
};

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

async function getHospitalRows() {
  const pool = getDbPool();
  const { rows } = await pool.query<HospitalRow>(`
    SELECT
      h.amp_code,
      h.hospcode,
      h.hospname,
      CASE WHEN h.hostype_new = '21' THEN 'อปท.' ELSE 'สป.สธ.' END AS affiliation,
      EXISTS (
        SELECT 1
        FROM data_sync_in s
        CROSS JOIN LATERAL jsonb_to_recordset(s.payload -> 'rows') AS r(hospcode text)
        WHERE s.topic = 'service_count' AND r.hospcode = h.hospcode
      ) AS sent
    FROM c_hospital h
    WHERE h.is_active AND h.hostype_new IN ('18', '5', '7', '8', '21')
    ORDER BY h.amp_code, (h.hostype_new = '21'), h.hospcode
  `);
  return rows;
}

export default async function ServiceCountPage() {
  const [rows, hospitals] = await Promise.all([getDistrictRows(), getHospitalRows()]);

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
          <Send className="h-3.5 w-3.5" />
        </span>
        <div>
          <h4 className="text-sm font-bold text-slate-900">หน่วยบริการส่งข้อมูลเข้าศูนย์ข้อมูลระดับอำเภอ</h4>
          <p className="text-xs text-slate-500">คลิกชื่ออำเภอเพื่อดูรายหน่วย</p>
        </div>
      </header>

      <ServiceTable rows={rows} hospitals={hospitals} />
    </div>
  );
}
