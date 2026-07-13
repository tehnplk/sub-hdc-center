'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import type { BreakdownCol } from './rapid-reports';
import type { RapidRow, RapidSummary } from './rapid-data';

export interface RapidApiResponse {
  id: string;
  title: string;
  targetLabel: string;
  resultLabel: string;
  controlLabel: string;
  breakdownCols: BreakdownCol[];
  year: string;
  fetchedAt: string;
  rows: RapidRow[];
  summary: RapidSummary;
}

// สถานะร่วมของทุกหน้า /rapid — โหลดข้อมูล report จาก API, กรองอำเภอ + สังกัด + sort ผ่าน
// query string (?amp=&aff=&sort=&dir=), สรุปยอดรวม, และ handler ดาวน์โหลดรายคน
export function useRapidReport(reportId: string) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<RapidApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/rapid/${reportId}`, { cache: 'no-store' })
      .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (!ok) throw new Error(payload.error || 'โหลดข้อมูลไม่สำเร็จ');
        setData(payload);
      })
      .catch((loadError: Error) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [reportId]);

  // อัปเดต query string หนึ่งพารามิเตอร์ (ค่าว่าง = ลบทิ้ง)
  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const ampCode = searchParams.get('amp') || '';
  const affiliation = searchParams.get('aff') || '';
  const allRows = useMemo(() => data?.rows || [], [data]);

  const districts = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of allRows) if (row.ampCode) map.set(row.ampCode, row.ampName);
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [allRows]);

  const affiliations = useMemo(
    () => [...new Set(allRows.map((row) => row.affiliation).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'th')),
    [allRows]
  );

  const filteredRows = useMemo(
    () =>
      allRows.filter(
        (row) => (!ampCode || row.ampCode === ampCode) && (!affiliation || row.affiliation === affiliation)
      ),
    [allRows, ampCode, affiliation]
  );

  // สถานะ sort จาก query string — default เรียงตาม hospcode
  const sortKey = searchParams.get('sort') || 'hospcode';
  const sortDir = searchParams.get('dir') === 'desc' ? 'desc' : 'asc';
  function toggleSort(key: string) {
    const nextDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', key);
    params.set('dir', nextDir);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const summary: RapidSummary = useMemo(() => {
    const target = filteredRows.reduce((sum, row) => sum + row.target, 0);
    const result = filteredRows.reduce((sum, row) => sum + row.result, 0);
    const control = filteredRows.reduce((sum, row) => sum + row.control, 0);
    return {
      units: filteredRows.length,
      target,
      result,
      control,
      screenPercent: target > 0 ? (control / target) * 100 : 0,
      controlPercent: control > 0 ? (result / control) * 100 : 0,
      unexamined: target - control,
      percent: target > 0 ? (result / target) * 100 : 0,
      deficit: target - result,
    };
  }, [filteredRows]);

  // คลิกส่วนขาด → ชี้ไปยังศูนย์ข้อมูล SUB-HDC ของอำเภอนั้น (ดูรายบุคคลได้ที่ปลายทาง)
  function downloadIndividual(row: RapidRow) {
    const ampName = row.ampName || '-';
    // ตัด / ท้าย public_url (ถ้ามี) แล้วต่อ /rapid/index
    const base = row.subUrl.replace(/\/+$/, '');
    const target = base ? `${base}/rapid/index` : '';
    Swal.fire({
      icon: 'info',
      title: 'ดูข้อมูลรายบุคคล',
      html: `สามารถดูข้อมูลรายบุคคลได้ที่<br/>ศูนย์ข้อมูล SUB-HDC อ.${ampName}${
        target ? '' : '<br/><br/><span style="color:#94a3b8;">(ยังไม่มีลิงก์ศูนย์ข้อมูลของอำเภอนี้)</span>'
      }`,
      // ไม่มีปุ่มปิด — ใช้ปุ่มกากบาทมุมขวาบนแทน; คลิกลิงก์แล้วปิด modal อัตโนมัติ
      showCloseButton: true,
      showConfirmButton: Boolean(target),
      confirmButtonText: 'คลิกไปยังศูนย์ข้อมูลอำเภอ',
      confirmButtonColor: '#0284c7',
    }).then((result) => {
      if (result.isConfirmed && target) window.open(target, '_blank', 'noopener,noreferrer');
    });
  }

  return {
    data,
    loading,
    error,
    ampCode,
    affiliation,
    districts,
    affiliations,
    setParam,
    filteredRows,
    summary,
    sortKey,
    sortDir,
    toggleSort,
    downloadIndividual,
  };
}
