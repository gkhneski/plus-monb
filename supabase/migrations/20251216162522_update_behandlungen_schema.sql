-- Location: supabase/migrations/20251216162522_update_behandlungen_schema.sql
-- Schema Analysis: Existing behandlungen table needs modification
-- Integration Type: Modificative (ALTER existing table)
-- Dependencies: public.behandlungen, public.profiles.is_super_admin()

-- Step 1: Drop existing RLS policies before modifying table
DROP POLICY IF EXISTS "behandlungen_all" ON public.behandlungen;

-- Step 2: Add color_hex column (optional)
ALTER TABLE public.behandlungen
ADD COLUMN IF NOT EXISTS color_hex TEXT;

-- Step 3: Add CHECK constraints for dauer_min and preis_eur
ALTER TABLE public.behandlungen
DROP CONSTRAINT IF EXISTS behandlungen_dauer_min_check;

ALTER TABLE public.behandlungen
ADD CONSTRAINT behandlungen_dauer_min_check CHECK (dauer_min > 0);

ALTER TABLE public.behandlungen
DROP CONSTRAINT IF EXISTS behandlungen_preis_eur_check;

ALTER TABLE public.behandlungen
ADD CONSTRAINT behandlungen_preis_eur_check CHECK (preis_eur >= 0);

-- Step 4: Remove is_active column
ALTER TABLE public.behandlungen
DROP COLUMN IF EXISTS is_active;

-- Step 5: Create new RLS policies with proper permissions
-- Authenticated users can SELECT
CREATE POLICY "authenticated_users_can_view_behandlungen"
ON public.behandlungen
FOR SELECT
TO authenticated
USING (true);

-- Only super admins can INSERT/UPDATE/DELETE
CREATE POLICY "super_admin_full_access_behandlungen"
ON public.behandlungen
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());