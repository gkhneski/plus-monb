-- Location: supabase/migrations/20251216134800_fix_rls_recursive_policy.sql
-- Fix recursive RLS policy issue by making is_super_admin function use SECURITY DEFINER
-- This allows the function to bypass RLS when checking profiles table

-- Drop the existing function and all dependent policies using CASCADE
-- This will drop: profiles_select_own, profiles_update_own, and all super_admin policies
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;

-- Recreate the function with SECURITY DEFINER to bypass RLS
-- This prevents circular dependency when RLS policies call this function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER  -- Key change: runs with owner privileges, bypasses RLS
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- Recreate profiles policies that were dropped by CASCADE
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() 
  OR public.is_super_admin()
);

CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
  OR public.is_super_admin()
);

-- Recreate mitarbeiter, filialen, and buchungen policies that were dropped by CASCADE
-- RLS policies for mitarbeiter table
CREATE POLICY "super_admin_view_all_mitarbeiter"
ON public.mitarbeiter
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- RLS policies for filialen table
CREATE POLICY "super_admin_view_all_filialen"
ON public.filialen
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- RLS policies for buchungen table
CREATE POLICY "super_admin_view_all_buchungen"
ON public.buchungen
FOR SELECT
TO authenticated
USING (public.is_super_admin());