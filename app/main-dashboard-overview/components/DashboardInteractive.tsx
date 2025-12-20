'use client';

import { useState, useEffect } from 'react';
import KPICard from './KPICard';
import RevenueChart from './RevenueChart';
import ActivityFeed from './ActivityFeed';
import LocationPerformanceTable from './LocationPerformanceTable';

interface KPIData {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: string;
  subtitle?: string;
}

interface ChartDataPoint {
  date: string;
  revenue: number;
  appointments: number;
}

interface Activity {
  id: string;
  type: 'appointment' | 'cancellation' | 'new_customer';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  iconColor: string;
}

interface LocationData {
  id: string;
  name: string;
  city: string;
  revenue: number;
  appointments: number;
  customers: number;
  utilization: number;
}

const DashboardInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const kpiData: KPIData[] = [
    {
      title: "Gesamtumsatz",
      value: "€45.280",
      change: 12.5,
      trend: "up",
      icon: "CurrencyEuroIcon",
      subtitle: "Dieser Monat"
    },
    {
      title: "Aktive Termine",
      value: "156",
      change: 8.3,
      trend: "up",
      icon: "CalendarDaysIcon",
      subtitle: "Heute"
    },
    {
      title: "Kunden",
      value: "1.248",
      change: 15.7,
      trend: "up",
      icon: "UsersIcon",
      subtitle: "Aktive Kunden"
    },
    {
      title: "Mitarbeiter-Auslastung",
      value: "87%",
      change: 5.2,
      trend: "up",
      icon: "UserGroupIcon",
      subtitle: "Durchschnitt"
    },
    {
      title: "Beliebte Behandlung",
      value: "Gesichtsbehandlung",
      change: 23.4,
      trend: "up",
      icon: "SparklesIcon",
      subtitle: "142 Buchungen"
    },
    {
      title: "Buchungsrate",
      value: "94%",
      change: 3.8,
      trend: "down",
      icon: "ChartBarIcon",
      subtitle: "Conversion"
    }
  ];

  const chartData: ChartDataPoint[] = [
    { date: "Mo", revenue: 4200, appointments: 18 },
    { date: "Di", revenue: 5100, appointments: 22 },
    { date: "Mi", revenue: 4800, appointments: 20 },
    { date: "Do", revenue: 6300, appointments: 28 },
    { date: "Fr", revenue: 7200, appointments: 32 },
    { date: "Sa", revenue: 8900, appointments: 38 },
    { date: "So", revenue: 3500, appointments: 15 }
  ];

  const activities: Activity[] = [
    {
      id: "1",
      type: "appointment",
      title: "Neue Terminbuchung",
      description: "Sarah Müller - Gesichtsbehandlung um 14:00 Uhr",
      timestamp: "2025-12-16T11:05:00",
      icon: "CalendarIcon",
      iconColor: "bg-primary"
    },
    {
      id: "2",
      type: "new_customer",
      title: "Neuer Kunde registriert",
      description: "Michael Schmidt hat sich angemeldet",
      timestamp: "2025-12-16T10:58:00",
      icon: "UserPlusIcon",
      iconColor: "bg-success"
    },
    {
      id: "3",
      type: "cancellation",
      title: "Termin storniert",
      description: "Anna Weber - Maniküre um 15:30 Uhr",
      timestamp: "2025-12-16T10:45:00",
      icon: "XCircleIcon",
      iconColor: "bg-error"
    },
    {
      id: "4",
      type: "appointment",
      title: "Termin bestätigt",
      description: "Lisa Bauer - Massage um 16:00 Uhr",
      timestamp: "2025-12-16T10:30:00",
      icon: "CheckCircleIcon",
      iconColor: "bg-success"
    },
    {
      id: "5",
      type: "new_customer",
      title: "Neuer Kunde registriert",
      description: "Thomas Klein hat sich angemeldet",
      timestamp: "2025-12-16T10:15:00",
      icon: "UserPlusIcon",
      iconColor: "bg-success"
    }
  ];

  const locationData: LocationData[] = [
    {
      id: "1",
      name: "Hauptfiliale Wien",
      city: "Wien",
      revenue: 18500,
      appointments: 78,
      customers: 456,
      utilization: 92
    },
    {
      id: "2",
      name: "Filiale Graz",
      city: "Graz",
      revenue: 12300,
      appointments: 52,
      customers: 298,
      utilization: 85
    },
    {
      id: "3",
      name: "Filiale Salzburg",
      city: "Salzburg",
      revenue: 8900,
      appointments: 38,
      customers: 234,
      utilization: 78
    },
    {
      id: "4",
      name: "Filiale Innsbruck",
      city: "Innsbruck",
      revenue: 5580,
      appointments: 24,
      customers: 156,
      utilization: 68
    }
  ];

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard Übersicht</h1>
          <p className="text-sm text-muted-foreground">
            Umfassende Geschäftseinblicke für alle Standorte
          </p>
        </div>
        
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-smooth ${
            autoRefresh 
              ? 'bg-success/10 text-success hover:bg-success/20' :'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
          <span>{autoRefresh ? 'Auto-Aktualisierung aktiv' : 'Auto-Aktualisierung pausiert'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Umsatz & Termine
              </h3>
              <p className="text-sm text-muted-foreground">
                Tägliche Leistungsübersicht der letzten 7 Tage
              </p>
            </div>
            <RevenueChart data={chartData} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <ActivityFeed activities={activities} />
        </div>
      </div>

      <LocationPerformanceTable locations={locationData} />
    </div>
  );
};

export default DashboardInteractive;
