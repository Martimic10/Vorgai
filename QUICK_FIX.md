# Quick Fix - Webhook Not Working

## The Problem
Your webhook listener isn't receiving events, so the database never updates.

## The Solution

### Step 1: Stop Everything
1. In the terminal running `stripe listen`, press `Ctrl+C`
2. In the terminal running `npm run dev`, press `Ctrl+C`

### Step 2: Authenticate Stripe CLI Again
```bash
stripe login
```
- Press Enter to open browser
- Click "Allow access" in your browser
- Wait for "Done!" message

### Step 3: Start Webhook Listener
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**IMPORTANT:** You should see this line:
```
> Ready! You are using Stripe API Version [2024-xx-xx]. Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

**Copy that `whsec_xxxxxxxxxxxxx` value!**

### Step 4: Update .env.local
Open `.env.local` and find this line:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Make sure it EXACTLY matches** the value from Step 3!

If it doesn't exist, add it. If it's different, update it.

### Step 5: Restart Dev Server
In a **NEW terminal** (keep webhook listener running):
```bash
npm run dev
```

### Step 6: Test Payment
1. Go to http://localhost:3000/pricing
2. Click "Get Starter Plan"
3. Use test card: `4242 4242 4242 4242`
4. Expiry: `12/34`, CVC: `123`, ZIP: `12345`
5. Complete checkout

### Step 7: Watch BOTH Terminals

**Terminal 1 (stripe listen):**
Should show:
```
2024-xx-xx xx:xx:xx   --> checkout.session.completed [evt_xxxxx]
2024-xx-xx xx:xx:xx  <--  [200] POST http://localhost:3000/api/webhooks/stripe [evt_xxxxx]
```

**Terminal 2 (npm run dev):**
Should show:
```
🎉 Checkout completed for user: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
💳 Updating subscription to plan: starter
✅ Subscription updated successfully!
```

---

## If You Still Don't See Events:

### Check Stripe CLI is actually listening:
```bash
# In a new terminal, run:
stripe trigger checkout.session.completed
```

You should see an event in the webhook listener terminal. If you don't, the listener isn't working.

### Verify webhook secret matches:
```bash
# Check what's in your .env.local
cat .env.local | grep STRIPE_WEBHOOK_SECRET
```

This should match EXACTLY what `stripe listen` showed.

### Check dev server is running:
Go to http://localhost:3000 - you should see your app.

### Check webhook endpoint works:
The webhook is at: http://localhost:3000/api/webhooks/stripe

---

## Still Having Issues?

Run these diagnostics:

### 1. Check Stripe CLI version:
```bash
stripe --version
```
Should be recent (v1.20+)

### 2. Check if logged in:
```bash
stripe config --list
```
Should show your account info

### 3. Manual webhook test:
```bash
stripe trigger checkout.session.completed --override checkout_session:metadata.user_id=test-user-123
```

Watch both terminals for output.

### 4. Check .env.local has ALL required vars:
```bash
cat .env.local
```

Should have:
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_STARTER_PRICE_ID
- STRIPE_PRO_PRICE_ID
- STRIPE_AGENCY_PRICE_ID
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SUPABASE_URL

---

## Common Mistakes:

❌ **Webhook listener stopped** - Keep it running!
❌ **Wrong webhook secret** - Must match EXACTLY
❌ **Forgot to restart dev server** - Must restart after changing .env.local
❌ **Using wrong port** - Must be localhost:3000
❌ **Dev server not running** - Check http://localhost:3000
