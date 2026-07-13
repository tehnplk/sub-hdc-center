'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Download, Zap } from 'lucide-react';

const menus = [
  { href: '/rapid', label: 'งานเร่งรัดติดตาม', icon: Zap },
  { href: '/dashboard/check', label: 'ตรวจสอบการเชื่อมต่อ', icon: Activity },
  { href: '/dashboard/download', label: 'ดาวน์โหลด', icon: Download },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-sky-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-11 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/rapid" className="text-xs font-bold text-sky-700">
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
                    ? 'bg-sky-100 font-semibold text-sky-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
