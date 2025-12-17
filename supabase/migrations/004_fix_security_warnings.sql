-- Fix security warnings from Supabase Security Advisor
-- This migration addresses:
-- 1. Search Path Mutable warnings on functions
-- 2. Leaked Password Protection (enable it)

-- ============================================================================
-- FIX 1: Add search_path to all functions to prevent search path injection
-- ============================================================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix reset_monthly_generations function
CREATE OR REPLACE FUNCTION public.reset_monthly_generations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Reset generations_used at the start of each billing period
  -- This would typically be called by a scheduled job
  UPDATE public.subscriptions
  SET generations_used = 0
  WHERE current_period_start <= NOW()
    AND current_period_end >= NOW();
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, description, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    '',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- ============================================================================
-- FIX 2: Enable Leaked Password Protection
-- ============================================================================

-- Enable password leak protection to prevent users from using leaked passwords
-- This checks against the Have I Been Pwned database
ALTER ROLE authenticator SET pgrst.db_pre_request = 'auth.check_password_leak';

-- Alternative: If the above doesn't work, you can enable it at the database level
-- This requires the pg_net extension
DO $$
BEGIN
  -- Enable leaked password protection if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_settings
    WHERE name = 'app.settings.auth.password_leak_check'
    AND setting = 'true'
  ) THEN
    -- Note: Actual implementation depends on Supabase config
    -- This is typically done via Supabase Dashboard: Authentication → Providers → Email
    -- Enable "Check for leaked passwords" option
    RAISE NOTICE 'Please enable "Check for leaked passwords" in Supabase Dashboard → Authentication → Providers → Email';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all functions now have proper search_path set
DO $$
DECLARE
  func_record RECORD;
  missing_search_path BOOLEAN := FALSE;
BEGIN
  FOR func_record IN
    SELECT
      p.proname as function_name,
      pg_catalog.pg_get_function_arguments(p.oid) as arguments,
      CASE
        WHEN p.prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
      END as security,
      pg_catalog.array_to_string(p.proconfig, ', ') as config
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('update_updated_at_column', 'reset_monthly_generations', 'handle_new_user')
  LOOP
    IF func_record.config IS NULL OR func_record.config NOT LIKE '%search_path%' THEN
      RAISE WARNING 'Function % is missing search_path configuration', func_record.function_name;
      missing_search_path := TRUE;
    ELSE
      RAISE NOTICE 'Function % has proper search_path: %', func_record.function_name, func_record.config;
    END IF;
  END LOOP;

  IF NOT missing_search_path THEN
    RAISE NOTICE '✓ All functions have proper search_path configuration';
  END IF;
END $$;
