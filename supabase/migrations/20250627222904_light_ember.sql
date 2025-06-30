/*
  # Complete FuturePath Database Setup
  
  This script creates all necessary tables for the FuturePath application:
  
  1. User Tables
    - user_profiles: User statistics, achievements, and activities
    - user_settings: User preferences and settings
    - user_notes: User's personal notes and journal entries
    - user_assessments: Career assessment results and history
    - user_roadmaps: Learning roadmaps and progress tracking
    - user_opportunities: Saved scholarships, internships, competitions
    - user_ai_chats: AI conversation history and chat sessions
  
  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Policies ensure users can only access their own data
    - Automatic profile creation on user signup
  
  3. Performance
    - Indexes on frequently queried columns
    - Triggers for automatic timestamp updates
*/

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS user_ai_chats CASCADE;
DROP TABLE IF EXISTS user_opportunities CASCADE;
DROP TABLE IF EXISTS user_roadmaps CASCADE;
DROP TABLE IF EXISTS user_assessments CASCADE;
DROP TABLE IF EXISTS user_notes CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

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

-- Create user_notes table
CREATE TABLE user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text DEFAULT 'Untitled Note',
  content text DEFAULT '',
  category text DEFAULT 'general',
  tags jsonb DEFAULT '[]'::jsonb,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- Create user_assessments table
CREATE TABLE user_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_name text NOT NULL,
  assessment_type text DEFAULT 'career',
  questions jsonb DEFAULT '[]'::jsonb,
  answers jsonb DEFAULT '[]'::jsonb,
  results jsonb DEFAULT '{}'::jsonb,
  score integer DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- Create user_roadmaps table
CREATE TABLE user_roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_name text NOT NULL,
  career_track text NOT NULL,
  steps jsonb DEFAULT '[]'::jsonb,
  progress_percentage integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- Create user_opportunities table
CREATE TABLE user_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_title text NOT NULL,
  opportunity_type text NOT NULL,
  description text DEFAULT '',
  amount text DEFAULT '',
  deadline date,
  location text DEFAULT '',
  requirements jsonb DEFAULT '[]'::jsonb,
  skills jsonb DEFAULT '[]'::jsonb,
  application_status text DEFAULT 'saved',
  application_date timestamptz,
  notes text DEFAULT '',
  external_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- Create user_ai_chats table
CREATE TABLE user_ai_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_title text DEFAULT 'New Chat',
  messages jsonb DEFAULT '[]'::jsonb,
  message_count integer DEFAULT 0,
  last_message_at timestamptz DEFAULT now(),
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX idx_user_notes_category ON user_notes(category);
CREATE INDEX idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX idx_user_roadmaps_user_id ON user_roadmaps(user_id);
CREATE INDEX idx_user_opportunities_user_id ON user_opportunities(user_id);
CREATE INDEX idx_user_opportunities_type ON user_opportunities(opportunity_type);
CREATE INDEX idx_user_ai_chats_user_id ON user_ai_chats(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_chats ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for user_notes
CREATE POLICY "Users can manage their own notes"
  ON user_notes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_assessments
CREATE POLICY "Users can manage their own assessments"
  ON user_assessments
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_roadmaps
CREATE POLICY "Users can manage their own roadmaps"
  ON user_roadmaps
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_opportunities
CREATE POLICY "Users can manage their own opportunities"
  ON user_opportunities
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_ai_chats
CREATE POLICY "Users can manage their own AI chats"
  ON user_ai_chats
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Create triggers for updated_at
CREATE TRIGGER update_user_notes_updated_at
  BEFORE UPDATE ON user_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roadmaps_updated_at
  BEFORE UPDATE ON user_roadmaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_opportunities_updated_at
  BEFORE UPDATE ON user_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ai_chats_updated_at
  BEFORE UPDATE ON user_ai_chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();