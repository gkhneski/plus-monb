-- Fix conflicting RLS policies by removing overly restrictive ones
-- The issue: Multiple SELECT policies with different conditions cause AND logic
-- All policies must pass, but authenticated_view_active_mitarbeiter restricts to is_active=true
-- while super_admin policies should allow viewing all records

-- ============================================
-- CLEAN UP BUCHUNGEN POLICIES
-- ============================================

-- Drop the overly broad ALL policy
DROP POLICY IF EXISTS buchungen_all ON public.buchungen;

-- Drop the redundant authenticated view policy (no conditions)
DROP POLICY IF EXISTS authenticated_view_buchungen ON public.buchungen;

-- Keep only the super admin policy and create a new consolidated one
DROP POLICY IF EXISTS super_admin_view_all_buchungen ON public.buchungen;

-- Create single permissive policy for buchungen
-- Super admins can see all, others can see all (no user-level restrictions needed for calendar)
CREATE POLICY "allow_authenticated_buchungen" ON public.buchungen
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow super admins to perform all operations
CREATE POLICY "allow_super_admin_all_buchungen" ON public.buchungen
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================
-- CLEAN UP MITARBEITER POLICIES
-- ============================================

-- Drop the overly broad ALL policy
DROP POLICY IF EXISTS mitarbeiter_all ON public.mitarbeiter;

-- Drop both existing SELECT policies
DROP POLICY IF EXISTS authenticated_view_active_mitarbeiter ON public.mitarbeiter;
DROP POLICY IF EXISTS super_admin_view_all_mitarbeiter ON public.mitarbeiter;

-- Create single permissive policy for mitarbeiter
-- All authenticated users can view all staff (needed for calendar/dropdowns)
CREATE POLICY "allow_authenticated_mitarbeiter" ON public.mitarbeiter
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow super admins to perform all operations
CREATE POLICY "allow_super_admin_all_mitarbeiter" ON public.mitarbeiter
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================
-- CLEAN UP FILIALEN POLICIES
-- ============================================

-- Drop the overly broad ALL policy
DROP POLICY IF EXISTS filialen_all ON public.filialen;

-- Drop both existing SELECT policies
DROP POLICY IF EXISTS authenticated_view_active_filialen ON public.filialen;
DROP POLICY IF EXISTS super_admin_view_all_filialen ON public.filialen;

-- Create single permissive policy for filialen
-- All authenticated users can view all locations (needed for calendar/dropdowns)
CREATE POLICY "allow_authenticated_filialen" ON public.filialen
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow super admins to perform all operations
CREATE POLICY "allow_super_admin_all_filialen" ON public.filialen
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================
-- ADD COMMENT FOR CLARITY
-- ============================================
COMMENT ON POLICY "allow_authenticated_buchungen" ON public.buchungen IS 
  'All authenticated users can view bookings for calendar functionality';

COMMENT ON POLICY "allow_authenticated_mitarbeiter" ON public.mitarbeiter IS 
  'All authenticated users can view all staff for dropdowns and calendar';

COMMENT ON POLICY "allow_authenticated_filialen" ON public.filialen IS 
  'All authenticated users can view all locations for dropdowns and calendar';