# 🚀 Final Stripe Setup Checklist

## ✅ What's Been Done

### 1. **Complete Stripe Integration**
- ✅ Pricing page checkout working
- ✅ Billing modal with Stripe checkout
- ✅ Generation limit enforcement
- ✅ Paywall when limits reached
- ✅ Subscription status display
- ✅ Webhook handling for subscription events

### 2. **Files Created/Updated**
- ✅ `/lib/stripe.ts` - Stripe client & config
- ✅ `/lib/subscription.ts` - Subscription utilities
- ✅ `/app/api/create-checkout-session/route.ts` - Checkout API
- ✅ `/app/api/webhooks/stripe/route.ts` - Webhook handler
- ✅ `/app/api/create-portal-session/route.ts` - Billing portal
- ✅ `/app/api/generate/route.ts` - Generation limits enforced
- ✅ `/app/pricing/page.tsx` - Stripe checkout integration
- ✅ `/app/generate/page.tsx` - Paywall modal trigger
- ✅ `/app/dashboard/page.tsx` - Subscription status widget
- ✅ `/components/billing-modal.tsx` - Updated with checkout
- ✅ `/components/subscription-status.tsx` - Usage display

## 🔧 Required Actions (DO THESE NOW!)

### Step 1: Run Database Migration
1. Open Supabase Dashboard → SQL Editor
2. Create new query
3. Copy & paste entire contents of `RUN_THIS_MIGRATION.sql`
4. Click **RUN**
5. Verify success (should show "Success. No rows returned")

### Step 2: Verify Environment Variables
Make sure your `.env.local` has:
```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_AGENCY_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Step 3: Start Stripe Webhook Listener
In a **separate terminal**, run:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Keep this running while testing!

### Step 4: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 🧪 Testing Checklist

### Test 1: Free User Flow
1. ✅ Sign up as new user
2. ✅ Should start on "Free Plan" with 0/3 projects
3. ✅ Create 3 projects successfully
4. ✅ Try 4th project → Should see paywall: "You've reached your free plan limit"
5. ✅ Billing modal should open automatically
6. ✅ Check dashboard → Subscription status shows "3/3 projects"

### Test 2: Stripe Checkout
1. ✅ Click "Get Starter Plan" in billing modal
2. ✅ Should redirect to Stripe checkout
3. ✅ Use test card: `4242 4242 4242 4242`
4. ✅ Complete checkout
5. ✅ Should redirect back to `/dashboard?success=true`
6. ✅ Check Stripe CLI terminal → Should see webhook events
7. ✅ Refresh dashboard → Plan should show "Starter" with "0/10 projects"

### Test 3: Paid User Limits
1. ✅ As Starter user, create 10 projects
2. ✅ Try 11th project → Should see paywall
3. ✅ Check Supabase → `generations_used` should be 10
4. ✅ Billing modal shows current plan

## 📊 Plan Limits

| Plan | Price | Monthly Projects | Status |
|------|-------|------------------|--------|
| Free | $0 | 3 | ✅ Implemented |
| Starter | $9 | 10 | ✅ Implemented |
| Pro | $19 | 20 | ✅ Implemented |
| Agency | $39 | Unlimited | ✅ Implemented |

## 🎯 Features Implemented

### Generation Limits
- ✅ API checks limits before generation
- ✅ Increments count after successful generation
- ✅ 402 error when limit reached
- ✅ Updates/edits don't count toward limit

### Paywall
- ✅ Automatic modal on limit reached
- ✅ Shows pricing options
- ✅ Stripe checkout integration
- ✅ Loading states

### Subscription Display
- ✅ Dashboard widget shows plan & usage
- ✅ Progress bar with color coding
- ✅ Warning at 80%+ usage
- ✅ "Upgrade" button when limit reached

### Everywhere Pricing Works
- ✅ Pricing page (`/pricing`)
- ✅ Billing modal (generate page)
- ✅ Paywall modal (on limit)
- ✅ Dashboard subscription widget

## 🐛 Troubleshooting

### "Invalid price ID" error
- Check `.env.local` has all three `STRIPE_*_PRICE_ID` variables
- Restart dev server after adding env variables
- Price IDs must start with `price_`

### "Invalid URL" error
- Make sure `NEXT_PUBLIC_SITE_URL` has `http://` prefix
- Example: `http://localhost:3000` NOT `localhost:3000`

### Webhook not working
- Check Stripe CLI is running: `stripe listen...`
- Copy webhook secret from CLI output to `.env.local`
- Restart dev server

### Subscription not created after checkout
- Check Stripe CLI terminal for webhook errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check Supabase logs for errors

## 📝 Next Steps (After Testing)

1. **Switch to Live Mode** (when ready to launch):
   - Get live Stripe API keys
   - Create products in live mode
   - Update all env variables
   - Set up production webhook endpoint

2. **Optional Enhancements**:
   - Email notifications for limit warnings
   - Usage analytics dashboard
   - Proration for upgrades/downgrades
   - Team/organization plans

## 🎉 You're Ready!

Once you've:
1. ✅ Run the migration
2. ✅ Started webhook listener
3. ✅ Restarted dev server
4. ✅ Tested free user flow
5. ✅ Tested checkout flow

You're ready to launch with Stripe payments!
