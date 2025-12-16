'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface LocationData {
  id: string;
  name: string;
  city: string;
  revenue: number;
  appointments: number;
  customers: number;
  utilization: number;
}

interface LocationPerformanceTableProps {
  locations: LocationData[];
}

type SortField = 'name' | 'revenue' | 'appointments' | 'customers' | 'utilization';
type SortDirection = 'asc' | 'desc';

const LocationPerformanceTable = ({ locations }: LocationPerformanceTableProps) => {
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedLocations = [...locations].sort((a, b) => {
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
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Standort-Leistungsvergleich</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                >
                  Standort
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="px-6 py-3 text-right">
                <button
                  onClick={() => handleSort('revenue')}
                  className="flex items-center justify-end gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth ml-auto"
                >
                  Umsatz
                  <SortIcon field="revenue" />
                </button>
              </th>
              <th className="px-6 py-3 text-right">
                <button
                  onClick={() => handleSort('appointments')}
                  className="flex items-center justify-end gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth ml-auto"
                >
                  Termine
                  <SortIcon field="appointments" />
                </button>
              </th>
              <th className="px-6 py-3 text-right">
                <button
                  onClick={() => handleSort('customers')}
                  className="flex items-center justify-end gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth ml-auto"
                >
                  Kunden
                  <SortIcon field="customers" />
                </button>
              </th>
              <th className="px-6 py-3 text-right">
                <button
                  onClick={() => handleSort('utilization')}
                  className="flex items-center justify-end gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth ml-auto"
                >
                  Auslastung
                  <SortIcon field="utilization" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedLocations.map((location) => (
              <tr key={location.id} className="hover:bg-muted/30 transition-smooth">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{location.name}</p>
                    <p className="text-xs text-muted-foreground">{location.city}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-foreground">
                    €{location.revenue.toLocaleString('de-DE')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-foreground">{location.appointments}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-foreground">{location.customers}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${location.utilization}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-12">
                      {location.utilization}%
                    </span>
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

export default LocationPerformanceTable;