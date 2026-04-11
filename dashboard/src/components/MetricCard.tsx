import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down';
}

export default function MetricCard({ title, value, change, icon: Icon, trend }: MetricCardProps) {
  return (
    <div className="glass p-6 group hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
          <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {change}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}
