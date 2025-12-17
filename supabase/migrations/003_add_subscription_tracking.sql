-- Add generations_used column to track usage
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS generations_used INTEGER DEFAULT 0;

-- Update the subscriptions table to include all necessary Stripe fields
-- These columns might already exist from the webhook expectations

-- Create or replace function to reset monthly generation count
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

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id
ON public.subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id
ON public.subscriptions(stripe_customer_id);
