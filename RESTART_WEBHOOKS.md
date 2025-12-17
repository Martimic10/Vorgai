# Complete Webhook Restart Guide

Follow these steps **EXACTLY** in order. Don't skip any steps.

---

## Step 1: Stop Everything

### Terminal 1 (Dev Server):
Press `Ctrl+C` to stop the dev server

### Terminal 2 (Webhook Listener, if running):
Press `Ctrl+C` to stop the webhook listener

---

## Step 2: Authenticate Stripe CLI

In **Terminal 2**, run:
```bash
stripe login
```

**What you should see:**
```
Your pairing code is: word-word-word-word
This pairing code verifies your authentication with Stripe.
Press Enter to open the browser (^C to quit)
```

**Do this:**
1. Press `Enter` - your browser will open
2. In the browser, you'll see your pairing code
3. Click **"Allow access"**
4. Wait for the browser to show "Success!"
5. Go back to Terminal 2

**Terminal 2 should now show:**
```
Done! The Stripe CLI is configured for [your account name]
```

---

## Step 3: Start Webhook Listener

In **Terminal 2**, run:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**CRITICAL - You MUST see this:**
```
> Ready! You are using Stripe API Version [2024-XX-XX]. Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (^C to quit)
```

**Copy the ENTIRE `whsec_xxxxxxxxxx` value!**

Example: `whsec_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

## Step 4: Update .env.local

1. Open `.env.local` in your code editor
2. Find the line with `STRIPE_WEBHOOK_SECRET`
3. **Replace** the entire value with the `whsec_xxxxx` you just copied from Terminal 2

**Example:**
```env
STRIPE_WEBHOOK_SECRET=whsec_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**IMPORTANT:**
- No quotes around the value
- No spaces
- Must be EXACTLY what Terminal 2 showed
- Save the file

---

## Step 5: Verify .env.local

Run this in **Terminal 1**:
```bash
cat .env.local | grep STRIPE_WEBHOOK_SECRET
```

**You should see:**
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Compare this with Terminal 2's output - they MUST match EXACTLY!**

---

## Step 6: Start Dev Server

In **Terminal 1**, run:
```bash
npm run dev
```

**Wait for:**
```
Ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## Step 7: Test Webhook with Stripe Trigger

In a **NEW Terminal 3**, run:
```bash
stripe trigger checkout.session.completed
```

### Check Terminal 2 (Webhook Listener):
You should see:
```
2024-XX-XX XX:XX:XX   --> checkout.session.completed [evt_xxxxx]
2024-XX-XX XX:XX:XX  <--  [200] POST http://localhost:3000/api/webhooks/stripe [evt_xxxxx]
```

**Look for `[200]`** - This means SUCCESS!

### If you see `[400]` or `[500]`:
- **[400]** = Webhook secret doesn't match → Go back to Step 4
- **[500]** = Server error → Check Terminal 1 for error messages

---

## Step 8: Test Real Payment

Now test with actual payment flow:

1. Go to http://localhost:3000/pricing
2. Click **"Get Starter Plan"**
3. Use test card: `4242 4242 4242 4242`
4. Expiry: `12/34`
5. CVC: `123`
6. ZIP: `12345`
7. Click **"Subscribe"**

---

## Step 9: Watch BOTH Terminals

### Terminal 2 (Webhook Listener) should show:
```
2024-XX-XX XX:XX:XX   --> checkout.session.completed [evt_xxxxx]
2024-XX-XX XX:XX:XX  <--  [200] POST http://localhost:3000/api/webhooks/stripe [evt_xxxxx]
```

### Terminal 1 (Dev Server) should show:
```
🎉 Checkout completed for user: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
💳 Updating subscription to plan: starter
✅ Subscription updated successfully!
```

---

## Step 10: Check UI Updates

After seeing the logs above:

1. Your browser should redirect to the page you started from
2. Wait up to 30 seconds
3. The plan should update from "Free Plan" to "Starter Plan"

**If it doesn't update:**
- Manually refresh the page
- Check the sidebar - it should show "Starter Plan"

---

## Common Problems & Solutions

### Problem: "stripe: command not found"
**Solution:** Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

### Problem: Terminal 2 shows nothing when you make a test payment
**Solution:**
- Make sure `stripe listen` is still running
- Check the URL: `localhost:3000/api/webhooks/stripe` (no typos)
- Restart from Step 3

### Problem: Terminal 1 shows no emoji logs
**Solution:**
- Terminal 2 probably shows `[400]` or `[500]`
- If `[400]`: Webhook secret mismatch → Redo Steps 3-6
- If `[500]`: Check Terminal 1 for error message

### Problem: `[400]` in Terminal 2
**Solution:**
```bash
# 1. Check what's in .env.local
cat .env.local | grep STRIPE_WEBHOOK_SECRET

# 2. Check what Terminal 2 showed when you started webhook listener
# They MUST match exactly

# 3. If they don't match:
# - Stop Terminal 1 (Ctrl+C)
# - Update .env.local with correct secret
# - Restart: npm run dev
```

### Problem: Plan updates but shows wrong plan
**Solution:** Check your price IDs in `.env.local`:
```env
STRIPE_STARTER_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_AGENCY_PRICE_ID=price_xxxxx
```

Make sure these match your Stripe Dashboard → Products → Prices

---

## Checklist - Complete This Before Testing

- [ ] Stripe CLI installed
- [ ] `stripe login` completed successfully
- [ ] `stripe listen` running in Terminal 2
- [ ] Copied `whsec_xxxxx` from Terminal 2 output
- [ ] Updated `STRIPE_WEBHOOK_SECRET` in `.env.local`
- [ ] Verified secret matches with `cat .env.local | grep STRIPE_WEBHOOK_SECRET`
- [ ] Dev server restarted in Terminal 1
- [ ] `stripe trigger checkout.session.completed` shows `[200]` in Terminal 2
- [ ] Dev server shows it's ready on http://localhost:3000

---

## You're Ready When...

✅ Terminal 2 shows: `> Ready! Your webhook signing secret is whsec_xxxxx`
✅ Terminal 1 shows: `Ready started server on 0.0.0.0:3000`
✅ `stripe trigger` test shows `[200]` in Terminal 2
✅ Both secrets match (Terminal 2 output = `.env.local` value)

**Now you can test payments and the plan should update automatically!**
