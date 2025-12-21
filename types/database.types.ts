interface Database {
  public: {
    Tables: {
      behandlungen: {
        Row: {
          id: string
          name: string
          dauer_min: number
          preis_eur: number
          color_hex: string | null
          kategorie_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          dauer_min: number
          preis_eur: number
          color_hex?: string | null
          kategorie_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          dauer_min?: number
          preis_eur?: number
          color_hex?: string | null
          kategorie_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      buchungen: {
        Row: {
          id: string
          kunde_id: string
          behandlung_id: string
          mitarbeiter_id: string
          datum: string
          uhrzeit: string
          status: string
          notizen: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kunde_id: string
          behandlung_id: string
          mitarbeiter_id: string
          datum: string
          uhrzeit: string
          status?: string
          notizen?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kunde_id?: string
          behandlung_id?: string
          mitarbeiter_id?: string
          datum?: string
          uhrzeit?: string
          status?: string
          notizen?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      filialen: {
        Row: {
          id: string
          name: string
          adresse: string | null
          telefon: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          adresse?: string | null
          telefon?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          adresse?: string | null
          telefon?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      kategorien: {
        Row: { id: string; name: string; color_hex: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; color_hex?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; name?: string; color_hex?: string | null; created_at?: string; updated_at?: string }
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
          vorname: string
          nachname: string
          email: string | null
          telefon: string | null
          color_hex: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vorname: string
          nachname: string
          email?: string | null
          telefon?: string | null
          color_hex?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vorname?: string
          nachname?: string
          email?: string | null
          telefon?: string | null
          color_hex?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: { id: string; email: string; role: string; created_at: string; updated_at: string }
        Insert: { id?: string; email: string; role?: string; created_at?: string; updated_at?: string }
        Update: { id?: string; email?: string; role?: string; created_at?: string; updated_at?: string }
      }
    }
  }
}

export type { Database }
export type { Database as DatabaseType }
