'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchWithAuth } from '@/lib/api';
import { Loader2, Download, ArrowUpRight, ArrowDownLeft, Search, TrendingUp, BarChart3, Receipt } from 'lucide-react';
import RevenueChart from '@/components/RevenueChart';

interface OverviewStats {
  totalRevenue: number;
  totalRewardsIssued: number;
  netProfit: number;
}

interface Transaction {
  id: string; type: string; user: string; amount: string; status: string; date: string;
}

interface RawScan {
  id: string; pointsEarned: number; timestamp: string;
  agent: { name: string };
}

export default function FinancialsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [overview, scans] = await Promise.all([
          fetchWithAuth('/analytics/overview'),
          fetchWithAuth('/scans'),
        ]);
        setStats(overview || {});
        setTransactions(Array.isArray(scans) ? scans.map((s: RawScan) => ({
          id: s.id,
          type: 'Scan Credit',
          user: s.agent?.name ?? 'Unknown Agent',
          amount: `-$${(s.pointsEarned * 0.1).toFixed(2)}`,
          status: 'Settled',
          date: new Date(s.timestamp).toLocaleDateString(),
        })) : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex bg-[#0A0A0A] min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C62E2E] animate-spin" />
      </div>
    );
  }

  const filtered = transactions.filter(t =>
    t && (!search || t.user.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex bg-[#0A0A0A] min-h-screen font-sans text-[#F5F5F7]">
        <Sidebar />

        <main className="flex-1 min-h-screen ml-64 p-8 lg:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-sans font-bold tracking-tight mb-2">Treasury Ledger</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93]">Capital flow & Platform liquidity oversight</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold shadow-sm hover:bg-white/10 transition-all text-xs text-[#8E8E93] uppercase tracking-widest">
              <Download size={18} /> <span>EXPORT AUDIT LEDGER</span>
            </button>
          </div>

          <div className="space-y-10">
            {/* Summary strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Gross Revenue', value: `$${stats?.totalRevenue?.toLocaleString() ?? '0'}`, icon: BarChart3 },
                { label: 'Total Payouts', value: `$${((stats?.totalRewardsIssued ?? 0) * 0.1).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Receipt },
                { label: 'Net Profit', value: `$${stats?.netProfit?.toLocaleString() ?? '0'}`, icon: TrendingUp },
              ].map((m, i) => (
                <div key={i} className="bg-[#161616] p-10 rounded-3xl border border-[#262626] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 rounded-full blur-[60px] -translate-x-10 -translate-y-10 group-hover:bg-[#C62E2E]/5 transition-colors" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-[#8E8E93] group-hover:text-white transition-colors border border-white/5">
                        <m.icon size={20} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93]">{m.label}</p>
                    </div>
                    <p className="text-4xl font-sans font-bold text-white tracking-tighter">{m.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue chart */}
            <div className="bg-[#161616] border border-[#262626] p-10 rounded-3xl shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C62E2E]/5 rounded-full blur-[80px] translate-x-32 -translate-y-32 group-hover:bg-[#C62E2E]/10 transition-colors" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-sans font-bold tracking-tight">Revenue Dynamics</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93] mt-1">Daily trend analysis protocol</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-full border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-[#C62E2E] shadow-[0_0_8px_#C62E2E]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Live Distribution</span>
                  </div>
                </div>
                <div className="h-80">
                  <RevenueChart />
                </div>
              </div>
            </div>

            {/* Audit Ledger */}
            <div className="bg-[#161616] border border-[#262626] rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-10 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-sans font-bold tracking-tight text-white">Audit Ledger</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C62E2E] mt-1">Comprehensive Transaction Record</p>
                </div>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C62E2E] transition-colors" size={18} />
                  <input
                    type="text" value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by respondent..."
                    className="pl-12 pr-4 py-3 text-sm bg-black border border-[#262626] rounded-xl focus:border-[#C62E2E] focus:ring-4 focus:ring-[#C62E2E]/10 outline-none transition-all w-full md:w-80 shadow-inner placeholder:text-white/10"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/2">
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Respondent Source</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Protocol Type</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Settlement Value</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Protocol State</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Execution Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5} className="px-10 py-24 text-center">
                        <BarChart3 size={32} className="mx-auto mb-4 text-white/10" />
                        <p className="text-lg font-sans italic text-white/40 uppercase tracking-tight opacity-60">No ledger entries detected in audit.</p>
                      </td></tr>
                    ) : filtered.map((t) => (
                      <tr key={t.id} className="hover:bg-white/2 transition-colors group/row">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-lg bg-black text-[#8E8E93] flex items-center justify-center text-[10px] font-black font-sans group-hover/row:bg-[#C62E2E] group-hover/row:text-white transition-all border border-white/5 shadow-inner">
                               {t.user?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                               <p className="font-sans font-bold text-lg text-white group-hover/row:text-[#C62E2E] transition-colors leading-none mb-1">{t.user}</p>
                               <p className="text-[10px] text-[#8E8E93] font-mono uppercase tracking-tighter opacity-50">ID: {t.id.slice(0, 10).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#8E8E93]">
                            {t.type.includes('Revenue') || t.type.includes('Deposit')
                              ? <ArrowUpRight size={16} className="text-emerald-500" />
                              : <ArrowDownLeft size={16} className="text-[#C62E2E]" />
                            }
                            {t.type}
                          </span>
                        </td>
                        <td className={`px-10 py-6 text-right font-sans font-bold text-2xl ${t.amount.startsWith('-') ? 'text-[#8E8E93]' : 'text-white'}`}>{t.amount}</td>
                        <td className="px-10 py-6 text-center">
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 bg-white/5 text-white/40 rounded-full border border-white/5">
                            {t.status}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right text-xs font-bold text-[#8E8E93] opacity-60 uppercase tracking-tight">{t.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
