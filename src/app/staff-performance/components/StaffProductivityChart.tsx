'use client';

import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Icon from '@/components/ui/AppIcon';

interface StaffMember {
  id: string;
  name: string;
  efficiency: number;
  satisfaction: number;
  revenue: number;
  bookings: number;
  role: string;
}

interface StaffProductivityChartProps {
  data: StaffMember[];
  onStaffSelect?: (staffId: string) => void;
}

const StaffProductivityChart = ({ data, onStaffSelect }: StaffProductivityChartProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="w-full h-96 bg-muted/30 rounded-lg animate-pulse flex items-center justify-center">
        <Icon name="ChartBarIcon" size={48} className="text-muted-foreground/30" />
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const staff = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-4 shadow-floating">
          <p className="font-semibold text-foreground mb-2">{staff.name}</p>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              Effizienz: <span className="font-medium text-foreground">{staff.efficiency}%</span>
            </p>
            <p className="text-muted-foreground">
              Zufriedenheit: <span className="font-medium text-foreground">{staff.satisfaction}%</span>
            </p>
            <p className="text-muted-foreground">
              Umsatz: <span className="font-medium text-foreground">€{staff.revenue.toLocaleString('de-DE')}</span>
            </p>
            <p className="text-muted-foreground">
              Buchungen: <span className="font-medium text-foreground">{staff.bookings}</span>
            </p>
            <p className="text-xs text-secondary mt-2">{staff.role}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getColorByPerformance = (efficiency: number, satisfaction: number) => {
    const avgScore = (efficiency + satisfaction) / 2;
    if (avgScore >= 85) return '#10B981';
    if (avgScore >= 70) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Mitarbeiter-Produktivitätsmatrix</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Blasengröße = Umsatzbeitrag | Position = Effizienz vs. Zufriedenheit
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Top-Performer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">Durchschnitt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error" />
            <span className="text-xs text-muted-foreground">Verbesserungsbedarf</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis 
            type="number" 
            dataKey="efficiency" 
            name="Effizienz"
            unit="%"
            domain={[0, 100]}
            label={{ value: 'Effizienz (%)', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            type="number" 
            dataKey="satisfaction" 
            name="Zufriedenheit"
            unit="%"
            domain={[0, 100]}
            label={{ value: 'Kundenzufriedenheit (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter 
            data={data} 
            onClick={(data) => {
              setSelectedStaff(data.id);
              onStaffSelect?.(data.id);
            }}
            cursor="pointer"
          >
            {data.map((entry) => (
              <Cell 
                key={entry.id}
                fill={getColorByPerformance(entry.efficiency, entry.satisfaction)}
                opacity={selectedStaff === entry.id ? 1 : 0.7}
                r={Math.sqrt(entry.revenue) / 15}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StaffProductivityChart;