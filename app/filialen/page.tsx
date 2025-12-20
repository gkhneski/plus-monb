"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { filialenService } from "../../services/filialenService"
import type { Database } from "../../types/database.types"
import { useAuth } from "../../contexts/AuthContext"
import Link from "next/link"

type Filiale = Database["public"]["Tables"]["filialen"]["Row"]

export default function FilialenPage() {
  const { user, loading: authLoading } = useAuth()
  const [filialen, setFilialen] = useState<Filiale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    opening_hours: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      loadFilialen()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  const loadFilialen = async () => {
    try {
      setLoading(true)
      const { data, error } = await filialenService.getAll()
      if (error) throw error
      setFilialen(data || [])
    } catch (err) {
      setError("Fehler beim Laden der Filialen")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      if (editingId) {
        const { error } = await filialenService.update(editingId, formData)
        if (error) throw error
      } else {
        const { error } = await filialenService.create(formData)
        if (error) throw error
      }

      await loadFilialen()
      setIsFormOpen(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (filiale: Filiale) => {
    setEditingId(filiale.id)
    setFormData({
      name: filiale.name,
      address: filiale.address || "",
      phone: filiale.phone || "",
      opening_hours: filiale.opening_hours || "",
    })
    setIsFormOpen(true)
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await filialenService.toggleActive(id, !isActive)
      if (error) throw error
      await loadFilialen()
    } catch (err) {
      setError("Fehler beim Ändern des Status")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diese Filiale wirklich löschen?")) return

    try {
      const { error } = await filialenService.delete(id)
      if (error) throw error
      await loadFilialen()
    } catch (err) {
      setError("Fehler beim Löschen der Filiale")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      opening_hours: "",
    })
    setEditingId(null)
  }

  // Show loading state during auth check
  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Wird geladen...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Anmeldung erforderlich</h3>
        <p className="text-gray-500 mb-6">Bitte melden Sie sich an, um Filialen zu verwalten.</p>
        <Link
          href="/login"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Zur Anmeldung
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Filialen</h1>
        <button
          onClick={() => {
            resetForm()
            setIsFormOpen(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Filiale anlegen
        </button>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {filialen.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Keine Filialen vorhanden</h3>
          <p className="text-gray-500 mb-6">Beginnen Sie, indem Sie Ihre erste Filiale erstellen.</p>
          <button
            onClick={() => {
              resetForm()
              setIsFormOpen(true)
            }}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
          >
            Filiale anlegen
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
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
              {filialen?.map((filiale) => (
                <tr key={filiale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{filiale.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{filiale.address || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{filiale.phone || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        filiale.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {filiale.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(filiale)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleToggleActive(filiale.id, filiale.is_active)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      {filiale.is_active ? "Deaktivieren" : "Aktivieren"}
                    </button>
                    <button onClick={() => handleDelete(filiale.id)} className="text-red-600 hover:text-red-900">
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
                {editingId ? "Filiale bearbeiten" : "Neue Filiale"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Öffnungszeiten</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.opening_hours}
                    onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                    placeholder="Mo-Fr: 9:00-18:00&#10;Sa: 10:00-16:00"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false)
                      resetForm()
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
                    {submitting ? "Wird gespeichert..." : "Speichern"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
