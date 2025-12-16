-- Location: supabase/migrations/20251216133600_add_rls_policies.sql
-- Schema Analysis: Tables mitarbeiter, buchungen, filialen have RLS enabled but no SELECT policies
-- Integration Type: Modification - Adding RLS policies to existing tables
-- Dependencies: public.profiles (via is_super_admin function)

-- RLS policies for mitarbeiter table
-- Super admins can view all staff members
CREATE POLICY "super_admin_view_all_mitarbeiter"
ON public.mitarbeiter
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- Staff can view all active staff members
CREATE POLICY "authenticated_view_active_mitarbeiter"
ON public.mitarbeiter
FOR SELECT
TO authenticated
USING (is_active = true);

-- RLS policies for filialen table
-- Super admins can view all locations
CREATE POLICY "super_admin_view_all_filialen"
ON public.filialen
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- All authenticated users can view active locations
CREATE POLICY "authenticated_view_active_filialen"
ON public.filialen
FOR SELECT
TO authenticated
USING (is_active = true);

-- RLS policies for buchungen table
-- Super admins can view all bookings
CREATE POLICY "super_admin_view_all_buchungen"
ON public.buchungen
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- Authenticated users can view all bookings (for calendar display)
CREATE POLICY "authenticated_view_buchungen"
ON public.buchungen
FOR SELECT
TO authenticated
USING (true);