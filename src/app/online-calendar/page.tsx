'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { buchungenService } from '../../services/buchungenService';
import { mitarbeiterService } from '../../services/mitarbeiterService';
import { supabase } from '../../lib/supabase/client';

interface BuchungWithRelations {
  id: string;
  kunde_id: string;
  mitarbeiter_id: string;
  behandlung_id: string | null;
  filiale_id: string | null;
  start_at: string;
  end_at: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notiz: string | null;
  kunden?: {
    id: string;
    vorname: string;
    nachname: string;
    email: string | null;
    telefon: string | null;
  } | null;
  mitarbeiter?: {
    id: string;
    name: string;
  } | null;
  behandlungen?: {
    id: string;
    name: string;
    dauer_min: number;
    preis_eur: number;
  } | null;
  filialen?: {
    id: string;
    name: string;
  } | null;
}

interface Mitarbeiter {
  id: string;
  name: string;
  color_hex: string | null;
  created_at: string;
  updated_at: string;
}

export default function OnlineCalendarPage() {
  const [buchungen, setBuchungen] = useState<BuchungWithRelations[]>([]);
  const [mitarbeiter, setMitarbeiter] = useState<Mitarbeiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMitarbeiter, setSelectedMitarbeiter] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Verify Supabase client on component mount
  useEffect(() => {
    console.log('🔍 Online Kalender: Überprüfung der Supabase-Konfiguration');
    console.log('📌 Supabase Client:', supabase ? '✅ Initialisiert' : '❌ Nicht initialisiert');
    console.log('📌 NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Gesetzt' : '❌ Fehlt');
    console.log('📌 NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Gesetzt' : '❌ Fehlt');
    
    if (!supabase) {
      setError('❌ Supabase Client ist nicht initialisiert. Bitte überprüfen Sie die Umgebungsvariablen.');
      setLoading(false);
      return;
    }
    
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      console.log('📅 Datum geändert:', selectedDate);
      loadBuchungen();
    }
  }, [selectedDate]);

  const loadData = async () => {
    try {
      console.log('🔄 Starte Datenladevorgang...');
      setLoading(true);
      setError('');
      
      console.log('👥 Lade Mitarbeiter aus Tabelle "public.mitarbeiter"...');
      const mitarbeiterRes = await mitarbeiterService.getAll();
      
      console.log('📊 Mitarbeiter Antwort:', {
        erfolg: !mitarbeiterRes.error,
        anzahl: mitarbeiterRes.data?.length || 0,
        fehler: mitarbeiterRes.error
      });
      
      if (mitarbeiterRes.error) {
        const errorMsg = mitarbeiterRes.error.message || String(mitarbeiterRes.error);
        console.error('❌ Fehler beim Laden der Mitarbeiter:', errorMsg);
        
        // Check for RLS-specific error
        if (errorMsg.includes('permission denied') || errorMsg.includes('42501')) {
          setError('🔒 Keine Berechtigung (RLS): Zugriff auf Tabelle "mitarbeiter" verweigert. Bitte als Super Admin einloggen.');
        } else if (errorMsg.includes('relation') && errorMsg.includes('does not exist')) {
          setError(`❌ Datenbankfehler: Tabelle "mitarbeiter" existiert nicht im Schema "public". Fehler: ${errorMsg}`);
        } else {
          setError(`❌ Fehler beim Laden der Mitarbeiter: ${errorMsg}`);
        }
        setLoading(false);
        return;
      }
      
      setMitarbeiter(mitarbeiterRes.data || []);
      console.log('✅ Mitarbeiter erfolgreich geladen:', mitarbeiterRes.data?.length || 0);
      
      await loadBuchungen();
    } catch (err: any) {
      console.error('💥 Unerwarteter Fehler in loadData:', err);
      setError(`💥 Systemfehler: ${err?.message || 'Unbekannter Fehler'}`);
      setLoading(false);
    }
  };

  const loadBuchungen = async () => {
    try {
      console.log('📅 Lade Buchungen...');
      console.log('🔍 Suche in Tabelle "public.buchungen"');
      setLoading(true);
      setError('');
      
      const startOfDay = `${selectedDate}T00:00:00`;
      const endOfDay = `${selectedDate}T23:59:59`;
      
      console.log('⏰ Zeitbereich:', { von: startOfDay, bis: endOfDay });
      
      const { data, error: buchungenError } = await buchungenService.getByDateRange(startOfDay, endOfDay);
      
      console.log('📊 Buchungen Antwort:', {
        erfolg: !buchungenError,
        anzahl: data?.length || 0,
        fehler: buchungenError
      });
      
      if (buchungenError) {
        const errorMsg = buchungenError.message || String(buchungenError);
        console.error('❌ Fehler beim Laden der Buchungen:', errorMsg);
        
        // Check for RLS-specific error
        if (errorMsg.includes('permission denied') || errorMsg.includes('42501')) {
          setError('🔒 Keine Berechtigung (RLS): Zugriff auf Tabelle "buchungen" verweigert. Bitte als Super Admin einloggen.');
        } else if (errorMsg.includes('relation') && errorMsg.includes('does not exist')) {
          setError(`❌ Datenbankfehler: Tabelle "buchungen" existiert nicht im Schema "public". Fehler: ${errorMsg}`);
        } else {
          setError(`❌ Fehler beim Laden der Buchungen: ${errorMsg}`);
        }
        setBuchungen([]);
      } else {
        setBuchungen(data || []);
        console.log('✅ Buchungen erfolgreich geladen:', data?.length || 0);
      }
    } catch (err: any) {
      console.error('💥 Unerwarteter Fehler in loadBuchungen:', err);
      setError(`💥 Systemfehler beim Laden der Buchungen: ${err?.message || 'Unbekannter Fehler'}`);
      setBuchungen([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Geplant';
      case 'confirmed':
        return 'Bestätigt';
      case 'completed':
        return 'Abgeschlossen';
      case 'cancelled':
        return 'Storniert';
      case 'no_show':
        return 'Nicht erschienen';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'no_show':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const filteredBuchungen = buchungen.filter((buchung) => {
    const matchesMitarbeiter = selectedMitarbeiter === 'all' || buchung.mitarbeiter_id === selectedMitarbeiter;
    const matchesStatus = selectedStatus === 'all' || buchung.status === selectedStatus;
    return matchesMitarbeiter && matchesStatus;
  });

  const groupByMitarbeiter = () => {
    const grouped: { [key: string]: BuchungWithRelations[] } = {};
    
    filteredBuchungen.forEach((buchung) => {
      const mitarbeiterName = buchung.mitarbeiter?.name || 'Unbekannt';
      if (!grouped[mitarbeiterName]) {
        grouped[mitarbeiterName] = [];
      }
      grouped[mitarbeiterName].push(buchung);
    });

    // Sort bookings by start_at within each group
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => 
        new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
      );
    });

    return grouped;
  };

  const groupedBuchungen = groupByMitarbeiter();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Online Kalender</h1>
              <p className="text-gray-600 mt-2">Tagesansicht der Buchungen</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datum
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mitarbeiter
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={selectedMitarbeiter}
                    onChange={(e) => setSelectedMitarbeiter(e.target.value)}
                  >
                    <option value="all">Alle Mitarbeiter</option>
                    {mitarbeiter?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Alle Status</option>
                    <option value="scheduled">Geplant</option>
                    <option value="confirmed">Bestätigt</option>
                    <option value="completed">Abgeschlossen</option>
                    <option value="cancelled">Storniert</option>
                    <option value="no_show">Nicht erschienen</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Enhanced Error Display */}
            {error && (
              <div className="mb-4 bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-lg shadow-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Fehler beim Laden der Daten</h3>
                    <p className="text-sm whitespace-pre-wrap font-mono">{error}</p>
                    <div className="mt-4 text-sm">
                      <p className="font-semibold">Mögliche Lösungen:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Stellen Sie sicher, dass Sie als Super Admin eingeloggt sind</li>
                        <li>Überprüfen Sie die RLS-Policies in Ihrem Supabase Dashboard</li>
                        <li>Verifizieren Sie die Umgebungsvariablen (NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY)</li>
                        <li>Prüfen Sie, ob die Tabellen "buchungen" und "mitarbeiter" im Schema "public" existieren</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Wird geladen...</p>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-lg shadow p-6 mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {formatDate(selectedDate)}
                  </h2>
                  <p className="text-gray-600">
                    {filteredBuchungen.length} Buchung{filteredBuchungen.length !== 1 ? 'en' : ''}
                  </p>
                </div>

                {Object.keys(groupedBuchungen).length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500 text-lg">Keine Buchungen für diesen Tag</p>
                    <p className="text-gray-400 mt-2">Passen Sie die Filter an oder wählen Sie ein anderes Datum</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedBuchungen).map(([mitarbeiterName, buchungen]) => (
                      <div key={mitarbeiterName} className="bg-white rounded-lg shadow">
                        <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100">
                          <h3 className="text-lg font-semibold text-indigo-900">
                            {mitarbeiterName}
                          </h3>
                        </div>
                        <div className="p-6 space-y-3">
                          {buchungen?.map((buchung) => (
                            <div
                              key={buchung.id}
                              className={`border-l-4 p-4 rounded-r-lg ${getStatusColor(buchung.status)}`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-semibold text-lg">
                                      {formatTime(buchung.start_at)} - {formatTime(buchung.end_at)}
                                    </span>
                                    <span className="px-2 py-1 text-xs rounded-full bg-white bg-opacity-50">
                                      {getStatusLabel(buchung.status)}
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="font-medium text-gray-900">
                                      {buchung.kunden?.vorname} {buchung.kunden?.nachname}
                                    </p>
                                    {buchung.behandlungen && (
                                      <p className="text-sm text-gray-600">
                                        {buchung.behandlungen.name} ({buchung.behandlungen.dauer_min} Min.)
                                      </p>
                                    )}
                                    {buchung.filialen && (
                                      <p className="text-sm text-gray-600">
                                        Filiale: {buchung.filialen.name}
                                      </p>
                                    )}
                                    {buchung.kunden?.telefon && (
                                      <p className="text-sm text-gray-600">
                                        Tel: {buchung.kunden.telefon}
                                      </p>
                                    )}
                                    {buchung.notiz && (
                                      <p className="text-sm text-gray-600 mt-2 italic">
                                        Notiz: {buchung.notiz}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}