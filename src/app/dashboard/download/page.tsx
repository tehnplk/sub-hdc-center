import type { Metadata } from 'next';
import { connection } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Download, FileDown } from 'lucide-react';
import { getDbPool } from '@/lib/db';
import { ScreenshotButton } from './screenshot-button';

export const metadata: Metadata = {
  title: 'ดาวน์โหลด',
  description: 'ดาวน์โหลดโปรแกรมและไฟล์',
};

interface DownloadFile {
  name: string;
  description: string;
  screenshot: string | null;
  size: number;
  modified: string;
  downloads: number;
}

// นามสกุลภาพ screenshot (ไม่แสดงเป็นรายการดาวน์โหลด แต่ใช้จับคู่)
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

// นามสกุลที่อนุญาตให้แสดงในรายการดาวน์โหลด
const DOWNLOAD_EXTS = new Set(['.exe', '.zip', '.xlsx', '.pdf']);

const DOWNLOAD_DIR = path.join(process.cwd(), 'public', 'download');

// คำอธิบายไฟล์ (map ตามชื่อไฟล์)
const FILE_DESCRIPTIONS: Record<string, string> = {
  'plk_link_person.exe': 'โปรแกรมถอดรหัสไฟล์ Excel จาก HDC Data Exchange',
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unit]}`;
}

async function getDownloadCounts(): Promise<Map<string, number>> {
  try {
    const pool = getDbPool();
    const { rows } = await pool.query<{ filename: string; count: string }>(
      'SELECT filename, count FROM download_count'
    );
    return new Map(rows.map((row) => [row.filename, Number(row.count)]));
  } catch {
    return new Map();
  }
}

async function getFiles(): Promise<DownloadFile[]> {
  let entries: string[] = [];
  try {
    entries = await fs.readdir(DOWNLOAD_DIR);
  } catch {
    return [];
  }

  const counts = await getDownloadCounts();

  // แยกไฟล์ภาพ (screenshot) ออกจากไฟล์ดาวน์โหลด — จับคู่ด้วยชื่อฐานเดียวกัน
  const imageByBase = new Map<string, string>();
  for (const name of entries) {
    const ext = path.extname(name).toLowerCase();
    if (IMAGE_EXTS.has(ext)) {
      imageByBase.set(path.basename(name, path.extname(name)), name);
    }
  }

  const files = await Promise.all(
    entries.map(async (name) => {
      const ext = path.extname(name).toLowerCase();
      if (!DOWNLOAD_EXTS.has(ext)) return null;

      const stat = await fs.stat(path.join(DOWNLOAD_DIR, name));
      if (!stat.isFile()) return null;

      const image = imageByBase.get(path.basename(name, path.extname(name)));
      return {
        name,
        description: FILE_DESCRIPTIONS[name] ?? '',
        screenshot: image ? `/download/${encodeURIComponent(image)}` : null,
        size: stat.size,
        modified: new Intl.DateTimeFormat('th-TH', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Bangkok',
        }).format(stat.mtime),
        downloads: counts.get(name) ?? 0,
      } satisfies DownloadFile;
    })
  );

  return files
    .filter((file): file is DownloadFile => file !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default async function DownloadPage() {
  await connection(); // อ่านรายการไฟล์สดทุก request
  const files = await getFiles();

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
          <Download className="h-3.5 w-3.5" />
        </span>
        <div>
          <h4 className="text-sm font-bold text-slate-900">ดาวน์โหลด</h4>
          <p className="text-xs text-slate-500">รายการโปรแกรมและไฟล์สำหรับดาวน์โหลด</p>
        </div>
      </header>

      <div className="overflow-x-auto rounded-lg border border-slate-400 bg-white shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="px-3 py-2 font-semibold">ชื่อไฟล์</th>
              <th className="px-3 py-2 font-semibold">รายละเอียด</th>
              <th className="px-3 py-2 text-right font-semibold">ขนาด</th>
              <th className="px-3 py-2 font-semibold">อัปเดตล่าสุด</th>
              <th className="px-3 py-2 text-center font-semibold">ดาวน์โหลด</th>
              <th className="px-3 py-2 text-right font-semibold">จำนวนดาวน์โหลด</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                  ยังไม่มีไฟล์สำหรับดาวน์โหลด
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr
                  key={file.name}
                  className="border-b border-slate-100 last:border-0 hover:bg-sky-50/50"
                >
                  <td className="px-3 py-2 font-medium text-slate-800">{file.name}</td>
                  <td className="px-3 py-2 text-slate-600">
                    <span className="flex items-center gap-2">
                      <span>{file.description || '-'}</span>
                      {file.screenshot && (
                        <ScreenshotButton src={file.screenshot} alt={file.name} />
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-500">
                    {formatSize(file.size)}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{file.modified}</td>
                  <td className="px-3 py-2">
                    <span className="flex justify-center">
                      <a
                        href={`/api/download/${encodeURIComponent(file.name)}`}
                        className="flex items-center gap-1.5 rounded-md bg-sky-600 px-2.5 py-1 font-semibold text-white transition hover:bg-sky-700"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        ดาวน์โหลด
                      </a>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-700">
                    {file.downloads.toLocaleString('th-TH')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
