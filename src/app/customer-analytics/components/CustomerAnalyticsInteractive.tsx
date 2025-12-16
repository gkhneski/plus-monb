'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import LocationSelector from '@/components/common/LocationSelector';
import DateRangePicker from '@/components/common/DateRangePicker';
import UserRoleIndicator from '@/components/common/UserRoleIndicator';
import MetricCard from './MetricCard';
import SegmentSelector from './SegmentSelector';
import DemographicFilter from './DemographicFilter';
import CustomerJourneyFunnel from './CustomerJourneyFunnel';
import DemographicDistribution from './DemographicDistribution';
import BookingBehaviorHeatmap from './BookingBehaviorHeatmap';
import Icon from '@/components/ui/AppIcon';

interface Segment {
  id: string;
  name: string;
  count: number;
  color: string;
}

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface FunnelStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
  dropoff: number;
}

interface DemographicData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface HeatmapCell {
  day: string;
  hour: number;
  value: number;
  bookings: number;
}

const CustomerAnalyticsInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const segments: Segment[] = [
    { id: 'all', name: 'Alle Kunden', count: 2847, color: '#2563EB' },
    { id: 'vip', name: 'VIP Kunden', count: 342, color: '#F59E0B' },
    { id: 'regular', name: 'Stammkunden', count: 1256, color: '#10B981' },
    { id: 'new', name: 'Neukunden', count: 789, color: '#8B5CF6' },
    { id: 'inactive', name: 'Inaktive Kunden', count: 460, color: '#EF4444' },
  ];

  const ageGroups: FilterOption[] = [
    { id: '18-25', label: '18-25 Jahre', count: 456 },
    { id: '26-35', label: '26-35 Jahre', count: 892 },
    { id: '36-45', label: '36-45 Jahre', count: 734 },
    { id: '46-55', label: '46-55 Jahre', count: 521 },
    { id: '56+', label: '56+ Jahre', count: 244 },
  ];

  const treatmentPreferences: FilterOption[] = [
    { id: 'facial', label: 'Gesichtsbehandlungen', count: 1234 },
    { id: 'massage', label: 'Massagen', count: 987 },
    { id: 'nails', label: 'Nagelpflege', count: 765 },
    { id: 'hair', label: 'Haarpflege', count: 654 },
    { id: 'makeup', label: 'Make-up', count: 432 },
  ];

  const funnelStages: FunnelStage[] = [
    { id: 'contact', name: 'Erstkontakt', count: 5420, percentage: 100, dropoff: 0 },
    { id: 'inquiry', name: 'Beratungsanfrage', count: 4336, percentage: 80, dropoff: 20 },
    { id: 'booking', name: 'Erste Buchung', count: 3252, percentage: 60, dropoff: 20 },
    { id: 'repeat', name: 'Wiederholungsbuchung', count: 2168, percentage: 40, dropoff: 20 },
    { id: 'regular', name: 'Stammkundin', count: 1256, percentage: 23, dropoff: 17 },
  ];

  const ageDistribution: DemographicData[] = [
    { label: '18-25 Jahre', value: 456, percentage: 16, color: '#8B5CF6' },
    { label: '26-35 Jahre', value: 892, percentage: 31, color: '#2563EB' },
    { label: '36-45 Jahre', value: 734, percentage: 26, color: '#10B981' },
    { label: '46-55 Jahre', value: 521, percentage: 18, color: '#F59E0B' },
    { label: '56+ Jahre', value: 244, percentage: 9, color: '#EF4444' },
  ];

  const locationDistribution: DemographicData[] = [
    { label: 'Wien', value: 1234, percentage: 43, color: '#2563EB' },
    { label: 'Graz', value: 678, percentage: 24, color: '#10B981' },
    { label: 'Salzburg', value: 456, percentage: 16, color: '#F59E0B' },
    { label: 'Innsbruck', value: 312, percentage: 11, color: '#8B5CF6' },
    { label: 'Linz', value: 167, percentage: 6, color: '#EF4444' },
  ];

  const heatmapData: HeatmapCell[] = [];
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  days.forEach(day => {
    hours.forEach(hour => {
      const baseValue = Math.random() * 100;
      const dayMultiplier = ['Sa', 'So'].includes(day) ? 1.3 : 1;
      const hourMultiplier = hour >= 10 && hour <= 18 ? 1.2 : 0.8;
      const value = Math.min(100, baseValue * dayMultiplier * hourMultiplier);
      const bookings = Math.floor(value / 10);

      heatmapData.push({
        day,
        hour,
        value: Math.round(value),
        bookings,
      });
    });
  });

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse text-muted-foreground">Laden...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isCollapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <Header showMenuButton={false} />
        
        <main className="pt-16">
          <div className="p-4 lg:p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Kundenanalyse
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Verstehen Sie Ihre Kunden durch datengetriebene Einblicke
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <UserRoleIndicator />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-3 flex-wrap">
              <SegmentSelector
                segments={segments}
                selectedSegment={selectedSegment}
                onSegmentChange={setSelectedSegment}
              />
              
              <DemographicFilter
                title="Altersgruppen"
                icon="UserGroupIcon"
                options={ageGroups}
                selectedOptions={selectedAgeGroups}
                onFilterChange={setSelectedAgeGroups}
              />
              
              <LocationSelector
                selectedLocations={selectedLocations}
                onLocationChange={setSelectedLocations}
                multiSelect={true}
              />
              
              <DemographicFilter
                title="Behandlungen"
                icon="SparklesIcon"
                options={treatmentPreferences}
                selectedOptions={selectedTreatments}
                onFilterChange={setSelectedTreatments}
              />
              
              <DateRangePicker />
              
              <button
                onClick={() => setComparisonMode(!comparisonMode)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                  transition-smooth
                  ${comparisonMode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:bg-muted'
                  }
                `}
              >
                <Icon 
                  name="ArrowsRightLeftIcon" 
                  size={18}
                  className={comparisonMode ? 'text-primary-foreground' : 'text-secondary'}
                />
                <span>Vergleichsmodus</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Kundenakquisitionskosten"
                value="€42,50"
                change={-8.5}
                trend="down"
                icon="CurrencyEuroIcon"
                sparklineData={[45, 48, 44, 46, 43, 42, 42.5]}
              />
              
              <MetricCard
                title="Durchschn. Lifetime Value"
                value="€1.847"
                change={12.3}
                trend="up"
                icon="ChartBarIcon"
                sparklineData={[1650, 1720, 1780, 1810, 1830, 1840, 1847]}
              />
              
              <MetricCard
                title="Kundenbindungsrate"
                value="78,4%"
                change={5.2}
                trend="up"
                icon="HeartIcon"
                sparklineData={[72, 74, 75, 76, 77, 78, 78.4]}
              />
              
              <MetricCard
                title="Abwanderungsrate"
                value="4,2%"
                change={-1.8}
                trend="down"
                icon="ArrowTrendingDownIcon"
                sparklineData={[6, 5.5, 5, 4.8, 4.5, 4.3, 4.2]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CustomerJourneyFunnel
                  stages={funnelStages}
                  onStageClick={(stageId) => console.log('Stage clicked:', stageId)}
                />
              </div>
              
              <div className="space-y-6">
                <DemographicDistribution
                  title="Altersverteilung"
                  icon="UserGroupIcon"
                  data={ageDistribution}
                  totalLabel="Kunden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BookingBehaviorHeatmap
                  data={heatmapData}
                  onCellClick={(cell) => console.log('Cell clicked:', cell)}
                />
              </div>
              
              <div>
                <DemographicDistribution
                  title="Standortverteilung"
                  icon="MapPinIcon"
                  data={locationDistribution}
                  totalLabel="Kunden"
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Exportoptionen
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Laden Sie Ihre Analysedaten für weitere Verarbeitung herunter
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-muted 
                                 rounded-lg hover:bg-muted/80 transition-smooth">
                  <Icon name="DocumentArrowDownIcon" size={20} className="text-secondary" />
                  <span className="text-sm font-medium text-foreground">CSV Export</span>
                </button>
                
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-muted 
                                 rounded-lg hover:bg-muted/80 transition-smooth">
                  <Icon name="DocumentChartBarIcon" size={20} className="text-secondary" />
                  <span className="text-sm font-medium text-foreground">Excel Export</span>
                </button>
                
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-muted 
                                 rounded-lg hover:bg-muted/80 transition-smooth">
                  <Icon name="DocumentTextIcon" size={20} className="text-secondary" />
                  <span className="text-sm font-medium text-foreground">PDF Bericht</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerAnalyticsInteractive;