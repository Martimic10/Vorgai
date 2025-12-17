-- ============================================================================
-- VORG STRIPE INTEGRATION - DATABASE MIGRATION
-- ============================================================================
-- Run this ONCE in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This adds generation tracking and fixes new user defaults
-- ============================================================================

-- First, update the subscriptions table to support 'free' plan
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_plan_check CHECK (plan IN ('free', 'starter', 'pro', 'agency'));

-- Add generations_used column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='subscriptions'
        AND column_name='generations_used'
    ) THEN
        ALTER TABLE public.subscriptions
        ADD COLUMN generations_used INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create or replace function to reset monthly generation count
-- (This is for future use - monthly resets would be handled by Stripe billing cycle)
CREATE OR REPLACE FUNCTION public.reset_monthly_generations()
RETURNS void AS $$
BEGIN
  -- Reset generations_used at the start of each billing period
  -- This would typically be called by a scheduled job
  UPDATE public.subscriptions
  SET generations_used = 0
  WHERE current_period_start <= NOW()
    AND current_period_end >= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id
ON public.subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id
ON public.subscriptions(stripe_customer_id);

-- Fix the new user signup function to give 'free' plan instead of 'starter'
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

  -- Create default subscription (FREE plan with 3 generations)
  INSERT INTO public.subscriptions (user_id, plan, status, generations_used)
  VALUES (NEW.id, 'free', 'active', 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users who are on 'starter' without a Stripe subscription to 'free'
UPDATE public.subscriptions
SET plan = 'free', generations_used = 0
WHERE plan = 'starter'
AND stripe_subscription_id IS NULL;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after to verify)
-- ============================================================================

-- Check if column was added successfully
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions'
AND column_name = 'generations_used';

-- Check current subscriptions
SELECT id, user_id, plan, status, generations_used, created_at
FROM public.subscriptions
LIMIT 5;
