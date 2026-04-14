import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down';
}

export default function MetricCard({ title, value, change, icon: Icon, trend }: MetricCardProps) {
  return (
    <div className="bg-[#161616] border border-[#262626] p-8 rounded-2xl hover:border-[#C62E2E]/30 transition-all duration-500 shadow-2xl group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C62E2E]/5 rounded-full blur-[60px] translate-x-10 -translate-y-10 group-hover:bg-[#C62E2E]/10 transition-colors" />
      
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-[#8E8E93] group-hover:bg-[#C62E2E]/10 group-hover:text-[#C62E2E] transition-colors border border-white/5 shadow-inner">
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border transition-all ${
            trend === 'up' 
              ? 'text-[#C62E2E] bg-[#C62E2E]/10 border-[#C62E2E]/20 shadow-[0_0_10px_rgba(198,46,46,0.1)]' 
              : 'text-[#8E8E93] bg-white/5 border-white/10'
          }`}>
            {trend === 'up' ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
            {change.toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <h3 className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.2em] mb-2 font-sans opacity-60 group-hover:opacity-100 transition-opacity">{title}</h3>
        <p className="text-4xl font-sans font-bold text-white tracking-tighter group-hover:scale-[1.02] transition-transform origin-left duration-500">{value}</p>
      </div>

      {/* Subtle bottom accent line */}
      <div className="mt-6 h-px w-full bg-white/5 rounded-full overflow-hidden relative z-10">
        <div 
          className="h-full bg-[#C62E2E] opacity-40 group-hover:opacity-100 transition-all duration-700 w-1/4 group-hover:w-full" 
        />
      </div>
    </div>
  );
}
