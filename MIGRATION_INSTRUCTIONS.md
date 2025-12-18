# Free Plan Migration Instructions

## Overview
This migration adds support for a permanent Free plan with 3 monthly generations, allowing users to downgrade from paid plans.

## Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy the contents of supabase/migrations/006_add_free_plan_monthly_resets.sql
-- and paste it into the Supabase SQL Editor, then run it.
```

Or use the Supabase CLI:

```bash
# Make sure you're in the project directory
cd /Users/michaelmartinez/Vorg

# Run the migration
supabase db push
```

## What Changed

### 1. Database Schema
- Added `generation_reset_at` column for monthly resets
- Added `generation_limit` column for plan limits
- Updated plan constraint to include 'free'
- Made Stripe fields nullable (free users don't have them)

### 2. Plans & Limits
- **Free**: 3 projects/month (always available, no payment)
- **Starter**: 10 projects/month ($9/mo)
- **Pro**: 20 projects/month ($19/mo)
- **Agency**: Unlimited projects ($39/mo)

### 3. Monthly Reset Logic
- Generations reset automatically after 30 days
- Free users: Reset to 3 generations
- Paid users: Reset based on Stripe billing period
- No manual intervention needed

### 4. Subscription Cancellation
- When user cancels subscription → Downgrade to Free plan
- User keeps 3 monthly generations
- No lockout, no loss of access

### 5. UI Updates
- Added Free plan card to pricing page (4 columns now)
- Added generation counter to dashboard: "2 / 3 projects this month"
- Shows "Upgrade" link for free users
- Shows "∞" for unlimited agency plans

## Testing with Stripe Test Mode

Your `.env.local` already has test keys, so you can test safely:

**Test Card**: 4242 4242 4242 4242
**Expiry**: Any future date
**CVC**: Any 3 digits

### Test Scenarios

1. **New User Signup**
   - Should get Free plan automatically
   - Should see "0 / 3 projects this month"

2. **Upgrade from Free to Starter**
   - Click "Get Starter Plan"
   - Use test card
   - Should see "0 / 10 projects this month"

3. **Generate Projects**
   - Generate 3 projects on Free plan
   - Should hit limit and see upgrade prompt

4. **Monthly Reset** (Manual Test)
   - In Supabase, set `generation_reset_at` to yesterday
   - Generate a new project
   - Counter should reset to 0

5. **Downgrade/Cancel**
   - In Stripe test dashboard, cancel subscription
   - Webhook should downgrade user to Free
   - Should see "0 / 3 projects this month"

## Stripe Webhook Events

Make sure your webhook is listening for:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Webhook URL: `https://your-domain.com/api/webhooks/stripe`

## Vercel Deployment

If testing on Vercel (not localhost):

1. Update Vercel environment variables with test keys
2. Create new Stripe webhook for Vercel URL
3. Update `STRIPE_WEBHOOK_SECRET` in Vercel

## Important Notes

- ✅ All test keys are already in `.env.local`
- ✅ No real charges will occur in test mode
- ✅ Migration is backward compatible (existing users won't be affected)
- ✅ Free users will NEVER be locked out
- ⚠️  Run migration on production BEFORE deploying code changes
