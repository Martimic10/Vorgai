# Database Setup Instructions

## Setting up the Projects Table

To enable project saving functionality, you need to run the database migration in your Supabase database.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `/supabase/migrations/001_create_projects_table.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd /Users/michaelmartinez/Vorg

# Run the migration
supabase db push
```

### What This Migration Does

The migration creates:
- **projects table** with the following columns:
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key to auth.users)
  - `name` (text) - Project name
  - `prompt` (text) - Initial prompt used to generate the project
  - `html_content` (text) - Generated HTML content
  - `chat_history` (JSONB) - Chat messages history
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
  - `last_viewed_at` (timestamp)

- **Indexes** for faster queries on:
  - `user_id`
  - `updated_at`
  - `last_viewed_at`

- **Row Level Security (RLS) policies** so users can only see their own projects

- **Trigger** to automatically update `updated_at` timestamp

### Verify the Setup

After running the migration, verify it worked:

1. Go to **Table Editor** in Supabase dashboard
2. You should see a new table called **projects**
3. Click on it to see the schema

### Features Enabled

Once the database is set up, users will be able to:
- ✅ Create new projects automatically when generating landing pages
- ✅ Auto-save project HTML and chat history every second
- ✅ Rename projects (saved to database)
- ✅ View all projects in dashboard "My projects" tab
- ✅ View recently viewed projects in "Recently viewed" tab
- ✅ Click on a project to load and continue editing it

## Troubleshooting

If you get errors about `auth.users`:
- Make sure you've enabled Supabase Auth in your project
- Check that RLS is enabled on the auth.users table

If projects aren't showing up:
- Check the browser console for errors
- Verify the user is authenticated
- Check that the `user_id` in the projects table matches the authenticated user's ID
