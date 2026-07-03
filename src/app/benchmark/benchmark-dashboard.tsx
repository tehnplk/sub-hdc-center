'use client';

import { useMemo, useState } from 'react';
import { Building2, CheckCircle2, MapPin, Power } from 'lucide-react';

export interface BenchmarkRow {
  id: number;
  district: string;
  district_name: string | null;
  system_on: number;
  hos_moph_all: number;
  hos_moph_send: number;
  hos_loc_all: number;
  hos_loc_send: number;
}

type EditableField = 'hos_moph_all' | 'hos_moph_send' | 'hos_loc_all' | 'hos_loc_send';

function percent(sent: number, total: number) {
  return total > 0 ? Math.round((sent / total) * 100) : 0;
}

function EditableNumberCell({
  row,
  field,
  badge = false,
  tone = 'sky',
  onSave,
}: {
  row: BenchmarkRow;
  field: EditableField;
  badge?: boolean;
  tone?: 'sky' | 'amber' | 'emerald';
  onSave: (id: number, field: EditableField, value: number) => Promise<void>;
}) {
  const value = row[field];
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const save = async () => {
    const nextValue = Number(draft);
    if (!Number.isInteger(nextValue) || nextValue < 0) {
      setDraft(String(value));
      setError(true);
      setTimeout(() => setError(false), 1200);
      return;
    }

    if (nextValue === value) {
      return;
    }

    setSaving(true);
    setError(false);
    try {
      await onSave(row.id, field, nextValue);
    } catch {
      setDraft(String(value));
      setError(true);
      setTimeout(() => setError(false), 1200);
    } finally {
      setSaving(false);
    }
  };

  const badgeTone =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-100 text-amber-800 focus:border-amber-500 focus:ring-amber-200'
      : tone === 'emerald'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 focus:border-emerald-500 focus:ring-emerald-200'
        : 'border-sky-200 bg-sky-100 text-sky-800 focus:border-sky-500 focus:ring-sky-200';

  return (
    <input
      className={`h-8 w-20 rounded-full border px-2 text-center text-sm font-extrabold outline-none transition focus:ring-2 ${
        badge ? badgeTone : 'border-transparent bg-transparent text-right text-base font-semibold text-emerald-700 focus:border-emerald-300 focus:bg-white focus:ring-emerald-100'
      } ${saving ? 'opacity-60' : ''} ${error ? 'border-rose-400 bg-rose-50 text-rose-700' : ''}`}
      inputMode="numeric"
      min={0}
      type="number"
      value={draft}
      onBlur={save}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={(event) => event.currentTarget.select()}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }
        if (event.key === 'Escape') {
          setDraft(String(value));
          event.currentTarget.blur();
        }
      }}
    />
  );
}

