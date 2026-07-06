'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export function AutoRefresh({ intervalSeconds }: { intervalSeconds: number }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(intervalSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.refresh();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router, intervalSeconds]);

  return (
    <button
      type="button"
      onClick={() => {
        router.refresh();
        setCountdown(intervalSeconds);
      }}
      className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50"
    >
      <RefreshCw className="h-3 w-3" />
      refresh อัตโนมัติใน {countdown}s
    </button>
  );
}
