'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ShieldCheck, Plus, Loader2, Copy, Check, X, Shield, Mail, User } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

interface AdminUser {
  id: string; name: string; email: string; role: string; createdAt: string;
}

export default function AdminsPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copying, setCopying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadAdmins = async () => {
    try {
      const data = await fetchWithAuth('/users');
      const list = Array.isArray(data) ? data : [];
      setAdmins(list.filter((u: AdminUser) => u.role === 'ADMIN' || u.role === 'SUPERADMIN'));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Registry failure';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) setCurrentUser(JSON.parse(raw));
    loadAdmins();
  }, []);

  const isSuperAdmin = currentUser?.role === 'SUPERADMIN';

  const handleInvite = async () => {
    if (!newEmail) return;
    setSubmitting(true); setError('');
    try {
      const data = await fetchWithAuth('/invites', {
        method: 'POST',
        body: JSON.stringify({ email: newEmail, role: 'ADMIN', name: newName }),
      });
      setInviteLink(data?.inviteLink || '');
      setIsAdding(false);
      setNewEmail(''); setNewName('');
    } catch {
      setError('FAILED TO GENERATE AUTHORIZATION TOKEN.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
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
    <ProtectedRoute allowedRoles={['SUPERADMIN']}>
      <div className="flex bg-[#0A0A0A] min-h-screen font-sans text-[#F5F5F7]">
        <Sidebar />

        <main className="flex-1 min-h-screen ml-64 p-8 lg:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-sans font-bold tracking-tight mb-2">Personnel Registry</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93]">High-level internal node management</p>
            </div>
            {isSuperAdmin && (
              <button
                onClick={() => { setIsAdding(true); setInviteLink(''); }}
                className="flex items-center gap-2 px-6 py-3 bg-[#C62E2E] text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(198,46,46,0.3)] hover:brightness-110 transition-all hover:-translate-y-0.5"
              >
                <Plus size={18} /> <span>PROVISION NODE</span>
              </button>
            )}
          </div>

          <div className="space-y-10">
            {/* Invite Form */}
            {isAdding && (
              <div className="bg-[#161616] border border-[#262626] p-10 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-sans font-bold tracking-tight">Generate Authorization</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C62E2E] mt-1">Tier-1 Access Provisioning</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="w-10 h-10 rounded-full border border-[#262626] flex items-center justify-center text-[#8E8E93] hover:bg-white/5 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[#8E8E93] ml-1">Identity Label</label>
                    <div className="relative group">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C62E2E] transition-colors" size={18} />
                       <input
                         type="text"
                         value={newName}
                         onChange={(e) => setNewName(e.target.value)}
                         placeholder="Authorized Name"
                         className="w-full pl-12 pr-4 py-4 bg-black border border-[#262626] rounded-xl focus:border-[#C62E2E] focus:ring-4 focus:ring-[#C62E2E]/10 outline-none transition-all text-base font-bold shadow-inner placeholder:text-white/10"
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[#8E8E93] ml-1">Secure Communication</label>
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C62E2E] transition-colors" size={18} />
                       <input
                         type="email"
                         value={newEmail}
                         onChange={(e) => setNewEmail(e.target.value)}
                         placeholder="admin@beth.com"
                         className="w-full pl-12 pr-4 py-4 bg-black border border-[#262626] rounded-xl focus:border-[#C62E2E] focus:ring-4 focus:ring-[#C62E2E]/10 outline-none transition-all text-base font-bold shadow-inner placeholder:text-white/10"
                       />
                    </div>
                  </div>
                </div>
                {error && <p className="text-[#C62E2E] text-[10px] font-black uppercase tracking-widest mb-6 px-4 py-2 bg-[#C62E2E]/10 rounded-lg inline-block border border-[#C62E2E]/20">{error}</p>}
                <div className="flex justify-end pt-6 border-t border-white/5">
                  <button
                    onClick={handleInvite}
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 bg-[#F5F5F7] text-[#0A0A0A] rounded-xl font-black shadow-lg hover:brightness-90 transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                    <span>ISSUE CREDENTIALS</span>
                  </button>
                </div>
              </div>
            )}

            {/* Invite Link Result */}
            {inviteLink && (
              <div className="bg-[#C62E2E] text-white p-10 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[80px]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                       <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-sans font-bold tracking-tight">Authorization Link Ready</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Credential acquisition protocol active</p>
                    </div>
                  </div>
                  <div className="bg-black/20 border border-white/10 p-6 rounded-2xl flex items-center gap-4 group backdrop-blur-md">
                    <code className="flex-1 text-sm text-white/70 break-all font-mono tracking-tighter">{inviteLink}</code>
                    <button
                      onClick={copyToClipboard}
                      className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white text-[#0A0A0A] rounded-lg transition-all text-[11px] font-black uppercase tracking-wider"
                    >
                      {copying ? <><Check size={14} /> COPIED</> : <><Copy size={14} /> COPY LINK</>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Table */}
            <div className="bg-[#161616] border border-[#262626] rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-sans font-bold tracking-tight text-white">Authorized Operators</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93] mt-1">Hierarchical node registry</p>
                </div>
              </div>

              {admins.length === 0 ? (
                <div className="p-24 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/5 border border-white/5 rounded-full flex items-center justify-center mb-8">
                    <Shield size={32} className="text-white/20" strokeWidth={1} />
                  </div>
                  <h4 className="text-2xl font-sans font-bold tracking-tight mb-4 text-white">No Personnel Detected</h4>
                  <p className="text-sm font-bold text-[#8E8E93] max-w-sm leading-relaxed uppercase tracking-tight opacity-60">
                    The platform registry is currently vacant at the administrative layer.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/2">
                        <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Operator Identity</th>
                        <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Communication Path</th>
                        <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Clearance Level</th>
                        <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Provisioned Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {admins.map((a) => (
                        <tr key={a.id} className="hover:bg-white/2 transition-colors group/row">
                          <td className="px-10 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-lg bg-[#262626] text-white flex items-center justify-center text-[11px] font-black font-sans group-hover/row:bg-[#C62E2E] transition-colors border border-white/5">
                                   {a.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-sans font-bold text-lg text-white group-hover/row:text-[#C62E2E] transition-colors">{a.name}</span>
                             </div>
                          </td>
                          <td className="px-10 py-6 text-sm font-bold text-[#8E8E93]">
                             {a.email}
                          </td>
                          <td className="px-10 py-6 text-center">
                            <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border ${
                               a.role === 'SUPERADMIN' 
                                 ? 'bg-[#C62E2E]/10 text-[#C62E2E] border-[#C62E2E]/20' 
                                 : 'bg-white/5 text-white/40 border-white/5'
                            }`}>
                              {a.role}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right text-xs font-bold text-[#8E8E93] opacity-60">
                            {new Date(a.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
