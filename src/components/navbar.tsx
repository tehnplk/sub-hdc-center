'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Download, Users, Zap } from 'lucide-react';

const menus = [
  { href: '/rapid', label: 'งานเร่งรัดติดตาม', icon: Zap },
  { href: '/dashboard/check', label: 'ตรวจสอบการเชื่อมต่อ', icon: Activity },
  { href: '/dashboard/download', label: 'ดาวน์โหลด', icon: Download },
];

export function Navbar() {
  const pathname = usePathname();
  const [visits, setVisits] = useState<number | null>(null);
  const counted = useRef(false);

  // นับจำนวนผู้เข้าใช้งาน 1 ครั้งต่อ session — refresh/reload ในหน้าเดิมจะแค่อ่านยอด
  // (GET) ไม่เพิ่มซ้ำ; ref guard กัน StrictMode ยิงซ้ำในการ mount เดียวกัน
  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    const alreadyCounted = sessionStorage.getItem('visitCounted') === '1';
    fetch('/api/visit', { method: alreadyCounted ? 'GET' : 'POST' })
      .then((response) => response.json())
      .then((data: { count: number }) => {
        setVisits(data.count);
        if (!alreadyCounted) sessionStorage.setItem('visitCounted', '1');
      })
      .catch(() => setVisits(null));
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-200 bg-emerald-50/95 shadow-sm backdrop-blur">
      <div className="flex w-full items-center gap-4 px-[25px] py-[15px]">
        <Link href="/rapid" className="text-xs font-bold text-emerald-700">
          Sub HDC Center
        </Link>
        <div className="flex items-center gap-1">
          {menus.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition ${
                  active
                    ? 'bg-emerald-100 font-semibold text-emerald-800'
                    : 'text-slate-600 hover:bg-emerald-100/60 hover:text-emerald-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
        <span className="ml-auto flex items-center gap-1.5 whitespace-nowrap rounded-md bg-emerald-100 px-2.5 py-1.5 text-xs font-medium text-emerald-700">
          <Users className="h-3.5 w-3.5" />
          จำนวนผู้เข้าใช้งาน {visits === null ? '…' : visits.toLocaleString('th-TH')} ครั้ง
        </span>
      </div>
    </nav>
  );
}
