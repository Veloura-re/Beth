'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchWithAuth } from '@/lib/api';
import { Plus, Loader2, Shapes, ChevronRight, Target, Activity } from 'lucide-react';

interface Campaign {
   id: string; name: string; description?: string; status: string;
   budget: number; rewardPerScan: number; painterMargin: number;
   _count?: { scans: number };
}

export default function CampaignsPage() {
   const [loading, setLoading] = useState(true);
   const [campaigns, setCampaigns] = useState<Campaign[]>([]);

   useEffect(() => {
      fetchWithAuth('/campaigns')
         .then(data => setCampaigns(Array.isArray(data) ? data : []))
         .catch(console.error)
         .finally(() => setLoading(false));
   }, []);

   if (loading) {
      return (
         <div className="flex bg-[#0A0A0A] min-h-screen items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#C62E2E] animate-spin" />
         </div>
      );
   }

   const totalScans = campaigns.reduce((s, c) => s + (c?._count?.scans ?? 0), 0);
   const activeCamps = campaigns.filter(c => c && c.status === 'ACTIVE').length;

   return (
      <ProtectedRoute allowedRoles={['ADMIN']}>
         <div className="flex bg-[#0A0A0A] min-h-screen font-sans text-[#F5F5F7]">
            <Sidebar />
            <main className="flex-1 min-h-screen ml-64 p-8 lg:p-12">

               {/* Page Header */}
               <div className="flex items-center justify-between mb-12">
                  <div>
                    <h1 className="text-4xl font-sans font-bold tracking-tight mb-2">System Directives</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93]">High-level operational targeting protocols</p>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#C62E2E] text-white rounded-xl font-bold shadow-lg hover:brightness-110 transition-all hover:-translate-y-0.5">
                     <Plus size={18} /> <span>CREATE INITIATIVE</span>
                  </button>
               </div>

               <div className="space-y-10">
                  {/* Summary strip */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {[
                        { label: 'Total Protocols', value: campaigns.length, icon: Shapes },
                        { label: 'Live Executions', value: activeCamps, icon: Activity },
                        { label: 'Platform Scans', value: totalScans.toLocaleString(), icon: Target },
                     ].map((m, i) => (
                        <div key={i} className="bg-[#161616] p-6 rounded-2xl border border-[#262626] shadow-xl flex items-center gap-4 group hover:border-[#C62E2E]/20 transition-all">
                           <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white/20 group-hover:text-[#C62E2E] transition-colors border border-white/5">
                              <m.icon size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] mb-1">{m.label}</p>
                              <p className="text-2xl font-sans font-bold text-white tracking-tight">{m.value}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Campaign cards */}
                  <div className="grid grid-cols-1 gap-6">
                     {campaigns.length === 0 ? (
                        <div className="bg-[#161616] p-24 text-center rounded-3xl border border-[#262626] border-dashed">
                           <Shapes size={32} className="text-white/10 mx-auto mb-4" strokeWidth={1} />
                           <p className="text-lg font-sans italic text-white/40">No strategic initiatives detected in registry.</p>
                        </div>
                     ) : campaigns.map((c) => {
                        const scans = c?._count?.scans ?? 0;
                        const utilization = c && c.budget > 0 ? Math.min(100, Math.round((scans * c.rewardPerScan * 0.1 / c.budget) * 100)) : 0;
                        return (
                           <div key={c.id} className="bg-[#161616] p-8 rounded-2xl border border-[#262626] hover:border-[#C62E2E]/30 transition-all duration-300 shadow-xl group overflow-hidden relative">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C62E2E]/5 rounded-full blur-[80px] translate-x-32 -translate-y-32 group-hover:bg-[#C62E2E]/10 transition-colors" />
                              
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6 relative z-10">
                                 <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                       <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                                          c.status === 'ACTIVE' 
                                             ? 'bg-[#C62E2E]/10 text-[#C62E2E] border-[#C62E2E]/20' 
                                             : 'bg-white/5 text-[#8E8E93] border-white/5'
                                       }`}>
                                          {c.status}
                                       </span>
                                       <span className="text-[9px] font-black text-[#8E8E93] tracking-[0.2em] font-mono uppercase bg-black px-2 py-1 rounded border border-white/5">
                                          PROTOCOL_ID: {c.id.slice(0, 8).toUpperCase()}
                                       </span>
                                    </div>
                                    <h3 className="text-3xl font-sans font-bold tracking-tight text-white mb-2">{c.name}</h3>
                                    {c.description && <p className="text-sm font-bold text-[#8E8E93] leading-relaxed max-w-2xl uppercase tracking-tight opacity-60">{c.description}</p>}
                                 </div>
                                 <div className="lg:text-right bg-black p-6 rounded-2xl border border-white/5 min-w-[200px] shadow-inner">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8E8E93] mb-1">Assigned Resources</p>
                                    <p className="text-4xl font-sans font-bold text-[#C62E2E] tracking-tighter">${c.budget.toLocaleString()}</p>
                                 </div>
                              </div>

                              {/* Progress bar */}
                              <div className="mb-8 relative z-10">
                                 <div className="flex justify-between items-end mb-3">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8E8E93]">Resource Consumption</span>
                                    <span className="text-xs font-sans font-bold text-white">{utilization}% CAPACITY</span>
                                 </div>
                                 <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                                    <div 
                                       className="h-full bg-gradient-to-r from-[#C62E2E] to-[#801B1B] transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(198,46,46,0.3)]" 
                                       style={{ width: `${utilization}%` }} 
                                    />
                                 </div>
                              </div>

                              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/5 relative z-10">
                                 <div className="flex gap-12 mb-6 sm:mb-0">
                                    <div className="group/item cursor-default">
                                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8E8E93] mb-1 group-hover/item:text-[#C62E2E] transition-colors">Registered Telemetry</p>
                                       <p className="text-2xl font-sans font-bold text-white tracking-tight">{scans.toLocaleString()}</p>
                                    </div>
                                    <div className="group/item cursor-default">
                                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8E8E93] mb-1 group-hover/item:text-[#C62E2E] transition-colors">Reward / Capture</p>
                                       <p className="text-2xl font-sans font-bold text-white tracking-tight">${c.rewardPerScan}</p>
                                    </div>
                                 </div>
                                 <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93] hover:text-white transition-all group/btn">
                                    VIEW PROTOCOL MANIFEST <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform text-[#C62E2E]" />
                                 </button>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </main>
         </div>
      </ProtectedRoute>
   );
}
