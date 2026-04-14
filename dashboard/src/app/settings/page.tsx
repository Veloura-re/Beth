'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  ChevronRight,
  LogOut,
  Cpu
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="flex bg-[#0A0A0A] min-h-screen text-[#F5F5F7] font-sans relative overflow-x-hidden selection:bg-[#C62E2E] selection:text-white">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 lg:p-12 relative z-10 max-w-7xl mx-auto">
        <header className="mb-20">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C62E2E] mb-3">System Architecture</p>
          <h1 className="text-5xl font-sans font-bold tracking-tight mb-4">Core Control Panel</h1>
          <p className="text-lg text-[#8E8E93] max-w-2xl font-bold leading-relaxed uppercase tracking-tight opacity-60">
            Configure technical parameters, security protocols, and operational access values for the Beth network registry.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <SettingsNode 
              icon={<Shield size={24} />} 
              title="Security Protocols" 
              desc="Manage encryption nodes, multi-layered authorization, and restricted access logs."
              accent
            />
            <SettingsNode 
              icon={<Bell size={24} />} 
              title="Intelligence Alerts" 
              desc="Global notification hooks and automated operational status report delivery."
            />
            <SettingsNode 
              icon={<Database size={24} />} 
              title="Registry Management" 
              desc="Core archival systems, ledger pruning protocols, and persistent cache structures."
            />
            <SettingsNode 
              icon={<Globe size={24} />} 
              title="Global Governance" 
              desc="Regional compliance frameworks and localized structural validation rules."
            />
        </div>

        <div className="space-y-6">
            <h3 className="text-xl font-sans font-bold tracking-tight border-b border-white/5 pb-4 mb-10 text-white uppercase">Operational Performance</h3>
            
            <button className="w-full flex items-center justify-between p-8 bg-[#161616] rounded-3xl border border-[#262626] hover:border-[#C62E2E]/30 transition-all group shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C62E2E]/5 rounded-full blur-[80px] translate-x-32 -translate-y-32 group-hover:bg-[#C62E2E]/10 transition-colors" />
              <div className="flex items-center gap-8 text-left relative z-10">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-[#8E8E93] group-hover:bg-[#C62E2E]/10 group-hover:text-[#C62E2E] transition-colors border border-white/5 shadow-inner">
                  <Cpu size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C62E2E] mb-1">Compute Infrastructure</p>
                  <p className="text-2xl font-sans font-bold text-white tracking-tight">Optimize Core Throughput</p>
                  <p className="text-sm font-bold text-[#8E8E93] uppercase tracking-tight opacity-60">Calibrate processing nodes for peak operational efficiency.</p>
                </div>
              </div>
              <ChevronRight size={24} className="text-[#8E8E93] group-hover:text-white group-hover:translate-x-2 transition-all opacity-20 group-hover:opacity-100" />
            </button>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-8 bg-[#161616] rounded-3xl border border-[#262626] hover:border-[#C62E2E]/30 transition-all group shadow-2xl mt-12 relative overflow-hidden"
            >
              <div className="flex items-center gap-8 text-left relative z-10">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-[#8E8E93] group-hover:bg-[#C62E2E]/5 group-hover:text-[#C62E2E] transition-colors border border-white/5 shadow-inner">
                  <LogOut size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93] mb-1">Session Protocol</p>
                  <p className="text-2xl font-sans font-bold text-white tracking-tight">Terminate Authorized Access</p>
                  <p className="text-sm font-bold text-[#8E8E93] uppercase tracking-tight opacity-60">Securely exit the management architecture and invalidate tokens.</p>
                </div>
              </div>
              <ChevronRight size={24} className="text-[#8E8E93] group-hover:text-white group-hover:translate-x-2 transition-all opacity-20 group-hover:opacity-100" />
            </button>
        </div>

        <footer className="mt-32 border-t border-white/5 pt-12 text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.4em] flex flex-col md:flex-row md:items-center justify-between gap-8 italic opacity-40">
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-[#C62E2E] animate-pulse shadow-[0_0_8px_#C62E2E]" />
             <span>BETH.OS KERNEL V 24.2.0 • NOMINAL STATUS</span>
          </div>
          <div className="flex gap-8 not-italic">
             <span className="hover:text-white cursor-help transition-colors border-b border-white/10 pb-1">Documentation</span>
             <span className="hover:text-white cursor-help transition-colors border-b border-white/10 pb-1">Audit Logs</span>
             <span className="hover:text-white cursor-help transition-colors border-b border-white/10 pb-1">Uptime</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function SettingsNode({ icon, title, desc, accent = false }: { icon: React.ReactNode, title: string, desc: string, accent?: boolean }) {
  return (
    <div className={`p-10 rounded-[40px] border transition-all duration-500 group relative overflow-hidden ${
      accent 
        ? 'bg-[#C62E2E] text-white border-[#C62E2E] shadow-2xl scale-[1.02] z-10' 
        : 'bg-[#161616] text-[#F5F5F7] border-[#262626] shadow-xl hover:border-[#C62E2E]/30'
    }`}>
      {accent && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
      )}
      
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-12 transition-all duration-500 border border-white/10 ${
        accent 
          ? 'bg-white/10 text-white' 
          : 'bg-black text-[#8E8E93] group-hover:bg-[#C62E2E]/10 group-hover:text-[#C62E2E]'
      }`}>
        {icon}
      </div>
      <div className="relative z-10">
        <h4 className="text-3xl font-sans font-bold mb-4 tracking-tight uppercase">{title}</h4>
        <p className={`text-base font-bold leading-relaxed uppercase tracking-tight ${accent ? 'text-white/80' : 'text-[#8E8E93] opacity-60'}`}>{desc}</p>
      </div>
      <div className={`mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
         accent ? 'text-white group-hover:translate-x-1' : 'text-[#8E8E93] group-hover:text-[#C62E2E] group-hover:translate-x-1'
      }`}>
         <span>Configure Protocol</span>
         <ChevronRight size={14} className="transition-transform" />
      </div>
    </div>
  );
}
