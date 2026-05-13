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
    <div className="flex bg-[#FBFBFD] min-h-screen text-[#1D1D1F] font-sans relative overflow-x-hidden selection:bg-[#000000] selection:text-white">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 lg:p-12 relative z-10 max-w-7xl mx-auto">
        <header className="mb-20">
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#86868B] mb-3">Account Settings</p>
          <h1 className="text-5xl font-sans font-bold tracking-tight mb-4 text-black">Settings</h1>
          <p className="text-lg text-[#86868B] max-w-2xl font-medium leading-relaxed">
            Manage your account, notifications, and security preferences.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <SettingsNode 
              icon={<Shield size={24} />} 
              title="Security" 
              desc="Manage your password and account security."
              accent
            />
            <SettingsNode 
              icon={<Bell size={24} />} 
              title="Notifications" 
              desc="Choose how you want to be notified about updates."
            />
            <SettingsNode 
              icon={<Database size={24} />} 
              title="Data Management" 
              desc="Manage your data and export history."
            />
            <SettingsNode 
              icon={<Globe size={24} />} 
              title="Regional Settings" 
              desc="Update your region and language preferences."
            />
        </div>

        <div className="space-y-6">
            <h3 className="text-xl font-sans font-bold tracking-tight border-b border-black/5 pb-4 mb-10 text-black">Account Actions</h3>
            
            <button className="w-full flex items-center justify-between p-8 bg-white rounded-3xl border border-[#D2D2D7] hover:border-black/30 transition-all group shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-[80px] translate-x-32 -translate-y-32 group-hover:bg-black/10 transition-colors" />
              <div className="flex items-center gap-8 text-left relative z-10">
                <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center text-[#1D1D1F] group-hover:bg-black group-hover:text-white transition-colors border border-black/5 shadow-inner">
                  <Cpu size={28} />
                </div>
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#86868B] mb-1">System Info</p>
                  <p className="text-2xl font-sans font-bold text-black tracking-tight">Performance</p>
                  <p className="text-sm font-medium text-[#86868B]">View system status and performance.</p>
                </div>
              </div>
              <ChevronRight size={24} className="text-[#86868B] group-hover:text-black group-hover:translate-x-2 transition-all opacity-20 group-hover:opacity-100" />
            </button>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-8 bg-white rounded-3xl border border-[#D2D2D7] hover:border-black/30 transition-all group shadow-sm mt-12 relative overflow-hidden"
            >
              <div className="flex items-center gap-8 text-left relative z-10">
                <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center text-[#1D1D1F] group-hover:bg-black group-hover:text-white transition-colors border border-black/5 shadow-inner">
                  <LogOut size={28} />
                </div>
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#86868B] mb-1">Session</p>
                  <p className="text-2xl font-sans font-bold text-black tracking-tight">Sign Out</p>
                  <p className="text-sm font-medium text-[#86868B]">Safely sign out of your account.</p>
                </div>
              </div>
              <ChevronRight size={24} className="text-[#86868B] group-hover:text-black group-hover:translate-x-2 transition-all opacity-20 group-hover:opacity-100" />
            </button>
        </div>

        <footer className="mt-32 border-t border-black/5 pt-12 text-[12px] font-black text-[#86868B] uppercase tracking-[0.4em] flex flex-col md:flex-row md:items-center justify-between gap-8 italic opacity-40">
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-black animate-pulse shadow-[0_0_8px_black]" />
             <span>BETH REWARDS • SYSTEM ONLINE</span>
          </div>
          <div className="flex gap-8 not-italic">
             <span className="hover:text-black cursor-help transition-colors border-b border-black/10 pb-1">Documentation</span>
             <span className="hover:text-black cursor-help transition-colors border-b border-black/10 pb-1">Logs</span>
             <span className="hover:text-black cursor-help transition-colors border-b border-black/10 pb-1">Uptime</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function SettingsNode({ icon, title, desc, accent = false }: { icon: React.ReactNode, title: string, desc: string, accent?: boolean }) {
  return (
    <div className={`p-10 rounded-3xl border transition-all duration-500 group relative overflow-hidden ${
      accent 
        ? 'bg-black text-white border-black shadow-xl scale-[1.02] z-10' 
        : 'bg-white text-[#1D1D1F] border-[#D2D2D7] shadow-sm hover:border-black/30'
    }`}>
      {accent && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
      )}
      
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-12 transition-all duration-500 border border-black/5 ${
        accent 
          ? 'bg-white/10 text-white' 
          : 'bg-[#F5F5F7] text-[#1D1D1F] group-hover:bg-black group-hover:text-white'
      }`}>
        {icon}
      </div>
      <div className="relative z-10">
        <h4 className="text-3xl font-sans font-bold mb-4 tracking-tight">{title}</h4>
        <p className={`text-base font-medium leading-relaxed ${accent ? 'text-white/80' : 'text-[#86868B]'}`}>{desc}</p>
      </div>
      <div className={`mt-10 flex items-center gap-2 text-[12px] font-black uppercase tracking-widest transition-all ${
         accent ? 'text-white group-hover:translate-x-1' : 'text-[#86868B] group-hover:text-black group-hover:translate-x-1'
      }`}>
         <span>Open Settings</span>
         <ChevronRight size={14} className="transition-transform" />
      </div>
    </div>
  );
}
