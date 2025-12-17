# Stripe Test Card Credentials

## Test Cards for Checkout Flow

### ✅ Successful Payment
**Card Number:** `4242 4242 4242 4242`
- Use any future expiration date (e.g., `12/34`)
- Use any 3-digit CVC (e.g., `123`)
- Use any billing ZIP code (e.g., `12345`)

This card will always succeed and create a subscription.

### ❌ Payment Declined
**Card Number:** `4000 0000 0000 0002`
- Test how your app handles failed payments
- Card will be declined

### 🔒 Requires Authentication (3D Secure)
**Card Number:** `4000 0025 0000 3155`
- Tests SCA (Strong Customer Authentication)
- You'll see a 3D Secure modal during checkout

### 💳 Other Test Scenarios

**Insufficient Funds:**
- `4000 0000 0000 9995`

**Expired Card:**
- `4000 0000 0000 0069`

**Incorrect CVC:**
- `4000 0000 0000 0127`

## Testing the Full Flow

### 1. Start Stripe Webhook Listener
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Keep this running in a separate terminal!

### 2. Test from Different Pages

**From Pricing Page (`/pricing`):**
1. Click "Get Starter Plan"
2. Complete checkout with test card `4242 4242 4242 4242`
3. Should redirect back to `/pricing?success=true`

**From Dashboard Sidebar (Billing Modal):**
1. Click "Billing" in sidebar
2. Click "Get Pro Plan"
3. Complete checkout
4. Should redirect back to `/dashboard?success=true`

**From Generate Page (when limit reached):**
1. Use up your 3 free projects
2. Try to generate 4th project
3. Paywall modal appears
4. Click "Get Starter Plan"
5. Complete checkout
6. Should redirect back to `/generate?success=true`

### 3. Verify Subscription Created

**Check Stripe CLI Output:**
- You should see webhook events like:
  - `checkout.session.completed`
  - `customer.subscription.created`

**Check Supabase:**
```sql
SELECT user_id, plan, status, generations_used, stripe_subscription_id
FROM subscriptions
WHERE stripe_subscription_id IS NOT NULL;
```

**Check Your Sidebar:**
- Plan should update from "Free Plan" to "Starter Plan"
- Usage should show "0 / 10 projects"

### 4. Test Generation Limits

**Free Plan (3 projects):**
- 4th generation should trigger paywall

**Starter Plan (10 projects):**
- 11th generation should trigger paywall

**Pro Plan (20 projects):**
- 21st generation should trigger paywall

**Agency Plan (unlimited):**
- No limit! Generate as many as you want

## Important Notes

- ✅ Test mode subscriptions won't charge real money
- ✅ All test cards work with any CVC, expiry, and ZIP
- ✅ The webhook listener is REQUIRED for local testing
- ✅ In production, you'll set up webhooks in Stripe Dashboard
- ✅ Users are redirected back to where they started checkout
- ❌ Don't use real card numbers in test mode!

## Canceling Test Subscriptions

**Via Stripe Dashboard:**
1. Go to Stripe Dashboard → Customers
2. Find the customer
3. Click on their subscription
4. Click "Cancel subscription"

**Via Your App (coming soon):**
- You can add a "Manage Billing" button that uses the billing portal API

## Next Steps for Production

1. **Get Live API Keys:**
   - Stripe Dashboard → Developers → API Keys
   - Switch from "Test mode" to "Live mode"

2. **Create Live Products:**
   - Create Starter, Pro, and Agency products in live mode
   - Copy live price IDs to `.env.local`

3. **Set Up Production Webhooks:**
   - Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.*`
   - Copy webhook secret to production env vars

4. **Update Environment Variables:**
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...  # from production webhook
   ```
