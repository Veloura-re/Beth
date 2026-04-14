'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { DollarSign, TrendingUp, Loader2, QrCode } from 'lucide-react';
import ScanChart from '@/components/ScanChart';
import { fetchWithAuth } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import MetricCard from '@/components/MetricCard';

interface OverviewStats {
  totalScans: number;
  totalRevenue: number;
  totalRewardsIssued: number;
  netProfit: number;
}

interface FinancialSummary {
  pendingLiability: number;
  requestCount: number;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [financials, setFinancials] = useState<FinancialSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyScanData[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (raw) setUser(JSON.parse(raw));

    const load = async () => {
      try {
        const [overview, daily, finance] = await Promise.all([
          fetchWithAuth('/analytics/overview'),
          fetchWithAuth('/analytics/charts/daily-scans'),
          fetchWithAuth('/financial/summary'),
        ]);
        setStats(overview || {});
        setDailyData(Array.isArray(daily) ? daily : []);
        setFinancials(finance || {});
      } catch (e: unknown) {
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

  const isSuper = user?.role === 'SUPERADMIN';

  const metrics = [
    { label: 'System Throughput', value: stats?.totalScans?.toLocaleString() ?? '0', icon: QrCode, change: '+12%', trend: 'up' as const },
    { label: 'Platform Volume', value: `$${stats?.totalRevenue?.toLocaleString() ?? '0'}`, icon: DollarSign, change: '+8%', trend: 'up' as const },
    { label: 'Pending Settlement', value: `$${financials?.pendingLiability?.toLocaleString() ?? '0'}`, icon: TrendingUp, change: '-3%', trend: 'down' as const },
    { label: 'Network Efficiency', value: stats && stats.totalRevenue > 0 ? `${Math.round((stats.netProfit / stats.totalRevenue) * 100)}%` : '—', icon: DollarSign, change: '+15%', trend: 'up' as const },
  ];

  return (
    <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']}>
      <div className="flex bg-[#0A0A0A] min-h-screen text-[#F5F5F7] font-sans">
        <Sidebar />

        <main className="flex-1 min-h-screen ml-64 p-8 lg:p-12">
          {/* Top header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-sans font-bold tracking-tight mb-2 uppercase">
                {isSuper ? 'System Oversight' : 'Mission Control'}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93]">Operational Analytics Node: 01</span>
                <div className="w-1 h-1 rounded-full bg-[#262626]" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#C62E2E] shadow-[0_0_8px_#C62E2E]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Synchronized</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((m, i) => (
                <MetricCard 
                  key={i}
                  title={m.label}
                  value={m.value}
                  icon={m.icon}
                  change={m.change}
                  trend={m.trend}
                />
              ))}
            </div>

            {/* Chart + Side panel */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#161616] p-8 rounded-2xl border border-[#262626] shadow-xl">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-xl font-sans font-bold tracking-tight">Data Throughput</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93] mt-1">Real-time engagement telemetry</p>
                  </div>
                  <div className="flex gap-2 p-1 bg-black rounded-lg">
                    {['7D', '30D', '90D'].map((t) => (
                      <button key={t} className={`px-4 py-1.5 text-[9px] font-black tracking-widest uppercase rounded-md transition-all ${t === '7D' ? 'bg-[#C62E2E] text-white shadow-lg' : 'text-[#8E8E93] hover:text-white'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-80">
                  <ScanChart data={dailyData} />
                </div>
              </div>

              <div className="bg-[#C62E2E] text-white p-10 rounded-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[60px] translate-x-10 -translate-y-10 group-hover:bg-white/20 transition-colors" />
                
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-10">
                    Network State
                  </p>
                  <div className="space-y-6">
                    {[
                      { label: 'Total Volume', val: stats?.totalScans ?? 0, detail: 'Cumulative system scans' },
                      { label: 'Active Requests', val: financials?.requestCount ?? 0, detail: 'Pending verification' },
                      { label: 'System Uptime', val: '99.9%', detail: 'Protocol stability' },
                    ].map((s, i) => (
                      <div key={i} className="group/item">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover/item:text-white transition-colors">{s.label}</p>
                          <p className="text-2xl font-sans font-bold">{s.val}</p>
                        </div>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">{s.detail}</p>
                        <div className="mt-4 h-px bg-white/10 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="relative z-10 pt-10">
                  <div className="p-4 bg-black/20 rounded-xl border border-white/5 backdrop-blur-md">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white font-black mb-1">Status</p>
                    <p className="text-[11px] text-white/80 font-bold leading-relaxed">Platform performance within operational parameters.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
