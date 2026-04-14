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

interface ChartData {
  name: string;
  scans: number;
}

export default function ScanChart({ data = [] }: { data?: ChartData[] }) {
  const chartData = data.length > 0 ? data : [
    { name: 'Mon', scans: 0 },
    { name: 'Tue', scans: 0 },
    { name: 'Wed', scans: 0 },
    { name: 'Thu', scans: 0 },
    { name: 'Fri', scans: 0 },
    { name: 'Sat', scans: 0 },
    { name: 'Sun', scans: 0 },
  ];

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C62E2E" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#C62E2E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="10 10"
            stroke="#262626"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#8E8E93"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            dy={16}
            fontWeight={900}
            tickFormatter={(val) => val.toUpperCase()}
            letterSpacing="0.2em"
          />
          <YAxis
            stroke="#8E8E93"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            fontWeight={900}
            tickFormatter={(value) => `${value}`}
            letterSpacing="0.1em"
          />
          <Tooltip
            cursor={{ stroke: '#C62E2E', strokeWidth: 1, strokeDasharray: '4 4' }}
            contentStyle={{
              backgroundColor: '#000000',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '900',
              color: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '16px 20px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em'
            }}
            itemStyle={{ color: '#C62E2E' }}
            labelStyle={{ color: '#8E8E93', marginBottom: '8px', fontSize: '9px' }}
          />
          <Area
            type="monotone"
            dataKey="scans"
            stroke="#C62E2E"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorScans)"
            animationDuration={2000}
            activeDot={{ r: 6, stroke: '#0D0D0D', strokeWidth: 3, fill: '#C62E2E' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
