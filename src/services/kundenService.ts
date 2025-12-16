import { supabase } from '../lib/supabase/client';
import { Database } from '../types/database.types';

type Kunde = Database['public']['Tables']['kunden']['Row'];
type KundeInsert = Database['public']['Tables']['kunden']['Insert'];
type KundeUpdate = Database['public']['Tables']['kunden']['Update'];

export const kundenService = {
  async getAll(): Promise<{ data: Kunde[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('kunden')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async search(searchTerm: string): Promise<{ data: Kunde[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('kunden')
      .select('*')
      .or(`vorname.ilike.%${searchTerm}%,nachname.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,telefon.ilike.%${searchTerm}%`)
      .order('nachname', { ascending: true });
    return { data, error };
  },

  async getById(id: string): Promise<{ data: Kunde | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('kunden')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(kunde: KundeInsert): Promise<{ data: Kunde | null; error: Error | null }> {
    // Validate: at least telefon OR email must be provided
    if (!kunde.telefon && !kunde.email) {
      return { 
        data: null, 
        error: new Error('Entweder Telefon oder E-Mail muss angegeben werden') 
      };
    }

    const { data, error } = await supabase
      .from('kunden')
      .insert(kunde)
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, updates: KundeUpdate): Promise<{ data: Kunde | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('kunden')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('kunden')
      .delete()
      .eq('id', id);
    return { error };
  },
};