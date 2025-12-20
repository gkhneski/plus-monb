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

// Relations-Select (funktioniert nur, wenn FK/Relationships in Postgres/Supabase sauber existieren)
const RELATIONS_SELECT = `
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
`;

const toError = (err: any): Error | null => {
  if (!err) return null;
  if (err instanceof Error) return err;

  // Supabase/PostgREST Error-Objekte
  const msg = err?.message ?? err?.error?.message ?? err?.details ?? JSON.stringify(err);
  return new Error(msg);
};

const isRelationsSelect400 = (status?: number, err?: any) => {
  if (status === 400) return true;

  // zusätzliche robuste Checks (falls status mal nicht kommt)
  const msg = String(err?.message ?? '');
  const code = String(err?.code ?? '');
  return (
    msg.toLowerCase().includes('relationship') ||
    msg.toLowerCase().includes('could not find') ||
    code.startsWith('PGRST')
  );
};

export const buchungenService = {
  async getAll(): Promise<{ data: BuchungWithRelations[] | null; error: Error | null }> {
    // 1) try with relations
    const res = await supabase
      .from('buchungen')
      .select(RELATIONS_SELECT)
      .order('start_at', { ascending: false });

    if (res.error && isRelationsSelect400(res.status, res.error)) {
      // 2) fallback without relations
      const fallback = await supabase
        .from('buchungen')
        .select('*')
        .order('start_at', { ascending: false });

      return { data: (fallback.data as any) ?? null, error: toError(fallback.error) };
    }

    return { data: (res.data as any) ?? null, error: toError(res.error) };
  },

  async getByDateRange(
    startDate: string,
    endDate: string
  ): Promise<{ data: BuchungWithRelations[] | null; error: Error | null }> {
    const res = await supabase
      .from('buchungen')
      .select(RELATIONS_SELECT)
      .gte('start_at', startDate)
      .lte('start_at', endDate)
      .order('start_at', { ascending: true });

    if (res.error && isRelationsSelect400(res.status, res.error)) {
      const fallback = await supabase
        .from('buchungen')
        .select('*')
        .gte('start_at', startDate)
        .lte('start_at', endDate)
        .order('start_at', { ascending: true });

      return { data: (fallback.data as any) ?? null, error: toError(fallback.error) };
    }

    return { data: (res.data as any) ?? null, error: toError(res.error) };
  },

  async getByMitarbeiter(
    mitarbeiterId: string,
    date: string
  ): Promise<{ data: BuchungWithRelations[] | null; error: Error | null }> {
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const res = await supabase
      .from('buchungen')
      .select(RELATIONS_SELECT)
      .eq('mitarbeiter_id', mitarbeiterId)
      .gte('start_at', startOfDay)
      .lte('start_at', endOfDay)
      .order('start_at', { ascending: true });

    if (res.error && isRelationsSelect400(res.status, res.error)) {
      const fallback = await supabase
        .from('buchungen')
        .select('*')
        .eq('mitarbeiter_id', mitarbeiterId)
        .gte('start_at', startOfDay)
        .lte('start_at', endOfDay)
        .order('start_at', { ascending: true });

      return { data: (fallback.data as any) ?? null, error: toError(fallback.error) };
    }

    return { data: (res.data as any) ?? null, error: toError(res.error) };
  },

  async getById(id: string): Promise<{ data: BuchungWithRelations | null; error: Error | null }> {
    const res = await supabase
      .from('buchungen')
      .select(RELATIONS_SELECT)
      .eq('id', id)
      .single();

    if (res.error && isRelationsSelect400(res.status, res.error)) {
      const fallback = await supabase
        .from('buchungen')
        .select('*')
        .eq('id', id)
        .single();

      return { data: (fallback.data as any) ?? null, error: toError(fallback.error) };
    }

    return { data: (res.data as any) ?? null, error: toError(res.error) };
  },

  async create(buchung: BuchungInsert): Promise<{ data: Buchung | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('buchungen')
      .insert(buchung)
      .select()
      .single();

    // Check for overlap error
    if ((error as any)?.message?.includes('overlapping')) {
      return {
        data: null,
        error: new Error('Dieser Mitarbeiter hat zu dieser Zeit bereits eine Buchung'),
      };
    }

    return { data: data ?? null, error: toError(error) };
  },

  async update(id: string, updates: BuchungUpdate): Promise<{ data: Buchung | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('buchungen')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    // Check for overlap error
    if ((error as any)?.message?.includes('overlapping')) {
      return {
        data: null,
        error: new Error('Dieser Mitarbeiter hat zu dieser Zeit bereits eine Buchung'),
      };
    }

    return { data: data ?? null, error: toError(error) };
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

    return { data: data ?? null, error: toError(error) };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from('buchungen').delete().eq('id', id);
    return { error: toError(error) };
  },

  // Calculate end_at based on start_at and duration
  calculateEndTime(startAt: string, durationMin: number): string {
    const start = new Date(startAt);
    const end = new Date(start.getTime() + durationMin * 60000);
    return end.toISOString();
  },
};
