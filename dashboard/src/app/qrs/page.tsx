'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchWithAuth } from '@/lib/api';
import { Plus, Loader2, Download, QrCode, Trash2, Printer, Search, ShieldCheck, Activity } from 'lucide-react';
import QRCode from 'react-qr-code';

interface QRCodeData {
  id: string; code?: string; status: string; rewardPoints: number;
  scanCount?: number; campaignName?: string;
  campaign?: { name: string };
}

export default function QRsPage() {
  const [loading, setLoading] = useState(true);
  const [qrs, setQrs] = useState<QRCodeData[]>([]);
  const [showBatch, setShowBatch] = useState(false);
  const [batchSize] = useState(10);
  const [search, setSearch] = useState('');

  const loadQrs = async () => {
    try {
      const data = await fetchWithAuth('/qrs');
      setQrs(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadQrs(); }, []);

  const filtered = qrs.filter(q =>
    q && (!search || q.id.toLowerCase().includes(search.toLowerCase()) ||
    (q.campaign?.name ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex bg-[#0A0A0A] min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C62E2E] animate-spin" />
      </div>
    );
  }

  if (showBatch) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen p-8 lg:p-12 print:p-0 font-sans text-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#161616] border border-[#262626] p-8 rounded-3xl mb-12 flex items-center justify-between shadow-2xl print:hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
              <h2 className="text-3xl font-sans font-bold tracking-tight">Identifier Batch Preview</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93] mt-1">Printing sequence: {batchSize} Secure Protocols</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-[#C62E2E] text-white rounded-xl font-bold shadow-lg hover:brightness-110 transition-all hover:-translate-y-0.5">
                 <Printer size={18} /> <span>EXECUTE PRINT</span>
              </button>
              <button onClick={() => setShowBatch(false)} className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold shadow-sm hover:bg-white/10 transition-all text-[#8E8E93]">
                 CLOSE PREVIEW
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: batchSize }).map((_, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl flex flex-col items-center text-center shadow-2xl relative overflow-hidden group border-4 border-[#0A0A0A]">
                <div className="mb-8 p-6 bg-[#F5F5F7] rounded-2xl border border-black/5 group-hover:border-[#C62E2E]/20 transition-all shadow-inner">
                  <QRCode value={`BETH-TX-${1000 + i}`} size={140} fgColor="#0A0A0A" />
                </div>
                <div className="space-y-1">
                   <p className="text-sm font-mono font-bold tracking-tighter text-[#0A0A0A]">BETH_PROTO_{1000 + i}</p>
                   <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C62E2E]">SECURITY VERIFIED</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex bg-[#0A0A0A] min-h-screen font-sans text-[#F5F5F7]">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-64 p-8 lg:p-12">

          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-sans font-bold tracking-tight mb-2">Protocol Registry</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93]">Secure identifier & Token management</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowBatch(true)} className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold shadow-sm hover:bg-white/10 transition-all text-xs text-[#8E8E93] uppercase tracking-widest">
                <Download size={18} /> <span>BATCH PROVISIONS</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-[#C62E2E] text-white rounded-xl font-bold shadow-lg hover:brightness-110 transition-all hover:-translate-y-0.5">
                <Plus size={18} /> <span>CREATE IDENTIFIER</span>
              </button>
            </div>
          </div>

          <div className="space-y-10">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Tokens', value: qrs.length, icon: QrCode },
                { label: 'Verified State', value: qrs.filter(q => q && q.status === 'ACTIVE').length, icon: ShieldCheck },
                { label: 'Network Signals', value: qrs.filter(q => q && (q.scanCount ?? 0) > 0).length, icon: Activity },
                { label: 'Protocol Volume', value: qrs.reduce((s, q) => s + (q?.scanCount ?? 0), 0), icon: Printer },
              ].map((m, i) => (
                <div key={i} className="bg-[#161616] p-6 rounded-2xl border border-[#262626] shadow-xl hover:border-[#C62E2E]/20 transition-all group">
                   <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-[#8E8E93] group-hover:bg-[#C62E2E]/10 group-hover:text-[#C62E2E] transition-colors border border-white/5">
                       <m.icon size={16} />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#8E8E93]">{m.label}</p>
                  </div>
                  <p className="text-3xl font-sans font-bold text-white tracking-tight">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-[#161616] border border-[#262626] rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-10 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-sans font-bold tracking-tight text-white">Secure Data Ledger</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C62E2E] mt-1">Active Security Tokens</p>
                </div>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C62E2E] transition-colors" size={18} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by ID or Initiative..."
                    className="pl-12 pr-4 py-3 text-sm bg-black border border-[#262626] rounded-xl focus:border-[#C62E2E] focus:ring-4 focus:ring-[#C62E2E]/10 outline-none transition-all w-full md:w-80 shadow-inner placeholder:text-white/10"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/2">
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Identifier</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Initiative Context</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Throughput</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Reward Weight</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Protocol State</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Oversight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} className="px-10 py-24 text-center">
                        <QrCode size={32} className="mx-auto mb-4 text-white/10" />
                        <p className="text-lg font-sans italic text-white/40 uppercase tracking-tight opacity-60">No identifiers identified in registry.</p>
                      </td></tr>
                    ) : filtered.map((qr) => (
                      <tr key={qr.id} className="hover:bg-white/2 transition-colors group/row">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-black rounded-xl border border-white/5 flex items-center justify-center group-hover/row:bg-[#C62E2E] transition-all shadow-inner">
                              <QrCode size={18} className="text-[#8E8E93] group-hover/row:text-white transition-colors" />
                            </div>
                            <span className="text-sm font-mono font-bold text-white tracking-tighter opacity-80">{qr.id.slice(0, 14).toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex flex-col">
                             <span className="font-sans font-bold text-lg text-white group-hover/row:text-[#C62E2E] transition-colors">{qr.campaign?.name ?? 'General Protocol'}</span>
                             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8E8E93]">Active Initiative</span>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-center font-sans font-bold text-xl text-white">{qr.scanCount ?? 0}</td>
                        <td className="px-10 py-6 text-center font-sans font-bold text-xl text-[#C62E2E]">{qr.rewardPoints}</td>
                        <td className="px-10 py-6 text-center">
                          <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border ${
                             qr.status === 'ACTIVE' 
                               ? 'bg-[#C62E2E]/10 text-[#C62E2E] border-[#C62E2E]/20' 
                               : 'bg-white/5 text-[#8E8E93] border-white/5'
                          }`}>
                            {qr.status}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button className="w-10 h-10 rounded-xl bg-[#C62E2E]/10 text-[#C62E2E] hover:bg-[#C62E2E] hover:text-white flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100 translate-x-4 group-hover/row:translate-x-0 border border-[#C62E2E]/20 shadow-lg">
                            <Trash2 size={18} />
                          </button>
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
