'use client';

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CurvyLines } from '@/components/Decoration';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Access Denied');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const role = data.user.role;
      if (role === 'SUPERADMIN') router.push('/admins');
      else if (role === 'ADMIN') router.push('/dashboard');
      else if (role === 'AGENT') router.push('/agents');
      else router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Access Denied';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex font-sans relative overflow-hidden selection:bg-[#C62E2E] selection:text-white">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#C62E2E] rounded-full blur-[150px]" />
         <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-[#C62E2E] rounded-full blur-[120px]" />
      </div>

      {/* Left panel — Brand / Aesthetic Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#0D0D0D] text-white flex-col justify-between p-24 relative z-10 border-r border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
           <CurvyLines />
        </div>
        
        <div className="relative z-20">
          <div className="flex items-center gap-4 mb-24 group cursor-default">
            <div className="w-12 h-12 rounded-xl bg-[#C62E2E] flex items-center justify-center shadow-[0_0_20px_rgba(198,46,46,0.3)] transform transition-all group-hover:scale-110 group-hover:rotate-6">
               <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
            </div>
            <div>
              <h1 className="text-2xl font-sans font-black tracking-tighter uppercase leading-none">Beth</h1>
              <p className="text-[10px] font-black text-[#C62E2E] tracking-[0.3em] uppercase mt-1">Oversight Hub</p>
            </div>
          </div>
          
          <div className="max-w-md">
            <p className="text-[10px] font-black tracking-[0.5em] uppercase text-white/30 mb-8 ml-1">
              Command & Control
            </p>
            <h2 className="text-8xl font-sans font-bold leading-[0.95] tracking-tighter text-white mb-8">
              PREMIUM<br />
              <span className="text-white/20">NETWORK</span><br />
              STABILITY.
            </h2>
            <p className="text-lg text-[#8E8E93] font-bold leading-relaxed uppercase tracking-tight opacity-60">
              Coordinating the rewards ecosystem with architectural precision and high-fidelity operational control protocols.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 relative z-20">
          {[
            { label: 'Security State', value: 'ENCRYPTED' },
            { label: 'Network status', value: 'OPERATIONAL' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.02] backdrop-blur-md p-8 rounded-2xl border border-white/5 group hover:border-[#C62E2E]/20 transition-all shadow-2xl">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8E8E93] mb-3 group-hover:text-[#C62E2E] transition-colors">
                {s.label}
              </p>
              <p className="text-2xl font-sans font-bold text-white tracking-tight italic uppercase">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — Login */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 relative z-10 transition-all duration-1000">
        <div className="w-full max-w-sm">
          {/* Mobile brand elevation */}
          <div className="flex lg:hidden items-center gap-4 mb-16">
            <div className="w-10 h-10 rounded-xl bg-[#C62E2E] flex items-center justify-center shadow-lg">
               <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
            </div>
            <span className="text-xl font-sans font-black tracking-tighter uppercase">Beth</span>
          </div>

          <div className="mb-14">
            <h2 className="text-4xl font-sans font-bold text-white mb-4 tracking-tight uppercase">Authorized Access</h2>
            <p className="text-[#8E8E93] font-bold uppercase text-[11px] tracking-widest opacity-60">Enter credentials to initialize secure session</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {/* Email */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93] ml-1">
                Security Identifier
              </label>
              <div className="relative group">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#C62E2E] transition-colors" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@beth.protocol"
                  className="w-full pl-10 pr-4 py-4 bg-transparent border-b border-white/10 focus:border-[#C62E2E] outline-none transition-all text-lg font-bold placeholder:text-white/5"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93] ml-1">
                Access Key
              </label>
              <div className="relative group">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#C62E2E] transition-colors" size={20} />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-12 py-4 bg-transparent border-b border-white/10 focus:border-[#C62E2E] outline-none transition-all text-lg font-bold placeholder:text-white/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#8E8E93]/40 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-[#C62E2E]/10 text-[#C62E2E] border border-[#C62E2E]/20 px-6 py-4 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-3 animate-in shake duration-500 shadow-2xl">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C62E2E] animate-pulse shadow-[0_0_8px_#C62E2E]" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-[#C62E2E] hover:brightness-110 text-white rounded-xl font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl hover:shadow-[#C62E2E]/20 hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-4 group/btn"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  INITIALIZE SESSION <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-24 pt-10 border-t border-white/5 flex justify-between items-center text-[#8E8E93]/20">
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              BETH.OS Intel v1.2
            </span>
            <div className="flex gap-4">
               <div className="w-2 h-2 rounded-full bg-[#C62E2E]/30" />
               <div className="w-2 h-2 rounded-full bg-white/5" />
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
