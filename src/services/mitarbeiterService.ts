import { supabase } from '../lib/supabase/client';
import { Database } from '../types/database.types';

type Mitarbeiter = Database['public']['Tables']['mitarbeiter']['Row'];
type MitarbeiterInsert = Database['public']['Tables']['mitarbeiter']['Insert'];
type MitarbeiterUpdate = Database['public']['Tables']['mitarbeiter']['Update'];

export const mitarbeiterService = {
  async getAll(): Promise<{ data: Mitarbeiter[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('mitarbeiter')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getById(id: string): Promise<{ data: Mitarbeiter | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('mitarbeiter')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(mitarbeiter: MitarbeiterInsert): Promise<{ data: Mitarbeiter | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('mitarbeiter')
      .insert(mitarbeiter)
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, updates: MitarbeiterUpdate): Promise<{ data: Mitarbeiter | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('mitarbeiter')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('mitarbeiter')
      .delete()
      .eq('id', id);
    return { error };
  },
};