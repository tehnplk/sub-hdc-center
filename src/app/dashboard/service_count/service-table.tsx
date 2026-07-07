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

function Dash() {
  return <span className="text-slate-300">-</span>;
}

function CountCell({ value, bold = false }: { value: number; bold?: boolean }) {
  if (value === 0) return <Dash />;
  return <span className={`text-slate-700 ${bold ? 'font-bold' : ''}`}>{value}</span>;
}

function SentBadge({ sent, all, bold = false }: { sent: number; all: number; bold?: boolean }) {
  if (sent === 0) return <Dash />;
  const tone = sent >= all ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
  return (
    <span className={`rounded-full px-2 py-0.5 ${bold ? 'font-bold' : 'font-semibold'} ${tone}`}>
      {sent}
    </span>
  );
}

function PercentCell({ sent, all, bold = false }: { sent: number; all: number; bold?: boolean }) {
  if (all === 0) return <Dash />;
  const pct = Math.round((sent / all) * 100);
  if (pct === 0) return <Dash />;
  if (pct >= 100) {
    return (
      <span className={`rounded-full bg-[#59e820] px-2 py-0.5 text-white ${bold ? 'font-bold' : 'font-semibold'}`}>
        {pct}%
      </span>
    );
  }
  return <span className={`text-amber-700 ${bold ? 'font-bold' : 'font-semibold'}`}>{pct}%</span>;
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
  const [affiliationFilter, setAffiliationFilter] = useState('all');
  const [sentFilter, setSentFilter] = useState('all');

  const sentCount = hospitals.filter((h) => h.sent).length;
  const filtered = hospitals.filter(
    (h) =>
      (affiliationFilter === 'all' || h.affiliation === affiliationFilter) &&
      (sentFilter === 'all' || h.sent === (sentFilter === 'sent'))
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              อำเภอ{district.name} ({district.code})
            </h4>
            <p className="text-xs text-slate-500">
              หน่วยบริการ {hospitals.length} แห่ง · จัดส่งข้อมูลแล้ว {sentCount} แห่ง
              {filtered.length !== hospitals.length && ` · แสดง ${filtered.length} แห่ง`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={affiliationFilter}
              onChange={(event) => setAffiliationFilter(event.target.value)}
              className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-sky-400"
            >
              <option value="all">สังกัด: ทั้งหมด</option>
              <option value="สป.สธ.">สป.สธ.</option>
              <option value="อปท.">อปท.</option>
            </select>
            <select
              value={sentFilter}
              onChange={(event) => setSentFilter(event.target.value)}
              className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-sky-400"
            >
              <option value="all">สถานะส่ง: ทั้งหมด</option>
              <option value="sent">ส่งแล้ว</option>
              <option value="not_sent">ยังไม่ส่ง</option>
            </select>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="px-2 py-2 text-left font-semibold">รหัส</th>
                <th className="px-2 py-2 text-left font-semibold">ชื่อหน่วยบริการ</th>
                <th className="px-2 py-2 text-center font-semibold">จัดส่งข้อมูล</th>
                <th className="px-2 py-2 text-center font-semibold">สังกัด</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-2 py-6 text-center text-slate-400">
                    ไม่มีหน่วยบริการตามเงื่อนไขที่กรอง
                  </td>
                </tr>
              )}
              {filtered.map((h) => (
                <tr key={h.hospcode} className="border-b border-slate-100 last:border-0">
                  <td className="px-2 py-1.5 font-mono text-slate-500">{h.hospcode}</td>
                  <td className="px-2 py-1.5 text-slate-800">{h.hospname}</td>
                  <td className="px-2 py-1.5">
                    <span className="flex justify-center">
                      {h.sent ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#59e820] text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f74d23] text-white">
                          <X className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </span>
                  </td>
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
    <div className="overflow-x-auto rounded-lg border border-slate-400 bg-white shadow-sm">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <th rowSpan={2} className="px-3 py-2 text-left font-semibold">
              รหัสอำเภอ
            </th>
            <th rowSpan={2} className="border-r border-r-slate-400 px-3 py-2 text-left font-semibold">
              อำเภอ
            </th>
            <th colSpan={3} className="border-b border-r border-r-slate-400 bg-sky-50 px-3 py-1.5 text-center font-semibold text-sky-700">
              สังกัด สธ.
            </th>
            <th colSpan={3} className="border-b border-r border-r-slate-400 bg-amber-50 px-3 py-1.5 text-center font-semibold text-amber-700">
              สังกัด อปท.
            </th>
            <th colSpan={3} className="border-b border-r border-r-slate-400 bg-slate-100 px-3 py-1.5 text-center font-semibold text-slate-700">
              รวม
            </th>
            <th rowSpan={2} className="px-3 py-2 text-left font-semibold">
              Update Time
            </th>
          </tr>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <th className="bg-sky-50/60 px-3 py-1.5 text-center font-medium">หน่วยบริการ (แห่ง)</th>
            <th className="bg-sky-50/60 px-3 py-1.5 text-center font-medium">ส่งข้อมูลแล้ว (แห่ง)</th>
            <th className="border-r border-r-slate-400 bg-sky-50/60 px-3 py-1.5 text-center font-medium">%</th>
            <th className="bg-amber-50/60 px-3 py-1.5 text-center font-medium">หน่วยบริการ (แห่ง)</th>
            <th className="bg-amber-50/60 px-3 py-1.5 text-center font-medium">ส่งข้อมูลแล้ว (แห่ง)</th>
            <th className="border-r border-r-slate-400 bg-amber-50/60 px-3 py-1.5 text-center font-medium">%</th>
            <th className="bg-slate-100/70 px-3 py-1.5 text-center font-medium">หน่วยบริการ (แห่ง)</th>
            <th className="bg-slate-100/70 px-3 py-1.5 text-center font-medium">ส่งข้อมูลแล้ว (แห่ง)</th>
            <th className="border-r border-r-slate-400 bg-slate-100/70 px-3 py-1.5 text-center font-medium">%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.code}
              className="border-b border-slate-100 last:border-0 hover:bg-sky-50/50"
            >
              <td className="px-3 py-2 font-mono text-slate-500">{row.code}</td>
              <td className="border-r border-r-slate-400 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setSelected(row)}
                  className="font-medium text-sky-700 underline-offset-2 hover:underline"
                >
                  {row.name}
                </button>
              </td>
              <td className="bg-sky-50/30 px-3 py-2 text-center">
                <CountCell value={row.moph_all} />
              </td>
              <td className="bg-sky-50/30 px-3 py-2 text-center">
                <SentBadge sent={row.moph_sent} all={row.moph_all} />
              </td>
              <td className="border-r border-r-slate-400 bg-sky-50/30 px-3 py-2 text-center">
                <PercentCell sent={row.moph_sent} all={row.moph_all} />
              </td>
              <td className="bg-amber-50/30 px-3 py-2 text-center">
                <CountCell value={row.loc_all} />
              </td>
              <td className="bg-amber-50/30 px-3 py-2 text-center">
                <SentBadge sent={row.loc_sent} all={row.loc_all} />
              </td>
              <td className="border-r border-r-slate-400 bg-amber-50/30 px-3 py-2 text-center">
                <PercentCell sent={row.loc_sent} all={row.loc_all} />
              </td>
              <td className="bg-slate-100/40 px-3 py-2 text-center">
                <CountCell value={row.moph_all + row.loc_all} bold />
              </td>
              <td className="bg-slate-100/40 px-3 py-2 text-center">
                <SentBadge
                  sent={row.moph_sent + row.loc_sent}
                  all={row.moph_all + row.loc_all}
                  bold
                />
              </td>
              <td className="border-r border-r-slate-400 bg-slate-100/40 px-3 py-2 text-center">
                <PercentCell
                  sent={row.moph_sent + row.loc_sent}
                  all={row.moph_all + row.loc_all}
                  bold
                />
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-500">
                {row.last_sync ?? '-'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-700">
            <td className="border-r border-r-slate-400 px-3 py-2" colSpan={2}>
              รวม {rows.length} อำเภอ
            </td>
            <td className="bg-sky-50/60 px-3 py-2 text-center">
              <CountCell value={total.moph_all} />
            </td>
            <td className="bg-sky-50/60 px-3 py-2 text-center">
              <CountCell value={total.moph_sent} />
            </td>
            <td className="border-r border-r-slate-400 bg-sky-50/60 px-3 py-2 text-center">
              <PercentCell sent={total.moph_sent} all={total.moph_all} />
            </td>
            <td className="bg-amber-50/60 px-3 py-2 text-center">
              <CountCell value={total.loc_all} />
            </td>
            <td className="bg-amber-50/60 px-3 py-2 text-center">
              <CountCell value={total.loc_sent} />
            </td>
            <td className="border-r border-r-slate-400 bg-amber-50/60 px-3 py-2 text-center">
              <PercentCell sent={total.loc_sent} all={total.loc_all} />
            </td>
            <td className="bg-slate-100/70 px-3 py-2 text-center">
              <CountCell value={total.moph_all + total.loc_all} bold />
            </td>
            <td className="bg-slate-100/70 px-3 py-2 text-center">
              <CountCell value={total.moph_sent + total.loc_sent} bold />
            </td>
            <td className="border-r border-r-slate-400 bg-slate-100/70 px-3 py-2 text-center">
              <PercentCell
                sent={total.moph_sent + total.loc_sent}
                all={total.moph_all + total.loc_all}
                bold
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
