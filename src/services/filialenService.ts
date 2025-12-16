import { supabase } from '../lib/supabase/client';
import { Database } from '../types/database.types';

type Filiale = Database['public']['Tables']['filialen']['Row'];
type FilialeInsert = Database['public']['Tables']['filialen']['Insert'];
type FilialeUpdate = Database['public']['Tables']['filialen']['Update'];

export const filialenService = {
  async getAll(): Promise<{ data: Filiale[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('filialen')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getActive(): Promise<{ data: Filiale[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('filialen')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    return { data, error };
  },

  async getById(id: string): Promise<{ data: Filiale | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('filialen')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(filiale: FilialeInsert): Promise<{ data: Filiale | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('filialen')
      .insert(filiale)
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, updates: FilialeUpdate): Promise<{ data: Filiale | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('filialen')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async toggleActive(id: string, isActive: boolean): Promise<{ data: Filiale | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('filialen')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('filialen')
      .delete()
      .eq('id', id);
    return { error };
  },
};