export function BenchmarkDashboard({ initialRows }: { initialRows: BenchmarkRow[] }) {
  const [rows, setRows] = useState(initialRows);

  const totals = useMemo(() => {
    const totalMophAll = rows.reduce((sum, row) => sum + row.hos_moph_all, 0);
    const totalMophSend = rows.reduce((sum, row) => sum + row.hos_moph_send, 0);
    const totalLocAll = rows.reduce((sum, row) => sum + row.hos_loc_all, 0);
    const totalLocSend = rows.reduce((sum, row) => sum + row.hos_loc_send, 0);

    return {
      activeSystems: rows.filter((row) => row.system_on === 1).length,
      totalMophAll,
      totalMophSend,
      totalLocAll,
      totalLocSend,
      totalMophRate: percent(totalMophSend, totalMophAll),
      totalLocRate: percent(totalLocSend, totalLocAll),
    };
  }, [rows]);

  const saveCell = async (id: number, field: EditableField, value: number) => {
    const response = await fetch('/api/benchmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, field, value }),
    });

    if (!response.ok) {
      throw new Error('Unable to save');
    }

    const payload = (await response.json()) as { row: BenchmarkRow };
    setRows((currentRows) => currentRows.map((row) => (row.id === id ? payload.row : row)));
  };

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-[0_10px_26px_rgba(14,165,233,0.12)]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-sky-700">เปิดระบบ</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <Power className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-4xl font-extrabold text-slate-950">{totals.activeSystems}</p>
        </div>
        <div className="relative min-h-[124px] rounded-xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-4 shadow-[0_10px_26px_rgba(16,185,129,0.14)]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-700">สธ ข้อมูลปีงบ69-ครบแล้ว</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-4xl font-extrabold text-slate-950">
            {totals.totalMophSend}
            <span className="ml-2 text-base font-bold text-slate-500">/ {totals.totalMophAll}</span>
          </p>
          <span className="absolute bottom-4 right-4 rounded-full bg-emerald-600 px-3 py-1 text-lg font-extrabold text-white shadow-md shadow-emerald-600/25">
            {totals.totalMophRate}%
          </span>
        </div>
        <div className="relative min-h-[124px] rounded-xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-4 shadow-[0_10px_26px_rgba(245,158,11,0.14)]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-amber-700">อปท ข้อมูลปีงบ69-ครบแล้ว</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-4xl font-extrabold text-slate-950">
            {totals.totalLocSend}
            <span className="ml-2 text-base font-bold text-slate-500">/ {totals.totalLocAll}</span>
          </p>
          <span className="absolute bottom-4 right-4 rounded-full bg-amber-500 px-3 py-1 text-lg font-extrabold text-white shadow-md shadow-amber-500/25">
            {totals.totalLocRate}%
          </span>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-sky-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.10)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead className="bg-sky-700 text-xs font-extrabold uppercase text-white">
              <tr>
                <th className="px-4 py-3 align-middle" rowSpan={2}>
                  อำเภอ
                </th>
                <th className="px-4 py-3 align-middle" rowSpan={2}>
                  เปิดระบบ
                </th>
                <th className="border-l border-sky-400 px-4 py-3 text-center text-base" colSpan={3}>
                  สังกัด สธ
                </th>
                <th className="border-l border-sky-400 px-4 py-3 text-center text-base" colSpan={3}>
                  สังกัด อปท
                </th>
              </tr>
              <tr className="border-t border-sky-400 bg-sky-600">
                <th className="border-l border-sky-400 px-4 py-3 text-right">แห่ง</th>
                <th className="px-4 py-3 text-right">ข้อมูลปีงบ69-ครบแล้ว</th>
                <th className="px-4 py-3 text-right">ร้อยละ</th>
                <th className="border-l border-sky-400 px-4 py-3 text-right">แห่ง</th>
                <th className="px-4 py-3 text-right">ข้อมูลปีงบ69-ครบแล้ว</th>
                <th className="px-4 py-3 text-right">ร้อยละ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                    No benchmark data
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const mophRate = percent(row.hos_moph_send, row.hos_moph_all);
                  const localRate = percent(row.hos_loc_send, row.hos_loc_all);
                  const isOn = row.system_on === 1;

                  return (
                    <tr key={row.id} className="transition-colors odd:bg-white even:bg-sky-50/45 hover:bg-amber-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                            <MapPin className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{row.district_name ?? '-'}</p>
                            <p className="text-xs font-bold text-sky-600">{row.district}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${
                            isOn
                              ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                              : 'border-rose-300 bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isOn ? 'On' : 'Off'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <EditableNumberCell key={`${row.id}-hos_moph_all-${row.hos_moph_all}`} row={row} field="hos_moph_all" badge tone="sky" onSave={saveCell} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <EditableNumberCell key={`${row.id}-hos_moph_send-${row.hos_moph_send}`} row={row} field="hos_moph_send" tone="emerald" onSave={saveCell} />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{mophRate}%</td>
                      <td className="px-4 py-3 text-right">
                        <EditableNumberCell key={`${row.id}-hos_loc_all-${row.hos_loc_all}`} row={row} field="hos_loc_all" badge tone="amber" onSave={saveCell} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <EditableNumberCell key={`${row.id}-hos_loc_send-${row.hos_loc_send}`} row={row} field="hos_loc_send" tone="amber" onSave={saveCell} />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{localRate}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
