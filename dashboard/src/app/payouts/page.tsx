'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchWithAuth } from '@/lib/api';
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
      const [reqs, sum] = await Promise.all([
        fetchWithAuth('/financial/requests'),
        fetchWithAuth('/financial/summary'),
      ]);
      setRequests(Array.isArray(reqs) ? reqs : []);
      setSummary(sum || null);
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
      await fetchWithAuth(`/financial/requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[#0A0A0A] min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C62E2E] animate-spin" />
      </div>
    );
  }

  const filtered = requests.filter(r =>
    r && (!search || (r.agent?.name ?? r.user?.name ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  const pendingCount = requests.filter(r => r && r.status === 'PENDING').length;

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex bg-[#0A0A0A] min-h-screen font-sans text-[#F5F5F7]">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-64 p-8 lg:p-12">

          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-sans font-bold tracking-tight mb-2">Disbursement Ledger</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93]">Personnel settlement & reward distribution protocols</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold shadow-sm hover:bg-white/10 transition-all text-xs text-[#8E8E93] uppercase tracking-widest">
              <Download size={18} /> <span>EXPORT LEDGER</span>
            </button>
          </div>

          <div className="space-y-10">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Settled Capital', value: `$${summary?.totalDisbursed?.toLocaleString() ?? '0'}`, icon: CheckCircle, accent: false },
                { label: 'Pending Liability', value: `$${summary?.pendingLiability?.toLocaleString() ?? '0'}`, icon: Clock, accent: true },
                { label: 'Active Authorizations', value: `${pendingCount}`, icon: Wallet, accent: false },
              ].map((m, i) => (
                <div key={i} className={`p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${m.accent ? 'bg-[#C62E2E] text-white border-[#C62E2E] shadow-2xl scale-105 z-10' : 'bg-[#161616] text-[#F5F5F7] border-[#262626] shadow-xl hover:border-[#C62E2E]/20'}`}>
                  {m.accent && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[60px] -translate-x-10 -translate-y-10" />}
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.accent ? 'bg-white/20' : 'bg-black text-[#8E8E93] border border-white/5'}`}>
                         <m.icon size={16} />
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${m.accent ? 'text-white/60' : 'text-[#8E8E93]'}`}>{m.label}</p>
                    </div>
                    <p className="text-4xl font-sans font-bold tracking-tighter">{m.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-[#161616] border border-[#262626] rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-10 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-sans font-bold tracking-tight text-white">Execution Stream</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C62E2E] mt-1">Official Disbursement Registry</p>
                </div>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C62E2E] transition-colors" size={18} />
                  <input
                    type="text" value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by respondent name..."
                    className="pl-12 pr-4 py-3 text-sm bg-black border border-[#262626] rounded-xl focus:border-[#C62E2E] focus:ring-4 focus:ring-[#C62E2E]/10 outline-none transition-all w-full md:w-80 shadow-inner placeholder:text-white/10"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/2">
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Recipient Entity</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Settlement Amount</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Protocol Date</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Security State</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Administrative</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5} className="px-10 py-24 text-center">
                        <Wallet size={32} className="mx-auto mb-4 text-white/10" />
                        <p className="text-lg font-sans italic text-white/40 uppercase tracking-tight opacity-60">No disbursement signals identified.</p>
                      </td></tr>
                    ) : filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-white/2 transition-colors group/row">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-lg bg-black text-[#8E8E93] flex items-center justify-center text-[10px] font-black font-sans group-hover/row:bg-[#C62E2E] group-hover/row:text-white transition-all border border-white/5 shadow-inner">
                               {(r.agent?.name ?? r.user?.name ?? 'A').charAt(0).toUpperCase()}
                            </div>
                            <div>
                               <p className="font-sans font-bold text-lg text-white group-hover/row:text-[#C62E2E] transition-colors leading-none mb-1">{r.agent?.name ?? r.user?.name ?? 'Anonymous'}</p>
                               <p className="text-[10px] text-[#8E8E93] font-mono uppercase tracking-tighter opacity-50">{r.agent?.email ?? 'FIELD_OPERATOR'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right font-sans font-bold text-2xl text-white tracking-tighter">${r.amount.toLocaleString()}</td>
                        <td className="px-10 py-6 text-xs font-bold text-[#8E8E93] opacity-60 uppercase tracking-tight">{new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</td>
                        <td className="px-10 py-6 text-center">
                          <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border ${
                             r.status === 'PAID' 
                               ? 'bg-[#C62E2E]/10 text-[#C62E2E] border-[#C62E2E]/20' 
                               : r.status === 'REJECTED' 
                                  ? 'bg-black text-[#8E8E93] border-white/5' 
                                  : 'bg-white/5 text-[#8E8E93] border-white/5'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          {r.status === 'PENDING' ? (
                            <div className="flex justify-end gap-3 translate-x-2 opacity-0 group-hover/row:opacity-100 group-hover/row:translate-x-0 transition-all">
                              <button onClick={() => handleUpdate(r.id, 'PAID')} className="w-10 h-10 rounded-xl bg-[#C62E2E]/10 text-[#C62E2E] hover:bg-[#C62E2E] hover:text-white flex items-center justify-center transition-all border border-[#C62E2E]/20 shadow-lg">
                                <CheckCircle size={20} />
                              </button>
                              <button onClick={() => handleUpdate(r.id, 'REJECTED')} className="w-10 h-10 rounded-xl bg-white/5 text-[#8E8E93] hover:bg-[#161616] hover:text-white flex items-center justify-center transition-all border border-white/10 shadow-lg">
                                <X size={20} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[9px] font-black text-[#8E8E93]/20 uppercase tracking-[0.2em] italic">AUTHORIZED</span>
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
