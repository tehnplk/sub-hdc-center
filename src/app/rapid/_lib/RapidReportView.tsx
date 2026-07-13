'use client';

import { useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  Percent,
  RefreshCw,
  Target,
  TriangleAlert,
} from 'lucide-react';
import { useRapidReport } from './use-rapid-report';
import { formatAffiliation, formatDate, formatNumber, formatPercent } from './rapid-format';
import { sortRows, SortHeader, type SortColumn } from './rapid-sort';
import type { RapidRow } from './rapid-data';

function PercentBadge({ value }: { value: number }) {
  if (value >= 100) {
    return <span className="rounded-full bg-[#59e820] px-2 py-0.5 font-semibold text-white">{formatPercent(value)}</span>;
  }
  if (value <= 0) return <span className="text-slate-300">-</span>;
  return <span className="font-semibold text-amber-700">{formatPercent(value)}</span>;
}

const FIXED_COLUMNS: SortColumn[] = [
  { key: 'hospcode', label: 'หน่วยบริการ', type: 'text' },
  { key: 'ampName', label: 'อำเภอ', type: 'text' },
  { key: 'affiliation', label: 'สังกัด', type: 'text' },
];

export function RapidReportView({ reportId, fallbackTitle }: { reportId: string; fallbackTitle: string }) {
  const {
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
  } = useRapidReport(reportId);

  const mode: 'control' | 'breakdown' | 'simple' = data?.controlLabel
    ? 'control'
    : data?.breakdownCols?.length
      ? 'breakdown'
      : 'simple';

  const breakdownColumns: SortColumn[] = useMemo(
    () => (data?.breakdownCols || []).map((column) => ({ key: column.key, label: column.label, type: 'num' as const })),
    [data?.breakdownCols]
  );

  const sortColumns: SortColumn[] = useMemo(() => {
    if (mode === 'control') {
      return [
        ...FIXED_COLUMNS,
        { key: 'target', label: data?.targetLabel || 'เป้าหมาย', type: 'num' },
        { key: 'control', label: data?.controlLabel || 'ได้รับการตรวจ', type: 'num' },
        { key: 'screenPercent', label: '% ตรวจ', type: 'num' },
        { key: 'result', label: data?.resultLabel || 'ผลงาน', type: 'num' },
        { key: 'controlPercent', label: '% คุมได้', type: 'num' },
        { key: 'unexamined', label: 'ยังไม่ได้ตรวจ', type: 'num' },
      ];
    }
    if (mode === 'breakdown') {
      return [
        ...FIXED_COLUMNS,
        { key: 'target', label: 'เป้าหมาย', type: 'num' },
        { key: 'result', label: 'คัดกรอง', type: 'num' },
        { key: 'percent', label: '%คัดกรอง', type: 'num' },
        { key: 'deficit', label: 'ส่วนขาด (คน)', type: 'num' },
      ];
    }
    return [
      ...FIXED_COLUMNS,
      { key: 'target', label: data?.targetLabel || 'เป้าหมาย', type: 'num' },
      { key: 'result', label: data?.resultLabel || 'ผลงาน', type: 'num' },
      { key: 'percent', label: 'ร้อยละ', type: 'num' },
      { key: 'deficit', label: 'ส่วนขาด', type: 'num' },
    ];
  }, [mode, data]);

  const metricColumns = useMemo(() => sortColumns.slice(FIXED_COLUMNS.length), [sortColumns]);
  const rows = sortRows<RapidRow>(filteredRows, sortColumns, sortKey, sortDir);
  const exportHref = `/api/rapid/${reportId}/export?${new URLSearchParams({
    ...(ampCode ? { ampCode } : {}),
    ...(affiliation ? { affiliation } : {}),
  }).toString()}`;

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
          <Target className="h-3.5 w-3.5" />
        </span>
        <div>
          <h4 className="text-sm font-bold text-slate-900">{data?.title || fallbackTitle}</h4>
          <p className="text-xs text-slate-500">งานเร่งรัดติดตามรายตัวชี้วัด · ดึงข้อมูลสดจาก HDC กลาง</p>
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-sm">
        <span className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          หน่วยบริการ <strong className="text-slate-900">{loading ? '…' : formatNumber(summary.units)}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          {data?.targetLabel || 'เป้าหมาย'} <strong className="text-slate-900">{loading ? '…' : formatNumber(summary.target)}</strong>
        </span>
        {mode === 'control' && (
          <>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              {data?.controlLabel} <strong className="text-slate-900">{loading ? '…' : formatNumber(summary.control)}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              ตรวจ <strong className="text-slate-900">{loading ? '…' : formatPercent(summary.screenPercent)}</strong>
            </span>
          </>
        )}
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          {data?.resultLabel || 'ผลงาน'} <strong className="text-slate-900">{loading ? '…' : formatNumber(summary.result)}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <Percent className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          {mode === 'control' ? 'คุมได้' : 'ร้อยละ'}{' '}
          <strong className="text-slate-900">{loading ? '…' : formatPercent(mode === 'control' ? summary.controlPercent : summary.percent)}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <TriangleAlert className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          {mode === 'control' ? 'ยังไม่ได้ตรวจ' : 'ส่วนขาด'}{' '}
          <strong className="text-slate-900">{loading ? '…' : formatNumber(mode === 'control' ? summary.unexamined : summary.deficit)}</strong>
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-slate-400">
          <Database className="h-3.5 w-3.5" aria-hidden="true" />
          แหล่งข้อมูลจาก HDC กลาง
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={ampCode}
          onChange={(event) => setParam('amp', event.target.value)}
          disabled={loading}
          className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-sky-400"
        >
          <option value="">ทุกอำเภอ</option>
          {districts.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={affiliation}
          onChange={(event) => setParam('aff', event.target.value)}
          disabled={loading}
          className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-sky-400"
        >
          <option value="">ทุกสังกัด</option>
          {affiliations.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <a
          href={exportHref}
          className="ml-auto flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
          ส่งออก Excel
        </a>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-400 bg-white shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
              {FIXED_COLUMNS.map((column) => (
                <SortHeader
                  key={column.key}
                  column={column}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  rowSpan={mode === 'breakdown' ? 2 : undefined}
                />
              ))}
              {metricColumns.map((column) => (
                <SortHeader
                  key={column.key}
                  column={column}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  rowSpan={mode === 'breakdown' ? 2 : undefined}
                />
              ))}
              {mode === 'breakdown' && breakdownColumns.length > 0 && (
                <th colSpan={breakdownColumns.length} className="border-l border-l-slate-400 bg-slate-100 px-3 py-1.5 text-center font-semibold">
                  ผลการคัดกรอง
                </th>
              )}
            </tr>
            {mode === 'breakdown' && (
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                {breakdownColumns.map((column) => (
                  <SortHeader key={column.key} column={column} sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={sortColumns.length}
                  className="px-3 py-6 text-center text-slate-400"
                >
                  {loading ? 'กำลังโหลดข้อมูล...' : 'ไม่พบข้อมูล'}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.hospcode} className="border-b border-slate-100 last:border-0 hover:bg-sky-50/50">
                  <td className="px-3 py-2">
                    <div className="font-mono text-slate-500">{row.hospcode}</div>
                    {row.hospname ? <div className="text-slate-800">{row.hospname}</div> : null}
                  </td>
                  <td className="px-3 py-2 text-slate-700">{row.ampName || '-'}</td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold ${
                        row.affiliation === 'อปท.' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
                      }`}
                    >
                      {formatAffiliation(row.affiliation)}
                    </span>
                  </td>

                  {mode === 'control' && (
                    <>
                      <td className="px-3 py-2 text-center">{formatNumber(row.target)}</td>
                      <td className="px-3 py-2 text-center">{formatNumber(row.control)}</td>
                      <td className="px-3 py-2 text-center">
                        <PercentBadge value={row.screenPercent} />
                      </td>
                      <td className="px-3 py-2 text-center">{formatNumber(row.result)}</td>
                      <td className="px-3 py-2 text-center">
                        <PercentBadge value={row.controlPercent} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={downloadIndividual}
                          className="inline-flex items-center gap-1 text-slate-700 underline-offset-2 hover:text-sky-700 hover:underline"
                        >
                          {formatNumber(row.unexamined)}
                          <Download className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </td>
                    </>
                  )}

                  {mode !== 'control' && (
                    <>
                      <td className="px-3 py-2 text-center">{formatNumber(row.target)}</td>
                      <td className="px-3 py-2 text-center">{formatNumber(row.result)}</td>
                      <td className="px-3 py-2 text-center">
                        <PercentBadge value={row.percent} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={downloadIndividual}
                          className="inline-flex items-center gap-1 text-slate-700 underline-offset-2 hover:text-sky-700 hover:underline"
                        >
                          {formatNumber(row.deficit)}
                          <Download className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </td>
                    </>
                  )}

                  {mode === 'breakdown' &&
                    breakdownColumns.map((column) => (
                      <td key={column.key} className="px-3 py-2 text-center">
                        {formatNumber(Number(row[column.key]))}
                      </td>
                    ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <RefreshCw className="h-3 w-3" aria-hidden="true" />
        {loading ? '…' : `ดึงข้อมูลสดจาก HDC (ปีงบ ${data?.year}) เมื่อ: ${formatDate(data?.fetchedAt)}`}
      </div>
    </div>
  );
}
