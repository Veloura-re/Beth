'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Shapes, 
  QrCode, 
  Users, 
  BarChart2, 
  Wallet, 
  LogOut 
} from 'lucide-react';

interface AuthUser {
  name: string;
  email: string;
  role: string;
}

const navItems = [
  { name: 'System Oversight', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPERADMIN', 'ADMIN'] },
  { name: 'Personnel Registry', href: '/admins', icon: ShieldCheck, roles: ['SUPERADMIN'] },
  { name: 'System Directives', href: '/campaigns', icon: Shapes, roles: ['SUPERADMIN', 'ADMIN'] },
  { name: 'Protocol Registry', href: '/qrs', icon: QrCode, roles: ['SUPERADMIN', 'ADMIN'] },
  { name: 'Operational Personnel', href: '/agents', icon: Users, roles: ['SUPERADMIN', 'ADMIN'] },
  { name: 'Treasury Ledger', href: '/financials', icon: BarChart2, roles: ['SUPERADMIN', 'ADMIN'] },
  { name: 'Disbursement Ledger', href: '/payouts', icon: Wallet, roles: ['SUPERADMIN', 'ADMIN'] },
];

const roleLabels: Record<string, { label: string; color: string }> = {
  'SUPERADMIN': { label: 'Node Commander', color: 'bg-[#C62E2E]' },
  'ADMIN': { label: 'Platform Admin', color: 'bg-white/10' },
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(raw));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const filtered = navItems.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  const roleInfo = user ? (roleLabels[user.role] ?? { label: user.role, color: '#8E8E93' }) : null;

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 bg-[#0D0D0D] border-r border-[#262626] flex flex-col z-50 font-sans"
    >
      {/* Brand */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-[#C62E2E] flex items-center justify-center shadow-[0_0_15px_rgba(198,46,46,0.2)] group-hover:scale-105 transition-transform">
             <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
          </div>
          <div>
            <h1 className="text-lg font-sans font-bold tracking-tight leading-none text-white">BETH</h1>
            <p className="text-[10px] font-black text-[#8E8E93] tracking-widest uppercase mt-1">Oversight Hub</p>
          </div>
        </div>
        
        {roleInfo && (
          <div className="mt-6 inline-flex items-center px-2 py-1 bg-white/5 rounded-md border border-white/10">
            <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">
              {roleInfo.label}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
          Mission Control
        </p>
        {filtered.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${active
                ? 'bg-white/5 text-white font-bold border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.4)]'
                : 'text-[#8E8E93] hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon
                size={18}
                strokeWidth={active ? 2.5 : 2}
                className={`shrink-0 transition-colors ${active ? 'text-[#C62E2E]' : 'text-white/30 group-hover:text-white/60'}`}
              />
              <span className="text-sm tracking-tight">
                {item.name}
              </span>
              {active && (
                <div className="ml-auto w-1 h-1 rounded-full bg-[#C62E2E] shadow-[0_0_8px_#C62E2E]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="mt-auto p-4 border-t border-white/5">
        {user && (
          <div className="bg-white/5 rounded-xl p-3 mb-3 border border-white/5">
            <p className="text-xs font-bold text-white truncate">
              {user.name}
            </p>
            <p className="text-[9px] font-medium text-[#8E8E93] truncate uppercase tracking-tight">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#8E8E93] hover:bg-[#C62E2E] hover:text-white rounded-lg transition-all shadow-sm border border-transparent"
        >
          <div className="flex items-center gap-3">
            <LogOut size={16} strokeWidth={2} />
            <span className="font-bold tracking-tight">Sign Out</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
