-- Ensure all existing users have profile records
-- This migration creates profile records for any users that don't have them yet
-- (The trigger only creates profiles for new signups, not existing users)

-- First, ensure the name and description columns exist (in case table was created without them)
DO $$
BEGIN
  -- Add name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN name TEXT;
    RAISE NOTICE 'Added name column to profiles table';
  END IF;

  -- Add description column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'description'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN description TEXT;
    RAISE NOTICE 'Added description column to profiles table';
  END IF;
END $$;

-- Insert profile records for all users who don't have one
INSERT INTO public.profiles (id, name, description, created_at, updated_at)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', ''),
  '',
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify all users now have profiles
DO $$
DECLARE
  user_count INTEGER;
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM public.profiles;

  RAISE NOTICE 'Total users: %', user_count;
  RAISE NOTICE 'Total profiles: %', profile_count;

  IF user_count = profile_count THEN
    RAISE NOTICE '✓ All users have profile records';
  ELSE
    RAISE WARNING '⚠ Profile count mismatch: % users, % profiles', user_count, profile_count;
  END IF;
END $$;
