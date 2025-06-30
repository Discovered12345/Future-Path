/*
  # Fix User Tables Migration

  1. New Tables
    - `user_profiles`: Stores user stats, achievements, and activities
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `stats` (jsonb, user statistics)
      - `achievements` (jsonb, user achievements)
      - `recent_activities` (jsonb, recent user activities)
      - `created_at`, `updated_at`, `deleted_at` (timestamps)

    - `user_settings`: Stores user preferences and settings
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `settings` (jsonb, user settings)
      - `created_at`, `updated_at`, `deleted_at` (timestamps)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data

  3. Triggers
    - Auto-create user profile and settings on signup
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;

-- Create user_profiles table
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stats jsonb DEFAULT '{
    "daysActive": 1,
    "skillsTracked": 0,
    "goalsCompleted": 0,
    "messagesWithAI": 0,
    "roadmapsCreated": 0,
    "assessmentsTaken": 0,
    "opportunitiesFound": 0,
    "profileCompleteness": 25
  }'::jsonb,
  achievements jsonb DEFAULT '[]'::jsonb,
  recent_activities jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- Create user_settings table
CREATE TABLE user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  settings jsonb DEFAULT '{
    "theme": "default",
    "emailNotifications": true,
    "pushNotifications": true,
    "weeklyReports": false,
    "autoSave": true,
    "publicProfile": false,
    "language": "en",
    "timezone": "UTC"
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile data"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own profile data"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile data"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

-- Function to automatically create user profile and settings on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile with default stats and achievements
  INSERT INTO user_profiles (user_id, stats, achievements, recent_activities)
  VALUES (
    NEW.id,
    '{
      "daysActive": 1,
      "skillsTracked": 0,
      "goalsCompleted": 0,
      "messagesWithAI": 0,
      "roadmapsCreated": 0,
      "assessmentsTaken": 0,
      "opportunitiesFound": 0,
      "profileCompleteness": 25
    }'::jsonb,
    '[
      {
        "id": "first-login",
        "title": "Welcome to FuturePath!",
        "description": "Created your account and logged in",
        "type": "milestone",
        "earned": true,
        "earnedAt": "' || NOW() || '",
        "requirement": 1,
        "currentProgress": 1
      }
    ]'::jsonb,
    '[]'::jsonb
  );
  
  -- Create user settings with defaults
  INSERT INTO user_settings (user_id, settings)
  VALUES (
    NEW.id,
    '{
      "theme": "default",
      "emailNotifications": true,
      "pushNotifications": true,
      "weeklyReports": false,
      "autoSave": true,
      "publicProfile": false,
      "language": "en",
      "timezone": "UTC"
    }'::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();