-- Atualizar função de manipulação de novos usuários para definir limites corretos
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Check if this is the first user (admin)
  SELECT COUNT(*) INTO admin_count FROM public.profiles;
  
  -- Insert profile for new user
  INSERT INTO public.profiles (
    user_id, 
    name, 
    plan, 
    searches_used, 
    searches_limit,
    is_admin
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    'free',
    0,
    3,  -- Usuários grátis têm 3 buscas por dia
    admin_count = 0
  );
  
  RETURN NEW;
END;
$$;