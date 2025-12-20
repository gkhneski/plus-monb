"use client"
import { useAuth } from "../../contexts/AuthContext"

export default function EinstellungenPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Einstellungen</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Benutzerinformationen</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-Mail</label>
            <p className="mt-1 text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Benutzer-ID</label>
            <p className="mt-1 text-gray-600 text-sm font-mono">{user?.id}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Systemstatus</h2>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-gray-700">Supabase Verbindung: Aktiv</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-gray-700">Authentifizierung: Aktiv</span>
          </div>
        </div>
      </div>
    </div>
  )
}
