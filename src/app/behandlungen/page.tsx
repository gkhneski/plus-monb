'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { behandlungenService } from '../../services/behandlungenService';
import { Database } from '../../types/database.types';

type Behandlung = Database['public']['Tables']['behandlungen']['Row'];

export default function BehandlungenPage() {
  const [behandlungen, setBehandlungen] = useState<Behandlung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    kategorie: '',
    preis_eur: '',
    dauer_min: '',
    color_hex: '#3B82F6',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBehandlungen();
  }, []);

  const loadBehandlungen = async () => {
    try {
      setLoading(true);
      const { data, error } = await behandlungenService.getAll();
      if (error) {
        setError(error.message || 'Fehler beim Laden der Behandlungen');
        return;
      }
      setBehandlungen(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Behandlungen');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const submitData = {
        name: formData.name,
        kategorie: formData.kategorie || null,
        preis_eur: parseFloat(formData.preis_eur),
        dauer_min: parseInt(formData.dauer_min),
        color_hex: formData.color_hex || null,
      };

      if (editingId) {
        const { error } = await behandlungenService.update(editingId, submitData);
        if (error) {
          setError(error.message || 'Fehler beim Aktualisieren');
          return;
        }
      } else {
        const { error } = await behandlungenService.create(submitData);
        if (error) {
          setError(error.message || 'Fehler beim Erstellen');
          return;
        }
      }
      
      await loadBehandlungen();
      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (behandlung: Behandlung) => {
    setEditingId(behandlung.id);
    setFormData({
      name: behandlung.name,
      kategorie: behandlung.kategorie || '',
      preis_eur: behandlung.preis_eur.toString(),
      dauer_min: behandlung.dauer_min.toString(),
      color_hex: behandlung.color_hex || '#3B82F6',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Behandlung wirklich löschen?')) return;
    
    try {
      const { error } = await behandlungenService.delete(id);
      if (error) {
        setError(error.message || 'Fehler beim Löschen der Behandlung');
        return;
      }
      await loadBehandlungen();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen der Behandlung');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      kategorie: '',
      preis_eur: '',
      dauer_min: '',
      color_hex: '#3B82F6',
    });
    setEditingId(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Behandlungen</h1>
              <button
                onClick={() => {
                  resetForm();
                  setIsFormOpen(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                + Neue Behandlung
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
                <button
                  onClick={() => setError('')}
                  className="absolute top-0 right-0 px-4 py-3"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Wird geladen...</p>
              </div>
            ) : behandlungen.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">Keine Behandlungen vorhanden</p>
                <p className="text-gray-400 mt-2">Erstellen Sie Ihre erste Behandlung mit dem Button oben</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dauer (Min)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farbe
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {behandlungen?.map((behandlung) => (
                      <tr key={behandlung.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {behandlung.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {behandlung.kategorie || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {behandlung.dauer_min} Min.
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatPrice(behandlung.preis_eur)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {behandlung.color_hex ? (
                            <div className="flex items-center">
                              <div
                                className="w-6 h-6 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: behandlung.color_hex }}
                              ></div>
                              <span className="ml-2 text-xs text-gray-400">{behandlung.color_hex}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(behandlung)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Bearbeiten
                          </button>
                          <button
                            onClick={() => handleDelete(behandlung.id)}
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
                <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                      {editingId ? 'Behandlung bearbeiten' : 'Neue Behandlung'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="z.B. Gesichtsmassage, Haarschnitt"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kategorie
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={formData.kategorie}
                          onChange={(e) =>
                            setFormData({ ...formData, kategorie: e.target.value })
                          }
                          placeholder="z.B. Gesicht, Körper, Haare"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dauer (Minuten) *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={formData.dauer_min}
                          onChange={(e) =>
                            setFormData({ ...formData, dauer_min: e.target.value })
                          }
                          placeholder="z.B. 30, 60, 90"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preis (EUR) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={formData.preis_eur}
                          onChange={(e) =>
                            setFormData({ ...formData, preis_eur: e.target.value })
                          }
                          placeholder="z.B. 45.00, 89.50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farbe (optional)
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                            value={formData.color_hex}
                            onChange={(e) =>
                              setFormData({ ...formData, color_hex: e.target.value })
                            }
                          />
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formData.color_hex}
                            onChange={(e) =>
                              setFormData({ ...formData, color_hex: e.target.value })
                            }
                            placeholder="#3B82F6"
                            pattern="^#[0-9A-Fa-f]{6}$"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Format: #RRGGBB (z.B. #3B82F6 für Blau)
                        </p>
                      </div>
                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setIsFormOpen(false);
                            resetForm();
                            setError('');
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