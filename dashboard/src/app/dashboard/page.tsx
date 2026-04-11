import React from 'react';
import Sidebar from '@/components/Sidebar';
import MetricCard from '@/components/MetricCard';
import { 
  Zap, 
  Users, 
  Target, 
  Award, 
  BarChart3, 
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';

import ScanChart from '@/components/ScanChart';

export default function DashboardPage() {
  // Mock data for initial UI presentation
  const metrics = [
    { title: 'Total Scans', value: '124,592', change: '+12.5%', icon: Zap, trend: 'up' as const },
    { title: 'Active Agents', value: '1,284', change: '+4.2%', icon: Users, trend: 'up' as const },
    { title: 'Total Revenue', value: '$31,148.00', change: '+18.7%', icon: DollarSign, trend: 'up' as const },
    { title: 'Net Profit', value: '$16,240.50', change: '+22.1%', icon: TrendingUp, trend: 'up' as const },
  ];

  return (
    <div className="flex bg-background min-h-screen text-foreground">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-1">Overview</h2>
            <p className="text-muted-foreground">Welcome back, SuperAdmin. Here's your performance snapshot.</p>
          </div>
          <div className="flex gap-3">
            <button className="glass px-4 py-2 text-sm font-medium hover:bg-white/5 transition-colors">
              Export Report
            </button>
            <button className="glow-btn">
              Generate QR Batch
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((m, i) => (
            <MetricCard key={i} {...m} />
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass p-6 h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Scan Growth
              </h3>
              <div className="flex gap-2">
                <button className="text-xs font-semibold px-2 py-1 rounded bg-primary/20 text-primary border border-primary/20">7D</button>
                <button className="text-xs font-semibold px-2 py-1 rounded text-muted-foreground hover:text-white">30D</button>
                <button className="text-xs font-semibold px-2 py-1 rounded text-muted-foreground hover:text-white">1Y</button>
              </div>
            </div>
            <div className="flex-1 rounded-lg flex items-center justify-center text-muted-foreground">
              <ScanChart />
            </div>
          </div>

          <div className="glass p-6 h-[400px] flex flex-col">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-primary" />
              Top Campaigns
            </h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                    C{i}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">Mega City Promo {i}</p>
                    <p className="text-xs text-muted-foreground">12.5k scans • $450 profit</p>
                  </div>
                  <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[70%]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
