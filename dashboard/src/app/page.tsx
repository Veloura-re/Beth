'use client';

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CurvyLines } from '@/components/Decoration';
import { supabase } from '@/lib/supabase';

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
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);
      if (!data.user) throw new Error('No user data returned');

      // Fetch profile for role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw new Error('Profile lookup failed');

      localStorage.setItem('user', JSON.stringify({ ...data.user, ...profile }));

      const role = profile.role;
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
    <div className="min-h-screen bg-[#0A0A0A] flex font-sans relative overflow-hidden selection:bg-[#F4F1EA] selection:text-black">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#F4F1EA] rounded-full blur-[150px]" />
         <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-[#F4F1EA] rounded-full blur-[120px]" />
      </div>

      {/* Left panel — Brand / Aesthetic Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#0D0D0D] text-white flex-col justify-between p-24 relative z-10 border-r border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
           <CurvyLines />
        </div>
        
        <div className="relative z-20">
          <div className="flex items-center gap-4 mb-24 group cursor-default">
            <div className="w-12 h-12 bg-[#F4F1EA] flex items-center justify-center shadow-[0_0_20px_rgba(244,241,234,0.1)] transform transition-all group-hover:scale-110 group-hover:rotate-6 rounded-3xl">
               <div className="w-7 h-7 bg-black" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-sans font-black tracking-tighter uppercase leading-none">Beth</h1>
              <p className="text-[12px] font-black text-[#F4F1EA] tracking-[0.3em] uppercase mt-1">Oversight Hub</p>
            </div>
          </div>
          
          <div className="max-w-md">
            <p className="text-[12px] font-black tracking-[0.5em] uppercase text-white/30 mb-8 ml-1">
              Welcome Back
            </p>
            <h2 className="text-8xl font-sans font-bold leading-[0.95] tracking-tighter text-white mb-8">
              SIMPLE.<br />
              <span className="text-white/20">FAST.</span><br />
              SECURE.
            </h2>
            <p className="text-lg text-[#8E8E93] font-bold leading-relaxed uppercase tracking-tight opacity-60">
              Managing your rewards easily and keeping everything running smoothly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 relative z-20">
          {[
            { label: 'Status', value: 'Secured' },
            { label: 'Network status', value: 'OPERATIONAL' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.02] backdrop-blur-md p-8 rounded-3xl border border-white/5 group hover:border-[#F4F1EA]/20 transition-all shadow-2xl">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#8E8E93] mb-3 group-hover:text-[#F4F1EA] transition-colors">
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
            <div className="w-10 h-10 bg-[#F4F1EA] flex items-center justify-center shadow-lg rounded-3xl">
               <div className="w-6 h-6 bg-black" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
            </div>
            <span className="text-xl font-sans font-black tracking-tighter uppercase">Beth</span>
          </div>

          <div className="mb-14">
            <h2 className="text-4xl font-sans font-bold text-white mb-4 tracking-tight uppercase">Sign In</h2>
            <p className="text-[#8E8E93] font-bold uppercase text-[13px] tracking-widest opacity-60">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {/* Email */}
            <div className="space-y-3">
              <label className="block text-[12px] font-black uppercase tracking-[0.2em] text-[#8E8E93] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#F4F1EA] transition-colors" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@beth.protocol"
                  className="w-full pl-10 pr-4 py-4 bg-transparent border-b border-white/10 focus:border-[#F4F1EA] outline-none transition-all text-lg font-bold placeholder:text-white/5"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="block text-[12px] font-black uppercase tracking-[0.2em] text-[#8E8E93] ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#F4F1EA] transition-colors" size={20} />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-12 py-4 bg-transparent border-b border-white/10 focus:border-[#F4F1EA] outline-none transition-all text-lg font-bold placeholder:text-white/5"
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
              <div className="bg-[#F4F1EA]/10 text-[#F4F1EA] border border-[#F4F1EA]/20 px-6 py-4 rounded-3xl text-[12px] font-black tracking-widest uppercase flex items-center gap-3 animate-in shake duration-500 shadow-2xl">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F4F1EA] animate-pulse shadow-[0_0_8px_#F4F1EA]" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-[#F4F1EA] hover:brightness-110 text-black rounded-3xl font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl hover:shadow-[#F4F1EA]/20 hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-4 group/btn"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  CONTINUE <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-24 pt-10 border-t border-white/5 flex justify-between items-center text-[#8E8E93]/20">
            <span className="text-[12px] font-black uppercase tracking-[0.3em]">
              BETH.OS Intel v1.2
            </span>
            <div className="flex gap-4">
               <div className="w-2 h-2 rounded-full bg-[#F4F1EA]/30" />
               <div className="w-2 h-2 rounded-full bg-white/5" />
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
