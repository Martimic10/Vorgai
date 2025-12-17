# Stripe Integration Setup Guide

This guide will walk you through setting up Stripe for handling subscriptions and payments in Vorg.

## Prerequisites

- A Stripe account (sign up at https://stripe.com)
- Supabase project with the database migrations applied
- Environment variables configured

## Step 1: Get Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** and **Secret key**
3. Add them to your `.env.local` file:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## Step 2: Create Stripe Products and Prices

You need to create three subscription products in Stripe:

### Starter Plan ($9/month)
1. Go to https://dashboard.stripe.com/test/products
2. Click "Add Product"
3. Name: "Starter Plan"
4. Description: "50 generations per month"
5. Add a price: $9.00 USD, Recurring monthly
6. Save the product
7. Copy the **Price ID** (starts with `price_...`)
8. Add to `.env.local`: `STRIPE_STARTER_PRICE_ID=price_...`

### Pro Plan ($19/month)
1. Create another product
2. Name: "Pro Plan"
3. Description: "200 generations per month"
4. Add a price: $19.00 USD, Recurring monthly
5. Copy the **Price ID**
6. Add to `.env.local`: `STRIPE_PRO_PRICE_ID=price_...`

### Agency Plan ($39/month)
1. Create another product
2. Name: "Agency Plan"
3. Description: "Unlimited generations"
4. Add a price: $39.00 USD, Recurring monthly
5. Copy the **Price ID**
6. Add to `.env.local`: `STRIPE_AGENCY_PRICE_ID=price_...`

## Step 3: Set Up Stripe Webhooks

Webhooks allow Stripe to notify your app about subscription events (payment success, cancellation, etc.).

### Local Development (using Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_...`)
5. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

### Production Deployment

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret**
6. Add to your production environment variables: `STRIPE_WEBHOOK_SECRET=whsec_...`

## Step 4: Configure Other Environment Variables

Add these to your `.env.local`:

```env
# Site URL (change for production)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase Service Role Key (from Supabase dashboard > Settings > API)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 5: Run Database Migrations

Make sure all Supabase migrations are applied:

```bash
# If using Supabase CLI
supabase db push

# Or apply them manually through Supabase dashboard > SQL Editor
```

Key migration: `003_add_subscription_tracking.sql` adds the `generations_used` column.

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Start Stripe webhook forwarding: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Go to http://localhost:3000/pricing
4. Sign up for a new account
5. Click on a plan to start checkout
6. Use Stripe test card: `4242 4242 4242 4242` (any future date, any CVC)
7. Complete the checkout
8. Verify the subscription was created in:
   - Stripe Dashboard: https://dashboard.stripe.com/test/subscriptions
   - Supabase: Check the `subscriptions` table

## Test Card Numbers

- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

## Switching to Live Mode

When you're ready to go live:

1. Get your **live** API keys from https://dashboard.stripe.com/apikeys
2. Create the same products in **live mode**
3. Set up webhooks in **live mode**
4. Update all environment variables with live keys
5. Remove `/test/` from all Stripe dashboard URLs in this guide

## Generation Limits

The system tracks generation usage with these limits:

- **Free**: 3 generations (default for new users)
- **Starter**: 50 generations/month
- **Pro**: 200 generations/month
- **Agency**: Unlimited

Limits reset at the start of each billing period (handled by Stripe subscription renewal).

## Billing Portal

Users can manage their subscriptions (update payment method, cancel, etc.) through the Stripe billing portal:

- API endpoint: `/api/create-portal-session`
- Redirects to Stripe-hosted portal
- Returns to `/dashboard` after completion

## Troubleshooting

### "No subscription found" error
- Check that the user has a record in the `subscriptions` table
- New users should automatically get a free subscription via the database trigger

### Webhook not working
- Verify webhook secret is correct
- Check that Stripe CLI is running for local development
- Check webhook logs in Stripe Dashboard

### Price IDs not working
- Ensure price IDs in `.env.local` match exactly with Stripe dashboard
- Price IDs are different between test and live mode

## Support

For Stripe-specific issues, check:
- Stripe Dashboard logs: https://dashboard.stripe.com/test/logs
- Stripe webhook logs: https://dashboard.stripe.com/test/webhooks
- Stripe API docs: https://stripe.com/docs/api
