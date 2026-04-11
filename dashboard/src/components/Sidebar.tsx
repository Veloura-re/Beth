'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  QrCode, 
  Users, 
  TrendingUp, 
  Wallet, 
  Settings,
  ShieldAlert,
  LogOut
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'QR Codes', href: '/qrs', icon: QrCode },
  { name: 'Campaigns', href: '/campaigns', icon: TrendingUp },
  { name: 'Agents', href: '/agents', icon: Users },
  { name: 'Painters', href: '/painters', icon: Users },
  { name: 'Financials', href: '/financials', icon: Wallet },
  { name: 'Security', href: '/security', icon: ShieldAlert },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen glass border-r border-white/5 flex flex-col p-4 fixed left-0 top-0">
      <div className="flex items-center gap-3 px-3 py-6 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(255,0,51,0.5)]">
          <span className="text-white font-bold">B</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">BETH <span className="text-primary">REWARD</span></h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(255,0,51,0.1)]' 
                  : 'text-muted-foreground hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-white/5 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-all group">
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
          <span className="font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
