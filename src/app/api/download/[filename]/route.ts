import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getDbPool } from '@/lib/db';

const DOWNLOAD_DIR = path.join(process.cwd(), 'public', 'download');
const DOWNLOAD_EXTS = new Set(['.exe', '.zip', '.xlsx', '.pdf']);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // กัน path traversal — รับเฉพาะชื่อไฟล์ล้วน
  const safeName = path.basename(filename);

  // อนุญาตเฉพาะนามสกุลที่กำหนด
  if (!DOWNLOAD_EXTS.has(path.extname(safeName).toLowerCase())) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const filePath = path.join(DOWNLOAD_DIR, safeName);

  let data: Buffer;
  try {
    data = await fs.readFile(filePath);
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // นับยอดดาวน์โหลด (upsert)
  try {
    const pool = getDbPool();
    await pool.query(
      `INSERT INTO download_count (filename, count, updated_at)
       VALUES ($1, 1, NOW())
       ON CONFLICT (filename)
       DO UPDATE SET count = download_count.count + 1, updated_at = NOW()`,
      [safeName]
    );
  } catch (error) {
    console.error('download count failed:', error);
    // ไม่ให้การนับล้มเหลวขวางการดาวน์โหลด
  }

  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(safeName)}"`,
      'Content-Length': String(data.length),
    },
  });
}
