'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LocationComparisonChartProps {
  data: Array<{
    location: string;
    revenue: number;
    appointments: number;
    customers: number;
  }>;
}

const LocationComparisonChart = ({ data }: LocationComparisonChartProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Standort-Vergleich</h3>
        <p className="text-sm text-muted-foreground mt-1">Normalisierte Metriken für fairen Vergleich</p>
      </div>
      <div className="w-full h-80" aria-label="Standort-Vergleich Balkendiagramm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="location" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => value.toLocaleString('de-DE')}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar dataKey="revenue" fill="#2563EB" name="Umsatz (€)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="appointments" fill="#10B981" name="Termine" radius={[8, 8, 0, 0]} />
            <Bar dataKey="customers" fill="#F59E0B" name="Kunden" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LocationComparisonChart;
