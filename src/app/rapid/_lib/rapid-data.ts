import { getDbPool } from '@/lib/db';
import { RAPID_REPORTS, currentThaiFiscalYear, type BreakdownCol } from './rapid-reports';

// โหลด + สรุปข้อมูล report จาก HDC opendata API (live) รายหน่วยบริการ
// ใช้ร่วมกันระหว่าง GET (JSON) และ export (xlsx)
// ต่างจาก sub center เดี่ยว (SUB_HDC): ที่นี่เป็นศูนย์ข้อมูลระดับจังหวัด จึงไม่ fix อำเภอเดียว
// แต่แสดงทุกอำเภอ — filter อำเภอ/สังกัดทำที่ query string ฝั่ง client แทน

const HDC_API_URL =
  (process.env.HDC_API_BASE_URL || 'https://opendata.moph.go.th/api').replace(/\/$/, '') + '/report_data';
const HDC_PROVINCE = process.env.HDC_API_PROVINCE || '65';

export interface RapidRow {
  hospcode: string;
  hospname: string;
  affiliation: string;
  ampCode: string;
  ampName: string;
  target: number;
  result: number;
  control: number;
  screenPercent: number;
  controlPercent: number;
  unexamined: number;
  percent: number;
  deficit: number;
  [key: string]: string | number;
}

export interface RapidSummary {
  units: number;
  target: number;
  result: number;
  control: number;
  screenPercent: number;
  controlPercent: number;
  unexamined: number;
  percent: number;
  deficit: number;
}

interface HdcApiRow {
  hospcode?: string;
  [key: string]: unknown;
}

function sumCols(row: HdcApiRow, cols: string[]) {
  let total = 0;
  for (const col of cols) total += Number(row?.[col] || 0);
  return total;
}

interface HospInfo {
  hospname: string;
  ampCode: string;
  ampName: string;
  affiliation: string;
}

// ชื่อ + อำเภอ + สังกัด ราย hospcode — ใช้ hostype_new เดียวกับหน้า service_count
// ('21' = อปท., นอกนั้น = สป.สธ.)
async function getHospInfoMap(): Promise<Record<string, HospInfo>> {
  const pool = getDbPool();
  const { rows } = await pool.query<{
    hospcode: string;
    hospname: string | null;
    amp_code: string | null;
    amp_name: string | null;
    hostype_new: string | null;
  }>(`
    SELECT hospcode, hospname, amp_code, amp_name, hostype_new
    FROM c_hospital
    WHERE is_active AND hostype_new IN ('18', '5', '7', '8', '21')
  `);
  const map: Record<string, HospInfo> = {};
  for (const row of rows) {
    map[row.hospcode] = {
      hospname: row.hospname || '',
      ampCode: row.amp_code || '',
      ampName: row.amp_name || '',
      affiliation: row.hostype_new === '21' ? 'อปท.' : 'สป.สธ.',
    };
  }
  return map;
}

function computeSummary(rows: RapidRow[]): RapidSummary {
  const target = rows.reduce((sum, row) => sum + row.target, 0);
  const result = rows.reduce((sum, row) => sum + row.result, 0);
  const control = rows.reduce((sum, row) => sum + row.control, 0);
  return {
    units: rows.length,
    target,
    result,
    control,
    screenPercent: target > 0 ? (control / target) * 100 : 0,
    controlPercent: control > 0 ? (result / control) * 100 : 0,
    unexamined: target - control,
    percent: target > 0 ? (result / target) * 100 : 0,
    deficit: target - result,
  };
}

export interface LoadRapidReportResult {
  report: (typeof RAPID_REPORTS)[string];
  year: string;
  rows: RapidRow[];
  summary: RapidSummary;
}

// คืน null ถ้า id ไม่รู้จัก; ไม่งั้นคืน { report, year, rows, summary }
// รองรับ filter สังกัด (affiliation) และอำเภอ (ampCode) — ใช้ทั้งฝั่งแสดงผลและ export
export async function loadRapidReport(
  id: string,
  { affiliation = '', ampCode = '' }: { affiliation?: string; ampCode?: string } = {}
): Promise<LoadRapidReportResult | null> {
  const report = RAPID_REPORTS[id];
  if (!report) return null;

  const year = currentThaiFiscalYear();
  const response = await fetch(HDC_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ tableName: report.tableName, year, province: HDC_PROVINCE, type: 'json' }),
    cache: 'no-store',
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`HDC API ${response.status}: ${text.slice(0, 200)}`);
  const payload = JSON.parse(text) as HdcApiRow[];
  if (!Array.isArray(payload)) throw new Error('รูปแบบข้อมูลจาก HDC ไม่ถูกต้อง');

  // รวมราย hospcode (payload เป็นราย hospcode+areacode รายเดือน)
  const byHospcode = new Map<string, Record<string, number>>();
  for (const row of payload) {
    const hospcode = String(row?.hospcode || '').trim();
    if (!hospcode) continue;
    const acc = byHospcode.get(hospcode) || { target: 0, result: 0, control: 0 };
    acc.target += sumCols(row, report.targetCols);
    acc.result += sumCols(row, report.resultCols);
    acc.control += sumCols(row, report.controlCols || []);
    for (const { key, sourceCols, outsideCriteria } of report.breakdownCols || []) {
      if (outsideCriteria) continue; // คำนวณทีหลังจากยอดรวม
      acc[key] = (acc[key] || 0) + sumCols(row, sourceCols || [key]);
    }
    byHospcode.set(hospcode, acc);
  }

  // คอลัมน์ "นอกเกณฑ์" = max(0, ผลงาน - ผลรวม breakdown อื่น) คำนวณบนยอดรวมรายหน่วย
  const outsideCols = (report.breakdownCols || []).filter((column: BreakdownCol) => column.outsideCriteria);
  if (outsideCols.length) {
    const classifiedCols = (report.breakdownCols || []).filter((column: BreakdownCol) => !column.outsideCriteria);
    for (const acc of byHospcode.values()) {
      const classified = classifiedCols.reduce((sum, column) => sum + (acc[column.key] || 0), 0);
      for (const { key } of outsideCols) acc[key] = Math.max(0, (acc.result || 0) - classified);
    }
  }

  const hospInfo = await getHospInfoMap();

  const rows: RapidRow[] = Array.from(byHospcode.entries())
    .map(([hospcode, acc]) => {
      const info = hospInfo[hospcode] || ({} as Partial<HospInfo>);
      return {
        hospcode,
        hospname: info.hospname || '',
        affiliation: info.affiliation || '',
        ampCode: info.ampCode || '',
        ampName: info.ampName || '',
        target: acc.target,
        result: acc.result,
        control: acc.control,
        screenPercent: acc.target > 0 ? (acc.control / acc.target) * 100 : 0,
        controlPercent: acc.control > 0 ? (acc.result / acc.control) * 100 : 0,
        unexamined: acc.target - acc.control,
        percent: acc.target > 0 ? (acc.result / acc.target) * 100 : 0,
        deficit: acc.target - acc.result,
        ...Object.fromEntries((report.breakdownCols || []).map(({ key }) => [key, acc[key] || 0])),
      } as RapidRow;
    })
    // แสดงเฉพาะหน่วยบริการที่รู้จัก (มีใน c_hospital) + filter อำเภอ/สังกัดถ้าระบุ
    .filter(
      (row) =>
        row.ampCode && (!ampCode || row.ampCode === ampCode) && (!affiliation || row.affiliation === affiliation)
    )
    .sort((left, right) => left.hospcode.localeCompare(right.hospcode));

  return { report, year, rows, summary: computeSummary(rows) };
}
