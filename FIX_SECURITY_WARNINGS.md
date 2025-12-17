# Fix Security Warnings - Quick Guide

This guide will help you fix all 5 security warnings from Supabase Security Advisor.

## Summary of Issues

1. **4x Search Path Mutable** - Functions missing secure search_path configuration
2. **1x Leaked Password Protection Disabled** - Password leak checking not enabled

## Fix Steps

### Step 1: Run the Security Migration

The migration file `004_fix_security_warnings.sql` has been created to fix the search path issues.

**Option A: Using Supabase CLI (Recommended)**

```bash
# Make sure you're logged in
npx supabase login

# Link your project (if not already linked)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push the migration
npx supabase db push
```

**Option B: Using Supabase Dashboard**

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/004_fix_security_warnings.sql`
5. Click **Run** (bottom right)
6. Verify you see "✓ All functions have proper search_path configuration" in the results

**Option C: Manual SQL Execution**

```bash
# Read and execute the migration file
psql YOUR_DATABASE_URL -f supabase/migrations/004_fix_security_warnings.sql
```

### Step 2: Enable Leaked Password Protection

This requires manual configuration in the Supabase Dashboard:

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Navigate to **Authentication** → **Providers**
3. Click on **Email** provider
4. Scroll to **"Check for leaked passwords"**
5. **Toggle it ON**
6. Click **Save**

See [ENABLE_PASSWORD_PROTECTION.md](ENABLE_PASSWORD_PROTECTION.md) for detailed instructions.

## Verification

### Verify Search Path Fixes

After running the migration, check the Security Advisor:

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Click **Security Advisor** in the left sidebar
3. The 4 "Function Search Path Mutable" warnings should be gone

### Verify Password Protection

1. The "Leaked Password Protection Disabled" warning should disappear
2. Try signing up with a weak password like `password123` - it should be rejected

## What Was Fixed

### Search Path Security

The migration updated these functions to use a secure search_path:

1. `update_updated_at_column()` - Auto-updates timestamps on project changes
2. `reset_monthly_generations()` - Resets generation counts monthly
3. `handle_new_user()` - Creates profile on user signup

**Before:**
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**After:**
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ← Fixed!
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
```

### Why This Matters

**Search Path Vulnerability:**
Without a fixed search_path, attackers could potentially:
- Create malicious functions/tables in their own schema
- Trick SECURITY DEFINER functions into using them
- Escalate privileges or access unauthorized data

**Password Leak Protection:**
Prevents users from choosing passwords that have been exposed in data breaches.

## Expected Results

After completing both steps, you should have:
- ✅ 0 Errors
- ✅ 0 Warnings
- ✅ 0 Info items

All security warnings resolved! 🎉

## Troubleshooting

### Migration fails with "function already exists"

This is fine - it means the function is being updated (which is what we want).

### Can't find Supabase project ref

Run:
```bash
npx supabase projects list
```

Or find it in your Supabase Dashboard URL:
```
https://supabase.com/dashboard/project/ABC123DEF456
                                         ^^^^^^^^^^^^
                                         This is your project ref
```

### Password protection toggle not visible

Make sure you're looking at the **Email** provider settings, not the general Authentication settings.

## Production Deployment

After fixing locally:

1. **Commit the migration:**
   ```bash
   git add supabase/migrations/004_fix_security_warnings.sql
   git commit -m "fix: address security warnings from Supabase Advisor"
   ```

2. **Deploy to production:**
   - If using CI/CD, the migration will run automatically
   - If manual, run the same migration against production database

3. **Enable password protection in production:**
   - Repeat Step 2 for your production Supabase project

---

**Status:**
- [ ] Run migration (Step 1)
- [ ] Enable password protection (Step 2)
- [ ] Verify in Security Advisor
- [ ] Deploy to production
