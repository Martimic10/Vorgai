# Production Deployment Guide - Vorg.dev

Complete guide to deploy Vorg to production on Vercel with domain vorg.dev.

## Step 1: Deploy to Vercel

### 1.1 Push to GitHub (if not already done)

```bash
# Initialize git if needed
git init

# Add all files
git add .

# Commit
git commit -m "Ready for production deployment"

# Create GitHub repo and push
# Go to https://github.com/new and create a new repository
# Then:
git remote add origin https://github.com/YOUR_USERNAME/vorg.git
git branch -M main
git push -u origin main
```

### 1.2 Import Project to Vercel

1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### 1.3 Configure Environment Variables in Vercel

Before deploying, add these environment variables in Vercel:

**Build & Development Settings:**
- Leave framework preset as **Next.js**
- Leave build command as default
- Leave output directory as default

**Environment Variables** (add in Vercel dashboard):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (LIVE MODE - we'll get these in Step 3)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (we'll get this in Step 4)

# Site URL (IMPORTANT - use your domain)
NEXT_PUBLIC_SITE_URL=https://vorg.dev

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

**IMPORTANT:** Make sure to use `https://vorg.dev` (no trailing slash) for `NEXT_PUBLIC_SITE_URL`

### 1.4 Deploy

Click **Deploy** and wait for the build to complete.

## Step 2: Configure Domain

### 2.1 Add Domain in Vercel

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Add `vorg.dev`
4. Add `www.vorg.dev` (optional, will redirect to main)

### 2.2 Update DNS Records

Vercel will show you the DNS records to add. Go to your domain registrar and add:

**For root domain (vorg.dev):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**For www (optional):**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

**Note:** DNS propagation can take up to 48 hours, but usually takes 10-30 minutes.

### 2.3 Verify Domain

Once DNS propagates, Vercel will automatically issue an SSL certificate for your domain.

## Step 3: Configure Stripe Live Mode

### 3.1 Activate Stripe Live Mode

1. Go to https://dashboard.stripe.com
2. Toggle the switch in the top right from **Test mode** to **Live mode**
3. Complete Stripe's onboarding if you haven't already:
   - Business details
   - Bank account information
   - Tax information

### 3.2 Get Live API Keys

1. In Stripe Dashboard (Live mode), go to **Developers** → **API keys**
2. Copy your **Publishable key** (starts with `pk_live_`)
3. Click **Reveal** on **Secret key** and copy it (starts with `sk_live_`)

### 3.3 Update Vercel Environment Variables

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Update these variables:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
   - `STRIPE_SECRET_KEY` → `sk_live_...`
3. **Redeploy** your app (Vercel → Deployments → click ⋯ on latest → Redeploy)

### 3.4 Update Stripe Product Prices (IMPORTANT!)

Your test mode products don't exist in live mode. You need to create them:

1. In Stripe Dashboard (Live mode), go to **Products**
2. Create products matching your test mode setup:

**Pro Plan:**
- Name: `Vorg Pro`
- Description: `Professional plan with advanced features`
- Price: `$29.99 USD per month`
- Recurring: Monthly
- Copy the **Price ID** (starts with `price_`)

**Enterprise Plan:**
- Name: `Vorg Enterprise`
- Description: `Enterprise plan with unlimited features`
- Price: `$99.99 USD per month`
- Recurring: Monthly
- Copy the **Price ID** (starts with `price_`)

### 3.5 Update Price IDs in Code

Update the price IDs in your code to use live mode prices:

**Find where price IDs are used** (likely in `/app/pricing/page.tsx` or similar):

```typescript
// OLD (test mode)
const proPriceId = 'price_test_...'
const enterprisePriceId = 'price_test_...'

// NEW (live mode)
const proPriceId = 'price_...' // your live Pro price ID
const enterprisePriceId = 'price_...' // your live Enterprise price ID
```

Or better yet, use environment variables:

```typescript
const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
const enterprisePriceId = process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID
```

Then add to Vercel environment variables:
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` → `price_...` (your live Pro price)
- `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` → `price_...` (your live Enterprise price)

Commit and push changes, Vercel will auto-deploy.

## Step 4: Create Production Webhook

### 4.1 Create Webhook Endpoint

1. In Stripe Dashboard (Live mode), go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://vorg.dev/api/webhooks/stripe`
4. Description: `Production webhook for Vorg`
5. Click **Select events** and choose:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **Add endpoint**

### 4.2 Get Webhook Signing Secret

1. Click on your newly created webhook
2. Under **Signing secret**, click **Reveal**
3. Copy the secret (starts with `whsec_`)

### 4.3 Add to Vercel Environment Variables

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Add or update:
   - `STRIPE_WEBHOOK_SECRET` → `whsec_...` (your live webhook secret)
3. **Redeploy** your app

## Step 5: Fix Security Warnings

