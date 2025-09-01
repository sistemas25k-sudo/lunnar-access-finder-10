-- Create enum for user plans
CREATE TYPE public.user_plan AS ENUM ('free', 'light', 'premium', 'premium-plus', 'platinum');

-- Create enum for search status
CREATE TYPE public.search_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plan user_plan NOT NULL DEFAULT 'free',
  searches_used INTEGER NOT NULL DEFAULT 0,
  searches_limit INTEGER NOT NULL DEFAULT 10,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create searches table to track user searches
CREATE TABLE public.searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status search_status NOT NULL DEFAULT 'pending',
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create search_results table for storing found credentials
CREATE TABLE public.search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id UUID NOT NULL REFERENCES public.searches(id) ON DELETE CASCADE,
  email TEXT,
  password TEXT,
  additional_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table for tracking payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan user_plan NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Create policies for searches
CREATE POLICY "Users can view their own searches" 
ON public.searches 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own searches" 
ON public.searches 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all searches" 
ON public.searches 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Create policies for search_results
CREATE POLICY "Users can view results of their own searches" 
ON public.search_results 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.searches 
    WHERE id = search_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all search results" 
ON public.search_results 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Create policies for payments
CREATE POLICY "Users can view their own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" 
ON public.payments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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
    10,
    admin_count = 0  -- First user becomes admin
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get plan limits
CREATE OR REPLACE FUNCTION public.get_plan_limits(plan_type user_plan)
RETURNS INTEGER
LANGUAGE plpgsql
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

-- Function to reset daily searches (to be called by cron job)
CREATE OR REPLACE FUNCTION public.reset_daily_searches()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles 
  SET searches_used = 0,
      searches_limit = public.get_plan_limits(plan);
END;
$$;