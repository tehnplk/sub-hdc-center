import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Zap } from 'lucide-react';
import { RAPID_MENU } from './_lib/rapid-reports';

export const metadata: Metadata = {
  title: 'งานเร่งรัดติดตาม',
  description: 'ตัวชี้วัดงานเร่งรัดติดตาม ดึงข้อมูลสดจาก HDC กลาง',
};

export default function RapidPortalPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
          <Zap className="h-3.5 w-3.5" />
        </span>
        <div>
          <h4 className="text-sm font-bold text-slate-900">งานเร่งรัดติดตาม</h4>
          <p className="text-xs text-slate-500">เลือกตัวชี้วัดเพื่อดูผลงานรายหน่วยบริการ (ดึงข้อมูลสดจาก HDC กลาง)</p>
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border border-slate-400 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {RAPID_MENU.map(({ id, href, title }, index) => (
            <li key={id}>
              <Link
                href={href}
                className="flex items-center gap-3 px-4 py-3 text-xs transition hover:bg-emerald-50/50"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                  {index + 1}
                </span>
                <span className="flex-1 font-medium text-slate-800">{title}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