### 5.1 Run Security Migration

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy contents of `supabase/migrations/004_fix_security_warnings.sql`
4. Paste and click **Run**
5. Verify you see success messages

### 5.2 Enable Password Protection

1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Find **Password Protection** settings
3. Enable **Leaked Password Protection**
4. This prevents users from using commonly leaked passwords

### 5.3 Verify Warnings Are Fixed

1. Go to Supabase Dashboard → **Security Advisor**
2. All warnings should now be resolved
3. You should see a green checkmark

## Step 6: Update Supabase Site URL

### 6.1 Update Site URL in Supabase

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Update **Site URL** to: `https://vorg.dev`
3. Update **Redirect URLs** to allow:
   - `https://vorg.dev/**`
   - `http://localhost:3000/**` (for local development)

This ensures authentication redirects work correctly.

## Step 7: Test Everything End-to-End

### 7.1 Test Authentication

1. Go to https://vorg.dev
2. Sign up with a new account
3. Verify email confirmation works
4. Log in and log out
5. Test password reset

### 7.2 Test Landing Page Generation

1. Log in to your account
2. Create a new landing page
3. Verify generation works
4. Test preview modes (desktop, tablet, mobile)
5. Test "Open in Browser" button
6. Test export functionality

### 7.3 Test Payments (IMPORTANT - This charges real money!)

**Use Stripe's test card for initial testing:**

Even in live mode, you can test with test cards if you have the Stripe CLI, but for real testing:

1. Go to https://vorg.dev/pricing
2. Click on a plan
3. Use a **real credit card** (or your own test card if available)
4. Complete checkout
5. Verify you're redirected back with success
6. Check Stripe Dashboard → **Payments** to see the payment
7. Go to Account Settings and verify your plan updated

**Test the back button:**
1. Go to pricing page
2. Click a plan
3. In Stripe checkout, click the back arrow
4. Verify you're returned to pricing page (or wherever you came from)

### 7.4 Test Webhooks

1. After making a test purchase, go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your production webhook
3. Look at **Recent events**
4. All events should have green checkmarks (successful)
5. If you see failures, click on them to see error details

### 7.5 Test Account Settings

1. Go to Account Settings
2. Update your name and description
3. Click **Save Changes**
4. Should see "Changes saved successfully!"
5. Close and reopen modal to verify changes persisted

## Step 8: Final Checks

### 8.1 Performance

- [ ] Test page load speed
- [ ] Check Vercel Analytics for any issues
- [ ] Test on different devices and browsers

### 8.2 SEO

- [ ] Verify meta tags are correct
- [ ] Check Open Graph images
- [ ] Test Twitter card preview

### 8.3 Security

- [ ] All environment variables are set correctly
- [ ] No secrets in client-side code
- [ ] HTTPS is working
- [ ] Supabase RLS policies are enabled

### 8.4 Monitoring

- [ ] Set up error tracking (optional: Sentry)
- [ ] Monitor Vercel logs for errors
- [ ] Monitor Stripe webhook logs
- [ ] Check Supabase logs

## Troubleshooting

### Issue: Webhook events failing

**Check:**
1. Is `STRIPE_WEBHOOK_SECRET` set correctly in Vercel?
2. Did you redeploy after adding the secret?
3. Check Vercel logs for webhook errors
4. Verify endpoint URL is `https://vorg.dev/api/webhooks/stripe`

### Issue: Payments not updating subscription

**Check:**
1. Webhook events are succeeding (green checkmarks)
2. Check Vercel function logs for errors
3. Verify Supabase connection is working
4. Check subscriptions table in Supabase

### Issue: Domain not loading

**Check:**
1. DNS records are correct
2. Wait for DNS propagation (can take up to 48 hours)
3. Verify domain is added in Vercel
4. Check Vercel domain settings for any errors

### Issue: "Redirect URI mismatch" error on login

**Check:**
1. Site URL in Supabase is `https://vorg.dev`
2. Redirect URLs include `https://vorg.dev/**`
3. `NEXT_PUBLIC_SITE_URL` in Vercel is `https://vorg.dev`

## Environment Variables Checklist

Make sure all these are set in Vercel:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live mode: `pk_live_...`)
- [ ] `STRIPE_SECRET_KEY` (live mode: `sk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` (live mode: `whsec_...`)
- [ ] `NEXT_PUBLIC_SITE_URL` (`https://vorg.dev`)
- [ ] `OPENAI_API_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` (optional, if using env var)
- [ ] `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` (optional, if using env var)

## Post-Launch

### Monitor for the first 24 hours

1. Check Vercel analytics for traffic
2. Monitor Stripe for payments
3. Check for any error logs
4. Test periodically to ensure everything works

### Keep test mode for development

Continue using Stripe test mode when developing locally:
- Use test keys in `.env.local`
- Use Stripe CLI for local webhooks
- Never test production payments without intention

---

**You're ready to launch!** 🚀

Once you complete all steps, your app will be live at https://vorg.dev with real payments processing.
