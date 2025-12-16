-- Migration: Simplify Mitarbeiter table to minimal fields
-- Drop unwanted columns and add color_hex

-- Drop foreign key constraint first
ALTER TABLE public.mitarbeiter
  DROP CONSTRAINT IF EXISTS mitarbeiter_filiale_id_fkey;

-- Drop unwanted columns
ALTER TABLE public.mitarbeiter
  DROP COLUMN IF EXISTS filiale_id,
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS role;

-- Add color_hex column
ALTER TABLE public.mitarbeiter
  ADD COLUMN IF NOT EXISTS color_hex text NULL;

-- Update RLS policies
-- First drop existing policies
DROP POLICY IF EXISTS allow_authenticated_mitarbeiter ON public.mitarbeiter;
DROP POLICY IF EXISTS allow_super_admin_all_mitarbeiter ON public.mitarbeiter;

-- Create new RLS policies
-- Authenticated users can SELECT
CREATE POLICY "allow_authenticated_select_mitarbeiter"
  ON public.mitarbeiter
  FOR SELECT
  TO authenticated
  USING (true);

-- Only super admins can INSERT, UPDATE, DELETE
CREATE POLICY "allow_super_admin_insert_mitarbeiter"
  ON public.mitarbeiter
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "allow_super_admin_update_mitarbeiter"
  ON public.mitarbeiter
  FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "allow_super_admin_delete_mitarbeiter"
  ON public.mitarbeiter
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin());