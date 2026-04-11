'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { Search, Download, Brush } from 'lucide-react';

export default function PaintersFinancialPage() {
  const painters = [
    { id: '1', name: 'Alex Smith', qrs: 12, scans: 2450, earnings: 122.50, paid: 100.00, balance: 22.50 },
    { id: '2', name: 'Maria Garcia', qrs: 8, scans: 1120, earnings: 56.00, paid: 50.00, balance: 6.00 },
    { id: '3', name: 'James Wilson', qrs: 25, scans: 5600, earnings: 280.00, paid: 250.00, balance: 30.00 },
  ];

  return (
    <div className="flex bg-background min-h-screen text-foreground">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-1">Painter Financials</h2>
            <p className="text-muted-foreground">Monitor QR deployment, scan performance, and painter payouts.</p>
          </div>
          <button className="glass flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-white/5 transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </header>

        <div className="glass overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search painters..." 
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground border-b border-white/5">
                <th className="px-6 py-4 font-semibold">Painter Name</th>
                <th className="px-6 py-4 font-semibold">QRs Installed</th>
                <th className="px-6 py-4 font-semibold">Total Scans</th>
                <th className="px-6 py-4 font-semibold">Earnings ($)</th>
                <th className="px-6 py-4 font-semibold">Paid ($)</th>
                <th className="px-6 py-4 font-semibold">Balance ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {painters.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      <Brush size={14} />
                    </div>
                    {p.name}
                  </td>
                  <td className="px-6 py-4">{p.qrs}</td>
                  <td className="px-6 py-4 font-bold">{p.scans.toLocaleString()}</td>
                  <td className="px-6 py-4">${p.earnings.toFixed(2)}</td>
                  <td className="px-6 py-4 text-green-500">${p.paid.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gradient">${p.balance.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
