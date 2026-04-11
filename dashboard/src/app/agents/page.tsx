'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { Search, Filter, Download, Users as UsersIcon } from 'lucide-react';

export default function AgentsFinancialPage() {
  const agents = [
    { id: '1', name: 'John Doe', scans: 145, points: 1450, requested: 120, paid: 100, balance: 45 },
    { id: '2', name: 'Jane Smith', scans: 88, points: 880, requested: 50, paid: 50, balance: 38 },
    { id: '3', name: 'Mike Ross', scans: 210, points: 2100, requested: 200, paid: 180, balance: 30 },
  ];

  return (
    <div className="flex bg-background min-h-screen text-foreground">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-1">Agent Financials</h2>
            <p className="text-muted-foreground">Track performance, points, and cashout history for all agents.</p>
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
                placeholder="Search agents..." 
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground border-b border-white/5">
                <th className="px-6 py-4 font-semibold">Agent Name</th>
                <th className="px-6 py-4 font-semibold">Total Scans</th>
                <th className="px-6 py-4 font-semibold">Points Earned</th>
                <th className="px-6 py-4 font-semibold">Requested ($)</th>
                <th className="px-6 py-4 font-semibold">Paid ($)</th>
                <th className="px-6 py-4 font-semibold">Balance ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {agents.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {a.name[0]}
                    </div>
                    {a.name}
                  </td>
                  <td className="px-6 py-4">{a.scans}</td>
                  <td className="px-6 py-4 font-bold text-primary">{a.points}</td>
                  <td className="px-6 py-4">${a.requested}.00</td>
                  <td className="px-6 py-4 text-green-500">${a.paid}.00</td>
                  <td className="px-6 py-4">
                    <span className="font-bold">${a.balance}.00</span>
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
