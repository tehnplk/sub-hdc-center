import { loadRapidReport } from '@/app/rapid/_lib/rapid-data';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const affiliation = url.searchParams.get('affiliation') || '';
  const ampCode = url.searchParams.get('ampCode') || '';

  try {
    const data = await loadRapidReport(id, { affiliation, ampCode });
    if (!data) return Response.json({ error: 'ไม่พบตัวชี้วัดนี้' }, { status: 404 });

    const { report, year, rows, summary } = data;
    return Response.json({
      id,
      title: report.title,
      tableName: report.tableName,
      targetLabel: report.targetLabel,
      resultLabel: report.resultLabel,
      controlLabel: report.controlLabel || '',
      breakdownCols: report.breakdownCols || [],
      rateBase: report.rateBase || '',
      year,
      fetchedAt: new Date().toISOString(),
      rows,
      summary,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'ดึงข้อมูลจาก HDC ไม่สำเร็จ' },
      { status: 500 }
    );
  }
}
