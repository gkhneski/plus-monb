import { supabase } from '../lib/supabase/client';
import { Database } from '../types/database.types';

type Buchung = Database['public']['Tables']['buchungen']['Row'];
type BuchungInsert = Database['public']['Tables']['buchungen']['Insert'];
type BuchungUpdate = Database['public']['Tables']['buchungen']['Update'];

interface BuchungWithRelations extends Buchung {
  kunden?: {
    id: string;
    vorname: string;
    nachname: string;
    email: string | null;
    telefon: string | null;
  } | null;
  mitarbeiter?: {
    id: string;
    name: string;
  } | null;
  behandlungen?: {
    id: string;
    name: string;
    dauer_min: number;
    preis_eur: number;
  } | null;
  filialen?: {
    id: string;
    name: string;
  } | null;
}

export const buchungenService = {
  async getAll(): Promise<{ data: BuchungWithRelations[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('buchungen')
      .select(`
        *,
        kunden:kunde_id (
          id,
          vorname,
          nachname,
          email,
          telefon
        ),
        mitarbeiter:mitarbeiter_id (
          id,
          name
        ),
        behandlungen:behandlung_id (
          id,
          name,
          dauer_min,
          preis_eur
        ),
        filialen:filiale_id (
          id,
          name
        )
      `)
      .order('start_at', { ascending: false });
    return { data, error };
  },

  async getByDateRange(startDate: string, endDate: string): Promise<{ data: BuchungWithRelations[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('buchungen')
      .select(`
        *,
        kunden:kunde_id (
          id,
          vorname,
          nachname,
          email,
          telefon
        ),
        mitarbeiter:mitarbeiter_id (
          id,
          name
        ),
        behandlungen:behandlung_id (
          id,
          name,
          dauer_min,
          preis_eur
        ),
        filialen:filiale_id (
          id,
          name
        )
      `)
      .gte('start_at', startDate)
      .lte('start_at', endDate)
      .order('start_at', { ascending: true });
    return { data, error };
  },

  async getByMitarbeiter(mitarbeiterId: string, date: string): Promise<{ data: BuchungWithRelations[] | null; error: Error | null }> {
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;
    
    const { data, error } = await supabase
      .from('buchungen')
      .select(`
        *,
        kunden:kunde_id (
          id,
          vorname,
          nachname,
          email,
          telefon
        ),
        mitarbeiter:mitarbeiter_id (
          id,
          name
        ),
        behandlungen:behandlung_id (
          id,
          name,
          dauer_min,
          preis_eur
        ),
        filialen:filiale_id (
          id,
          name
        )
      `)
      .eq('mitarbeiter_id', mitarbeiterId)
      .gte('start_at', startOfDay)
      .lte('start_at', endOfDay)
      .order('start_at', { ascending: true });
    return { data, error };
  },

  async getById(id: string): Promise<{ data: BuchungWithRelations | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('buchungen')
      .select(`
        *,
        kunden:kunde_id (
          id,
          vorname,
          nachname,
          email,
          telefon
        ),
        mitarbeiter:mitarbeiter_id (
          id,
          name
        ),
        behandlungen:behandlung_id (
          id,
          name,
          dauer_min,
          preis_eur
        ),
        filialen:filiale_id (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(buchung: BuchungInsert): Promise<{ data: Buchung | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('buchungen')
      .insert(buchung)
      .select()
      .single();
    
    // Check for overlap error
    if (error?.message?.includes('overlapping')) {
      return { 
        data: null, 
        error: new Error('Dieser Mitarbeiter hat zu dieser Zeit bereits eine Buchung') 
      };
    }
    
    return { data, error };
  },

  async update(id: string, updates: BuchungUpdate): Promise<{ data: Buchung | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('buchungen')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    // Check for overlap error
    if (error?.message?.includes('overlapping')) {
      return { 
        data: null, 
        error: new Error('Dieser Mitarbeiter hat zu dieser Zeit bereits eine Buchung') 
      };
    }
    
    return { data, error };
  },

  async updateStatus(
    id: string, 
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  ): Promise<{ data: Buchung | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('buchungen')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('buchungen')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Calculate end_at based on start_at and duration
  calculateEndTime(startAt: string, durationMin: number): string {
    const start = new Date(startAt);
    const end = new Date(start.getTime() + durationMin * 60000);
    return end.toISOString();
  },
};