'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchWithAuth } from '@/lib/api';
import { Plus, Loader2, Copy, Check, X, Users, UserPlus, Mail, Shield, Activity, Target } from 'lucide-react';

interface Agent {
  id: string; name: string; email: string; createdAt: string; role?: string;
  _count?: { scans: number };
}

export default function AgentsPage() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [currentUser, setCurrentUser] = useState<Agent | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copying, setCopying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) setCurrentUser(JSON.parse(raw));

    fetchWithAuth('/users/agents')
      .then(data => setAgents(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN';

  const handleInvite = async () => {
    if (!newEmail) return;
    setSubmitting(true);
    try {
      const data = await fetchWithAuth('/invites', {
        method: 'POST',
        body: JSON.stringify({ email: newEmail, role: 'AGENT', name: newName }),
      });
      setInviteLink(data?.inviteLink || '');
      setIsAdding(false);
      setNewEmail(''); setNewName('');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Registry failure';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const copy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex bg-[#0A0A0A] min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C62E2E] animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'AGENT']}>
      <div className="flex bg-[#0A0A0A] min-h-screen font-sans text-[#F5F5F7]">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-64 p-8 lg:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-sans font-bold tracking-tight mb-2">Field Consultants</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93]">Platform operational intelligence personnel</p>
            </div>
            {isAdmin && (
              <button onClick={() => { setIsAdding(true); setInviteLink(''); }} className="flex items-center gap-2 px-6 py-3 bg-[#C62E2E] text-white rounded-xl font-bold shadow-lg hover:brightness-110 transition-all hover:-translate-y-0.5">
                <UserPlus size={18} /> <span>RECRUIT AGENT</span>
              </button>
            )}
          </div>

          <div className="space-y-10">
            {/* Invite Form */}
            {isAdding && isAdmin && (
              <div className="bg-[#161616] border border-[#262626] p-10 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-sans font-bold tracking-tight">Generate Invitation</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C62E2E] mt-1">Tier-3 Operational Recruitment</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="w-10 h-10 rounded-full border border-[#262626] flex items-center justify-center text-[#8E8E93] hover:bg-white/5 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[#8E8E93] ml-1">Identity Profile</label>
                    <div className="relative group">
                       <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C62E2E] transition-colors" size={18} />
                       <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full Name"
                         className="w-full pl-12 pr-4 py-4 bg-black border border-[#262626] rounded-xl focus:border-[#C62E2E] focus:ring-4 focus:ring-[#C62E2E]/10 outline-none transition-all text-base font-bold shadow-inner placeholder:text-white/10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[#8E8E93] ml-1">Secure Signal (Email)</label>
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C62E2E] transition-colors" size={18} />
                       <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="agent@beth.com"
                         className="w-full pl-12 pr-4 py-4 bg-black border border-[#262626] rounded-xl focus:border-[#C62E2E] focus:ring-4 focus:ring-[#C62E2E]/10 outline-none transition-all text-base font-bold shadow-inner placeholder:text-white/10" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-6 border-t border-white/5">
                  <button onClick={handleInvite} disabled={submitting} className="flex items-center gap-2 px-8 py-3 bg-[#F5F5F7] text-[#0A0A0A] rounded-xl font-black shadow-lg hover:brightness-90 transition-all disabled:opacity-50">
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                    <span>ISSUE AUTHORIZATION</span>
                  </button>
                </div>
              </div>
            )}

            {/* Invite Link */}
            {inviteLink && (
              <div className="bg-[#C62E2E] text-white p-10 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[80px]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                       <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-sans font-bold tracking-tight">Operational Invite Ready</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Field registration protocol active</p>
                    </div>
                  </div>
                  <div className="bg-black/20 border border-white/10 p-6 rounded-2xl flex items-center gap-4 group backdrop-blur-md">
                    <code className="flex-1 text-sm text-white/70 break-all font-mono tracking-tighter">{inviteLink}</code>
                    <button onClick={copy} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white text-[#0A0A0A] rounded-lg transition-all text-[11px] font-black uppercase tracking-wider">
                      {copying ? <><Check size={14} /> COPIED</> : <><Copy size={14} /> COPY LINK</>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Network Personnel', value: agents.length, icon: Users },
                { label: 'Weekly Delta', value: agents.filter(a => a && a.createdAt && new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, icon: Activity },
                { label: 'Operational Throughput', value: agents.reduce((s, a) => s + (a?._count?.scans ?? 0), 0), icon: Target },
              ].map((m, i) => (
                <div key={i} className="bg-[#161616] p-6 rounded-2xl border border-[#262626] shadow-xl flex items-center gap-4 hover:border-[#C62E2E]/30 transition-all group">
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

            {/* Table */}
            <div className="bg-[#161616] border border-[#262626] rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-10 py-8 border-b border-white/5">
                <h3 className="text-xl font-sans font-bold tracking-tight text-white">Active Operational Roster</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93] mt-1">Authorized intelligence personnel registry</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/2">
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Identity</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Secure Path</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Protocol Output</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {agents.length === 0 ? (
                      <tr><td colSpan={4} className="px-10 py-20 text-center">
                        <Users size={32} className="mx-auto mb-4 text-white/10" />
                        <p className="text-lg font-sans italic text-white/40">No personnel detected in the platform registry.</p>
                      </td></tr>
                    ) : agents.map((a) => (
                      <tr key={a.id} className="hover:bg-white/2 transition-colors group/row">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center text-[10px] font-black font-sans group-hover/row:bg-[#C62E2E] transition-colors border border-white/5">
                                 {a.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-sans font-bold text-lg text-white group-hover/row:text-[#C62E2E] transition-colors">{a.name}</span>
                           </div>
                        </td>
                        <td className="px-10 py-6 text-sm font-bold text-[#8E8E93]">{a.email}</td>
                        <td className="px-10 py-6 text-center">
                          <span className="inline-flex items-center px-4 py-1.5 bg-black rounded-lg text-lg font-sans font-bold text-white border border-white/5 shadow-inner">
                             {a._count?.scans ?? 0} <span className="text-[9px] font-black text-[#C62E2E] ml-2 tracking-widest uppercase opacity-60">Scans</span>
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right text-xs font-bold text-[#8E8E93] opacity-60">{a.createdAt ? new Date(a.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase() : 'UNKNOWN'}</td>
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
