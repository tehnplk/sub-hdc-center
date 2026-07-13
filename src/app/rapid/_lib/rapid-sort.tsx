import { ChevronUp, ChevronDown } from 'lucide-react';

export interface SortColumn {
  key: string;
  label: string;
  type: 'text' | 'num';
  className?: string;
}

// เรียง rows ตาม column ที่เลือก (num/text) — ใช้ร่วมทุกหน้า /rapid
export function sortRows<T extends Record<string, unknown>>(
  rows: T[],
  columns: SortColumn[],
  sortKey: string,
  sortDir: string
): T[] {
  const column = columns.find((item) => item.key === sortKey) || columns[0];
  const sign = sortDir === 'desc' ? -1 : 1;
  return [...rows].sort((left, right) => {
    const a = left[column.key];
    const b = right[column.key];
    if (column.type === 'num') return (Number(a || 0) - Number(b || 0)) * sign;
    return String(a || '').localeCompare(String(b || ''), 'th') * sign;
  });
}

// หัวคอลัมน์ที่คลิก sort ได้ (อัปเดต query string ผ่าน onSort)
export function SortHeader({
  column,
  sortKey,
  sortDir,
  onSort,
  rowSpan,
  colSpan,
}: {
  column: SortColumn;
  sortKey: string;
  sortDir: string;
  onSort: (key: string) => void;
  rowSpan?: number;
  colSpan?: number;
}) {
  const active = sortKey === column.key;
  return (
    <th
      rowSpan={rowSpan}
      colSpan={colSpan}
      className={`px-3 py-2 text-center font-semibold ${column.className || ''}`}
      aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        className={`inline-flex items-center gap-1 transition ${
          active ? 'text-sky-700' : 'text-slate-600 hover:text-slate-900'
        }`}
        onClick={() => onSort(column.key)}
      >
        {column.label}
        {active ? (
          sortDir === 'asc' ? <ChevronUp className="h-3 w-3" aria-hidden="true" /> : <ChevronDown className="h-3 w-3" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-3 w-3 opacity-30" aria-hidden="true" />
        )}
      </button>
    </th>
  );
}
