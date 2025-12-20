'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface StaffPerformanceData {
  id: string;
  name: string;
  role: string;
  image: string;
  alt: string;
  utilization: number;
  avgServiceTime: number;
  satisfaction: number;
  revenue: number;
  bookings: number;
  noShows: number;
  trend: number;
}

interface StaffPerformanceTableProps {
  data: StaffPerformanceData[];
  onStaffClick?: (staffId: string) => void;
}

type SortField = 'name' | 'utilization' | 'satisfaction' | 'revenue' | 'bookings';
type SortDirection = 'asc' | 'desc';

const StaffPerformanceTable = ({ data, onStaffClick }: StaffPerformanceTableProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [sortedData, setSortedData] = useState(data);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      const sorted = [...data].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return sortDirection === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
      setSortedData(sorted);
    }
  }, [sortField, sortDirection, data, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="h-96 bg-muted/30 rounded-lg animate-pulse" />
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <Icon name="ChevronUpDownIcon" size={16} className="text-muted-foreground" />;
    }
    return (
      <Icon 
        name={sortDirection === 'asc' ? 'ChevronUpIcon' : 'ChevronDownIcon'} 
        size={16} 
        className="text-primary" 
      />
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Detaillierte Mitarbeiterleistung</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Umfassende Metriken für alle Teammitglieder
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left">
                <button 
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-smooth"
                >
                  Mitarbeiter
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button 
                  onClick={() => handleSort('utilization')}
                  className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-smooth"
                >
                  Auslastung
                  <SortIcon field="utilization" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-sm font-semibold text-foreground">Ø Service-Zeit</span>
              </th>
              <th className="px-6 py-4 text-left">
                <button 
                  onClick={() => handleSort('satisfaction')}
                  className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-smooth"
                >
                  Zufriedenheit
                  <SortIcon field="satisfaction" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button 
                  onClick={() => handleSort('revenue')}
                  className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-smooth"
                >
                  Umsatz
                  <SortIcon field="revenue" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button 
                  onClick={() => handleSort('bookings')}
                  className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-smooth"
                >
                  Buchungen
                  <SortIcon field="bookings" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-sm font-semibold text-foreground">Trend</span>
              </th>
              <th className="px-6 py-4 text-right">
                <span className="text-sm font-semibold text-foreground">Aktionen</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedData.map((staff) => (
              <tr 
                key={staff.id}
                className="hover:bg-muted/30 transition-smooth cursor-pointer"
                onClick={() => onStaffClick?.(staff.id)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <AppImage
                        src={staff.image}
                        alt={staff.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                      <div 
                        className={`h-full rounded-full ${
                          staff.utilization >= 85 ? 'bg-success' :
                          staff.utilization >= 70 ? 'bg-warning' : 'bg-error'
                        }`}
                        style={{ width: `${staff.utilization}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">{staff.utilization}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-foreground">{staff.avgServiceTime} Min</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Icon name="StarIcon" size={16} className="text-warning" />
                    <span className="text-sm font-medium text-foreground">{staff.satisfaction}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-foreground">
                    €{staff.revenue.toLocaleString('de-DE')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <span className="text-sm font-medium text-foreground">{staff.bookings}</span>
                    <p className="text-xs text-muted-foreground">{staff.noShows} No-Shows</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-1 ${
                    staff.trend >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    <Icon 
                      name={staff.trend >= 0 ? 'ArrowUpIcon' : 'ArrowDownIcon'} 
                      size={16} 
                    />
                    <span className="text-sm font-medium">{Math.abs(staff.trend)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      className="p-2 hover:bg-muted rounded-lg transition-smooth"
                      title="Zeitplan anzeigen"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Icon name="CalendarIcon" size={18} className="text-secondary" />
                    </button>
                    <button 
                      className="p-2 hover:bg-muted rounded-lg transition-smooth"
                      title="Leistungsbericht"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Icon name="DocumentChartBarIcon" size={18} className="text-secondary" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffPerformanceTable;
