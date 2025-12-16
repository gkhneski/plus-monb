'use client';

import Icon from '@/components/ui/AppIcon';

interface LocationDetailPopupProps {
  location: {
    id: string;
    name: string;
    city: string;
    address: string;
    revenue: number;
    staffCount: number;
    customerSatisfaction: number;
    capacityUtilization: number;
    todayAppointments: number;
    performance: 'excellent' | 'good' | 'warning' | 'critical';
  };
  onClose: () => void;
  onViewDetails: () => void;
}

const LocationDetailPopup = ({ location, onClose, onViewDetails }: LocationDetailPopupProps) => {
  const performanceColors = {
    excellent: 'bg-success text-success-foreground',
    good: 'bg-primary text-primary-foreground',
    warning: 'bg-warning text-warning-foreground',
    critical: 'bg-error text-error-foreground',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-lg shadow-floating max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${performanceColors[location.performance]}`}>
              <Icon name="BuildingStorefrontIcon" size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{location.name}</h3>
              <p className="text-sm text-muted-foreground">{location.city}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-smooth"
          >
            <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-start gap-2">
            <Icon name="MapPinIcon" size={18} className="text-secondary mt-0.5" />
            <p className="text-sm text-foreground">{location.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Monatsumsatz</p>
              <p className="text-xl font-bold text-foreground">€{location.revenue.toLocaleString('de-DE')}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Mitarbeiter</p>
              <p className="text-xl font-bold text-foreground">{location.staffCount}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Zufriedenheit</p>
              <div className="flex items-center gap-1">
                <Icon name="StarIcon" size={16} className="text-warning" variant="solid" />
                <p className="text-xl font-bold text-foreground">{location.customerSatisfaction.toFixed(1)}</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Auslastung</p>
              <p className="text-xl font-bold text-foreground">{location.capacityUtilization}%</p>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="CalendarIcon" size={18} className="text-primary" />
                <span className="text-sm font-medium text-foreground">Heute</span>
              </div>
              <span className="text-lg font-bold text-primary">{location.todayAppointments} Termine</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={onViewDetails}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-smooth"
          >
            Detaillierte Analyse anzeigen
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailPopup;