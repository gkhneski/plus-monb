import type { Metadata } from "next"
// import Header from '@/components/common/Header';
// import Sidebar from '@/components/common/Sidebar';
import LocationSelector from "@/components/common/LocationSelector"
import DateRangePicker from "@/components/common/DateRangePicker"
import UserRoleIndicator from "@/components/common/UserRoleIndicator"
import DashboardInteractive from "./components/DashboardInteractive"

export const metadata: Metadata = {
  title: "Dashboard Übersicht - Cosmetics Studio Analytics",
  description:
    "Zentrale Kommandozentrale mit umfassenden Geschäftseinblicken für Kosmetikstudio-Operationen über alle Standorte hinweg mit Echtzeit-KPIs und Leistungsmetriken.",
}

export default function MainDashboardOverviewPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* <Sidebar /> */}

      {/* <div className="lg:ml-60"> */}
      {/* <Header showMenuButton={false} /> */}

      <main className="pt-16">
        <div className="px-4 lg:px-6 py-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <LocationSelector multiSelect={true} />
                <DateRangePicker />
              </div>

              <UserRoleIndicator
                userName="Max Mustermann"
                userRole="studio_manager"
                userEmail="max.mustermann@cosmetics-studio.at"
              />
            </div>

            <DashboardInteractive />
          </div>
        </div>
      </main>
      {/* </div> */}
    </div>
  )
}
