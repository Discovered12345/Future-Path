/*
  # Fix RLS Policies and Data Saving Issues

  1. Policy Updates
    - Fix all RLS policies for proper data access
    - Add service role policies for admin operations
    - Remove conflicting policies

  2. Database Fixes
    - Fix timestamp null handling issues
    - Ensure all tables have RLS enabled
    - Set proper defaults for deleted_at columns

  3. Security
    - Maintain user data isolation
    - Allow proper CRUD operations for authenticated users
    - Enable admin operations for account deletion
*/

-- Fix user_profiles policies
DROP POLICY IF EXISTS "Users can view their own profile data" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile data" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile data" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile data" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON user_profiles;

CREATE POLICY "Users can view their own profile data"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile data"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile data"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile data"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all profiles"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix user_settings policies
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;
DROP POLICY IF EXISTS "Service role can manage all settings" ON user_settings;

CREATE POLICY "Users can view their own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON user_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all settings"
  ON user_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix user_ai_chats policies
DROP POLICY IF EXISTS "Users can view their own AI chats" ON user_ai_chats;
DROP POLICY IF EXISTS "Users can insert their own AI chats" ON user_ai_chats;
DROP POLICY IF EXISTS "Users can update their own AI chats" ON user_ai_chats;
DROP POLICY IF EXISTS "Users can delete their own AI chats" ON user_ai_chats;
DROP POLICY IF EXISTS "Service role can manage all chats" ON user_ai_chats;

CREATE POLICY "Users can view their own AI chats"
  ON user_ai_chats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI chats"
  ON user_ai_chats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI chats"
  ON user_ai_chats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI chats"
  ON user_ai_chats
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all chats"
  ON user_ai_chats
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix user_notes policies
DROP POLICY IF EXISTS "Users can manage their own notes" ON user_notes;
DROP POLICY IF EXISTS "Service role can manage all notes" ON user_notes;

CREATE POLICY "Users can view their own notes"
  ON user_notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON user_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON user_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON user_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all notes"
  ON user_notes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix user_assessments policies
DROP POLICY IF EXISTS "Users can manage their own assessments" ON user_assessments;
DROP POLICY IF EXISTS "Service role can manage all assessments" ON user_assessments;

CREATE POLICY "Users can view their own assessments"
  ON user_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
  ON user_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
  ON user_assessments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments"
  ON user_assessments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all assessments"
  ON user_assessments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix user_roadmaps policies
DROP POLICY IF EXISTS "Users can manage their own roadmaps" ON user_roadmaps;
DROP POLICY IF EXISTS "Service role can manage all roadmaps" ON user_roadmaps;

CREATE POLICY "Users can view their own roadmaps"
  ON user_roadmaps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmaps"
  ON user_roadmaps
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps"
  ON user_roadmaps
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps"
  ON user_roadmaps
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all roadmaps"
  ON user_roadmaps
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix user_opportunities policies
DROP POLICY IF EXISTS "Users can manage their own opportunities" ON user_opportunities;
DROP POLICY IF EXISTS "Service role can manage all opportunities" ON user_opportunities;

CREATE POLICY "Users can view their own opportunities"
  ON user_opportunities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own opportunities"
  ON user_opportunities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own opportunities"
  ON user_opportunities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own opportunities"
  ON user_opportunities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all opportunities"
  ON user_opportunities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure all tables have RLS enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_opportunities ENABLE ROW LEVEL SECURITY;

-- Fix timestamp null handling issues
ALTER TABLE user_profiles ALTER COLUMN deleted_at SET DEFAULT NULL;
ALTER TABLE user_settings ALTER COLUMN deleted_at SET DEFAULT NULL;
ALTER TABLE user_ai_chats ALTER COLUMN deleted_at SET DEFAULT NULL;
ALTER TABLE user_notes ALTER COLUMN deleted_at SET DEFAULT NULL;
ALTER TABLE user_assessments ALTER COLUMN deleted_at SET DEFAULT NULL;
ALTER TABLE user_roadmaps ALTER COLUMN deleted_at SET DEFAULT NULL;
ALTER TABLE user_opportunities ALTER COLUMN deleted_at SET DEFAULT NULL;

-- Update any existing "null" string values to actual NULL
UPDATE user_profiles SET deleted_at = NULL WHERE deleted_at::text = 'null';
UPDATE user_settings SET deleted_at = NULL WHERE deleted_at::text = 'null';
UPDATE user_ai_chats SET deleted_at = NULL WHERE deleted_at::text = 'null';
UPDATE user_notes SET deleted_at = NULL WHERE deleted_at::text = 'null';
UPDATE user_assessments SET deleted_at = NULL WHERE deleted_at::text = 'null';
UPDATE user_roadmaps SET deleted_at = NULL WHERE deleted_at::text = 'null';
UPDATE user_opportunities SET deleted_at = NULL WHERE deleted_at::text = 'null';