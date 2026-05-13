'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCashoutRequests, updateCashoutStatus } from '@/lib/api';
import { Loader2, Download, Wallet, Clock, CheckCircle, Search, X } from 'lucide-react';

interface PayoutRequest {
  id: string; amount: number; status: string; createdAt: string;
  agent?: { name: string; email: string };
  user?: { name: string; role: string };
}

interface FinancialSummary {
  pendingLiability: number;
  totalDisbursed: number;
}

export default function PayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      const reqs = await getCashoutRequests(null);
      setRequests(Array.isArray(reqs) ? reqs : []);
      const pendingLiability = reqs.filter((r: any) => r.status === 'PENDING').reduce((acc: number, r: any) => acc + Number(r.amount), 0);
      const totalDisbursed = reqs.filter((r: any) => r.status === 'PAID').reduce((acc: number, r: any) => acc + Number(r.amount), 0);
      setSummary({ pendingLiability, totalDisbursed });
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdate = async (id: string, status: string) => {
    try {
      await updateCashoutStatus(id, status);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[#FBFBFD] min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-black animate-spin" />
      </div>
    );
  }

  const filtered = requests.filter(r =>
    r && (!search || (r.agent?.name ?? r.user?.name ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  const pendingCount = requests.filter(r => r && r.status === 'PENDING').length;

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex bg-[#FBFBFD] min-h-screen font-sans text-[#1D1D1F]">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-64 p-8 lg:p-12">

          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-sans font-bold tracking-tight mb-2 text-black">Payouts</h1>
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#86868B]">Manage member payouts and reward distributions.</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-[#D2D2D7] rounded-xl font-bold shadow-sm hover:bg-[#F5F5F7] transition-all text-xs text-[#1D1D1F] uppercase tracking-widest">
              <Download size={18} /> <span>EXPORT HISTORY</span>
            </button>
          </div>

          <div className="space-y-10">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Paid', value: `$${summary?.totalDisbursed?.toLocaleString() ?? '0'}`, icon: CheckCircle, accent: false },
                { label: 'Pending Payouts', value: `$${summary?.pendingLiability?.toLocaleString() ?? '0'}`, icon: Clock, accent: true },
                { label: 'Awaiting Approval', value: `${pendingCount}`, icon: Wallet, accent: false },
              ].map((m, i) => (
                <div key={i} className={`p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${m.accent ? 'bg-black text-white border-black shadow-xl scale-105 z-10' : 'bg-white text-[#1D1D1F] border-[#D2D2D7] shadow-sm hover:border-black/20'}`}>
                  {m.accent && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[60px] -translate-x-10 -translate-y-10" />}
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.accent ? 'bg-white/20' : 'bg-[#F5F5F7] text-[#1D1D1F] border border-black/5'}`}>
                         <m.icon size={16} />
                      </div>
                      <p className={`text-[12px] font-black uppercase tracking-widest ${m.accent ? 'text-white/60' : 'text-[#86868B]'}`}>{m.label}</p>
                    </div>
                    <p className={`text-4xl font-sans font-bold tracking-tighter ${m.accent ? 'text-white' : 'text-black'}`}>{m.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-[#D2D2D7] rounded-3xl overflow-hidden shadow-sm">
              <div className="px-10 py-8 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-sans font-bold tracking-tight text-black">Recent Requests</h3>
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#86868B] mt-1">Payout History</p>
                </div>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={18} />
                  <input
                    type="text" value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name..."
                    className="pl-12 pr-4 py-3 text-sm bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl focus:border-black focus:ring-4 focus:ring-black/10 outline-none transition-all w-full md:w-80 shadow-inner placeholder:text-black/20"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#F5F5F7]">
                      <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B]">Member</th>
                      <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B] text-right">Amount</th>
                      <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B]">Date</th>
                      <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B] text-center">Status</th>
                      <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5} className="px-10 py-24 text-center">
                        <Wallet size={32} className="mx-auto mb-4 text-black/10" />
                        <p className="text-lg font-sans italic text-[#86868B] uppercase tracking-tight">No payout requests found.</p>
                      </td></tr>
                    ) : filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-[#F5F5F7] transition-colors group/row">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-lg bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center text-[12px] font-black font-sans group-hover/row:bg-black group-hover/row:text-white transition-all border border-black/5 shadow-inner">
                               {(r.agent?.name ?? r.user?.name ?? 'A').charAt(0).toUpperCase()}
                            </div>
                            <div>
                               <p className="font-sans font-bold text-lg text-black group-hover/row:text-black transition-colors leading-none mb-1">{r.agent?.name ?? r.user?.name ?? 'Anonymous'}</p>
                               <p className="text-[12px] text-[#86868B] font-mono uppercase tracking-tighter opacity-50">{r.agent?.email ?? 'Member'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right font-sans font-bold text-2xl text-black tracking-tighter">${r.amount.toLocaleString()}</td>
                        <td className="px-10 py-6 text-xs font-bold text-[#86868B] opacity-60 uppercase tracking-tight">{new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</td>
                        <td className="px-10 py-6 text-center">
                          <span className={`text-[11px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border ${
                             r.status === 'PAID' 
                               ? 'bg-black/10 text-black border-black/20' 
                               : r.status === 'REJECTED' 
                                  ? 'bg-[#F5F5F7] text-[#86868B] border-black/5' 
                                  : 'bg-[#F5F5F7] text-black border-black/5'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          {r.status === 'PENDING' ? (
                            <div className="flex justify-end gap-3 translate-x-2 opacity-0 group-hover/row:opacity-100 group-hover/row:translate-x-0 transition-all">
                              <button onClick={() => handleUpdate(r.id, 'PAID')} className="w-10 h-10 rounded-xl bg-black text-white hover:bg-[#1D1D1F] flex items-center justify-center transition-all border border-black/10 shadow-lg">
                                <CheckCircle size={20} />
                              </button>
                              <button onClick={() => handleUpdate(r.id, 'REJECTED')} className="w-10 h-10 rounded-xl bg-[#F5F5F7] text-[#86868B] hover:bg-[#E5E5E7] hover:text-black flex items-center justify-center transition-all border border-[#D2D2D7] shadow-lg">
                                <X size={20} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-black text-[#86868B]/40 uppercase tracking-[0.2em] italic">APPROVED</span>
                          )}
                        </td>
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
