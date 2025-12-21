"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { behandlungenService } from "../../services/behandlungenService"
import { kategorienService } from "../../services/kategorienService"
import type { Database } from "../../types/database.types"
import { Search, Plus, Edit2, Trash2, X } from "lucide-react"

type Behandlung = Database["public"]["Tables"]["behandlungen"]["Row"] & {
  kategorien: { id: string; name: string } | null
}
type Kategorie = Database["public"]["Tables"]["kategorien"]["Row"]

export default function BehandlungenPage() {
  const [behandlungen, setBehandlungen] = useState<Behandlung[]>([])
  const [kategorien, setKategorien] = useState<Kategorie[]>([])
  const [selectedKategorie, setSelectedKategorie] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Behandlung Form
  const [isBehandlungFormOpen, setIsBehandlungFormOpen] = useState(false)
  const [editingBehandlungId, setEditingBehandlungId] = useState<string | null>(null)
  const [behandlungFormData, setBehandlungFormData] = useState({
    name: "",
    kategorie_id: "",
    preis_eur: "",
    dauer_min: "",
    color_hex: "#3B82F6",
  })

  // Kategorie Form
  const [isKategorieFormOpen, setIsKategorieFormOpen] = useState(false)
  const [editingKategorieId, setEditingKategorieId] = useState<string | null>(null)
  const [kategorieFormData, setKategorieFormData] = useState({
    name: "",
    beschreibung: "",
  })

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedKategorie === null) {
      loadBehandlungen()
    } else {
      loadBehandlungenByKategorie(selectedKategorie)
    }
  }, [selectedKategorie])

  const loadData = async () => {
    await Promise.all([loadKategorien(), loadBehandlungen()])
  }

  const loadKategorien = async () => {
    try {
      const { data, error } = await kategorienService.getAll()
      if (error) {
        // Only log to console, don't show user error
        console.error("Fehler beim Laden der Kategorien:", error)
        return
      }
      setKategorien(data || [])
    } catch (err) {
      console.error("Fehler beim Laden der Kategorien:", err)
    }
  }

  const loadBehandlungen = async () => {
    try {
      setLoading(true)
      const { data, error } = await behandlungenService.getAll()
      if (error) {
        setError(error.message || "Fehler beim Laden der Behandlungen")
        return
      }
      setBehandlungen(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden der Behandlungen")
    } finally {
      setLoading(false)
    }
  }

  const loadBehandlungenByKategorie = async (kategorieId: string | null) => {
    try {
      setLoading(true)
      const { data, error } = await behandlungenService.getByKategorie(kategorieId)
      if (error) {
        setError(error.message || "Fehler beim Laden der Behandlungen")
        return
      }
      setBehandlungen(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden der Behandlungen")
    } finally {
      setLoading(false)
    }
  }

  // Behandlung handlers
  const handleBehandlungSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const submitData = {
        name: behandlungFormData.name,
        kategorie_id: behandlungFormData.kategorie_id || null,
        preis_eur: Number.parseFloat(behandlungFormData.preis_eur),
        dauer_min: Number.parseInt(behandlungFormData.dauer_min),
        color_hex: behandlungFormData.color_hex || null,
      }

      if (editingBehandlungId) {
        const { error } = await behandlungenService.update(editingBehandlungId, submitData)
        if (error) {
          setError(error.message || "Fehler beim Aktualisieren")
          return
        }
      } else {
        const { error } = await behandlungenService.create(submitData)
        if (error) {
          setError(error.message || "Fehler beim Erstellen")
          return
        }
      }

      await loadBehandlungen()
      setIsBehandlungFormOpen(false)
      resetBehandlungForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setSubmitting(false)
    }
  }

  const handleBehandlungEdit = (behandlung: Behandlung) => {
    setEditingBehandlungId(behandlung.id)
    setBehandlungFormData({
      name: behandlung.name,
      kategorie_id: behandlung.kategorie_id || "",
      preis_eur: behandlung.preis_eur.toString(),
      dauer_min: behandlung.dauer_min.toString(),
      color_hex: behandlung.color_hex || "#3B82F6",
    })
    setIsBehandlungFormOpen(true)
  }

  const handleBehandlungDelete = async (id: string) => {
    if (!confirm("Möchten Sie diese Behandlung wirklich löschen?")) return

    try {
      const { error } = await behandlungenService.delete(id)
      if (error) {
        setError(error.message || "Fehler beim Löschen der Behandlung")
        return
      }
      await loadBehandlungen()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Löschen der Behandlung")
    }
  }

  const resetBehandlungForm = () => {
    setBehandlungFormData({
      name: "",
      kategorie_id: "",
      preis_eur: "",
      dauer_min: "",
      color_hex: "#3B82F6",
    })
    setEditingBehandlungId(null)
  }

  // Kategorie handlers
  const handleKategorieSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      if (editingKategorieId) {
        const { error } = await kategorienService.update(editingKategorieId, kategorieFormData)
        if (error) {
          setError(error.message || "Fehler beim Aktualisieren")
          return
        }
      } else {
        const { error } = await kategorienService.create(kategorieFormData)
        if (error) {
          setError(error.message || "Fehler beim Erstellen")
          return
        }
      }

      await loadKategorien()
      setIsKategorieFormOpen(false)
      resetKategorieForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setSubmitting(false)
    }
  }

  const handleKategorieEdit = (kategorie: Kategorie) => {
    setEditingKategorieId(kategorie.id)
    setKategorieFormData({
      name: kategorie.name,
      beschreibung: kategorie.beschreibung || "",
    })
    setIsKategorieFormOpen(true)
  }

  const handleKategorieDelete = async (id: string) => {
    const { count } = await kategorienService.getBehandlungenCount(id)

    if (count > 0) {
      alert(`Diese Kategorie kann nicht gelöscht werden, da ${count} Behandlung(en) dieser Kategorie zugeordnet sind.`)
      return
    }

    if (!confirm("Möchten Sie diese Kategorie wirklich löschen?")) return

    try {
      const { error } = await kategorienService.delete(id)
      if (error) {
        setError(error.message || "Fehler beim Löschen der Kategorie")
        return
      }
      await loadKategorien()
      if (selectedKategorie === id) {
        setSelectedKategorie(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Löschen der Kategorie")
    }
  }

  const resetKategorieForm = () => {
    setKategorieFormData({
      name: "",
      beschreibung: "",
    })
    setEditingKategorieId(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  const filteredBehandlungen = behandlungen.filter((b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const uncategorizedCount = behandlungen.filter((b) => !b.kategorie_id).length

  return (
    <div className="flex h-full">
      {/* Left Panel - Kategorien */}
      <div className="w-80 border-r border-gray-200 bg-white p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Kategorien</h2>
          <button
            onClick={() => {
              resetKategorieForm()
              setIsKategorieFormOpen(true)
            }}
            className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors"
            title="Kategorie hinzufügen"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          {/* Alle Dienstleistungen */}
          <button
            onClick={() => setSelectedKategorie(null)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
              selectedKategorie === null ? "bg-cyan-600 text-white" : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <div className="flex items-center">
              <Search className="w-4 h-4 mr-2" />
              <span className="font-normal">Alle Dienstleistungen</span>
            </div>
            <span className={`text-sm ${selectedKategorie === null ? "text-white" : "text-gray-500"}`}>
              {behandlungen.length}
            </span>
          </button>

          {/* Nicht kategorisierte Dienstleistungen */}
          {uncategorizedCount > 0 && (
            <button
              onClick={() => setSelectedKategorie("uncategorized")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                selectedKategorie === "uncategorized" ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 border border-gray-400 rounded"></div>
                <span className="font-light text-sm">Nicht kategorisierte Dienstleistungen</span>
              </div>
              <span className="text-sm text-gray-500">{uncategorizedCount}</span>
            </button>
          )}

          {/* Kategorien Liste */}
          {kategorien.map((kategorie) => {
            const count = behandlungen.filter((b) => b.kategorie_id === kategorie.id).length
            return (
              <div
                key={kategorie.id}
                className={`group relative rounded-lg transition-colors ${
                  selectedKategorie === kategorie.id ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <button
                  onClick={() => setSelectedKategorie(kategorie.id)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 bg-cyan-100 rounded"></div>
                    <span className="font-light text-gray-700">{kategorie.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{count}</span>
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleKategorieEdit(kategorie)
                    }}
                    className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-white rounded"
                    title="Bearbeiten"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleKategorieDelete(kategorie.id)
                    }}
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-white rounded"
                    title="Löschen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Panel - Behandlungen */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Behandlungen</h1>
            <button
              onClick={() => {
                resetBehandlungForm()
                setIsBehandlungFormOpen(true)
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 font-light"
            >
              <Plus className="w-4 h-4" />
              Neue Behandlung
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Name, Kategorie, ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
            <button onClick={() => setError("")} className="absolute top-0 right-0 px-4 py-3">
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-light">Wird geladen...</p>
          </div>
        ) : filteredBehandlungen.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg font-light">Keine Behandlungen gefunden</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bezeichnung
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
                {filteredBehandlungen.map((behandlung) => (
                  <tr key={behandlung.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-gray-700">
                      {behandlung.kategorien?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-normal text-gray-900">{behandlung.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-gray-500">
                      {behandlung.dauer_min} Min.
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-gray-500">
                      {formatPrice(behandlung.preis_eur)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {behandlung.color_hex ? (
                        <div className="flex items-center">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: behandlung.color_hex }}
                          ></div>
                          <span className="ml-2 text-xs text-gray-400 font-light">{behandlung.color_hex}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-light">
                      <button
                        onClick={() => handleBehandlungEdit(behandlung)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleBehandlungDelete(behandlung.id)}
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
      </div>

      {/* Behandlung Form Modal */}
      {isBehandlungFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingBehandlungId ? "Behandlung bearbeiten" : "Neue Behandlung"}
              </h3>
              <button
                onClick={() => {
                  setIsBehandlungFormOpen(false)
                  resetBehandlungForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBehandlungSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={behandlungFormData.name}
                  onChange={(e) => setBehandlungFormData({ ...behandlungFormData, name: e.target.value })}
                  placeholder="z.B. Gesichtsmassage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={behandlungFormData.kategorie_id}
                  onChange={(e) => setBehandlungFormData({ ...behandlungFormData, kategorie_id: e.target.value })}
                >
                  <option value="">Keine Kategorie</option>
                  {kategorien.map((kategorie) => (
                    <option key={kategorie.id} value={kategorie.id}>
                      {kategorie.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dauer (Minuten) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={behandlungFormData.dauer_min}
                  onChange={(e) => setBehandlungFormData({ ...behandlungFormData, dauer_min: e.target.value })}
                  placeholder="z.B. 30, 60, 90"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preis (EUR) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={behandlungFormData.preis_eur}
                  onChange={(e) => setBehandlungFormData({ ...behandlungFormData, preis_eur: e.target.value })}
                  placeholder="z.B. 45.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farbe (optional)</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    value={behandlungFormData.color_hex}
                    onChange={(e) => setBehandlungFormData({ ...behandlungFormData, color_hex: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={behandlungFormData.color_hex}
                    onChange={(e) => setBehandlungFormData({ ...behandlungFormData, color_hex: e.target.value })}
                    placeholder="#3B82F6"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsBehandlungFormOpen(false)
                    resetBehandlungForm()
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-light"
                  disabled={submitting}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 font-light"
                  disabled={submitting}
                >
                  {submitting ? "Wird gespeichert..." : "Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kategorie Form Modal */}
      {isKategorieFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingKategorieId ? "Kategorie bearbeiten" : "Neue Kategorie"}
              </h3>
              <button
                onClick={() => {
                  setIsKategorieFormOpen(false)
                  resetKategorieForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleKategorieSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={kategorieFormData.name}
                  onChange={(e) => setKategorieFormData({ ...kategorieFormData, name: e.target.value })}
                  placeholder="z.B. Gesicht, Körper"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={kategorieFormData.beschreibung}
                  onChange={(e) => setKategorieFormData({ ...kategorieFormData, beschreibung: e.target.value })}
                  placeholder="Optionale Beschreibung"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsKategorieFormOpen(false)
                    resetKategorieForm()
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-light"
                  disabled={submitting}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 font-light"
                  disabled={submitting}
                >
                  {submitting ? "Wird gespeichert..." : "Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
