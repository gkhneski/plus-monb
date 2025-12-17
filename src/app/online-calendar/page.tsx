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
type ViewMode = "day_employees" | "week" | "day_resources"

interface BuchungWithRelations extends Buchung {
  kunden?: Kunde | null
  mitarbeiter?: Mitarbeiter | null
  behandlung?: Behandlung | null
  filiale?: Filiale | null
}

const SLOT_MINUTES = 15
const SLOT_HEIGHT = 24
const START_HOUR = 8
const END_HOUR = 20

const DAY_NAMES = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

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
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd
}
function startOfWeekMonday(d: Date) {
  const x = startOfDay(d)
  const day = x.getDay() // 0=So ... 6=Sa
  const diff = day === 0 ? -6 : 1 - day
  return startOfDay(addDays(x, diff))
}
function formatDM(d: Date) {
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`
}

const FALLBACK_COLORS = ["#4F46E5", "#16A34A", "#DC2626", "#D97706", "#0EA5E9", "#7C3AED", "#E11D48"]
function getEmployeeColor(m: any, idx: number) {
  const c = String(m?.colorHex ?? m?.color_hex ?? m?.farbe ?? "")
  if (c && c.startsWith("#") && (c.length === 7 || c.length === 4)) return c
  return FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
}
function statusStyle(status: Status) {
  switch (status) {
    case "confirmed":
      return { bg: "bg-green-50 hover:bg-green-100", border: "border-green-200", badge: "bg-green-100 text-green-800" }
    case "scheduled":
      return { bg: "bg-blue-50 hover:bg-blue-100", border: "border-blue-200", badge: "bg-blue-100 text-blue-800" }
    case "completed":
      return { bg: "bg-gray-50 hover:bg-gray-100", border: "border-gray-200", badge: "bg-gray-100 text-gray-700" }
    case "cancelled":
      return { bg: "bg-red-50 hover:bg-red-100", border: "border-red-200", badge: "bg-red-100 text-red-800" }
    case "no_show":
      return { bg: "bg-orange-50 hover:bg-orange-100", border: "border-orange-200", badge: "bg-orange-100 text-orange-800" }
    default:
      return { bg: "bg-indigo-50 hover:bg-indigo-100", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-800" }
  }
}

/** overlap layout: splits overlapping bookings into columns */
function layoutEvents(events: BuchungWithRelations[], dayStart0: Date) {
  const sorted = [...events].sort((a, b) => {
    const sa = safeDate((a as any).start_at)?.getTime() ?? 0
    const sb = safeDate((b as any).start_at)?.getTime() ?? 0
    return sa - sb
  })

  type Item = { b: BuchungWithRelations; startMin: number; endMin: number; col: number; colCount: number }
  const items: Item[] = []
  const active: Item[] = []

  for (const b of sorted) {
    const s = safeDate((b as any).start_at)
    const e = safeDate((b as any).end_at)
    if (!s || !e) continue

    const startMin = minutesBetween(dayStart0, s)
    const endMin = minutesBetween(dayStart0, e)

    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].endMin <= startMin) active.splice(i, 1)
    }

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

  // Ansicht
  const [viewMode, setViewMode] = useState<ViewMode>("day_employees")

  // Tag / Woche
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()))
  const [anchorDate, setAnchorDate] = useState<Date>(() => startOfDay(new Date()))

  // Filter
  const [selectedFilialeId, setSelectedFilialeId] = useState<string>("all")
  const [selectedMitarbeiterId, setSelectedMitarbeiterId] = useState<string>("all")
  const [searchText, setSearchText] = useState<string>("")

  // Right panel (statt Modal)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeDate, setActiveDate] = useState<Date>(() => startOfDay(new Date()))
  const [selectedBooking, setSelectedBooking] = useState<BuchungWithRelations | null>(null)

  // Form
  const [formKundeId, setFormKundeId] = useState<string>("")
  const [formMitarbeiterId, setFormMitarbeiterId] = useState<string>("")
  const [formBehandlungId, setFormBehandlungId] = useState<string>("")
  const [formFilialeId, setFormFilialeId] = useState<string>("")
  const [formStatus, setFormStatus] = useState<Status>("confirmed")
  const [formNotiz, setFormNotiz] = useState<string>("")
  const [formStartHHMM, setFormStartHHMM] = useState<string>("10:00")
  const [formDurationMin, setFormDurationMin] = useState<number>(45)
  const [formResourceId, setFormResourceId] = useState<string>("unassigned")

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

  const gridHeight = useMemo(() => {
    const totalMinutes = (END_HOUR - START_HOUR) * 60
    const slots = totalMinutes / SLOT_MINUTES
    return slots * SLOT_HEIGHT
  }, [])

  const dayStart = useMemo(() => setTimeOnDate(selectedDate, START_HOUR, 0), [selectedDate])
  const dayEnd = useMemo(() => setTimeOnDate(selectedDate, END_HOUR, 0), [selectedDate])

  // Woche
  const weekStart = useMemo(() => startOfWeekMonday(anchorDate), [anchorDate])
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])
  const weekLabel = useMemo(() => `${formatDM(weekStart)} – ${formatDM(weekEnd)}`, [weekStart, weekEnd])

  // Ressourcen-Feld automatisch erkennen (resource_id / room_id / device_id)
  const resourceField = useMemo<null | "resource_id" | "room_id" | "device_id">(() => {
    const fields = ["resource_id", "room_id", "device_id"] as const
    for (const f of fields) {
      if (buchungen.some((b: any) => Object.prototype.hasOwnProperty.call(b, f))) return f
    }
    return null
  }, [buchungen])

  const resources = useMemo(() => {
    if (!resourceField) return [{ id: "unassigned", name: "Nicht zugewiesen" }]

    const set = new Set<string>()
    for (const b of buchungen as any[]) {
      const v = b?.[resourceField]
      if (v) set.add(String(v))
    }
    const vals = Array.from(set).sort()
    return [{ id: "unassigned", name: "Nicht zugewiesen" }, ...vals.map((v) => ({ id: v, name: v }))]
  }, [buchungen, resourceField])

  const filteredMitarbeiter = useMemo(() => {
    let list = [...mitarbeiter]
    if (selectedFilialeId !== "all") {
      list = list.filter((m: any) => String((m as any).filiale_id ?? "") === selectedFilialeId)
    }
    if (selectedMitarbeiterId !== "all") {
      list = list.filter((m: any) => String((m as any).id) === selectedMitarbeiterId)
    }
    return list
  }, [mitarbeiter, selectedFilialeId, selectedMitarbeiterId])

  // ---- Daten laden (unverändert aus deinem Page-Stand) ----
  async function loadAll() {
    setLoading(true)
    setError(null)

    try {
      const [kRes, mRes, bRes, fRes, buRes] = await Promise.all([
        kundenService.getAll(),
        mitarbeiterService.getAll(),
        behandlungenService.getAll(),
        filialenService.getAll(),
        buchungenService.getAll(),
      ])

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
      setTimeout(() => {
        if (!scrollRef.current) return
        const targetMin = (10 - START_HOUR) * 60
        scrollRef.current.scrollTop = (targetMin / SLOT_MINUTES) * SLOT_HEIGHT
      }, 50)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Filtered bookings ----
  const dayBookings = useMemo(() => {
    const ymd = toLocalYMD(selectedDate)

    let list = buchungen.filter((b) => {
      const s = safeDate((b as any).start_at)
      if (!s) return false
      return toLocalYMD(s) === ymd
    })

    if (selectedFilialeId !== "all") list = list.filter((b: any) => String((b as any).filiale_id ?? "") === selectedFilialeId)
    if (selectedMitarbeiterId !== "all") list = list.filter((b: any) => String((b as any).mitarbeiter_id ?? "") === selectedMitarbeiterId)

    const q = searchText.trim().toLowerCase()
    if (q) {
      list = list.filter((b: any) => {
        const k = String((b.kunden as any)?.name ?? (b.kunden as any)?.vorname ?? "").toLowerCase()
        const t = String((b.behandlung as any)?.name ?? "").toLowerCase()
        const n = String((b as any)?.notiz ?? "").toLowerCase()
        return k.includes(q) || t.includes(q) || n.includes(q)
      })
    }

    return list
  }, [buchungen, selectedDate, selectedFilialeId, selectedMitarbeiterId, searchText])

  const bookingsByEmployee = useMemo(() => {
    const map = new Map<string, BuchungWithRelations[]>()
    for (const b of dayBookings) {
      const empId = String((b as any).mitarbeiter_id ?? "")
      if (!map.has(empId)) map.set(empId, [])
      map.get(empId)!.push(b)
    }
    return map
  }, [dayBookings])

  const bookingsByResource = useMemo(() => {
    const map = new Map<string, BuchungWithRelations[]>()
    for (const r of resources) map.set(r.id, [])
    for (const b of dayBookings as any[]) {
      const rid = resourceField ? String(b?.[resourceField] ?? "unassigned") : "unassigned"
      if (!map.has(rid)) map.set(rid, [])
      map.get(rid)!.push(b)
    }
    return map
  }, [dayBookings, resources, resourceField])

  const weekBookings = useMemo(() => {
    const startY = toLocalYMD(weekStart)
    const endY = toLocalYMD(addDays(weekEnd, 1)) // exklusiv

    let list = buchungen.filter((b) => {
      const s = safeDate((b as any).start_at)
      if (!s) return false
      const y = toLocalYMD(s)
      return y >= startY && y < endY
    })

    if (selectedFilialeId !== "all") list = list.filter((b: any) => String((b as any).filiale_id ?? "") === selectedFilialeId)
    if (selectedMitarbeiterId !== "all") list = list.filter((b: any) => String((b as any).mitarbeiter_id ?? "") === selectedMitarbeiterId)

    const q = searchText.trim().toLowerCase()
    if (q) {
      list = list.filter((b: any) => {
        const k = String((b.kunden as any)?.name ?? (b.kunden as any)?.vorname ?? "").toLowerCase()
        const t = String((b.behandlung as any)?.name ?? "").toLowerCase()
        const n = String((b as any)?.notiz ?? "").toLowerCase()
        return k.includes(q) || t.includes(q) || n.includes(q)
      })
    }

    return list
  }, [buchungen, weekStart, weekEnd, selectedFilialeId, selectedMitarbeiterId, searchText])

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, BuchungWithRelations[]>()
    for (const d of weekDays) map.set(toLocalYMD(d), [])
    for (const b of weekBookings) {
      const s = safeDate((b as any).start_at)
      if (!s) continue
      const key = toLocalYMD(s)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(b)
    }
    return map
  }, [weekBookings, weekDays])

  // ---- Panel open helpers (statt Modal) ----
  function openCreatePanelAt(opts: { date: Date; hhmm: string; empId?: string; resourceId?: string }) {
    setError(null)
    setPanelOpen(true)
    setEditingId(null)
    setSelectedBooking(null)

    const d = startOfDay(opts.date)
    setActiveDate(d)
    setSelectedDate(d)

    setFormStartHHMM(opts.hhmm)
    setFormDurationMin(45)
    setFormStatus("confirmed")
    setFormNotiz("")
    setFormKundeId("")
    setFormBehandlungId("")

    const defaultEmp =
      opts.empId ??
      (selectedMitarbeiterId !== "all" ? selectedMitarbeiterId : String((filteredMitarbeiter[0] as any)?.id ?? (mitarbeiter[0] as any)?.id ?? ""))
    setFormMitarbeiterId(defaultEmp)

    if (selectedFilialeId !== "all") setFormFilialeId(selectedFilialeId)
    else {
      const emp = mitarbeiter.find((x: any) => String(x.id) === String(defaultEmp)) as any
      setFormFilialeId(String(emp?.filiale_id ?? ""))
    }

    const rid = opts.resourceId ?? "unassigned"
    setFormResourceId(rid)
  }

  function openEditPanel(b: BuchungWithRelations) {
    const s = safeDate((b as any).start_at)
    const e = safeDate((b as any).end_at)
    if (!s || !e) return

    setError(null)
    setPanelOpen(true)
    setEditingId(String((b as any).id))
    setSelectedBooking(b)
    setActiveDate(startOfDay(s))
    setSelectedDate(startOfDay(s))

    setFormKundeId(String((b as any).kunde_id ?? ""))
    setFormMitarbeiterId(String((b as any).mitarbeiter_id ?? ""))
    setFormBehandlungId(String((b as any).behandlung_id ?? ""))
    setFormFilialeId(String((b as any).filiale_id ?? ""))
    setFormStatus(((b as any).status ?? "confirmed") as Status)
    setFormNotiz(String((b as any).notiz ?? ""))

    setFormStartHHMM(formatHHMM(s))
    setFormDurationMin(Math.max(15, minutesBetween(s, e)))

    const rid = resourceField ? String((b as any)[resourceField] ?? "unassigned") : "unassigned"
    setFormResourceId(rid)
  }

  function buildStartEndFromForm() {
    const [hh, mm] = formStartHHMM.split(":").map((x) => parseInt(x, 10))
    const start = setTimeOnDate(activeDate, hh || 0, mm || 0)
    const end = new Date(start.getTime() + Math.max(15, formDurationMin) * 60000)
    return { start, end }
  }

  function checkConflict(empId: string, start: Date, end: Date) {
    const ymd = toLocalYMD(start)
    const list = buchungen
      .filter((x: any) => {
        const s = safeDate((x as any).start_at)
        if (!s) return false
        return toLocalYMD(s) === ymd
      })
      .filter((x: any) => String((x as any).mitarbeiter_id ?? "") === String(empId))
      .filter((x: any) => (editingId ? String((x as any).id) !== String(editingId) : true))

    for (const b of list) {
      const s = safeDate((b as any).start_at)
      const e = safeDate((b as any).end_at)
      if (!s || !e) continue
      if (overlaps(start, end, s, e)) return b
    }
    return null
  }

  async function saveFromPanel() {
    const { start, end } = buildStartEndFromForm()

    if (!formMitarbeiterId) return setError("Bitte Mitarbeiter auswählen.")
    if (!formKundeId) return setError("Bitte Kunde auswählen.")
    if (!formBehandlungId) return setError("Bitte Behandlung auswählen.")
    if (!formFilialeId) return setError("Bitte Filiale auswählen.")

    const startLimit = setTimeOnDate(activeDate, START_HOUR, 0)
    const endLimit = setTimeOnDate(activeDate, END_HOUR, 0)
    if (start < startLimit || end > new Date(endLimit.getTime() + 60_000)) {
      return setError(`Bitte nur zwischen ${pad2(START_HOUR)}:00 und ${pad2(END_HOUR)}:00 planen.`)
    }

    const conflict = checkConflict(formMitarbeiterId, start, end)
    if (conflict) {
      const cs = safeDate((conflict as any).start_at)
      const ce = safeDate((conflict as any).end_at)
      return setError(`Konflikt: Mitarbeiter hat bereits ${cs ? formatHHMM(cs) : ""}–${ce ? formatHHMM(ce) : ""}.`)
    }

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

    // Ressource nur setzen, wenn DB-Feld erkannt wurde (sonst riskierst du DB-Error)
    if (resourceField) {
      payload[resourceField] = formResourceId === "unassigned" ? null : formResourceId
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

      await loadAll()
      // Panel bleibt offen, damit du schnell weiter klicken kannst
      setSelectedBooking(null)
      setEditingId(null)
    } catch (e: any) {
      setError(e?.message ?? "Speichern fehlgeschlagen")
      setLoading(false)
    }
  }

  async function deleteFromPanel() {
    if (!editingId) return
    try {
      setLoading(true)
      setError(null)

      const svc: any = buchungenService as any
      const fn = svc.remove || svc.delete || svc.deleteById || svc.destroy || svc.removeById
      if (!fn) throw new Error("Delete-Funktion im buchungenService nicht gefunden (remove/delete).")

      const res = await fn(editingId)
      if (res?.error) throw new Error(res.error.message)

      await loadAll()
      setSelectedBooking(null)
      setEditingId(null)
    } catch (e: any) {
      setError(e?.message ?? "Löschen fehlgeschlagen")
      setLoading(false)
    }
  }

  // ---- Drag/Drop Moves ----
  async function moveBookingDayEmployee(bookingId: string, newEmpId: string, newStart: Date) {
    const b = buchungen.find((x: any) => String((x as any).id) === bookingId)
    if (!b) return

    const oldStart = safeDate((b as any).start_at)
    const oldEnd = safeDate((b as any).end_at)
    if (!oldStart || !oldEnd) return

    const dur = Math.max(15, minutesBetween(oldStart, oldEnd))
    const newEnd = new Date(newStart.getTime() + dur * 60000)

    const conflict = checkConflict(newEmpId, newStart, newEnd)
    if (conflict) return setError("Verschieben nicht möglich: Termin-Konflikt beim Mitarbeiter.")

    try {
      const res = await (buchungenService as any).update(bookingId, {
        mitarbeiter_id: newEmpId,
        start_at: newStart.toISOString(),
        end_at: newEnd.toISOString(),
      })
      if ((res as any)?.error) throw new Error((res as any).error.message)
      await loadAll()
    } catch (e: any) {
      setError(e?.message ?? "Verschieben fehlgeschlagen")
    }
  }

  async function moveBookingWeek(bookingId: string, newStart: Date) {
    const b = buchungen.find((x: any) => String((x as any).id) === bookingId)
    if (!b) return

    const oldStart = safeDate((b as any).start_at)
    const oldEnd = safeDate((b as any).end_at)
    if (!oldStart || !oldEnd) return

    const dur = Math.max(15, minutesBetween(oldStart, oldEnd))
    const newEnd = new Date(newStart.getTime() + dur * 60000)
    const empId = String((b as any).mitarbeiter_id ?? "")

    const conflict = checkConflict(empId, newStart, newEnd)
    if (conflict) return setError("Verschieben nicht möglich: Termin-Konflikt beim Mitarbeiter.")

    try {
      const res = await (buchungenService as any).update(bookingId, {
        start_at: newStart.toISOString(),
        end_at: newEnd.toISOString(),
      })
      if ((res as any)?.error) throw new Error((res as any).error.message)
      await loadAll()
    } catch (e: any) {
      setError(e?.message ?? "Verschieben fehlgeschlagen")
    }
  }

  async function moveBookingDayResource(bookingId: string, newResourceId: string, newStart: Date) {
    const b = buchungen.find((x: any) => String((x as any).id) === bookingId)
    if (!b) return

    const oldStart = safeDate((b as any).start_at)
    const oldEnd = safeDate((b as any).end_at)
    if (!oldStart || !oldEnd) return

    const dur = Math.max(15, minutesBetween(oldStart, oldEnd))
    const newEnd = new Date(newStart.getTime() + dur * 60000)
    const empId = String((b as any).mitarbeiter_id ?? "")

    const conflict = checkConflict(empId, newStart, newEnd)
    if (conflict) return setError("Verschieben nicht möglich: Termin-Konflikt beim Mitarbeiter.")

    const payload: any = { start_at: newStart.toISOString(), end_at: newEnd.toISOString() }
    if (resourceField) payload[resourceField] = newResourceId === "unassigned" ? null : newResourceId

    try {
      const res = await (buchungenService as any).update(bookingId, payload)
      if ((res as any)?.error) throw new Error((res as any).error.message)
      await loadAll()
    } catch (e: any) {
      setError(e?.message ?? "Verschieben fehlgeschlagen")
    }
  }

  // ---- UI rendering ----
  function ViewModeButton({ mode, label }: { mode: ViewMode; label: string }) {
    const active = viewMode === mode
    return (
      <button
        onClick={() => setViewMode(mode)}
        className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
          active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        {label}
      </button>
    )
  }

  // Right panel content
  const panelTitle = useMemo(() => {
    if (!panelOpen) return "Details"
    if (editingId) return "Termin bearbeiten"
    return "Neuer Termin"
  }, [panelOpen, editingId])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Online Kalender</h1>
            <p className="mt-1 text-sm text-gray-500">
              Woche · Tag (Mitarbeiter) · Tag (Ressourcen) · Rechts-Panel statt Modal
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ViewModeButton mode="day_employees" label="Tag · Mitarbeiter" />
            <ViewModeButton mode="week" label="Woche (Mo–So)" />
            <ViewModeButton mode="day_resources" label="Tag · Ressourcen" />

            {viewMode === "week" ? (
              <>
                <button
                  onClick={() => setAnchorDate(startOfDay(new Date()))}
                  className="rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Diese Woche
                </button>
                <button
                  onClick={() => setAnchorDate((d) => startOfDay(addDays(d, -7)))}
                  className="rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  ← Woche
                </button>

                <input
                  type="date"
                  value={toLocalYMD(anchorDate)}
                  onChange={(e) => setAnchorDate(startOfDay(new Date(e.target.value + "T00:00:00")))}
                  className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700"
                />

                <button
                  onClick={() => setAnchorDate((d) => startOfDay(addDays(d, 7)))}
                  className="rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Woche →
                </button>

                <div className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700">{weekLabel}</div>
              </>
            ) : (
              <>
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
              </>
            )}

            <select
              value={selectedFilialeId}
              onChange={(e) => setSelectedFilialeId(e.target.value)}
              className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700"
            >
              <option value="all">Alle Filialen</option>
              {filialen.map((f: any) => (
                <option key={String(f.id)} value={String(f.id)}>
                  {String(f.name ?? f.titel ?? "Filiale")}
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
                  {String(m.name ?? m.vorname ?? "Mitarbeiter")}
                </option>
              ))}
            </select>

            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Suche: Kunde / Behandlung / Notiz"
              className="w-64 rounded-lg border bg-white px-3 py-2 text-sm text-gray-700"
            />

            <button
              onClick={() => {
                // Quick create: heute 10:00
                const d = viewMode === "week" ? startOfDay(new Date()) : selectedDate
                openCreatePanelAt({ date: d, hhmm: "10:00" })
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              + Neuer Termin
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Main area: Calendar + Right panel */}
        <div className="mt-6 flex gap-4">
          {/* Calendar */}
          <div className="flex-1 rounded-xl border bg-white overflow-hidden">
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

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {/* Headers */}
                {viewMode === "week" ? (
                  <div className="grid" style={{ gridTemplateColumns: "repeat(7, minmax(200px, 1fr))" }}>
                    {weekDays.map((d, idx) => {
                      const isToday = toLocalYMD(d) === toLocalYMD(new Date())
                      return (
                        <div key={toLocalYMD(d)} className="h-14 border-b border-l px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-gray-900">
                              {DAY_NAMES[idx]} <span className="text-gray-500">{formatDM(d)}</span>
                            </div>
                            {isToday && (
                              <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800">
                                Heute
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{(bookingsByDay.get(toLocalYMD(d)) ?? []).length} Termine</div>
                        </div>
                      )
                    })}
                  </div>
                ) : viewMode === "day_resources" ? (
                  <div
                    className="grid"
                    style={{ gridTemplateColumns: `repeat(${Math.max(1, resources.length)}, minmax(220px, 1fr))` }}
                  >
                    {resources.map((r) => (
                      <div key={r.id} className="h-14 border-b border-l px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900 truncate">{r.name}</div>
                        <div className="text-xs text-gray-500">
                          {resourceField ? "Ressource" : "Hinweis: Kein resource_id/room_id/device_id erkannt"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="grid"
                    style={{ gridTemplateColumns: `repeat(${Math.max(1, filteredMitarbeiter.length)}, minmax(220px, 1fr))` }}
                  >
                    {filteredMitarbeiter.length === 0 ? (
                      <div className="h-14 border-b px-4 py-3 text-sm text-gray-600">Keine Mitarbeiter im Filter</div>
                    ) : (
                      filteredMitarbeiter.map((m: any, idx: number) => {
                        const color = getEmployeeColor(m, idx)
                        return (
                          <div key={String(m.id)} className="h-14 border-b border-l px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                              <div className="text-sm font-semibold text-gray-900">
                                {String(m.name ?? m.vorname ?? "Mitarbeiter")}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">{String(m.position ?? "")}</div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {/* Scroll grid */}
                <div ref={scrollRef} className="h-[70vh] overflow-auto">
                  {/* WEEK */}
                  {viewMode === "week" && (
                    <div className="grid" style={{ gridTemplateColumns: "repeat(7, minmax(200px, 1fr))" }}>
                      {weekDays.map((d) => {
                        const key = toLocalYMD(d)
                        const dayList = bookingsByDay.get(key) ?? []
                        const laidOut = layoutEvents(dayList, startOfDay(d))

                        return (
                          <div
                            key={key}
                            className="relative border-l"
                            style={{ height: gridHeight }}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            {timeSlots.map((s) => {
                              const slotTop = ((s.hh - START_HOUR) * 60 + s.mm) / SLOT_MINUTES * SLOT_HEIGHT
                              const slotStart = setTimeOnDate(d, s.hh, s.mm)
                              return (
                                <div
                                  key={s.label}
                                  className={`absolute left-0 right-0 border-t ${s.mm === 0 ? "border-gray-200" : "border-gray-100"}`}
                                  style={{ top: slotTop, height: SLOT_HEIGHT }}
                                  onClick={() => openCreatePanelAt({ date: d, hhmm: s.label })}
                                  onDrop={(e) => {
                                    e.preventDefault()
                                    const bookingId = e.dataTransfer.getData("text/bookingId")
                                    if (!bookingId) return
                                    moveBookingWeek(bookingId, slotStart)
                                  }}
                                />
                              )
                            })}

                            {laidOut.map((it) => {
                              const s = safeDate((it.b as any).start_at)
                              const e = safeDate((it.b as any).end_at)
                              if (!s || !e) return null

                              const day0 = startOfDay(d)
                              const startMin = minutesBetween(day0, s)
                              const endMin = minutesBetween(day0, e)

                              const visibleStart = clamp(startMin, START_HOUR * 60, END_HOUR * 60)
                              const visibleEnd = clamp(endMin, START_HOUR * 60, END_HOUR * 60)

                              const top = ((visibleStart - START_HOUR * 60) / SLOT_MINUTES) * SLOT_HEIGHT
                              const height = Math.max(SLOT_HEIGHT, ((visibleEnd - visibleStart) / SLOT_MINUTES) * SLOT_HEIGHT)

                              const widthPct = 100 / it.colCount
                              const leftPct = it.col * widthPct

                              const kundeName = (it.b.kunden as any)?.name ?? (it.b.kunden as any)?.vorname ?? "Kunde"
                              const behandlungName = (it.b.behandlung as any)?.name ?? ""
                              const st = ((it.b as any).status ?? "confirmed") as Status
                              const stUI = statusStyle(st)

                              const empId = String((it.b as any).mitarbeiter_id ?? "")
                              const empIdx = mitarbeiter.findIndex((x: any) => String(x.id) === empId)
                              const emp = mitarbeiter[empIdx] as any
                              const empColor = getEmployeeColor(emp, Math.max(0, empIdx))

                              return (
                                <div
                                  key={String((it.b as any).id)}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData("text/bookingId", String((it.b as any).id))
                                    e.dataTransfer.effectAllowed = "move"
                                  }}
                                  onClick={() => openEditPanel(it.b)}
                                  className={`absolute z-10 cursor-pointer rounded-lg border px-2 py-1 text-xs text-gray-800 shadow-sm ${stUI.bg} ${stUI.border}`}
                                  style={{
                                    top,
                                    height,
                                    left: `calc(${leftPct}% + 6px)`,
                                    width: `calc(${widthPct}% - 12px)`,
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="font-semibold text-gray-900 truncate">{kundeName}</div>
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: empColor }} />
                                  </div>
                                  <div className="text-gray-600 truncate">{behandlungName}</div>
                                  <div className="mt-1 flex items-center justify-between gap-2">
                                    <div className="text-[11px] text-gray-500">
                                      {formatHHMM(s)}–{formatHHMM(e)}
                                    </div>
                                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${stUI.badge}`}>
                                      {st === "confirmed"
                                        ? "Bestätigt"
                                        : st === "scheduled"
                                          ? "Geplant"
                                          : st === "completed"
                                            ? "Erledigt"
                                            : st === "cancelled"
                                              ? "Storniert"
                                              : "No-Show"}
                                    </span>
                                  </div>
                                  {selectedMitarbeiterId === "all" && (
                                    <div className="mt-1 text-[11px] text-gray-500 truncate">
                                      {String((it.b.mitarbeiter as any)?.name ?? (it.b.mitarbeiter as any)?.vorname ?? "")}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* DAY · RESOURCES */}
                  {viewMode === "day_resources" && (
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(${Math.max(1, resources.length)}, minmax(220px, 1fr))`,
                      }}
                    >
                      {resources.map((r) => {
                        const list = bookingsByResource.get(r.id) ?? []
                        const laidOut = layoutEvents(list, startOfDay(selectedDate))

                        return (
                          <div
                            key={r.id}
                            className="relative border-l"
                            style={{ height: gridHeight }}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            {timeSlots.map((s) => {
                              const slotTop = ((s.hh - START_HOUR) * 60 + s.mm) / SLOT_MINUTES * SLOT_HEIGHT
                              const slotStart = setTimeOnDate(selectedDate, s.hh, s.mm)
                              const disabled = slotStart < dayStart || slotStart > dayEnd

                              return (
                                <div
                                  key={s.label}
                                  className={`absolute left-0 right-0 border-t ${s.mm === 0 ? "border-gray-200" : "border-gray-100"}`}
                                  style={{ top: slotTop, height: SLOT_HEIGHT }}
                                  onClick={() => {
                                    if (disabled) return
                                    openCreatePanelAt({ date: selectedDate, hhmm: s.label, resourceId: r.id })
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault()
                                    const bookingId = e.dataTransfer.getData("text/bookingId")
                                    if (!bookingId) return
                                    moveBookingDayResource(bookingId, r.id, slotStart)
                                  }}
                                />
                              )
                            })}

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
                              const behandlungName = (it.b.behandlung as any)?.name ?? ""
                              const st = ((it.b as any).status ?? "confirmed") as Status
                              const stUI = statusStyle(st)

                              const empId = String((it.b as any).mitarbeiter_id ?? "")
                              const empIdx = mitarbeiter.findIndex((x: any) => String(x.id) === empId)
                              const emp = mitarbeiter[empIdx] as any
                              const empColor = getEmployeeColor(emp, Math.max(0, empIdx))

                              return (
                                <div
                                  key={String((it.b as any).id)}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData("text/bookingId", String((it.b as any).id))
                                    e.dataTransfer.effectAllowed = "move"
                                  }}
                                  onClick={() => openEditPanel(it.b)}
                                  className={`absolute z-10 cursor-pointer rounded-lg border px-2 py-1 text-xs text-gray-800 shadow-sm ${stUI.bg} ${stUI.border}`}
                                  style={{
                                    top,
                                    height,
                                    left: `calc(${leftPct}% + 6px)`,
                                    width: `calc(${widthPct}% - 12px)`,
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="font-semibold text-gray-900 truncate">{kundeName}</div>
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: empColor }} />
                                  </div>
                                  <div className="text-gray-600 truncate">{behandlungName}</div>
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
                  )}

                  {/* DAY · EMPLOYEES */}
                  {viewMode === "day_employees" && (
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(${Math.max(1, filteredMitarbeiter.length)}, minmax(220px, 1fr))`,
                      }}
                    >
                      {filteredMitarbeiter.map((m: any, idx: number) => {
                        const empId = String(m.id)
                        const empBookings = bookingsByEmployee.get(empId) ?? []
                        const laidOut = layoutEvents(empBookings, startOfDay(selectedDate))
                        const empColor = getEmployeeColor(m, idx)

                        return (
                          <div
                            key={empId}
                            className="relative border-l"
                            style={{ height: gridHeight }}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            {timeSlots.map((s) => {
                              const slotTop = ((s.hh - START_HOUR) * 60 + s.mm) / SLOT_MINUTES * SLOT_HEIGHT
                              const slotStart = setTimeOnDate(selectedDate, s.hh, s.mm)
                              const disabled = slotStart < dayStart || slotStart > dayEnd

                              return (
                                <div
                                  key={s.label}
                                  className={`absolute left-0 right-0 border-t ${s.mm === 0 ? "border-gray-200" : "border-gray-100"}`}
                                  style={{ top: slotTop, height: SLOT_HEIGHT }}
                                  onClick={() => {
                                    if (disabled) return
                                    openCreatePanelAt({ date: selectedDate, hhmm: s.label, empId })
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault()
                                    const bookingId = e.dataTransfer.getData("text/bookingId")
                                    if (!bookingId) return
                                    moveBookingDayEmployee(bookingId, empId, slotStart)
                                  }}
                                />
                              )
                            })}

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
                              const behandlungName = (it.b.behandlung as any)?.name ?? ""
                              const st = ((it.b as any).status ?? "confirmed") as Status
                              const stUI = statusStyle(st)

                              return (
                                <div
                                  key={String((it.b as any).id)}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData("text/bookingId", String((it.b as any).id))
                                    e.dataTransfer.effectAllowed = "move"
                                  }}
                                  onClick={() => openEditPanel(it.b)}
                                  className={`absolute z-10 cursor-pointer rounded-lg border px-2 py-1 text-xs text-gray-800 shadow-sm ${stUI.bg} ${stUI.border}`}
                                  style={{
                                    top,
                                    height,
                                    left: `calc(${leftPct}% + 6px)`,
                                    width: `calc(${widthPct}% - 12px)`,
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="font-semibold text-gray-900 truncate">{kundeName}</div>
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: empColor }} />
                                  </div>
                                  <div className="text-gray-600 truncate">{behandlungName}</div>
                                  <div className="mt-1 flex items-center justify-between gap-2">
                                    <div className="text-[11px] text-gray-500">
                                      {formatHHMM(s)} – {formatHHMM(e)}
                                    </div>
                                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${stUI.badge}`}>
                                      {st === "confirmed"
                                        ? "Bestätigt"
                                        : st === "scheduled"
                                          ? "Geplant"
                                          : st === "completed"
                                            ? "Erledigt"
                                            : st === "cancelled"
                                              ? "Storniert"
                                              : "No-Show"}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loading && <div className="border-t p-3 text-sm text-gray-500">Lade Daten…</div>}
          </div>

          {/* Right details panel */}
          <aside className="w-[380px] shrink-0 rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-gray-900">{panelTitle}</div>
                <div className="text-sm text-gray-500">
                  {panelOpen ? toLocalYMD(activeDate) : "Klick auf Termin oder freien Slot"}
                </div>
              </div>
              <button
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => {
                  setPanelOpen(false)
                  setSelectedBooking(null)
                  setEditingId(null)
                  setError(null)
                }}
              >
                Schließen
              </button>
            </div>

            {!panelOpen ? (
              <div className="mt-4 rounded-lg border bg-gray-50 p-3 text-sm text-gray-600">
                • Klick auf freien Slot = neuer Termin<br />
                • Klick auf Termin = bearbeiten<br />
                • Drag & Drop funktioniert weiter
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">Datum</label>
                    <input
                      type="date"
                      value={toLocalYMD(activeDate)}
                      onChange={(e) => setActiveDate(startOfDay(new Date(e.target.value + "T00:00:00")))}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
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
                  </div>

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
                          {String(f.name ?? f.titel ?? "Filiale")}
                        </option>
                      ))}
                    </select>
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

                  <div>
                    <label className="text-xs text-gray-600">Ressource (Raum/Gerät)</label>
                    <select
                      value={formResourceId}
                      onChange={(e) => setFormResourceId(e.target.value)}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      disabled={!resourceField}
                      title={!resourceField ? "Kein resource_id/room_id/device_id erkannt – Feld fehlt in DB" : ""}
                    >
                      {resources.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    {!resourceField && (
                      <div className="mt-1 text-xs text-gray-500">
                        Für echtes Speichern brauchst du ein Feld in `buchungen`: <b>resource_id</b> (oder room_id/device_id).
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Notiz</label>
                    <textarea
                      value={formNotiz}
                      onChange={(e) => setFormNotiz(e.target.value)}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div>
                    {editingId && (
                      <button
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                        onClick={deleteFromPanel}
                      >
                        Löschen
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => {
                        // Reset selection but keep panel open
                        setSelectedBooking(null)
                        setEditingId(null)
                      }}
                    >
                      Neu
                    </button>
                    <button
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                      onClick={saveFromPanel}
                    >
                      Speichern
                    </button>
                  </div>
                </div>

                {selectedBooking && (
                  <div className="mt-4 rounded-lg border bg-gray-50 p-3 text-xs text-gray-600">
                    <div><b>ID:</b> {String((selectedBooking as any).id ?? "")}</div>
                    <div><b>Kunde:</b> {String((selectedBooking.kunden as any)?.name ?? (selectedBooking.kunden as any)?.vorname ?? "")}</div>
                    <div><b>Mitarbeiter:</b> {String((selectedBooking.mitarbeiter as any)?.name ?? (selectedBooking.mitarbeiter as any)?.vorname ?? "")}</div>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
