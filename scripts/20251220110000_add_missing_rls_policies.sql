-- Add missing RLS policies for all tables

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.kunden ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behandlungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for kunden table
-- Super admins can view all customers
CREATE POLICY "super_admin_view_all_kunden"
ON public.kunden
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- All authenticated users can view all customers (for booking)
CREATE POLICY "authenticated_view_kunden"
ON public.kunden
FOR SELECT
TO authenticated
USING (true);

-- RLS policies for behandlungen table
-- Super admins can view all treatments
CREATE POLICY "super_admin_view_all_behandlungen"
ON public.behandlungen
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- All authenticated users can view all treatments (for booking)
CREATE POLICY "authenticated_view_behandlungen"
ON public.behandlungen
FOR SELECT
TO authenticated
USING (true);

-- RLS policies for profiles table
-- Users can view their own profile
CREATE POLICY "users_view_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Super admins can view all profiles
CREATE POLICY "super_admin_view_all_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- RLS policies for kategorien table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'kategorien') THEN
    EXECUTE 'ALTER TABLE public.kategorien ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'CREATE POLICY "authenticated_view_kategorien"
    ON public.kategorien
    FOR SELECT
    TO authenticated
    USING (true)';
  END IF;
END $$;
