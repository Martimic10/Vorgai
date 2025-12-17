# Webhook Debugging Guide

## Step 1: Start the Stripe Webhook Listener

In a **NEW terminal window** (keep dev server running):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You should see:
```
> Ready! You are using Stripe API Version [2024-xx-xx]. Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy the `whsec_xxxxx` value!**

## Step 2: Update .env.local

Add/update this line in your `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

Replace `whsec_xxxxxxxxxxxxx` with the value from Step 1.

## Step 3: Restart Dev Server

In your dev server terminal:
1. Press `Ctrl+C` to stop
2. Run `npm run dev` to restart

**IMPORTANT:** You MUST restart after adding the webhook secret!

## Step 4: Test the Payment Flow

1. Go to your pricing page or billing modal
2. Click "Get Starter Plan"
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date (e.g., `12/34`)
5. CVC: Any 3 digits (e.g., `123`)
6. ZIP: Any 5 digits (e.g., `12345`)
7. Complete checkout

## Step 5: Watch the Terminals

### In Stripe CLI Terminal:
You should see events like:
```
2024-xx-xx xx:xx:xx   --> checkout.session.completed [evt_xxxxx]
2024-xx-xx xx:xx:xx  <--  [200] POST http://localhost:3000/api/webhooks/stripe [evt_xxxxx]
```

**Look for `[200]`** - This means the webhook succeeded!

If you see `[400]` or `[500]`, there's an error.

### In Dev Server Terminal:
You should see:
```
🎉 Checkout completed for user: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
💳 Updating subscription to plan: starter
✅ Subscription updated successfully!
```

## Troubleshooting

### Problem: Webhook listener shows nothing
**Solution:** Make sure you ran the command in Step 1

### Problem: `[400]` error in webhook listener
**Possible causes:**
1. **Wrong webhook secret** - Copy the EXACT value from `stripe listen` output
2. **Didn't restart dev server** - You MUST restart after adding STRIPE_WEBHOOK_SECRET
3. **Missing STRIPE_WEBHOOK_SECRET** - Check it's in `.env.local`

**Fix:**
```bash
# 1. Check your .env.local has STRIPE_WEBHOOK_SECRET
# 2. Make sure it matches the output from stripe listen
# 3. Restart dev server: Ctrl+C then npm run dev
```

### Problem: `[500]` error in webhook listener
**Check dev server logs** for the error. Common issues:

1. **Missing SUPABASE_SERVICE_ROLE_KEY**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxxx
   ```

2. **Wrong price IDs** - Make sure these match your Stripe dashboard:
   ```env
   STRIPE_STARTER_PRICE_ID=price_xxxxx
   STRIPE_PRO_PRICE_ID=price_xxxxx
   STRIPE_AGENCY_PRICE_ID=price_xxxxx
   ```

### Problem: Webhook succeeds but plan doesn't update

**Check Supabase directly:**

1. Go to Supabase Dashboard → SQL Editor
2. Run:
   ```sql
   SELECT user_id, plan, status, generations_used, stripe_subscription_id, updated_at
   FROM subscriptions
   ORDER BY updated_at DESC
   LIMIT 5;
   ```

3. Look for your user_id and check if the plan updated

**If plan is still 'free':**
- The webhook didn't run (check terminals above)
- Or there's a database error (check dev server logs)

### Problem: "Stripe is not configured" error

**Solution:** Make sure these are in `.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

Then restart dev server.

## Quick Checklist

Before testing, make sure you have:

- [ ] Stripe CLI installed (`brew install stripe/stripe-cli/stripe`)
- [ ] Logged into Stripe CLI (`stripe login`)
- [ ] Webhook listener running (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
- [ ] STRIPE_WEBHOOK_SECRET in `.env.local` (from webhook listener output)
- [ ] All Stripe env vars in `.env.local`:
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  - STRIPE_SECRET_KEY
  - STRIPE_STARTER_PRICE_ID
  - STRIPE_PRO_PRICE_ID
  - STRIPE_AGENCY_PRICE_ID
  - STRIPE_WEBHOOK_SECRET
  - SUPABASE_SERVICE_ROLE_KEY
- [ ] Dev server restarted after adding webhook secret

## Expected Flow

1. User clicks "Get Starter Plan"
2. Redirects to Stripe checkout
3. User enters test card `4242 4242 4242 4242`
4. Completes payment
5. Stripe redirects to `/dashboard?success=true` (or wherever they came from)
6. **Stripe CLI shows:** `checkout.session.completed [200]`
7. **Dev server shows:** 🎉 → 💳 → ✅
8. **Page polls** for 30 seconds, checking every 2 seconds
9. **Plan updates** when database changes from 'free' to 'starter'
10. **UI updates** showing new plan and credits

## Still Not Working?

Check the logs in **both terminals**:

1. **Stripe CLI terminal** - Shows if webhooks are being received
2. **Dev server terminal** - Shows if webhooks are being processed

If webhooks aren't being received at all:
- Check webhook listener is running
- Check the URL is correct: `localhost:3000/api/webhooks/stripe`

If webhooks are received but fail:
- Check dev server logs for error messages
- Make sure STRIPE_WEBHOOK_SECRET matches
- Make sure SUPABASE_SERVICE_ROLE_KEY is set

If webhooks succeed but UI doesn't update:
- Wait up to 30 seconds (polling takes time)
- Check browser console for errors
- Manually refresh the page
- Check Supabase database directly (SQL above)
