'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', scans: 4000 },
  { name: 'Tue', scans: 3000 },
  { name: 'Wed', scans: 5000 },
  { name: 'Thu', scans: 2780 },
  { name: 'Fri', scans: 1890 },
  { name: 'Sat', scans: 2390 },
  { name: 'Sun', scans: 3490 },
];

export default function ScanChart() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff0033" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ff0033" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#71717a" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#18181b', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="scans" 
            stroke="#ff0033" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorScans)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
