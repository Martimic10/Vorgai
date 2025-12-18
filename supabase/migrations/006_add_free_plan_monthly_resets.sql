-- Migration: Add Free Plan and Monthly Generation Reset Support
-- This enables a permanent free tier with 3 monthly generations

-- Step 1: Update subscriptions table to support 'free' plan
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_plan_check
CHECK (plan IN ('free', 'starter', 'pro', 'agency'));

-- Step 2: Add generation_reset_at field for monthly resets
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS generation_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');

-- Step 3: Add generation_limit field (denormalized for performance)
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS generation_limit INTEGER DEFAULT 3;

-- Step 4: Ensure generations_used column exists (might already exist from previous migration)
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS generations_used INTEGER DEFAULT 0;

-- Step 5: Make stripe fields nullable (free users won't have these)
ALTER TABLE public.subscriptions
ALTER COLUMN stripe_customer_id DROP NOT NULL,
ALTER COLUMN stripe_subscription_id DROP NOT NULL,
ALTER COLUMN status DROP NOT NULL;

-- Step 6: Update existing users without subscription to have free plan
UPDATE public.subscriptions
SET
  plan = 'free',
  status = NULL,
  generation_limit = 3,
  generations_used = 0,
  generation_reset_at = NOW() + INTERVAL '30 days'
WHERE stripe_subscription_id IS NULL OR stripe_subscription_id = '';

-- Step 7: Set generation limits for existing paid users
UPDATE public.subscriptions
SET generation_limit = CASE
  WHEN plan = 'starter' THEN 10
  WHEN plan = 'pro' THEN 20
  WHEN plan = 'agency' THEN 999999  -- Effectively unlimited
  ELSE 3
END
WHERE generation_limit IS NULL OR generation_limit = 3;

-- Step 8: Create function to check and reset monthly generations
CREATE OR REPLACE FUNCTION public.check_and_reset_generations(p_user_id UUID)
RETURNS TABLE(
  should_reset BOOLEAN,
  current_limit INTEGER,
  current_used INTEGER
) AS $$
DECLARE
  v_reset_at TIMESTAMP WITH TIME ZONE;
  v_limit INTEGER;
  v_used INTEGER;
BEGIN
  -- Get current values
  SELECT generation_reset_at, generation_limit, generations_used
  INTO v_reset_at, v_limit, v_used
  FROM public.subscriptions
  WHERE user_id = p_user_id;

  -- Check if reset is needed
  IF v_reset_at IS NULL OR NOW() >= v_reset_at THEN
    -- Reset the counter
    UPDATE public.subscriptions
    SET
      generations_used = 0,
      generation_reset_at = NOW() + INTERVAL '30 days',
      updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN QUERY SELECT TRUE, v_limit, 0;
  ELSE
    RETURN QUERY SELECT FALSE, v_limit, v_used;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create function to get plan limits
CREATE OR REPLACE FUNCTION public.get_plan_limit(p_plan TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE p_plan
    WHEN 'free' THEN 3
    WHEN 'starter' THEN 10
    WHEN 'pro' THEN 20
    WHEN 'agency' THEN 999999
    ELSE 3
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 10: Update handle_new_user function to create free plan by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create free plan subscription for new users
  INSERT INTO public.subscriptions (
    user_id,
    plan,
    status,
    generation_limit,
    generations_used,
    generation_reset_at
  )
  VALUES (
    NEW.id,
    'free',
    NULL,
    3,
    0,
    NOW() + INTERVAL '30 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create index for generation_reset_at for scheduled job performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_generation_reset_at
ON public.subscriptions(generation_reset_at)
WHERE generation_reset_at IS NOT NULL;

-- Step 12: Add comment for documentation
COMMENT ON COLUMN public.subscriptions.generation_reset_at IS 'Timestamp when monthly generation count resets to 0';
COMMENT ON COLUMN public.subscriptions.generation_limit IS 'Monthly generation limit based on plan (3 for free, 10 for starter, 20 for pro, unlimited for agency)';
COMMENT ON COLUMN public.subscriptions.generations_used IS 'Number of generations used in current month';
