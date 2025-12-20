'use client';

import { useState } from 'react';
import StaffMetricCard from './StaffMetricCard';
import StaffProductivityChart from './StaffProductivityChart';
import ScheduleOptimizationPanel from './ScheduleOptimizationPanel';
import StaffPerformanceTable from './StaffPerformanceTable';
import StaffSelector from './StaffSelector';
import LocationSelector from '@/components/common/LocationSelector';
import DateRangePicker from '@/components/common/DateRangePicker';

interface StaffMember {
  id: string;
  name: string;
  efficiency: number;
  satisfaction: number;
  revenue: number;
  bookings: number;
  role: string;
}

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

interface ScheduleRecommendation {
  id: string;
  type: 'understaffed' | 'overstaffed' | 'skill_gap' | 'optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeSlot: string;
  suggestedAction: string;
}

const StaffPerformanceInteractive = () => {
  const [selectedView, setSelectedView] = useState<'team' | 'individual'>('team');
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const mockStaffData: StaffMember[] = [
  {
    id: '1',
    name: 'Anna Schmidt',
    efficiency: 92,
    satisfaction: 96,
    revenue: 45000,
    bookings: 156,
    role: 'Senior Kosmetikerin'
  },
  {
    id: '2',
    name: 'Maria Weber',
    efficiency: 88,
    satisfaction: 94,
    revenue: 38000,
    bookings: 142,
    role: 'Kosmetikerin'
  },
  {
    id: '3',
    name: 'Julia Müller',
    efficiency: 85,
    satisfaction: 91,
    revenue: 35000,
    bookings: 138,
    role: 'Kosmetikerin'
  },
  {
    id: '4',
    name: 'Sophie Fischer',
    efficiency: 78,
    satisfaction: 88,
    revenue: 28000,
    bookings: 118,
    role: 'Junior Kosmetikerin'
  },
  {
    id: '5',
    name: 'Laura Bauer',
    efficiency: 82,
    satisfaction: 90,
    revenue: 32000,
    bookings: 125,
    role: 'Empfang'
  }];


  const mockPerformanceData: StaffPerformanceData[] = [
  {
    id: '1',
    name: 'Anna Schmidt',
    role: 'Senior Kosmetikerin',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1757e492a-1763293666438.png",
    alt: 'Professional woman with blonde hair in white medical uniform smiling at camera',
    utilization: 92,
    avgServiceTime: 45,
    satisfaction: 96,
    revenue: 45000,
    bookings: 156,
    noShows: 3,
    trend: 8
  },
  {
    id: '2',
    name: 'Maria Weber',
    role: 'Kosmetikerin',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_10df5a971-1765003957966.png",
    alt: 'Young woman with dark hair in professional attire with friendly smile',
    utilization: 88,
    avgServiceTime: 48,
    satisfaction: 94,
    revenue: 38000,
    bookings: 142,
    noShows: 5,
    trend: 5
  },
  {
    id: '3',
    name: 'Julia Müller',
    role: 'Kosmetikerin',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_13e7ee145-1763295644608.png",
    alt: 'Woman with brown hair in white medical coat with professional demeanor',
    utilization: 85,
    avgServiceTime: 50,
    satisfaction: 91,
    revenue: 35000,
    bookings: 138,
    noShows: 4,
    trend: 3
  },
  {
    id: '4',
    name: 'Sophie Fischer',
    role: 'Junior Kosmetikerin',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_10778c045-1765088831422.png",
    alt: 'Young professional woman with light hair in medical uniform',
    utilization: 78,
    avgServiceTime: 55,
    satisfaction: 88,
    revenue: 28000,
    bookings: 118,
    noShows: 7,
    trend: -2
  },
  {
    id: '5',
    name: 'Laura Bauer',
    role: 'Empfang',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1bb5d2cb2-1763294526193.png",
    alt: 'Friendly woman with dark hair in professional business attire',
    utilization: 82,
    avgServiceTime: 52,
    satisfaction: 90,
    revenue: 32000,
    bookings: 125,
    noShows: 6,
    trend: 1
  }];


  const mockRecommendations: ScheduleRecommendation[] = [
  {
    id: '1',
    type: 'understaffed',
    title: 'Unterbesetzung am Freitagnachmittag',
    description: 'Historische Daten zeigen erhöhte Nachfrage zwischen 14:00-18:00 Uhr',
    impact: 'high',
    timeSlot: 'Freitag 14:00-18:00',
    suggestedAction: 'Zusätzliche Kosmetikerin einplanen oder Überstunden anbieten'
  },
  {
    id: '2',
    type: 'skill_gap',
    title: 'Spezialisierungslücke bei Gesichtsbehandlungen',
    description: 'Nur 2 Mitarbeiter für fortgeschrittene Gesichtsbehandlungen qualifiziert',
    impact: 'medium',
    timeSlot: 'Gesamte Woche',
    suggestedAction: 'Schulung für 2-3 weitere Mitarbeiter in fortgeschrittenen Techniken'
  },
  {
    id: '3',
    type: 'optimization',
    title: 'Optimierungspotenzial bei Terminlängen',
    description: 'Durchschnittliche Servicezeit 12% über geplanter Zeit',
    impact: 'medium',
    timeSlot: 'Alle Zeitfenster',
    suggestedAction: 'Zeitpuffer zwischen Terminen von 5 auf 10 Minuten erhöhen'
  },
  {
    id: '4',
    type: 'overstaffed',
    title: 'Überbesetzung am Montagvormittag',
    description: 'Auslastung unter 60% zwischen 09:00-12:00 Uhr',
    impact: 'low',
    timeSlot: 'Montag 09:00-12:00',
    suggestedAction: 'Einen Mitarbeiter für administrative Aufgaben oder Schulungen einplanen'
  }];


  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <StaffSelector
          selectedView={selectedView}
          onViewChange={setSelectedView}
          selectedStaff={selectedStaff}
          onStaffChange={setSelectedStaff} />

        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <LocationSelector
            selectedLocations={selectedLocations}
            onLocationChange={setSelectedLocations} />

          <DateRangePicker />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StaffMetricCard
          title="Team-Auslastung"
          value="87"
          change={5}
          target={85}
          icon="ChartBarIcon"
          unit="%" />

        <StaffMetricCard
          title="Ø Service-Zeit"
          value="48"
          change={-3}
          target={50}
          icon="ClockIcon"
          unit=" Min" />

        <StaffMetricCard
          title="Kundenzufriedenheit"
          value="93"
          change={2}
          target={90}
          icon="StarIcon"
          unit="%" />

        <StaffMetricCard
          title="Umsatz pro Mitarbeiter"
          value="€35.600"
          change={8}
          target={32000}
          icon="CurrencyEuroIcon" />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <StaffProductivityChart data={mockStaffData} />
        </div>
        <div className="lg:col-span-4">
          <ScheduleOptimizationPanel recommendations={mockRecommendations} />
        </div>
      </div>

      <StaffPerformanceTable data={mockPerformanceData} />
    </div>);

};

export default StaffPerformanceInteractive;
