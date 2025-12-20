'use client';

import { useState, useEffect } from 'react';
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

interface ChartDataPoint {
  date: string;
  revenue: number;
  appointments: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
}

const RevenueChart = ({ data }: RevenueChartProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="w-full h-80 bg-muted/30 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Lade Diagramm...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80" aria-label="Umsatz und Termine Diagramm">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#64748B', fontSize: 12 }}
            tickLine={{ stroke: '#E2E8F0' }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#64748B', fontSize: 12 }}
            tickLine={{ stroke: '#E2E8F0' }}
            label={{ value: 'Umsatz (€)', angle: -90, position: 'insideLeft', style: { fill: '#64748B', fontSize: 12 } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#64748B', fontSize: 12 }}
            tickLine={{ stroke: '#E2E8F0' }}
            label={{ value: 'Termine', angle: 90, position: 'insideRight', style: { fill: '#64748B', fontSize: 12 } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'revenue') return [`€${value.toLocaleString('de-DE')}`, 'Umsatz'];
              return [value, 'Termine'];
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => value === 'revenue' ? 'Umsatz' : 'Termine'}
          />
          <Bar 
            yAxisId="left"
            dataKey="revenue" 
            fill="#2563EB" 
            radius={[8, 8, 0, 0]}
            name="revenue"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="appointments" 
            stroke="#F59E0B" 
            strokeWidth={3}
            dot={{ fill: '#F59E0B', r: 4 }}
            name="appointments"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
