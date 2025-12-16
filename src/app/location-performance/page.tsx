import type { Metadata } from 'next';
import LocationPerformanceInteractive from './components/LocationPerformanceInteractive';

export const metadata: Metadata = {
  title: 'Standort-Leistung - Cosmetics Studio Analytics',
  description: 'Umfassende Multi-Standort-Vergleichsanalyse mit KPI-Überwachung, geografischer Visualisierung und Leistungsbewertung für alle Cosmetics Studio Filialen.',
};

export default function LocationPerformancePage() {
  return <LocationPerformanceInteractive />;
}