# 🚀 Vorg Launch Checklist

Complete this checklist before launching to production.

## Pre-Launch Setup

### 1. Environment Variables ✓

Make sure ALL these are set in your production environment:

```bash
# Stripe (LIVE MODE - Critical!)
STRIPE_SECRET_KEY=sk_live_...                    # NOT sk_test_!
STRIPE_WEBHOOK_SECRET=whsec_...                  # From production webhook
STRIPE_STARTER_PRICE_ID=price_...                # Live mode price ID
STRIPE_PRO_PRICE_ID=price_...                    # Live mode price ID
STRIPE_AGENCY_PRICE_ID=price_...                 # Live mode price ID

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI Provider (at least one)
OPENAI_API_KEY=sk-...                            # Preferred
# OR
ANTHROPIC_API_KEY=sk-ant-...                     # Fallback

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com     # Your production domain
```

### 2. Stripe Configuration

- [ ] Switch Stripe to **Live Mode**
- [ ] Create live mode products (Starter, Pro, Agency)
- [ ] Copy live mode price IDs to environment variables
- [ ] Set up webhook endpoint (see PRODUCTION_WEBHOOK_SETUP.md)
- [ ] Test webhook delivery shows 200 status
- [ ] Verify webhook secret is from live mode

### 3. Database Setup

- [ ] Run all migrations in production Supabase
- [ ] Verify tables exist:
  - `subscriptions`
  - `projects`
  - `profiles`
- [ ] Test Row Level Security policies
- [ ] Verify service role key has admin access

### 4. AI Provider Setup

- [ ] Choose primary AI provider (OpenAI recommended)
- [ ] Set API key in production environment
- [ ] Verify API key has sufficient credits/quota
- [ ] Test generation endpoint works

### 5. Domain & Deployment

- [ ] Domain configured and pointing to deployment
- [ ] SSL certificate active (HTTPS working)
- [ ] Update `NEXT_PUBLIC_SITE_URL` to match domain
- [ ] Update Stripe redirect URLs to use production domain

## Testing Checklist

### Authentication Flow

- [ ] User can sign up with email
- [ ] Email confirmation works
- [ ] User can log in
- [ ] User can log out
- [ ] Password reset works

### Generation Flow

- [ ] Landing page generation works
- [ ] Chat updates work (iterative changes)
- [ ] Image upload works (reference images)
- [ ] Preview shows correctly
- [ ] Desktop/Tablet/Mobile views work
- [ ] Export HTML works
- [ ] Open in browser works (with Vorg badge logo)

### Subscription Flow

- [ ] Free tier limits enforced (3 projects)
- [ ] Upgrade button opens billing modal
- [ ] Stripe checkout opens correctly
- [ ] Test payment completes successfully
- [ ] Webhook fires and updates subscription
- [ ] User plan updates in UI
- [ ] Generation limits update correctly
- [ ] Cancel redirects back to origin page

### Dashboard

- [ ] Projects display correctly
- [ ] Project thumbnails render (desktop-first preview)
- [ ] Can open existing projects
- [ ] Can rename projects
- [ ] Account settings save correctly
- [ ] Subscription status displays correctly

## Pre-Launch Tests

### Test Payment Flow (Use Test Mode First!)

1. Create test account
2. Generate 3 free projects (should hit limit)
3. Click upgrade
4. Complete checkout with test card: `4242 4242 4242 4242`
5. Verify redirected back to site
6. Verify plan updated to paid tier
7. Verify generation count reset
8. Generate new project (should work now)

### Test Webhook Delivery

1. Go to Stripe Dashboard → Webhooks
2. Click on production webhook
3. Check "Events" tab
4. Should see `checkout.session.completed` events
5. All should show 200 status

### Test Email Flow

1. Sign up with new email
2. Verify confirmation email received
3. Click confirmation link
4. Verify redirected to dashboard

## Security Checks

- [ ] No API keys in client-side code
- [ ] Webhook signature verification enabled
- [ ] RLS policies active on all tables
- [ ] Service role key only used server-side
- [ ] HTTPS enforced (no HTTP)

## Performance Checks

- [ ] Page load time < 3s
- [ ] Generation completes in reasonable time
- [ ] Images optimized (Vorg logo compressed to 32x32)
- [ ] No console errors in browser

## Monitoring Setup

- [ ] Error tracking configured (Sentry, etc.)
- [ ] Webhook failure alerts set up
- [ ] Database backup configured
- [ ] Usage monitoring enabled

## Documentation

- [ ] README.md updated with project info
- [ ] API documentation if needed
- [ ] User guide/help section
- [ ] Pricing page accurate

## Legal & Compliance

- [ ] Privacy Policy in place
- [ ] Terms of Service in place
- [ ] Cookie consent if needed
- [ ] GDPR compliance if EU users
- [ ] Stripe Terms accepted

## Post-Launch Monitoring

### First 24 Hours

- [ ] Monitor webhook success rate
- [ ] Check error logs
- [ ] Monitor signup rate
- [ ] Test payment flow with real card
- [ ] Verify emails sending correctly

### First Week

- [ ] Monitor subscription conversion rate
- [ ] Check generation success rate
- [ ] Review user feedback
- [ ] Monitor API costs
- [ ] Check database performance

## Rollback Plan

If something goes wrong:

1. Keep previous deployment accessible
2. Note webhook secret for rollback
3. Database migrations should be reversible
4. Have Stripe test mode ready as backup

## Go-Live Steps

1. **Final environment variable check**
   ```bash
   # Verify all vars set
   echo $STRIPE_SECRET_KEY          # Should start with sk_live_
   echo $STRIPE_WEBHOOK_SECRET      # Should start with whsec_
   echo $NEXT_PUBLIC_SITE_URL       # Should be https://...
   ```

2. **Deploy to production**
   ```bash
   git push origin main
   # Or your deployment command
   ```

3. **Verify deployment**
   - Site loads correctly
   - No console errors
   - Webhook endpoint accessible

4. **Test critical paths**
   - Sign up → Generate → Subscribe
   - Complete one real payment (can refund later)

5. **Monitor for 1 hour**
   - Watch error logs
   - Check webhook delivery
   - Verify subscriptions updating

## Launch! 🎉

Once all checks pass:

- [ ] Announce to users
- [ ] Post on social media
- [ ] Monitor closely for first 24 hours

---

## Quick Reference

**Local Testing:** See `LOCAL_WEBHOOK_TESTING.md`
**Production Webhooks:** See `PRODUCTION_WEBHOOK_SETUP.md`
**Restart Webhooks:** See `RESTART_WEBHOOKS.md`

## Support Contacts

- **Stripe Support:** https://support.stripe.com
- **Supabase Support:** https://supabase.com/support
- **Vercel Support:** https://vercel.com/support

---

Good luck with the launch! 🚀
