"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { mitarbeiterService } from "../../services/mitarbeiterService"
import type { Database } from "../../types/database.types"

type Mitarbeiter = Database["public"]["Tables"]["mitarbeiter"]["Row"]

export default function MitarbeiterPage() {
  const [mitarbeiter, setMitarbeiter] = useState<Mitarbeiter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    color_hex: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data, error } = await mitarbeiterService.getAll()

      if (error) throw error

      setMitarbeiter(data || [])
    } catch (err) {
      setError("Fehler beim Laden der Daten")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const submitData = {
        name: formData.name,
        color_hex: formData.color_hex || null,
      }

      if (editingId) {
        const { error } = await mitarbeiterService.update(editingId, submitData)
        if (error) throw error
      } else {
        const { error } = await mitarbeiterService.create(submitData)
        if (error) throw error
      }

      await loadData()
      setIsFormOpen(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (m: Mitarbeiter) => {
    setEditingId(m.id)
    setFormData({
      name: m.name,
      color_hex: m.color_hex || "",
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen Mitarbeiter wirklich löschen?")) return

    try {
      const { error } = await mitarbeiterService.delete(id)
      if (error) throw error
      await loadData()
    } catch (err) {
      setError("Fehler beim Löschen des Mitarbeiters")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      color_hex: "",
    })
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mitarbeiter</h1>
        <button
          onClick={() => {
            resetForm()
            setIsFormOpen(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          + Neuer Mitarbeiter
        </button>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Wird geladen...</p>
        </div>
      ) : mitarbeiter.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-gray-500 text-lg mt-4">Keine Mitarbeiter vorhanden</p>
          <p className="text-gray-400 mt-2">Erstellen Sie Ihren ersten Mitarbeiter mit dem Button oben</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mitarbeiter?.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {m.color_hex && (
                        <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: m.color_hex }} />
                      )}
                      <span className="text-sm font-medium text-gray-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(m)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Bearbeiten
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-900">
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
                {editingId ? "Mitarbeiter bearbeiten" : "Neuer Mitarbeiter"}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farbe (optional)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                      value={formData.color_hex || "#3B82F6"}
                      onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="#3B82F6"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.color_hex}
                      onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                    />
                  </div>
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
