# Fix Account Settings Save Issue

This guide will help you fix the "Save Changes" button in the account settings modal.

## Problem

The Save Changes button in the account settings popup may not be working because existing users don't have profile records. The trigger that creates profiles only runs for NEW user signups, not existing users.

## Solution

### Step 1: Run the Profile Migration

The migration file `005_ensure_existing_user_profiles.sql` has been created to ensure all existing users have profile records.

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
4. Copy and paste the contents of `supabase/migrations/005_ensure_existing_user_profiles.sql`
5. Click **Run** (bottom right)
6. Verify you see "✓ All users have profile records" in the results

**Option C: Manual SQL Execution**

```bash
# Read and execute the migration file
psql YOUR_DATABASE_URL -f supabase/migrations/005_ensure_existing_user_profiles.sql
```

### Step 2: Test the Save Button

After running the migration:

1. Open your app in the browser
2. Log in with your account
3. Click on your profile icon → **Account settings**
4. Make a change to your name or description
5. Click **Save Changes**
6. You should see "Changes saved successfully!" alert
7. Check the browser console (F12) for logs:
   - Should see "Saving profile for user: [your-user-id]"
   - Should see "Profile saved successfully: [data]"

### Step 3: Check for Errors

If the save still doesn't work, open the browser console (F12) and look for:

1. **Red error messages** - These will show the exact error
2. **"Error details" logs** - These show:
   - Error message
   - Error code
   - Helpful hints

Common errors and fixes:

#### Error: "new row violates row-level security policy"
**Cause:** RLS policy is blocking the update
**Fix:** Make sure you're logged in and the user ID matches the profile ID

#### Error: "duplicate key value violates unique constraint"
**Cause:** Trying to insert when record already exists
**Fix:** The upsert should handle this, but if not, the migration may need to run

#### Error: "permission denied for table profiles"
**Cause:** User doesn't have permission to access the profiles table
**Fix:** RLS policies need to be enabled (they should be from migration 003)

## What Was Changed

### 1. New Migration (`005_ensure_existing_user_profiles.sql`)

Creates profile records for all existing users who don't have them:

```sql
INSERT INTO public.profiles (id, name, description, created_at, updated_at)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', ''),
  '',
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

### 2. Enhanced Error Logging (`account-settings-modal.tsx`)

Added detailed console logging to help diagnose issues:

- Logs user ID, name, and description before save
- Logs full error details including message, code, and hints
- Shows success message with saved data
- Displays user-friendly alerts with error messages

**Before:**
```typescript
if (error) {
  console.error('Error saving profile:', error)
  alert('Failed to save changes. Please try again.')
}
```

**After:**
```typescript
if (error) {
  console.error('Error saving profile:', error)
  console.error('Error details:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  })
  alert(`Failed to save changes: ${error.message}. Please check the console for details.`)
}
```

## Verification

After running the migration and testing:

1. ✅ Save Changes button should work without errors
2. ✅ Changes should persist after closing and reopening the modal
3. ✅ Console should show "Profile saved successfully" message
4. ✅ Alert should show "Changes saved successfully!"

## Why This Was Needed

The `handle_new_user()` trigger in migration 003 only creates profile records for users who sign up AFTER the migration was run. If you created your account before running migration 003, you wouldn't have a profile record.

The upsert operation in the Save button should handle missing records (it tries INSERT if record doesn't exist), but RLS policies require the record to be created by the user themselves or by a SECURITY DEFINER function.

## Troubleshooting

### Still not working after migration?

1. **Check if profile exists:**
   - Go to Supabase Dashboard → Table Editor → profiles
   - Look for your user ID in the table
   - If not there, run the migration again

2. **Check RLS policies:**
   - Go to Supabase Dashboard → Table Editor → profiles → RLS
   - Should see "Users can update their own profile" policy
   - Should be enabled

3. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Try saving again
   - Look for any red error messages

4. **Check authentication:**
   - Make sure you're logged in
   - Try logging out and back in
   - Check if `user?.id` is defined

### Need more help?

Share the console logs (from Step 3) to diagnose the specific error.

---

**Status:**
- [x] Create migration to add missing profiles
- [x] Add enhanced error logging
- [ ] Run migration (Step 1)
- [ ] Test Save Changes (Step 2)
- [ ] Verify it works (Step 3)
