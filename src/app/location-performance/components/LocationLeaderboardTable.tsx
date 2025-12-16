import Icon from '@/components/ui/AppIcon';

interface Location {
  id: string;
  name: string;
  city: string;
  revenue: number;
  staffProductivity: number;
  customerSatisfaction: number;
  capacityUtilization: number;
  trend: 'up' | 'down' | 'stable';
  performance: 'excellent' | 'good' | 'warning' | 'critical';
}

interface LocationLeaderboardTableProps {
  locations: Location[];
  onLocationClick: (locationId: string) => void;
}

const LocationLeaderboardTable = ({ locations, onLocationClick }: LocationLeaderboardTableProps) => {
  const performanceBadgeColors = {
    excellent: 'bg-success/10 text-success border-success/20',
    good: 'bg-primary/10 text-primary border-primary/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    critical: 'bg-error/10 text-error border-error/20',
  };

  const trendIcons = {
    up: 'ArrowTrendingUpIcon',
    down: 'ArrowTrendingDownIcon',
    stable: 'MinusIcon',
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    stable: 'text-muted-foreground',
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Standort-Rangliste</h3>
        <p className="text-sm text-muted-foreground mt-1">Sortiert nach Gesamtleistung</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rang</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Standort</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Umsatz</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Produktivität</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zufriedenheit</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trend</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {locations.map((location, index) => (
              <tr
                key={location.id}
                onClick={() => onLocationClick(location.id)}
                className="hover:bg-muted/30 cursor-pointer transition-smooth"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{location.name}</p>
                    <p className="text-xs text-muted-foreground">{location.city}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="text-sm font-semibold text-foreground">€{location.revenue.toLocaleString('de-DE')}</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="text-sm font-medium text-foreground">{location.staffProductivity}%</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Icon name="StarIcon" size={14} className="text-warning" variant="solid" />
                    <p className="text-sm font-medium text-foreground">{location.customerSatisfaction.toFixed(1)}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <Icon name={trendIcons[location.trend] as any} size={20} className={trendColors[location.trend]} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${performanceBadgeColors[location.performance]}`}>
                      {location.performance === 'excellent' && 'Exzellent'}
                      {location.performance === 'good' && 'Gut'}
                      {location.performance === 'warning' && 'Warnung'}
                      {location.performance === 'critical' && 'Kritisch'}
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

export default LocationLeaderboardTable;