import * as XLSX from 'xlsx';
import { loadRapidReport } from '@/app/rapid/_lib/rapid-data';

// ส่งออกผลงานรายหน่วยบริการเป็น xlsx — ข้อมูลสรุป (ไม่มีข้อมูลรายคน) จึงไม่ต้อง login
// รองรับ filter อำเภอ (?ampCode=) และสังกัด (?affiliation=) ให้ตรงกับที่กรองบนหน้าเว็บ
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const affiliation = url.searchParams.get('affiliation') || '';
  const ampCode = url.searchParams.get('ampCode') || '';

  try {
    const data = await loadRapidReport(id, { affiliation, ampCode });
    if (!data) return Response.json({ error: 'ไม่พบตัวชี้วัดนี้' }, { status: 404 });

    const { report, year, rows } = data;
    const headers = report.breakdownCols?.length
      ? [
          'รหัสหน่วยบริการ',
          'หน่วยบริการ',
          'อำเภอ',
          'สังกัด',
          'เป้าหมาย',
          'คัดกรอง',
          '%คัดกรอง',
          'ส่วนขาด (คน)',
          ...report.breakdownCols.map(({ label }) => label),
        ]
      : report.controlLabel
        ? ['รหัสหน่วยบริการ', 'หน่วยบริการ', 'อำเภอ', 'สังกัด', report.targetLabel, report.controlLabel, '% ตรวจ', report.resultLabel, '% คุมได้', 'ยังไม่ได้ตรวจ']
        : ['รหัสหน่วยบริการ', 'หน่วยบริการ', 'อำเภอ', 'สังกัด', 'เป้าหมาย', report.resultLabel, 'ร้อยละ', 'ส่วนขาด'];

    const aoa = [
      headers,
      ...rows.map((row) => [
        row.hospcode,
        row.hospname,
        row.ampName,
        row.affiliation,
        row.target,
        ...(report.breakdownCols?.length
          ? [row.result, Number(row.percent.toFixed(2)), row.deficit, ...report.breakdownCols.map(({ key }) => row[key])]
          : report.controlLabel
            ? [row.control, Number(row.screenPercent.toFixed(2)), row.result, Number(row.controlPercent.toFixed(2)), row.unexamined]
            : [row.result, Number(row.percent.toFixed(2)), row.deficit]),
      ]),
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(workbook, worksheet, `rapid_${id}`.slice(0, 31));
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }) as Buffer;

    const suffix = [ampCode && 'อำเภอ', affiliation && 'สังกัด'].filter(Boolean).length ? '_filtered' : '';
    const filename = `rapid_${id}_${year}${suffix}.xlsx`;
    return new Response(new Blob([new Uint8Array(buffer)]), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'ส่งออกไม่สำเร็จ' },
      { status: 500 }
    );
  }
}
