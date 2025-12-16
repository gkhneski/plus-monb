'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import LocationSelector from '@/components/common/LocationSelector';
import DateRangePicker from '@/components/common/DateRangePicker';
import UserRoleIndicator from '@/components/common/UserRoleIndicator';
import LocationKPICard from './LocationKPICard';
import LocationMapMarker from './LocationMapMarker';
import LocationLeaderboardTable from './LocationLeaderboardTable';
import LocationComparisonChart from './LocationComparisonChart';
import LocationDetailPopup from './LocationDetailPopup';

interface Location {
  id: string;
  name: string;
  city: string;
  address: string;
  revenue: number;
  staffProductivity: number;
  customerSatisfaction: number;
  capacityUtilization: number;
  staffCount: number;
  todayAppointments: number;
  trend: 'up' | 'down' | 'stable';
  performance: 'excellent' | 'good' | 'warning' | 'critical';
  lat: number;
  lng: number;
}

const LocationPerformanceInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const mockLocations: Location[] = [
    {
      id: '1',
      name: 'Hauptfiliale Wien',
      city: 'Wien',
      address: 'Kärntner Straße 45, 1010 Wien',
      revenue: 85000,
      staffProductivity: 92,
      customerSatisfaction: 4.8,
      capacityUtilization: 88,
      staffCount: 12,
      todayAppointments: 34,
      trend: 'up',
      performance: 'excellent',
      lat: 35,
      lng: 45,
    },
    {
      id: '2',
      name: 'Filiale Graz',
      city: 'Graz',
      address: 'Herrengasse 12, 8010 Graz',
      revenue: 72000,
      staffProductivity: 87,
      customerSatisfaction: 4.6,
      capacityUtilization: 82,
      staffCount: 10,
      todayAppointments: 28,
      trend: 'up',
      performance: 'good',
      lat: 55,
      lng: 65,
    },
    {
      id: '3',
      name: 'Filiale Salzburg',
      city: 'Salzburg',
      address: 'Getreidegasse 23, 5020 Salzburg',
      revenue: 68000,
      staffProductivity: 85,
      customerSatisfaction: 4.7,
      capacityUtilization: 79,
      staffCount: 9,
      todayAppointments: 26,
      trend: 'stable',
      performance: 'good',
      lat: 40,
      lng: 30,
    },
    {
      id: '4',
      name: 'Filiale Innsbruck',
      city: 'Innsbruck',
      address: 'Maria-Theresien-Straße 18, 6020 Innsbruck',
      revenue: 58000,
      staffProductivity: 78,
      customerSatisfaction: 4.4,
      capacityUtilization: 71,
      staffCount: 8,
      todayAppointments: 22,
      trend: 'down',
      performance: 'warning',
      lat: 60,
      lng: 25,
    },
    {
      id: '5',
      name: 'Filiale Linz',
      city: 'Linz',
      address: 'Landstraße 34, 4020 Linz',
      revenue: 64000,
      staffProductivity: 81,
      customerSatisfaction: 4.5,
      capacityUtilization: 75,
      staffCount: 9,
      todayAppointments: 24,
      trend: 'up',
      performance: 'good',
      lat: 45,
      lng: 70,
    },
  ];

  const kpiData = [
    {
      title: 'Durchschn. Umsatz/Standort',
      value: '€69.400',
      change: 8.5,
      icon: 'CurrencyEuroIcon',
      status: 'excellent' as const,
    },
    {
      title: 'Durchschn. Produktivität',
      value: '84,6%',
      change: 5.2,
      icon: 'ChartBarIcon',
      status: 'good' as const,
    },
    {
      title: 'Durchschn. Zufriedenheit',
      value: '4,6',
      change: 3.1,
      icon: 'StarIcon',
      status: 'good' as const,
    },
    {
      title: 'Durchschn. Auslastung',
      value: '79%',
      change: -2.3,
      icon: 'ClockIcon',
      status: 'warning' as const,
    },
  ];

  const comparisonData = mockLocations.map(loc => ({
    location: loc.city,
    revenue: loc.revenue,
    appointments: loc.todayAppointments * 30,
    customers: Math.floor(loc.todayAppointments * 25),
  }));

  const selectedLocation = mockLocations.find(loc => loc.id === selectedLocationId);

  const handleLocationClick = (locationId: string) => {
    if (isHydrated) {
      setSelectedLocationId(locationId);
    }
  };

  const handleClosePopup = () => {
    if (isHydrated) {
      setSelectedLocationId(null);
    }
  };

  const handleViewDetails = () => {
    if (isHydrated) {
      console.log('Navigating to detailed location analysis');
      setSelectedLocationId(null);
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar isCollapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header showMenuButton={false} />
          <main className="flex-1 overflow-y-auto pt-16">
            <div className="p-6">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-muted rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-muted rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isCollapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header showMenuButton={false} />
        <main className="flex-1 overflow-y-auto pt-16">
          <div className="p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Standort-Leistung</h1>
                <p className="text-muted-foreground mt-1">Multi-Standort-Vergleich und Analyse</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <LocationSelector multiSelect={true} />
                <DateRangePicker />
                <UserRoleIndicator userRole="business_owner" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiData.map((kpi, index) => (
                <LocationKPICard key={index} {...kpi} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Standort-Karte</h3>
                    <p className="text-sm text-muted-foreground mt-1">Geografische Verteilung und Leistung</p>
                  </div>
                  <div className="relative w-full h-96 bg-muted/30 rounded-lg overflow-hidden border border-border">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
                    {mockLocations.map(location => (
                      <LocationMapMarker
                        key={location.id}
                        location={location}
                        onClick={() => handleLocationClick(location.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <LocationLeaderboardTable
                  locations={mockLocations}
                  onLocationClick={handleLocationClick}
                />
              </div>
            </div>

            <LocationComparisonChart data={comparisonData} />
          </div>
        </main>
      </div>

      {selectedLocation && (
        <LocationDetailPopup
          location={selectedLocation}
          onClose={handleClosePopup}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
};

export default LocationPerformanceInteractive;