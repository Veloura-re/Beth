'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000, payouts: 2400 },
  { name: 'Feb', revenue: 3000, payouts: 1398 },
  { name: 'Mar', revenue: 2000, payouts: 9800 },
  { name: 'Apr', revenue: 2780, payouts: 3908 },
  { name: 'May', revenue: 1890, payouts: 4800 },
  { name: 'Jun', revenue: 2390, payouts: 3800 },
];

export default function RevenueChart() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#1a1a1b',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold' }}
          />
          <Bar 
            dataKey="revenue" 
            fill="#e11d48" 
            radius={[4, 4, 0, 0]} 
            barSize={20}
            name="Gross Revenue"
          />
          <Bar 
            dataKey="payouts" 
            fill="#1a1a1b" 
            radius={[4, 4, 0, 0]} 
            barSize={20}
            name="Agent Payouts"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
