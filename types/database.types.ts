// Supabase Database Type Definitions
export type Database = {
  public: {
    Tables: {
      behandlungen: {
        Row: {
          id: string
          name: string
          kategorie: string | null
          preis_eur: number
          dauer_min: number
          color_hex: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          kategorie?: string | null
          preis_eur: number
          dauer_min: number
          color_hex?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          kategorie?: string | null
          preis_eur?: number
          dauer_min?: number
          color_hex?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      buchungen: {
        Row: {
          id: string
          kunde_id: string
          mitarbeiter_id: string
          behandlung_id: string | null
          filiale_id: string | null
          start_at: string
          end_at: string
          status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
          notiz: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kunde_id: string
          mitarbeiter_id: string
          behandlung_id?: string | null
          filiale_id?: string | null
          start_at: string
          end_at: string
          status?: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
          notiz?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kunde_id?: string
          mitarbeiter_id?: string
          behandlung_id?: string | null
          filiale_id?: string | null
          start_at?: string
          end_at?: string
          status?: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
          notiz?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      filialen: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          opening_hours: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          opening_hours?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          opening_hours?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      kunden: {
        Row: {
          id: string
          vorname: string
          nachname: string
          email: string | null
          telefon: string | null
          geburtsdatum: string | null
          notizen: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vorname: string
          nachname: string
          email?: string | null
          telefon?: string | null
          geburtsdatum?: string | null
          notizen?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vorname?: string
          nachname?: string
          email?: string | null
          telefon?: string | null
          geburtsdatum?: string | null
          notizen?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mitarbeiter: {
        Row: {
          id: string
          name: string
          color_hex: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color_hex?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color_hex?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          mitarbeiter_id: string | null
          role: "super_admin" | "manager" | "staff"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          mitarbeiter_id?: string | null
          role?: "super_admin" | "manager" | "staff"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mitarbeiter_id?: string | null
          role?: "super_admin" | "manager" | "staff"
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
