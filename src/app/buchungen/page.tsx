'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { buchungenService } from '../../services/buchungenService';
import { kundenService } from '../../services/kundenService';
import { mitarbeiterService } from '../../services/mitarbeiterService';
import { behandlungenService } from '../../services/behandlungenService';
import { filialenService } from '../../services/filialenService';
import { Database } from '../../types/database.types';

type Kunde = Database['public']['Tables']['kunden']['Row'];
type Mitarbeiter = Database['public']['Tables']['mitarbeiter']['Row'];
type Behandlung = Database['public']['Tables']['behandlungen']['Row'];
type Filiale = Database['public']['Tables']['filialen']['Row'];

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

export default function BuchungenPage() {
  const [buchungen, setBuchungen] = useState<BuchungWithRelations[]>([]);
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [mitarbeiter, setMitarbeiter] = useState<Mitarbeiter[]>([]);
  const [behandlungen, setBehandlungen] = useState<Behandlung[]>([]);
  const [filialen, setFilialen] = useState<Filiale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    kunde_id: '',
    mitarbeiter_id: '',
    behandlung_id: '',
    filiale_id: '',
    start_at: '',
    duration_min: '',
    status: 'scheduled\' as \'scheduled\' | \'confirmed\' | \'completed\' | \'cancelled\' | \'no_show',
    notiz: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  setLoading(true);
  setError('');

  const results = await Promise.allSettled([
    buchungenService.getAll(),
    kundenService.getAll(),
    mitarbeiterService.getActive(),
    behandlungenService.getActive(),
    filialenService.getActive(),
  ]);

  const [bRes, kRes, mRes, beRes, fRes] = results;
  const errors: string[] = [];

  if (bRes.status === 'fulfilled') setBuchungen(bRes.value.data || []);
  else errors.push('Buchungen: ' + String(bRes.reason));

  if (kRes.status === 'fulfilled') setKunden(kRes.value.data || []);
  else errors.push('Kunden: ' + String(kRes.reason));

  if (mRes.status === 'fulfilled') setMitarbeiter(mRes.value.data || []);
  else errors.push('Mitarbeiter: ' + String(mRes.reason));

  if (beRes.status === 'fulfilled') setBehandlungen(beRes.value.data || []);
  else errors.push('Behandlungen: ' + String(beRes.reason));

  if (fRes.status === 'fulfilled') setFilialen(fRes.value.data || []);
  else errors.push('Filialen: ' + String(fRes.reason));

  if (errors.length) {
    console.error('loadData errors:', errors);
    setError(errors.join(' | '));
  }

  setLoading(false);
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Calculate end_at from start_at + duration
      const startDate = new Date(formData.start_at);
      const durationMin = parseInt(formData.duration_min);
      const endDate = new Date(startDate.getTime() + durationMin * 60000);

      const submitData = {
        kunde_id: formData.kunde_id,
        mitarbeiter_id: formData.mitarbeiter_id,
        behandlung_id: formData.behandlung_id || null,
        filiale_id: formData.filiale_id || null,
        start_at: formData.start_at,
        end_at: endDate.toISOString(),
        status: formData.status,
        notiz: formData.notiz || null,
      };

      if (editingId) {
        const { error } = await buchungenService.update(editingId, submitData);
        if (error) throw error;
      } else {
        const { error } = await buchungenService.create(submitData);
        if (error) throw error;
      }
      
      await loadData();
      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (buchung: BuchungWithRelations) => {
    // Calculate duration from start_at and end_at
    const start = new Date(buchung.start_at);
    const end = new Date(buchung.end_at);
    const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);

    setEditingId(buchung.id);
    setFormData({
      kunde_id: buchung.kunde_id,
      mitarbeiter_id: buchung.mitarbeiter_id,
      behandlung_id: buchung.behandlung_id || '',
      filiale_id: buchung.filiale_id || '',
      start_at: buchung.start_at.slice(0, 16), // Format for datetime-local input
      duration_min: durationMin.toString(),
      status: buchung.status,
      notiz: buchung.notiz || '',
    });
    setIsFormOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show') => {
    try {
      const { error } = await buchungenService.updateStatus(id, status);
      if (error) throw error;
      await loadData();
    } catch (err) {
      setError('Fehler beim Aktualisieren des Status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Buchung wirklich löschen?')) return;
    
    try {
      const { error } = await buchungenService.delete(id);
      if (error) throw error;
      await loadData();
    } catch (err) {
      setError('Fehler beim Löschen der Buchung');
    }
  };

  const resetForm = () => {
    setFormData({
      kunde_id: '',
      mitarbeiter_id: '',
      behandlung_id: '',
      filiale_id: '',
      start_at: '',
      duration_min: '',
      status: 'scheduled',
      notiz: '',
    });
    setEditingId(null);
  };

  const handleBehandlungChange = (behandlungId: string) => {
    const behandlung = behandlungen.find((b) => b.id === behandlungId);
    setFormData({
      ...formData,
      behandlung_id: behandlungId,
      duration_min: behandlung ? behandlung.dauer_min.toString() : '',
    });
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
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Buchungen</h1>
              <button
                onClick={() => {
                  resetForm();
                  setIsFormOpen(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                + Neue Buchung
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Wird geladen...</p>
              </div>
            ) : buchungen.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 text-lg">Keine Buchungen vorhanden</p>
                <p className="text-gray-400 mt-2">Erstellen Sie Ihre erste Buchung</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Datum/Zeit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kunde
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mitarbeiter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Behandlung
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {buchungen?.map((buchung) => (
                      <tr key={buchung.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(buchung.start_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {buchung.kunden?.vorname} {buchung.kunden?.nachname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {buchung.mitarbeiter?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {buchung.behandlungen?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={buchung.status}
                            onChange={(e) =>
                              handleUpdateStatus(
                                buchung.id,
                                e.target.value as 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
                              )
                            }
                            className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              buchung.status
                            )}`}
                          >
                            <option value="scheduled">Geplant</option>
                            <option value="confirmed">Bestätigt</option>
                            <option value="completed">Abgeschlossen</option>
                            <option value="cancelled">Storniert</option>
                            <option value="no_show">Nicht erschienen</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(buchung)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Bearbeiten
                          </button>
                          <button
                            onClick={() => handleDelete(buchung.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Löschen
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Form Modal */}
            {isFormOpen && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                      {editingId ? 'Buchung bearbeiten' : 'Neue Buchung'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kunde *
                          </label>
                          <select
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formData.kunde_id}
                            onChange={(e) =>
                              setFormData({ ...formData, kunde_id: e.target.value })
                            }
                          >
                            <option value="">Kunde auswählen</option>
                            {kunden?.map((kunde) => (
                              <option key={kunde.id} value={kunde.id}>
                                {kunde.vorname} {kunde.nachname}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mitarbeiter *
                          </label>
                          <select
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formData.mitarbeiter_id}
                            onChange={(e) =>
                              setFormData({ ...formData, mitarbeiter_id: e.target.value })
                            }
                          >
                            <option value="">Mitarbeiter auswählen</option>
                            {mitarbeiter?.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Behandlung
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formData.behandlung_id}
                            onChange={(e) => handleBehandlungChange(e.target.value)}
                          >
                            <option value="">Keine Behandlung</option>
                            {behandlungen?.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name} ({b.dauer_min} Min., {b.preis_eur}€)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filiale
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formData.filiale_id}
                            onChange={(e) =>
                              setFormData({ ...formData, filiale_id: e.target.value })
                            }
                          >
                            <option value="">Keine Filiale</option>
                            {filialen?.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Startzeit *
                          </label>
                          <input
                            type="datetime-local"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formData.start_at}
                            onChange={(e) =>
                              setFormData({ ...formData, start_at: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dauer (Minuten) *
                          </label>
                          <input
                            type="number"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formData.duration_min}
                            onChange={(e) =>
                              setFormData({ ...formData, duration_min: e.target.value })
                            }
                            placeholder="z.B. 30, 60, 90"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show',
                            })
                          }
                        >
                          <option value="scheduled">Geplant</option>
                          <option value="confirmed">Bestätigt</option>
                          <option value="completed">Abgeschlossen</option>
                          <option value="cancelled">Storniert</option>
                          <option value="no_show">Nicht erschienen</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notiz
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={formData.notiz}
                          onChange={(e) =>
                            setFormData({ ...formData, notiz: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setIsFormOpen(false);
                            resetForm();
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                          disabled={submitting}
                        >
                          Abbrechen
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                          disabled={submitting}
                        >
                          {submitting ? 'Wird gespeichert...' : 'Speichern'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}