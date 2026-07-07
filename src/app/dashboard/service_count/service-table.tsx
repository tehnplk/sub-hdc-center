'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

export interface DistrictRow {
  code: string;
  name: string;
  moph_all: number;
  moph_sent: number;
  loc_all: number;
  loc_sent: number;
  last_sync: string | null;
}

export interface HospitalRow {
  amp_code: string;
  hospcode: string;
  hospname: string;
  affiliation: string;
  sent: boolean;
}

function SentBadge({ sent, all }: { sent: number; all: number }) {
  const tone =
    sent === 0
      ? all === 0
        ? 'text-slate-300'
        : 'bg-slate-100 text-slate-400'
      : sent >= all
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-amber-50 text-amber-700';
  return <span className={`rounded-full px-2 py-0.5 font-semibold ${tone}`}>{sent}</span>;
}

function PercentCell({ sent, all }: { sent: number; all: number }) {
  if (all === 0) return <span className="text-slate-300">-</span>;
  const pct = Math.round((sent / all) * 100);
  const tone =
    pct >= 100 ? 'text-emerald-700' : pct > 0 ? 'text-amber-700' : 'text-slate-400';
  return <span className={`font-semibold ${tone}`}>{pct}%</span>;
}

function DistrictModal({
  district,
  hospitals,
  onClose,
}: {
  district: DistrictRow;
  hospitals: HospitalRow[];
  onClose: () => void;
}) {
  const sentCount = hospitals.filter((h) => h.sent).length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              อำเภอ{district.name} ({district.code})
            </h4>
            <p className="text-xs text-slate-500">
              หน่วยบริการ {hospitals.length} แห่ง · จัดส่งข้อมูลแล้ว {sentCount} แห่ง
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-3">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="px-2 py-2 text-left font-semibold">รหัส</th>
                <th className="px-2 py-2 text-left font-semibold">ชื่อหน่วยบริการ</th>
                <th className="px-2 py-2 text-center font-semibold">สังกัด</th>
                <th className="px-2 py-2 text-center font-semibold">จัดส่งข้อมูล</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((h) => (
                <tr key={h.hospcode} className="border-b border-slate-100 last:border-0">
                  <td className="px-2 py-1.5 font-mono text-slate-500">{h.hospcode}</td>
                  <td className="px-2 py-1.5 text-slate-800">{h.hospname}</td>
                  <td className="px-2 py-1.5 text-center">
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold ${
                        h.affiliation === 'อปท.'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-sky-50 text-sky-700'
                      }`}
                    >
                      {h.affiliation}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    <span className="flex justify-center">
                      {h.sent ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <X className="h-4 w-4 text-rose-400" />
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ServiceTable({
  rows,
  hospitals,
}: {
  rows: DistrictRow[];
  hospitals: HospitalRow[];
}) {
  const [selected, setSelected] = useState<DistrictRow | null>(null);
  const total = rows.reduce(
    (acc, row) => ({
      moph_all: acc.moph_all + row.moph_all,
      moph_sent: acc.moph_sent + row.moph_sent,
      loc_all: acc.loc_all + row.loc_all,
      loc_sent: acc.loc_sent + row.loc_sent,
    }),
    { moph_all: 0, moph_sent: 0, loc_all: 0, loc_sent: 0 }
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <th rowSpan={2} className="px-3 py-2 text-left font-semibold">
              รหัสอำเภอ
            </th>
            <th rowSpan={2} className="border-r border-slate-200 px-3 py-2 text-left font-semibold">
              อำเภอ
            </th>
            <th colSpan={3} className="border-b border-r border-slate-200 px-3 py-1.5 text-center font-semibold text-sky-700">
              สังกัด สธ.
            </th>
            <th colSpan={3} className="border-b border-r border-slate-200 px-3 py-1.5 text-center font-semibold text-amber-700">
              สังกัด อปท.
            </th>
            <th colSpan={3} className="border-b border-r border-slate-200 px-3 py-1.5 text-center font-semibold text-slate-700">
              รวม
            </th>
            <th rowSpan={2} className="px-3 py-2 text-left font-semibold">
              Update Time
            </th>
          </tr>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <th className="px-3 py-1.5 text-center font-medium">หน่วยบริการ (แห่ง)</th>
            <th className="px-3 py-1.5 text-center font-medium">ส่งข้อมูลแล้ว (แห่ง)</th>
            <th className="border-r border-slate-200 px-3 py-1.5 text-center font-medium">%</th>
            <th className="px-3 py-1.5 text-center font-medium">หน่วยบริการ (แห่ง)</th>
            <th className="px-3 py-1.5 text-center font-medium">ส่งข้อมูลแล้ว (แห่ง)</th>
            <th className="border-r border-slate-200 px-3 py-1.5 text-center font-medium">%</th>
            <th className="px-3 py-1.5 text-center font-medium">หน่วยบริการ (แห่ง)</th>
            <th className="px-3 py-1.5 text-center font-medium">ส่งข้อมูลแล้ว (แห่ง)</th>
            <th className="border-r border-slate-200 px-3 py-1.5 text-center font-medium">%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.code}
              className="border-b border-slate-100 last:border-0 hover:bg-sky-50/50"
            >
              <td className="px-3 py-2 font-mono text-slate-500">{row.code}</td>
              <td className="border-r border-slate-100 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setSelected(row)}
                  className="font-medium text-sky-700 underline-offset-2 hover:underline"
                >
                  {row.name}
                </button>
              </td>
              <td className="px-3 py-2 text-center text-slate-700">{row.moph_all}</td>
              <td className="px-3 py-2 text-center">
                <SentBadge sent={row.moph_sent} all={row.moph_all} />
              </td>
              <td className="border-r border-slate-100 px-3 py-2 text-center">
                <PercentCell sent={row.moph_sent} all={row.moph_all} />
              </td>
              <td className="px-3 py-2 text-center text-slate-700">{row.loc_all}</td>
              <td className="px-3 py-2 text-center">
                <SentBadge sent={row.loc_sent} all={row.loc_all} />
              </td>
              <td className="border-r border-slate-100 px-3 py-2 text-center">
                <PercentCell sent={row.loc_sent} all={row.loc_all} />
              </td>
              <td className="px-3 py-2 text-center text-slate-700">
                {row.moph_all + row.loc_all}
              </td>
              <td className="px-3 py-2 text-center">
                <SentBadge sent={row.moph_sent + row.loc_sent} all={row.moph_all + row.loc_all} />
              </td>
              <td className="border-r border-slate-100 px-3 py-2 text-center">
                <PercentCell sent={row.moph_sent + row.loc_sent} all={row.moph_all + row.loc_all} />
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-500">
                {row.last_sync ?? '-'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-700">
            <td className="px-3 py-2" colSpan={2}>
              รวม {rows.length} อำเภอ
            </td>
            <td className="px-3 py-2 text-center">{total.moph_all}</td>
            <td className="px-3 py-2 text-center">{total.moph_sent}</td>
            <td className="border-r border-slate-100 px-3 py-2 text-center">
              <PercentCell sent={total.moph_sent} all={total.moph_all} />
            </td>
            <td className="px-3 py-2 text-center">{total.loc_all}</td>
            <td className="px-3 py-2 text-center">{total.loc_sent}</td>
            <td className="border-r border-slate-100 px-3 py-2 text-center">
              <PercentCell sent={total.loc_sent} all={total.loc_all} />
            </td>
            <td className="px-3 py-2 text-center">{total.moph_all + total.loc_all}</td>
            <td className="px-3 py-2 text-center">{total.moph_sent + total.loc_sent}</td>
            <td className="border-r border-slate-100 px-3 py-2 text-center">
              <PercentCell
                sent={total.moph_sent + total.loc_sent}
                all={total.moph_all + total.loc_all}
              />
            </td>
            <td className="px-3 py-2" />
          </tr>
        </tfoot>
      </table>

      {selected && (
        <DistrictModal
          district={selected}
          hospitals={hospitals.filter((h) => h.amp_code === selected.code)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
