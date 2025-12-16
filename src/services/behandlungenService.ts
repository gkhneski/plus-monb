import { supabase } from '../lib/supabase/client';
import { Database } from '../types/database.types';

type Behandlung = Database['public']['Tables']['behandlungen']['Row'];
type BehandlungInsert = Database['public']['Tables']['behandlungen']['Insert'];
type BehandlungUpdate = Database['public']['Tables']['behandlungen']['Update'];

export const behandlungenService = {
  async getAll(): Promise<{ data: Behandlung[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('behandlungen')
      .select('*')
      .order('kategorie', { ascending: true })
      .order('name', { ascending: true });
    return { data, error };
  },

  async getByKategorie(kategorie: string): Promise<{ data: Behandlung[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('behandlungen')
      .select('*')
      .eq('kategorie', kategorie)
      .order('name', { ascending: true });
    return { data, error };
  },

  async getById(id: string): Promise<{ data: Behandlung | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('behandlungen')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(behandlung: BehandlungInsert): Promise<{ data: Behandlung | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('behandlungen')
      .insert(behandlung)
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, updates: BehandlungUpdate): Promise<{ data: Behandlung | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('behandlungen')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('behandlungen')
      .delete()
      .eq('id', id);
    return { error };
  },
};