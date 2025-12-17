-- Add missing columns to projects table

-- Add html_content if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'html_content'
  ) THEN
    ALTER TABLE projects ADD COLUMN html_content TEXT;
  END IF;
END $$;

-- Add chat_history if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'chat_history'
  ) THEN
    ALTER TABLE projects ADD COLUMN chat_history JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add thumbnail_url if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE projects ADD COLUMN thumbnail_url TEXT;
  END IF;
END $$;

-- Add last_viewed_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'last_viewed_at'
  ) THEN
    ALTER TABLE projects ADD COLUMN last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create index on last_viewed_at for recently viewed (if not exists)
CREATE INDEX IF NOT EXISTS projects_last_viewed_at_idx ON projects(last_viewed_at DESC);
