# Production Stripe Webhook Setup Guide

This guide will help you set up Stripe webhooks for your production deployment.

## Prerequisites

- Stripe account with live mode enabled
- Production deployment URL (e.g., https://vorg.com)
- Access to your Stripe Dashboard

## Step 1: Get Your Webhook Endpoint URL

Your production webhook endpoint will be:
```
https://YOUR-DOMAIN.com/api/webhooks/stripe
```

For example, if your domain is `vorg.com`:
```
https://vorg.com/api/webhooks/stripe
```

## Step 2: Create Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **Live mode** (toggle in top right)
3. Navigate to **Developers** → **Webhooks**
4. Click **Add endpoint**
5. Enter your endpoint URL: `https://YOUR-DOMAIN.com/api/webhooks/stripe`
6. Select the following events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
7. Click **Add endpoint**

## Step 3: Get Your Webhook Signing Secret

After creating the endpoint:

1. Click on the newly created webhook endpoint
2. Find the **Signing secret** section
3. Click **Reveal** to see the secret
4. Copy the secret (starts with `whsec_...`)

## Step 4: Add Webhook Secret to Environment Variables

Add the webhook secret to your production environment variables:

### For Vercel:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add:
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: `whsec_...` (the secret you copied)
   - **Environment**: Production

### For other platforms:
Add to your `.env.production` or platform-specific environment configuration:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_production_secret_here
```

## Step 5: Verify Required Environment Variables

Make sure ALL these Stripe environment variables are set in production:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_...          # Live mode secret key
STRIPE_WEBHOOK_SECRET=whsec_...         # Webhook signing secret

# Stripe Price IDs (Live mode)
STRIPE_STARTER_PRICE_ID=price_...       # Starter plan price ID
STRIPE_PRO_PRICE_ID=price_...           # Pro plan price ID
STRIPE_AGENCY_PRICE_ID=price_...        # Agency plan price ID

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Required for webhook to update DB

# Site URL
NEXT_PUBLIC_SITE_URL=https://YOUR-DOMAIN.com
```

## Step 6: Get Live Mode Price IDs

1. In Stripe Dashboard, make sure you're in **Live mode**
2. Go to **Products**
3. Click on each product (Starter, Pro, Agency)
4. Copy the **Price ID** (starts with `price_...`)
5. Update your environment variables with these live mode price IDs

## Step 7: Test the Webhook

### Method 1: Using Stripe Dashboard
1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **Send test webhook**
4. Select `checkout.session.completed`
5. Click **Send test webhook**
6. Check the **Response** tab to see if it succeeded (200 OK)

### Method 2: Test with Real Payment (Recommended)
1. Go to your production site
2. Try upgrading to a paid plan
3. Complete the checkout with a test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
4. After payment, you should be redirected back
5. Your subscription should update immediately

## Step 8: Monitor Webhook Events

To check if webhooks are working:

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click on your endpoint
3. View the **Events** tab to see webhook deliveries
4. Each successful webhook should show **200** status
5. Click on any event to see the request/response details

## Troubleshooting

### Webhook shows 500 error
- Check your production logs for errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Ensure subscriptions table exists in your database

### Webhook shows 401 error
- Verify webhook secret is correct
- Make sure you're using the **live mode** webhook secret for production

### Subscription not updating after payment
- Check webhook was delivered (Stripe Dashboard → Webhooks → Events)
- Verify price IDs match between Stripe products and environment variables
- Check production logs for database errors

### "No user_id in metadata" in logs
- This happens with Stripe test events
- Real payments will include user_id from checkout session
- You can ignore these for test webhooks

## Webhook Flow

Here's what happens when a user subscribes:

1. User clicks upgrade → Redirected to Stripe Checkout
2. User completes payment
3. Stripe sends `checkout.session.completed` webhook to your endpoint
4. Your webhook handler:
   - Verifies the webhook signature
   - Extracts user_id from session metadata
   - Retrieves subscription details from Stripe
   - Maps price_id to plan name (starter/pro/agency)
   - Updates/creates subscription record in Supabase
5. User is redirected back to your site
6. Subscription status updates automatically

## Security Notes

- ✅ Webhook signature verification is enabled (prevents spoofed requests)
- ✅ Using service role key for database updates (bypasses RLS)
- ✅ Live mode secrets are separate from test mode
- ⚠️ Never commit webhook secrets to version control
- ⚠️ Webhook endpoint must be publicly accessible (no auth required)

## Quick Checklist

Before going live, verify:

- [ ] Webhook endpoint created in Stripe Dashboard (live mode)
- [ ] Webhook listening to correct events
- [ ] `STRIPE_WEBHOOK_SECRET` added to production env vars
- [ ] All Stripe price IDs updated for live mode
- [ ] `STRIPE_SECRET_KEY` using live mode key (sk_live_...)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in production
- [ ] Test webhook delivery shows 200 status
- [ ] Real payment test successfully updates subscription

## Need Help?

If you encounter issues:

1. Check Stripe webhook event logs for delivery status
2. Check your production application logs
3. Verify all environment variables are set correctly
4. Test with Stripe CLI locally first before deploying

---

🎉 Once setup is complete, your subscriptions will update automatically when users subscribe!
