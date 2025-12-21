import { supabase } from "../lib/supabase/client"
import type { Database } from "../types/database.types"

type Kategorie = Database["public"]["Tables"]["kategorien"]["Row"]
type KategorieInsert = Database["public"]["Tables"]["kategorien"]["Insert"]
type KategorieUpdate = Database["public"]["Tables"]["kategorien"]["Update"]

export const kategorienService = {
  async getAll(): Promise<{ data: Kategorie[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("kategorien")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true })

      if (error && error.message.includes("does not exist")) {
        console.warn("Kategorien table does not exist yet. Please run the migration script.")
        return { data: [], error: null }
      }

      return { data, error }
    } catch (err) {
      console.error("Error loading kategorien:", err)
      return { data: [], error: null }
    }
  },

  async getById(id: string): Promise<{ data: Kategorie | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.from("kategorien").select("*").eq("id", id).single()
      return { data, error }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  async create(kategorie: KategorieInsert): Promise<{ data: Kategorie | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.from("kategorien").insert(kategorie).select().single()
      return { data, error }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  async update(id: string, updates: KategorieUpdate): Promise<{ data: Kategorie | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.from("kategorien").update(updates).eq("id", id).select().single()
      return { data, error }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.from("kategorien").delete().eq("id", id)
      return { error }
    } catch (err) {
      return { error: err as Error }
    }
  },

  async getBehandlungenCount(kategorieId: string): Promise<{ count: number; error: Error | null }> {
    try {
      const { count, error } = await supabase
        .from("behandlungen")
        .select("*", { count: "exact", head: true })
        .eq("kategorie_id", kategorieId)
      return { count: count || 0, error }
    } catch (err) {
      return { count: 0, error: err as Error }
    }
  },
}
