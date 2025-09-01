-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_plan_limits(plan_type user_plan)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE plan_type
    WHEN 'free' THEN RETURN 10;
    WHEN 'light' THEN RETURN 100;
    WHEN 'premium' THEN RETURN 500;
    WHEN 'premium-plus' THEN RETURN 1000;
    WHEN 'platinum' THEN RETURN 10000;
    ELSE RETURN 10;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_daily_searches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET searches_used = 0,
      searches_limit = public.get_plan_limits(plan);
END;
$$;