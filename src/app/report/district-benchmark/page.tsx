import { getDbPool } from '@/lib/db';
import { MapPin, Building2, CheckCircle2, Percent, LayoutDashboard } from 'lucide-react';

export const revalidate = 0; // Always fetch fresh data

interface BenchmarkItem {
  id: number;
  code: string;
  district_name: string;
  hos_moph_all: number;
  hos_moph_send: number;
}

async function getBenchmarkData(): Promise<BenchmarkItem[]> {
  const pool = getDbPool();
  try {
    const [rows] = await pool.query(`
      SELECT b.id, b.district AS code, c.name AS district_name, b.hos_moph_all, b.hos_moph_send
      FROM benchmark_district b
      JOIN c_district c ON b.district = c.code
      ORDER BY b.district
    `);
    return rows as BenchmarkItem[];
  } catch (error) {
    console.error('Database query failed:', error);
    return [];
  }
}

export default async function DistrictBenchmarkReport() {
  const data = await getBenchmarkData();

  // Summary calculations
  const totalDistricts = data.length;
  const totalHosAll = data.reduce((sum, item) => sum + item.hos_moph_all, 0);
  const totalHosSend = data.reduce((sum, item) => sum + item.hos_moph_send, 0);
  const overallPercentage = totalHosAll > 0 ? parseFloat(((totalHosSend / totalHosAll) * 100).toFixed(1)) : 0;

  const getStatus = (send: number, all: number) => {
    if (all === 0) return { label: 'ไม่มีข้อมูล', color: 'bg-slate-100 text-slate-600 border border-slate-200' };
    const pct = (send / all) * 100;
    if (pct === 100) return { label: '100%', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
    if (pct >= 80) return { label: 'ดีเยี่ยม', color: 'bg-green-50 text-green-700 border border-green-200' };
    if (pct >= 50) return { label: 'ปานกลาง', color: 'bg-amber-50 text-amber-700 border border-amber-200' };
    return { label: 'ปรับปรุง', color: 'bg-rose-50 text-rose-700 border border-rose-200' };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 sm:p-8 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-slate-200">
          <div className="relative flex items-center justify-center p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20 border border-emerald-400/20">
            <LayoutDashboard className="w-6 h-6 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.15)]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              รายงานอัตราการส่งข้อมูลรายอำเภอ
            </h1>
          </div>
        </div>

        {/* Summaries Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Districts */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:shadow-[0_8px_20px_rgba(16,185,129,0.06)] hover:border-emerald-200 transition-all duration-300">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">จำนวนอำเภอ</p>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalDistricts} <span className="text-sm font-normal text-slate-500">อำเภอ</span></h3>
            </div>
            <div className="relative flex items-center justify-center p-3.5 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-2xl shadow-lg shadow-emerald-500/25 border border-emerald-300/20 group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300">
              <MapPin className="w-6 h-6 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.15)]" />
            </div>
          </div>

          {/* Card 2: Total Units */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:shadow-[0_8px_20px_rgba(16,185,129,0.06)] hover:border-emerald-200 transition-all duration-300">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">หน่วยบริการทั้งหมด</p>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalHosAll} <span className="text-sm font-normal text-slate-500">แห่ง</span></h3>
            </div>
            <div className="relative flex items-center justify-center p-3.5 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-2xl shadow-lg shadow-emerald-500/25 border border-emerald-300/20 group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300">
              <Building2 className="w-6 h-6 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.15)]" />
            </div>
          </div>

          {/* Card 3: Sent */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:shadow-[0_8px_20px_rgba(16,185,129,0.06)] hover:border-emerald-200 transition-all duration-300">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">นำเข้าแล้ว</p>
              <h3 className="text-3xl font-extrabold text-emerald-600 tracking-tight">{totalHosSend} <span className="text-sm font-normal text-slate-500">แห่ง</span></h3>
            </div>
            <div className="relative flex items-center justify-center p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-600/25 border border-emerald-400/20 group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300">
              <CheckCircle2 className="w-6 h-6 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.15)]" />
            </div>
          </div>

          {/* Card 4: Percentage */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:shadow-[0_8px_20px_rgba(16,185,129,0.06)] hover:border-emerald-200 transition-all duration-300">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">อัตราการส่งข้อมูล</p>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{overallPercentage}%</h3>
            </div>
            <div className="relative flex items-center justify-center p-3.5 bg-gradient-to-br from-teal-400 to-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/25 border border-emerald-300/20 group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300">
              <Percent className="w-6 h-6 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.15)]" />
            </div>
          </div>
        </div>

        {/* Detail Table */}
        <div className="bg-white border border-slate-200/85 rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">ข้อมูลรายอำเภอ</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">รหัสอำเภอ</th>
                  <th className="px-6 py-4">ชื่ออำเภอ</th>
                  <th className="px-6 py-4 text-center">หน่วยบริการทั้งหมด</th>
                  <th className="px-6 py-4 text-center">นำเข้าแล้ว</th>
                  <th className="px-6 py-4">ความก้าวหน้า</th>
                  <th className="px-6 py-4 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  data.map((item) => {
                    const percentage = item.hos_moph_all > 0 ? Math.round((item.hos_moph_send / item.hos_moph_all) * 100) : 0;
                    const status = getStatus(item.hos_moph_send, item.hos_moph_all);
                    
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                          {item.code}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md">
                              <MapPin className="w-4 h-4" />
                            </span>
                            {item.district_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-slate-600 font-medium">
                          {item.hos_moph_all} <span className="text-xs font-normal text-slate-400">แห่ง</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center font-bold text-emerald-600">
                          {item.hos_moph_send} <span className="text-xs font-normal text-slate-400">แห่ง</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-700 w-8">{percentage}%</span>
                            <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden flex-1 max-w-[120px]">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full shadow-inner"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
