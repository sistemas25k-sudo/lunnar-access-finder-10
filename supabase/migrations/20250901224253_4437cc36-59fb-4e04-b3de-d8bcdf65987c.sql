-- Create a security definer function to check admin status without RLS
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE profiles.user_id = $1 
    AND profiles.is_admin = true
  );
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all searches" ON public.searches;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.security_audit_log;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can view all searches"
ON public.searches
FOR ALL
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can view all payments"
ON public.payments
FOR ALL
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can view audit logs"
ON public.security_audit_log
FOR ALL
TO authenticated
USING (public.is_admin_user(auth.uid()));

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;