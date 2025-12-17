"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Sidebar from "../../components/common/Sidebar"
import { buchungenService } from "../../services/buchungenService"
import { kundenService } from "../../services/kundenService"
import { mitarbeiterService } from "../../services/mitarbeiterService"
import { behandlungenService } from "../../services/behandlungenService"
import { filialenService } from "../../services/filialenService"
import type { Database } from "../../types/database.types"

type Kunde = Database["public"]["Tables"]["kunden"]["Row"]
type Mitarbeiter = Database["public"]["Tables"]["mitarbeiter"]["Row"]
type Behandlung = Database["public"]["Tables"]["behandlungen"]["Row"]
type Filiale = Database["public"]["Tables"]["filialen"]["Row"]
type Buchung = Database["public"]["Tables"]["buchungen"]["Row"]

type Status = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"

interface BuchungWithRelations extends Buchung {
  kunden?: Kunde | null
  mitarbeiter?: Mitarbeiter | null
  behandlung?: Behandlung | null
  filiale?: Filiale | null
}

const SLOT_MINUTES = 15
const SLOT_HEIGHT = 24 // px pro 15 min
const START_HOUR = 8
const END_HOUR = 20

function pad2(n: number) {
  return String(n).padStart(2, "0")
}
function toLocalYMD(d: Date) {
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  return `${y}-${m}-${day}`
}
function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}
function setTimeOnDate(d: Date, hh: number, mm: number) {
  const x = new Date(d)
  x.setHours(hh, mm, 0, 0)
  return x
}
function minutesBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 60000)
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
function formatHHMM(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function safeDate(v: any) {
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

/** simple overlap layout: splits overlapping bookings into columns */
function layoutEvents(events: BuchungWithRelations[], dayStart: Date) {
  const sorted = [...events].sort((a, b) => {
    const sa = safeDate((a as any).start_at)?.getTime() ?? 0
    const sb = safeDate((b as any).start_at)?.getTime() ?? 0
    return sa - sb
  })

  type Item = {
    b: BuchungWithRelations
    startMin: number
    endMin: number
    col: number
    colCount: number
  }

  const items: Item[] = []
  const active: Item[] = []

  for (const b of sorted) {
    const s = safeDate((b as any).start_at)
    const e = safeDate((b as any).end_at)
    if (!s || !e) continue

    const startMin = minutesBetween(dayStart, s)
    const endMin = minutesBetween(dayStart, e)

    // clear inactive
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].endMin <= startMin) active.splice(i, 1)
    }

    // find smallest free col
    const used = new Set(active.map((x) => x.col))
    let col = 0
    while (used.has(col)) col++

    const item: Item = { b, startMin, endMin, col, colCount: 1 }
    items.push(item)
    active.push(item)

    const maxCol = Math.max(...active.map((x) => x.col))
    const count = maxCol + 1
    for (const x of active) x.colCount = count
  }

  return items
}

