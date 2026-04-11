'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter,
  Download
} from 'lucide-react';

export default function FinancialsPage() {
  const transactions = [
    { id: '1', type: 'Payout', user: 'Agent: John Doe', amount: '-$120.00', status: 'Paid', date: '2024-03-10' },
    { id: '2', type: 'Revenue', user: 'Campaign: Summer Hit', amount: '+$1,450.00', status: 'Settled', date: '2024-03-09' },
    { id: '3', type: 'Payout', user: 'Painter: Alex Smith', amount: '-$45.00', status: 'Pending', date: '2024-03-09' },
    { id: '4', type: 'Revenue', user: 'Campaign: Mega City', amount: '+$890.00', status: 'Settled', date: '2024-03-08' },
  ];

  return (
    <div className="flex bg-background min-h-screen text-foreground">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-1">Financials</h2>
            <p className="text-muted-foreground">Detailed breakdown of revenue, payouts, and net profit.</p>
          </div>
          <div className="flex gap-3">
            <button className="glass flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-white/5 transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </header>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass p-6 border-b-2 border-primary/50">
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white tracking-tight">$42,950.00</p>
          </div>
          <div className="glass p-6 border-b-2 border-red-500/50">
            <p className="text-sm text-muted-foreground mb-1">Total Payouts</p>
            <p className="text-3xl font-bold text-white tracking-tight">$18,420.00</p>
          </div>
          <div className="glass p-6 border-b-2 border-green-500/50">
            <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
            <p className="text-3xl font-bold text-white tracking-tight text-gradient">$24,530.00</p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="glass overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold">Recent Transactions</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search transactions..." 
                  className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
              <button className="glass px-4 py-2 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground border-b border-white/5">
                <th className="px-6 py-4 font-semibold">User / Source</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-medium">{t.user}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 text-sm ${t.type === 'Revenue' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'Revenue' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{t.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      t.status === 'Paid' || t.status === 'Settled' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{t.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-sm">View details</button>
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
