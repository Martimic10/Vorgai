# Local Webhook Testing Guide

Quick guide to test Stripe webhooks locally during development.

## Prerequisites

- Stripe CLI installed
- Stripe account (test mode is fine)
- Local development server running (`npm run dev`)

## Quick Start (3 Steps)

### 1. Install Stripe CLI

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
Download from: https://github.com/stripe/stripe-cli/releases

**Linux:**
```bash
# Download and install from releases page
```

### 2. Login to Stripe

```bash
stripe login
```

This will open a browser to authenticate. Press Enter after authenticating.

### 3. Start Webhook Forwarding

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

**IMPORTANT:** Copy the `whsec_...` secret and add it to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

Then restart your dev server:
```bash
npm run dev
```

## Testing the Webhook

### Option 1: Trigger Test Event (Quick)

In a new terminal:
```bash
stripe trigger checkout.session.completed
```

Check your dev server logs for:
```
🔔 Webhook received!
🎉 Checkout completed!
```

### Option 2: Real Checkout Flow (Recommended)

1. Go to http://localhost:3000
2. Sign in
3. Click upgrade to any plan
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Watch webhook logs in terminal
7. Verify subscription updated in database

## Common Issues

### "Webhook signature verification failed"
- Make sure `STRIPE_WEBHOOK_SECRET` in `.env.local` matches what `stripe listen` showed
- Restart your dev server after updating `.env.local`

### "No webhook received"
- Make sure `stripe listen` is running
- Check it's forwarding to the correct port (3000)
- Verify your dev server is running on localhost:3000

### "No user_id in metadata"
- This is normal for `stripe trigger` test events
- Real checkout flows will include user_id
- You can ignore this for manual triggers

## Webhook Events to Test

```bash
# Successful checkout
stripe trigger checkout.session.completed

# Subscription updated
stripe trigger customer.subscription.updated

# Subscription canceled
stripe trigger customer.subscription.deleted
```

## Monitoring Webhooks

When `stripe listen` is running, you'll see:
```
<-- [200] POST /api/webhooks/stripe [evt_xxxxx]
```

- `200` = Success
- `400/500` = Error (check your server logs)

## Stop Webhook Forwarding

Press `Ctrl+C` in the terminal running `stripe listen`

## Production vs Development

| Environment | Webhook Secret | How to Get It |
|------------|---------------|---------------|
| **Local** | `whsec_...` | Run `stripe listen` |
| **Production** | `whsec_...` | Stripe Dashboard → Webhooks |

**Note:** Local and production webhook secrets are different!

## Quick Test Script

Save this as `test-webhook.sh`:

```bash
#!/bin/bash
echo "Testing Stripe webhook..."
stripe trigger checkout.session.completed
echo "Check your dev server logs!"
```

Make it executable:
```bash
chmod +x test-webhook.sh
./test-webhook.sh
```

## Environment Variables Needed

For local development, your `.env.local` should have:

```bash
# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...        # From 'stripe listen'

# Stripe Price IDs (Test Mode)
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_AGENCY_PRICE_ID=price_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Pro Tips

1. **Keep `stripe listen` running** in a dedicated terminal
2. **Check both terminals** - webhook terminal and dev server logs
3. **Test real checkout flow** before deploying to production
4. **Use test cards** from https://stripe.com/docs/testing

## Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

---

Once this works locally, use `PRODUCTION_WEBHOOK_SETUP.md` for production deployment!
