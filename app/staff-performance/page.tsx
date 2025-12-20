import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import UserRoleIndicator from '@/components/common/UserRoleIndicator';
import StaffPerformanceInteractive from './components/StaffPerformanceInteractive';

export const metadata: Metadata = {
  title: 'Mitarbeiterleistung - Cosmetics Studio Analytics',
  description: 'Überwachen Sie Mitarbeiterproduktivität, Auslastung und Leistungsmetriken zur Optimierung der Personalplanung und Identifizierung von Schulungsmöglichkeiten.',
};

export default function StaffPerformancePage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="lg:ml-60">
        <Header showMenuButton={false} />
        
        <main className="pt-16">
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Mitarbeiterleistung</h1>
                <p className="text-muted-foreground mt-2">
                  Produktivität, Auslastung und Leistungsoptimierung
                </p>
              </div>
              <UserRoleIndicator
                userName="Max Mustermann"
                userRole="studio_manager"
                userEmail="max.mustermann@cosmetics-studio.at"
              />
            </div>

            <StaffPerformanceInteractive />
          </div>
        </main>
      </div>
    </div>
  );
}
