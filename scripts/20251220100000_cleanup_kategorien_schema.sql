-- Cleanup Script: Remove duplicate kategorien tables and fix foreign keys
-- This script cleans up the database schema to have only the correct tables

-- Step 1: Drop all duplicate/incorrect kategorien-related tables
DROP TABLE IF EXISTS public.behandlung_kategorien CASCADE;
DROP TABLE IF EXISTS public.behandlungs_kategorien CASCADE;
DROP TABLE IF EXISTS public.behandlungskategorien CASCADE;

-- Step 2: Drop existing foreign key if it exists
ALTER TABLE public.behandlungen
  DROP CONSTRAINT IF EXISTS behandlungen_kategorie_id_fkey;

-- Step 3: Remove kategorie_id column if it exists
ALTER TABLE public.behandlungen
  DROP COLUMN IF EXISTS kategorie_id;

-- Step 4: Drop kategorien table to recreate it cleanly
DROP TABLE IF EXISTS public.kategorien CASCADE;

-- Step 5: Create clean kategorien table
CREATE TABLE public.kategorien (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  beschreibung text,
  color_hex text DEFAULT '#3b82f6',
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 6: Add kategorie_id to behandlungen with proper foreign key
-- Using ON DELETE SET NULL so kategorien can be deleted without errors
ALTER TABLE public.behandlungen
  ADD COLUMN kategorie_id uuid;

ALTER TABLE public.behandlungen
  ADD CONSTRAINT behandlungen_kategorie_id_fkey 
  FOREIGN KEY (kategorie_id) 
  REFERENCES public.kategorien(id) 
  ON DELETE SET NULL;

-- Step 7: Create index for performance
CREATE INDEX idx_behandlungen_kategorie_id ON public.behandlungen(kategorie_id);

-- Step 8: Enable RLS on kategorien
ALTER TABLE public.kategorien ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies for kategorien
CREATE POLICY "Enable read access for all users" ON public.kategorien
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.kategorien
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.kategorien
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.kategorien
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 10: Insert default kategorien
-- Removed demo data insertion as user wants to add kategorien manually via UI