export default function OnlineKalenderPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [kunden, setKunden] = useState<Kunde[]>([])
  const [mitarbeiter, setMitarbeiter] = useState<Mitarbeiter[]>([])
  const [behandlungen, setBehandlungen] = useState<Behandlung[]>([])
  const [filialen, setFilialen] = useState<Filiale[]>([])
  const [buchungen, setBuchungen] = useState<BuchungWithRelations[]>([])

  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()))
  const [selectedFilialeId, setSelectedFilialeId] = useState<string>("all")
  const [selectedMitarbeiterId, setSelectedMitarbeiterId] = useState<string>("all")

  // Modal: neue Buchung / edit
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formKundeId, setFormKundeId] = useState<string>("")
  const [formMitarbeiterId, setFormMitarbeiterId] = useState<string>("")
  const [formBehandlungId, setFormBehandlungId] = useState<string>("")
  const [formFilialeId, setFormFilialeId] = useState<string>("")
  const [formStatus, setFormStatus] = useState<Status>("confirmed")
  const [formNotiz, setFormNotiz] = useState<string>("")
  const [formStartHHMM, setFormStartHHMM] = useState<string>("10:00")
  const [formDurationMin, setFormDurationMin] = useState<number>(45)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  const timeSlots = useMemo(() => {
    const slots: { hh: number; mm: number; label: string }[] = []
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      for (let m = 0; m < 60; m += SLOT_MINUTES) {
        if (h === END_HOUR && m > 0) break
        slots.push({ hh: h, mm: m, label: `${pad2(h)}:${pad2(m)}` })
      }
    }
    return slots
  }, [])

  const dayStart = useMemo(() => setTimeOnDate(selectedDate, START_HOUR, 0), [selectedDate])
  const dayEnd = useMemo(() => setTimeOnDate(selectedDate, END_HOUR, 0), [selectedDate])

  const filteredMitarbeiter = useMemo(() => {
    let list = [...mitarbeiter]
    // Falls deine Mitarbeiter eine filiale_id haben, filtert das sauber.
    if (selectedFilialeId !== "all") {
      list = list.filter((m: any) => String((m as any).filiale_id ?? "") === selectedFilialeId)
    }
    if (selectedMitarbeiterId !== "all") {
      list = list.filter((m: any) => String((m as any).id) === selectedMitarbeiterId)
    }
    return list
  }, [mitarbeiter, selectedFilialeId, selectedMitarbeiterId])

  const dayBookings = useMemo(() => {
    const ymd = toLocalYMD(selectedDate)
    let list = buchungen.filter((b) => {
      const s = safeDate((b as any).start_at)
      if (!s) return false
      return toLocalYMD(s) === ymd
    })
    if (selectedFilialeId !== "all") {
      list = list.filter((b: any) => String((b as any).filiale_id ?? "") === selectedFilialeId)
    }
    if (selectedMitarbeiterId !== "all") {
      list = list.filter((b: any) => String((b as any).mitarbeiter_id ?? "") === selectedMitarbeiterId)
    }
    return list
  }, [buchungen, selectedDate, selectedFilialeId, selectedMitarbeiterId])

  const bookingsByEmployee = useMemo(() => {
    const map = new Map<string, BuchungWithRelations[]>()
    for (const b of dayBookings) {
      const empId = String((b as any).mitarbeiter_id ?? "")
      if (!map.has(empId)) map.set(empId, [])
      map.get(empId)!.push(b)
    }
    return map
  }, [dayBookings])

  async function loadAll() {
    setLoading(true)
    setError(null)

    try {
      // Diese Services hast du bereits im Projekt – wie bei Buchungen-Seite.
      const [kRes, mRes, bRes, fRes, buRes] = await Promise.all([
        kundenService.getAll(),
        mitarbeiterService.getAll(),
        behandlungenService.getAll(),
        filialenService.getAll(),
        buchungenService.getAll(),
      ])

      // Annahme: { data, error } Pattern (wie Supabase)
      const kErr = (kRes as any)?.error
      const mErr = (mRes as any)?.error
      const bErr = (bRes as any)?.error
      const fErr = (fRes as any)?.error
      const buErr = (buRes as any)?.error

      if (kErr || mErr || bErr || fErr || buErr) {
        throw new Error(
          kErr?.message || mErr?.message || bErr?.message || fErr?.message || buErr?.message || "Fehler beim Laden"
        )
      }

      const k = ((kRes as any)?.data ?? []) as Kunde[]
      const m = ((mRes as any)?.data ?? []) as Mitarbeiter[]
      const be = ((bRes as any)?.data ?? []) as Behandlung[]
      const f = ((fRes as any)?.data ?? []) as Filiale[]
      const bu = ((buRes as any)?.data ?? []) as Buchung[]

      setKunden(k)
      setMitarbeiter(m)
      setBehandlungen(be)
      setFilialen(f)

      // Relations mappen (schnell & stabil)
      const kMap = new Map(k.map((x: any) => [String(x.id), x]))
      const mMap = new Map(m.map((x: any) => [String(x.id), x]))
      const beMap = new Map(be.map((x: any) => [String(x.id), x]))
      const fMap = new Map(f.map((x: any) => [String(x.id), x]))

      const withRel: BuchungWithRelations[] = bu.map((x: any) => ({
        ...(x as any),
        kunden: x.kunde_id ? (kMap.get(String(x.kunde_id)) ?? null) : null,
        mitarbeiter: x.mitarbeiter_id ? (mMap.get(String(x.mitarbeiter_id)) ?? null) : null,
        behandlung: x.behandlung_id ? (beMap.get(String(x.behandlung_id)) ?? null) : null,
        filiale: x.filiale_id ? (fMap.get(String(x.filiale_id)) ?? null) : null,
      }))

      setBuchungen(withRel)
    } catch (e: any) {
      setError(e?.message ?? "Unbekannter Fehler")
    } finally {
      setLoading(false)
      // auto-scroll Richtung 10:00
      setTimeout(() => {
        if (!scrollRef.current) return
        const targetMin = (10 - START_HOUR) * 60
        const y = (targetMin / SLOT_MINUTES) * SLOT_HEIGHT
        scrollRef.current.scrollTop = y
      }, 50)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openCreateModalAt(empId: string, hhmm: string) {
    setEditingId(null)
    setModalOpen(true)
    setFormMitarbeiterId(empId)
    setFormStartHHMM(hhmm)
    setFormDurationMin(45)
    setFormStatus("confirmed")
    setFormNotiz("")

    // default: Filiale aus Filter oder vom Mitarbeiter (falls vorhanden)
    if (selectedFilialeId !== "all") setFormFilialeId(selectedFilialeId)
    else {
      const emp = mitarbeiter.find((x: any) => String(x.id) === empId) as any
      setFormFilialeId(String(emp?.filiale_id ?? ""))
    }
  }

  function openEditModal(b: BuchungWithRelations) {
    const s = safeDate((b as any).start_at)
    const e = safeDate((b as any).end_at)
    if (!s || !e) return

    setEditingId(String((b as any).id))
    setModalOpen(true)

    setFormKundeId(String((b as any).kunde_id ?? ""))
    setFormMitarbeiterId(String((b as any).mitarbeiter_id ?? ""))
    setFormBehandlungId(String((b as any).behandlung_id ?? ""))
    setFormFilialeId(String((b as any).filiale_id ?? ""))
    setFormStatus(((b as any).status ?? "confirmed") as Status)
    setFormNotiz(String((b as any).notiz ?? ""))

    setFormStartHHMM(formatHHMM(s))
    setFormDurationMin(Math.max(15, minutesBetween(s, e)))
  }

  async function submitModal() {
    const [hh, mm] = formStartHHMM.split(":").map((x) => parseInt(x, 10))
    const start = setTimeOnDate(selectedDate, hh || 0, mm || 0)
    const end = new Date(start.getTime() + Math.max(15, formDurationMin) * 60000)

    const payload: any = {
      kunde_id: formKundeId || null,
      mitarbeiter_id: formMitarbeiterId || null,
      behandlung_id: formBehandlungId || null,
      filiale_id: formFilialeId || null,
      status: formStatus,
      notiz: formNotiz || null,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
    }

    try {
      setLoading(true)
      setError(null)

      if (editingId) {
        const res = await (buchungenService as any).update(editingId, payload)
        if ((res as any)?.error) throw new Error((res as any).error.message)
      } else {
        const res = await (buchungenService as any).create(payload)
        if ((res as any)?.error) throw new Error((res as any).error.message)
      }

      setModalOpen(false)
      await loadAll()
    } catch (e: any) {
      setError(e?.message ?? "Speichern fehlgeschlagen")
      setLoading(false)
    }
  }

  async function moveBooking(bookingId: string, newEmpId: string, newStart: Date) {
    const b = buchungen.find((x: any) => String((x as any).id) === bookingId)
    if (!b) return

    const oldStart = safeDate((b as any).start_at)
    const oldEnd = safeDate((b as any).end_at)
    if (!oldStart || !oldEnd) return

    const dur = Math.max(15, minutesBetween(oldStart, oldEnd))
    const newEnd = new Date(newStart.getTime() + dur * 60000)

    const payload: any = {
      mitarbeiter_id: newEmpId,
      start_at: newStart.toISOString(),
      end_at: newEnd.toISOString(),
    }

    try {
      const res = await (buchungenService as any).update(bookingId, payload)
      if ((res as any)?.error) throw new Error((res as any).error.message)
      await loadAll()
    } catch (e: any) {
      setError(e?.message ?? "Verschieben fehlgeschlagen")
    }
  }

  const gridHeight = useMemo(() => {
    const totalMinutes = (END_HOUR - START_HOUR) * 60
    const slots = totalMinutes / SLOT_MINUTES
    return slots * SLOT_HEIGHT
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Online Kalender</h1>
            <p className="mt-1 text-sm text-gray-500">
              Tagesansicht · Drag & Drop · Klick auf freien Slot = neue Buchung
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedDate(startOfDay(new Date()))}
              className="rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Heute
            </button>

            <button
              onClick={() => setSelectedDate((d) => startOfDay(addDays(d, -1)))}
              className="rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              ←
            </button>

            <input
              type="date"
              value={toLocalYMD(selectedDate)}
              onChange={(e) => setSelectedDate(startOfDay(new Date(e.target.value + "T00:00:00")))}
              className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700"
            />

            <button
              onClick={() => setSelectedDate((d) => startOfDay(addDays(d, 1)))}
              className="rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              →
            </button>

            <select
              value={selectedFilialeId}
              onChange={(e) => setSelectedFilialeId(e.target.value)}
              className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700"
            >
              <option value="all">Alle Filialen</option>
              {filialen.map((f: any) => (
                <option key={String(f.id)} value={String(f.id)}>
                  {String((f as any).name ?? (f as any).titel ?? "Filiale")}
                </option>
              ))}
            </select>

            <select
              value={selectedMitarbeiterId}
              onChange={(e) => setSelectedMitarbeiterId(e.target.value)}
              className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700"
            >
              <option value="all">Alle Mitarbeiter</option>
              {mitarbeiter.map((m: any) => (
                <option key={String(m.id)} value={String(m.id)}>
                  {String((m as any).name ?? (m as any).vorname ?? "Mitarbeiter")}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                // default: 10:00 + erster Mitarbeiter
                const first = filteredMitarbeiter[0] as any
                if (!first) return setError("Keine Mitarbeiter vorhanden (Filter?)")
                openCreateModalAt(String(first.id), "10:00")
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              + Neue Buchung
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 rounded-xl border bg-white">
          <div className="flex items-stretch">
            {/* Zeitachse */}
            <div className="w-20 border-r bg-gray-50">
              <div className="h-14 border-b" />
              <div className="relative" style={{ height: gridHeight }}>
                {timeSlots.map((s) => {
                  const isHour = s.mm === 0
                  const top = ((s.hh - START_HOUR) * 60 + s.mm) / SLOT_MINUTES * SLOT_HEIGHT
                  return (
                    <div
                      key={s.label}
                      className="absolute left-0 right-0 pr-2 text-right text-xs text-gray-500"
                      style={{ top: top - 8 }}
                    >
                      {isHour ? s.label : ""}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Kalender-Grid */}
            <div className="flex-1 overflow-hidden">
              {/* Header (Mitarbeiter) */}
              <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.max(1, filteredMitarbeiter.length)}, minmax(220px, 1fr))` }}>
                {filteredMitarbeiter.length === 0 ? (
                  <div className="h-14 border-b px-4 py-3 text-sm text-gray-600">
                    Keine Mitarbeiter im Filter
                  </div>
                ) : (
                  filteredMitarbeiter.map((m: any) => (
                    <div key={String(m.id)} className="h-14 border-b border-l px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">
                        {String(m.name ?? m.vorname ?? "Mitarbeiter")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {String(m.position ?? "")}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div ref={scrollRef} className="h-[70vh] overflow-auto">
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${Math.max(1, filteredMitarbeiter.length)}, minmax(220px, 1fr))`,
                  }}
                >
                  {filteredMitarbeiter.map((m: any) => {
                    const empId = String(m.id)
                    const empBookings = bookingsByEmployee.get(empId) ?? []
                    const laidOut = layoutEvents(empBookings, startOfDay(selectedDate))

                    return (
                      <div
                        key={empId}
                        className="relative border-l"
                        style={{ height: gridHeight }}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        {/* Slot-Linien + Drop-Zonen */}
                        {timeSlots.map((s) => {
                          const slotTop = ((s.hh - START_HOUR) * 60 + s.mm) / SLOT_MINUTES * SLOT_HEIGHT
                          const slotStart = setTimeOnDate(selectedDate, s.hh, s.mm)
                          const disabled = slotStart < dayStart || slotStart > dayEnd

                          return (
                            <div
                              key={s.label}
                              className={`absolute left-0 right-0 border-t ${s.mm === 0 ? "border-gray-200" : "border-gray-100"} `}
                              style={{ top: slotTop, height: SLOT_HEIGHT }}
                              onClick={() => {
                                if (disabled) return
                                openCreateModalAt(empId, s.label)
                              }}
                              onDrop={(e) => {
                                e.preventDefault()
                                const bookingId = e.dataTransfer.getData("text/bookingId")
                                if (!bookingId) return
                                moveBooking(bookingId, empId, slotStart)
                              }}
                            />
                          )
                        })}

                        {/* Buchungen */}
                        {laidOut.map((it) => {
                          const s = safeDate((it.b as any).start_at)
                          const e = safeDate((it.b as any).end_at)
                          if (!s || !e) return null

                          const day0 = startOfDay(selectedDate)
                          const startMin = minutesBetween(day0, s)
                          const endMin = minutesBetween(day0, e)

                          const visibleStart = clamp(startMin, START_HOUR * 60, END_HOUR * 60)
                          const visibleEnd = clamp(endMin, START_HOUR * 60, END_HOUR * 60)

                          const top = ((visibleStart - START_HOUR * 60) / SLOT_MINUTES) * SLOT_HEIGHT
                          const height = Math.max(SLOT_HEIGHT, ((visibleEnd - visibleStart) / SLOT_MINUTES) * SLOT_HEIGHT)

                          const widthPct = 100 / it.colCount
                          const leftPct = it.col * widthPct

                          const kundeName = (it.b.kunden as any)?.name ?? (it.b.kunden as any)?.vorname ?? "Kunde"
                          const behandlungName = (it.b.behandlung as any)?.name ?? (it.b as any)?.behandlung_id ?? ""

                          return (
                            <div
                              key={String((it.b as any).id)}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("text/bookingId", String((it.b as any).id))
                                e.dataTransfer.effectAllowed = "move"
                              }}
                              onClick={() => openEditModal(it.b)}
                              className="absolute z-10 cursor-pointer rounded-lg border bg-indigo-50 px-2 py-1 text-xs text-gray-800 shadow-sm hover:bg-indigo-100"
                              style={{
                                top,
                                height,
                                left: `calc(${leftPct}% + 6px)`,
                                width: `calc(${widthPct}% - 12px)`,
                              }}
                              title="Klicken zum Bearbeiten, ziehen zum Verschieben"
                            >
                              <div className="font-semibold text-gray-900">{kundeName}</div>
                              <div className="text-gray-600">{behandlungName}</div>
                              <div className="mt-1 text-[11px] text-gray-500">
                                {formatHHMM(s)} – {formatHHMM(e)}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="border-t p-3 text-sm text-gray-500">Lade Daten…</div>
          )}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {editingId ? "Buchung bearbeiten" : "Neue Buchung"}
                  </div>
                  <div className="text-sm text-gray-500">{toLocalYMD(selectedDate)}</div>
                </div>
                <button
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                  onClick={() => setModalOpen(false)}
                >
                  Schließen
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs text-gray-600">Kunde</label>
                  <select
                    value={formKundeId}
                    onChange={(e) => setFormKundeId(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">— auswählen —</option>
                    {kunden.map((k: any) => (
                      <option key={String(k.id)} value={String(k.id)}>
                        {String(k.name ?? k.vorname ?? "Kunde")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600">Mitarbeiter</label>
                  <select
                    value={formMitarbeiterId}
                    onChange={(e) => setFormMitarbeiterId(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">— auswählen —</option>
                    {mitarbeiter.map((m: any) => (
                      <option key={String(m.id)} value={String(m.id)}>
                        {String(m.name ?? m.vorname ?? "Mitarbeiter")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600">Behandlung</label>
                  <select
                    value={formBehandlungId}
                    onChange={(e) => setFormBehandlungId(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">— auswählen —</option>
                    {behandlungen.map((b: any) => (
                      <option key={String(b.id)} value={String(b.id)}>
                        {String(b.name ?? "Behandlung")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600">Filiale</label>
                  <select
                    value={formFilialeId}
                    onChange={(e) => setFormFilialeId(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">— auswählen —</option>
                    {filialen.map((f: any) => (
                      <option key={String(f.id)} value={String(f.id)}>
                        {String((f as any).name ?? (f as any).titel ?? "Filiale")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600">Start</label>
                  <input
                    type="time"
                    value={formStartHHMM}
                    step={SLOT_MINUTES * 60}
                    onChange={(e) => setFormStartHHMM(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Dauer (Min.)</label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={formDurationMin}
                    onChange={(e) => setFormDurationMin(parseInt(e.target.value || "45", 10))}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as Status)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="scheduled">Geplant</option>
                    <option value="confirmed">Bestätigt</option>
                    <option value="completed">Erledigt</option>
                    <option value="cancelled">Storniert</option>
                    <option value="no_show">No-Show</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600">Notiz</label>
                  <textarea
                    value={formNotiz}
                    onChange={(e) => setFormNotiz(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={() => setModalOpen(false)}
                >
                  Abbrechen
                </button>
                <button
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  onClick={submitModal}
                >
                  Speichern
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Tipp: Termin im Kalender ziehen = verschieben. Klick = bearbeiten.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
