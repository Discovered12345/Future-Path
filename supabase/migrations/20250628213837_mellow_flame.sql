/*
  # Fix RLS policies and timestamp handling

  1. Security Updates
    - Drop and recreate all RLS policies to ensure consistency
    - Enable RLS on all tables
    - Add proper service role policies

  2. Data Fixes
    - Fix timestamp null handling issues
    - Update string "null" values to actual NULL
    - Set proper defaults for deleted_at columns

  3. Policy Structure
    - Separate policies for each operation (SELECT, INSERT, UPDATE, DELETE)
    - Service role policies for admin access
    - Proper user isolation using auth.uid()
*/

-- First, disable RLS temporarily to avoid conflicts during policy recreation
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_opportunities DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on user_profiles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_profiles';
    END LOOP;
    
    -- Drop all policies on user_settings
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_settings' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_settings';
    END LOOP;
    
    -- Drop all policies on user_ai_chats
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_ai_chats' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_ai_chats';
    END LOOP;
    
    -- Drop all policies on user_notes
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_notes' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_notes';
    END LOOP;
    
    -- Drop all policies on user_assessments
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_assessments' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_assessments';
    END LOOP;
    
    -- Drop all policies on user_roadmaps
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_roadmaps' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_roadmaps';
    END LOOP;
    
    -- Drop all policies on user_opportunities
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_opportunities' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_opportunities';
    END LOOP;
END $$;

-- Fix timestamp null handling issues BEFORE recreating policies
ALTER TABLE user_profiles ALTER COLUMN deleted_at SET DEFAULT NULL;
ALTER TABLE user_settings ALTER COLUMN deleted_at SET DEFAULT NULL;
ALTER TABLE user_ai_chats ALTER COLUMN deleted_at SET DEFAULT NULL;
ALTER TABLE user_notes ALTER COLUMN deleted_at SET DEFAULT NULL;
ALTER TABLE user_assessments ALTER COLUMN deleted_at SET DEFAULT NULL;
ALTER TABLE user_roadmaps ALTER COLUMN deleted_at SET DEFAULT NULL;
ALTER TABLE user_opportunities ALTER COLUMN deleted_at SET DEFAULT NULL;

-- Update any existing "null" string values to actual NULL
UPDATE user_profiles SET deleted_at = NULL WHERE deleted_at IS NOT NULL AND deleted_at::text = 'null';
UPDATE user_settings SET deleted_at = NULL WHERE deleted_at IS NOT NULL AND deleted_at::text = 'null';
UPDATE user_ai_chats SET deleted_at = NULL WHERE deleted_at IS NOT NULL AND deleted_at::text = 'null';
UPDATE user_notes SET deleted_at = NULL WHERE deleted_at IS NOT NULL AND deleted_at::text = 'null';
UPDATE user_assessments SET deleted_at = NULL WHERE deleted_at IS NOT NULL AND deleted_at::text = 'null';
UPDATE user_roadmaps SET deleted_at = NULL WHERE deleted_at IS NOT NULL AND deleted_at::text = 'null';
UPDATE user_opportunities SET deleted_at = NULL WHERE deleted_at IS NOT NULL AND deleted_at::text = 'null';

-- Re-enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_opportunities ENABLE ROW LEVEL SECURITY;

-- Create new policies for user_profiles
CREATE POLICY "profiles_select_own" ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "profiles_insert_own" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_delete_own" ON user_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_service_all" ON user_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create new policies for user_settings
CREATE POLICY "settings_select_own" ON user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "settings_insert_own" ON user_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_update_own" ON user_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_delete_own" ON user_settings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "settings_service_all" ON user_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create new policies for user_ai_chats
CREATE POLICY "chats_select_own" ON user_ai_chats FOR SELECT TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "chats_insert_own" ON user_ai_chats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chats_update_own" ON user_ai_chats FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chats_delete_own" ON user_ai_chats FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "chats_service_all" ON user_ai_chats FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create new policies for user_notes
CREATE POLICY "notes_select_own" ON user_notes FOR SELECT TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "notes_insert_own" ON user_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_update_own" ON user_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_delete_own" ON user_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notes_service_all" ON user_notes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create new policies for user_assessments
CREATE POLICY "assessments_select_own" ON user_assessments FOR SELECT TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "assessments_insert_own" ON user_assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "assessments_update_own" ON user_assessments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "assessments_delete_own" ON user_assessments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "assessments_service_all" ON user_assessments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create new policies for user_roadmaps
CREATE POLICY "roadmaps_select_own" ON user_roadmaps FOR SELECT TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "roadmaps_insert_own" ON user_roadmaps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "roadmaps_update_own" ON user_roadmaps FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "roadmaps_delete_own" ON user_roadmaps FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "roadmaps_service_all" ON user_roadmaps FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create new policies for user_opportunities
CREATE POLICY "opportunities_select_own" ON user_opportunities FOR SELECT TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "opportunities_insert_own" ON user_opportunities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "opportunities_update_own" ON user_opportunities FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "opportunities_delete_own" ON user_opportunities FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "opportunities_service_all" ON user_opportunities FOR ALL TO service_role USING (true) WITH CHECK (true);