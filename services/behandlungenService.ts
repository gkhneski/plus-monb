import { supabase } from "../lib/supabase/client"
import type { Database } from "../types/database.types"

type Behandlung = Database["public"]["Tables"]["behandlungen"]["Row"]
type BehandlungInsert = Database["public"]["Tables"]["behandlungen"]["Insert"]
type BehandlungUpdate = Database["public"]["Tables"]["behandlungen"]["Update"]

type BehandlungWithKategorie = Behandlung & {
  kategorien: { id: string; name: string } | null
}

export const behandlungenService = {
  async getAll(): Promise<{ data: BehandlungWithKategorie[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("behandlungen")
        .select("*, kategorien(id, name)")
        .order("name", { ascending: true })

      // If kategorien table doesn't exist, fall back to query without join
      if (error && (error.message.includes("kategorien") || error.message.includes("schema cache"))) {
        console.warn("Kategorien table not found, loading behandlungen without categories")
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("behandlungen")
          .select("*")
          .order("name", { ascending: true })

        // Add null kategorien field to match expected type
        const dataWithNull = fallbackData?.map((b) => ({ ...b, kategorien: null })) || []
        return { data: dataWithNull, error: fallbackError }
      }

      return { data, error }
    } catch (err) {
      console.error("Error loading behandlungen:", err)
      return { data: null, error: err as Error }
    }
  },

  async getByKategorie(
    kategorieId: string | null,
  ): Promise<{ data: BehandlungWithKategorie[] | null; error: Error | null }> {
    try {
      let query = supabase.from("behandlungen").select("*, kategorien(id, name)").order("name", { ascending: true })

      if (kategorieId === null || kategorieId === "uncategorized") {
        query = query.is("kategorie_id", null)
      } else {
        query = query.eq("kategorie_id", kategorieId)
      }

      const { data, error } = await query

      // If kategorien table doesn't exist, fall back to query without join
      if (error && (error.message.includes("kategorien") || error.message.includes("schema cache"))) {
        let fallbackQuery = supabase.from("behandlungen").select("*").order("name", { ascending: true })

        if (kategorieId === null || kategorieId === "uncategorized") {
          fallbackQuery = fallbackQuery.is("kategorie_id", null)
        } else {
          fallbackQuery = fallbackQuery.eq("kategorie_id", kategorieId)
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery
        const dataWithNull = fallbackData?.map((b) => ({ ...b, kategorien: null })) || []
        return { data: dataWithNull, error: fallbackError }
      }

      return { data, error }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  async getById(id: string): Promise<{ data: BehandlungWithKategorie | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("behandlungen")
        .select("*, kategorien(id, name)")
        .eq("id", id)
        .single()

      if (error && (error.message.includes("kategorien") || error.message.includes("schema cache"))) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("behandlungen")
          .select("*")
          .eq("id", id)
          .single()

        const dataWithNull = fallbackData ? { ...fallbackData, kategorien: null } : null
        return { data: dataWithNull, error: fallbackError }
      }

      return { data, error }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  async create(behandlung: BehandlungInsert): Promise<{ data: Behandlung | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.from("behandlungen").insert(behandlung).select().single()
      return { data, error }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  async update(id: string, updates: BehandlungUpdate): Promise<{ data: Behandlung | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.from("behandlungen").update(updates).eq("id", id).select().single()
      return { data, error }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.from("behandlungen").delete().eq("id", id)
      return { error }
    } catch (err) {
      return { error: err as Error }
    }
  },
}
