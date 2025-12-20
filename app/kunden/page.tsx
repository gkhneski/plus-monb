"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { kundenService } from "../../services/kundenService"
import type { Database } from "../../types/database.types"

type Kunde = Database["public"]["Tables"]["kunden"]["Row"]

export default function KundenPage() {
  const [kunden, setKunden] = useState<Kunde[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    vorname: "",
    nachname: "",
    email: "",
    telefon: "",
    geburtsdatum: "",
    notizen: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadKunden()
  }, [])

  const loadKunden = async () => {
    try {
      setLoading(true)
      const { data, error } = await kundenService.getAll()
      if (error) throw error
      setKunden(data || [])
    } catch (err) {
      setError("Fehler beim Laden der Kunden")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadKunden()
      return
    }

    try {
      setLoading(true)
      const { data, error } = await kundenService.search(searchTerm)
      if (error) throw error
      setKunden(data || [])
    } catch (err) {
      setError("Fehler bei der Suche")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    // Validate: at least telefon OR email
    if (!formData.telefon.trim() && !formData.email.trim()) {
      setError("Entweder Telefon oder E-Mail muss angegeben werden")
      setSubmitting(false)
      return
    }

    try {
      const submitData = {
        ...formData,
        email: formData.email || null,
        telefon: formData.telefon || null,
        geburtsdatum: formData.geburtsdatum || null,
        notizen: formData.notizen || null,
      }

      if (editingId) {
        const { error } = await kundenService.update(editingId, submitData)
        if (error) throw error
      } else {
        const { error } = await kundenService.create(submitData)
        if (error) throw error
      }

      await loadKunden()
      setIsFormOpen(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (kunde: Kunde) => {
    setEditingId(kunde.id)
    setFormData({
      vorname: kunde.vorname,
      nachname: kunde.nachname,
      email: kunde.email || "",
      telefon: kunde.telefon || "",
      geburtsdatum: kunde.geburtsdatum || "",
      notizen: kunde.notizen || "",
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen Kunden wirklich löschen?")) return

    try {
      const { error } = await kundenService.delete(id)
      if (error) throw error
      await loadKunden()
    } catch (err) {
      setError("Fehler beim Löschen des Kunden")
    }
  }

  const resetForm = () => {
    setFormData({
      vorname: "",
      nachname: "",
      email: "",
      telefon: "",
      geburtsdatum: "",
      notizen: "",
    })
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Kunden</h1>
        <button
          onClick={() => {
            resetForm()
            setIsFormOpen(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          + Neuer Kunde
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Suche nach Name, E-Mail oder Telefon..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Suchen
        </button>
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("")
              loadKunden()
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Zurücksetzen
          </button>
        )}
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Wird geladen...</p>
        </div>
      ) : kunden.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">{searchTerm ? "Keine Kunden gefunden" : "Keine Kunden vorhanden"}</p>
          <p className="text-gray-400 mt-2">
            {searchTerm ? "Versuchen Sie eine andere Suche" : "Erstellen Sie Ihren ersten Kunden"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-Mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Geburtsdatum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kunden?.map((kunde) => (
                <tr key={kunde.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {kunde.vorname} {kunde.nachname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kunde.email || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kunde.telefon || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {kunde.geburtsdatum ? new Date(kunde.geburtsdatum).toLocaleDateString("de-DE") : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(kunde)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Bearbeiten
                    </button>
                    <button onClick={() => handleDelete(kunde.id)} className="text-red-600 hover:text-red-900">
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
                {editingId ? "Kunde bearbeiten" : "Neuer Kunde"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.vorname}
                    onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.nachname}
                    onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-gray-500">* Entweder Telefon oder E-Mail muss angegeben werden</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Geburtsdatum</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.geburtsdatum}
                    onChange={(e) => setFormData({ ...formData, geburtsdatum: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.notizen}
                    onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
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
