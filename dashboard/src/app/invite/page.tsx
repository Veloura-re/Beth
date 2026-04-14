'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Loader2, Lock, User, Key, Check } from 'lucide-react';

function OnboardingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('KEI_MISMATCH: Access identifiers do not align.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, token })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'SYSTEM_FAILURE: Registration protocol aborted.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="text-center bg-[#161616] p-12 rounded-[40px] border border-[#262626] shadow-2xl max-w-md animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C62E2E]/10 rounded-full blur-[60px] translate-x-10 -translate-y-10" />
        <div className="w-16 h-16 bg-black text-[#C62E2E] rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-inner">
           <Lock size={32} />
        </div>
        <h2 className="text-3xl font-sans font-bold mb-4 text-white uppercase tracking-tight">Access Restricted</h2>
        <p className="text-sm text-[#8E8E93] leading-relaxed font-bold uppercase tracking-tight opacity-60">Authorization token or identity missing. Please use a valid procurement link.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="mb-14 text-center px-4">
        <div className="inline-flex w-16 h-16 bg-[#C62E2E] text-white rounded-2xl items-center justify-center mb-8 shadow-[0_0_20px_rgba(198,46,46,0.3)]">
          <ShieldCheck size={32} strokeWidth={1.5} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C62E2E] mb-3">Systems Onboarding</p>
        <h1 className="text-5xl font-sans font-bold tracking-tighter text-white uppercase">Initialize Operator</h1>
      </div>

      <form onSubmit={handleRegister} className="bg-[#161616] border border-[#262626] p-12 rounded-[40px] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-full h-full bg-[#C62E2E]/5 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 group-hover:bg-[#C62E2E]/10" />
        
        <div className="space-y-10 relative z-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] ml-1">Identity Profile</label>
            <div className="relative">
              <User className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#C62E2E] transition-colors" size={20} />
              <input 
                type="text" 
                autoFocus
                required
                className="w-full bg-transparent border-b border-white/10 pl-9 py-4 focus:border-[#C62E2E] outline-none transition-all text-xl font-bold placeholder:text-white/5"
                placeholder="Full Legal Name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 bg-black/40 p-8 rounded-2xl border border-white/5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93]">Authorized Intelligence Node</label>
            <div className="flex items-center gap-4">
               <div className="w-9 h-9 rounded-xl bg-[#C62E2E]/10 text-[#C62E2E] flex items-center justify-center border border-[#C62E2E]/20 shadow-inner">
                  <Check size={18} />
               </div>
               <span className="text-lg font-sans font-bold text-white tracking-tight">{email}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] ml-1">Access Key</label>
              <div className="relative">
                <Key className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#C62E2E] transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  className="w-full bg-transparent border-b border-white/10 pl-9 py-4 focus:border-[#C62E2E] outline-none transition-all text-xl font-bold placeholder:text-white/5"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] ml-1">Verify Key</label>
              <div className="relative">
                <Key className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#C62E2E] transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  className="w-full bg-transparent border-b border-white/10 pl-9 py-4 focus:border-[#C62E2E] outline-none transition-all text-xl font-bold placeholder:text-white/5"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-[#C62E2E]/10 text-[#C62E2E] border border-[#C62E2E]/20 p-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 animate-in shake duration-500 shadow-2xl">
              <div className="w-8 h-8 rounded-full bg-[#C62E2E] text-white flex items-center justify-center shrink-0 shadow-[0_0_10px_#C62E2E]">
                 !
              </div>
              <div>
                <p className="opacity-40 mb-0.5 text-[9px]">Protocol Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 bg-[#C62E2E] hover:brightness-110 text-white rounded-2xl flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.3em] shadow-2xl hover:shadow-[#C62E2E]/20 transition-all duration-500 group/btn hover:-translate-y-1"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Finalize Registry Entry <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-20 text-center">
        <p className="text-[10px] font-black tracking-[0.5em] uppercase text-[#8E8E93] opacity-20 italic">BETH.OS KERNEL V 24.2.0 • NOMINAL STATUS</p>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen flex items-center justify-center p-8 relative overflow-hidden selection:bg-[#C62E2E] selection:text-white">
      {/* Abstract Design Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
         <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#C62E2E] rounded-full blur-[150px]" />
         <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-[#C62E2E] rounded-full blur-[150px]" />
      </div>

      <Suspense fallback={<Loader2 className="animate-spin text-[#C62E2E] w-12 h-12" />}>
        <OnboardingForm />
      </Suspense>
    </div>
  );
}
