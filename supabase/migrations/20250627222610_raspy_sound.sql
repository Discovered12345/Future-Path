/*
  # Additional Tables for FuturePath

  1. New Tables
    - `user_notes`: For storing user notes and journal entries
    - `user_assessments`: For storing assessment results
    - `user_roadmaps`: For storing custom roadmaps
    - `user_opportunities`: For tracking saved opportunities

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create user_notes table
CREATE TABLE IF NOT EXISTS user_notes (
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
CREATE TABLE IF NOT EXISTS user_assessments (
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
CREATE TABLE IF NOT EXISTS user_roadmaps (
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
CREATE TABLE IF NOT EXISTS user_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_title text NOT NULL,
  opportunity_type text NOT NULL, -- scholarship, internship, competition
  description text DEFAULT '',
  amount text DEFAULT '',
  deadline date,
  location text DEFAULT '',
  requirements jsonb DEFAULT '[]'::jsonb,
  skills jsonb DEFAULT '[]'::jsonb,
  application_status text DEFAULT 'saved', -- saved, applied, accepted, rejected
  application_date timestamptz,
  notes text DEFAULT '',
  external_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- Create user_ai_chats table
CREATE TABLE IF NOT EXISTS user_ai_chats (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_category ON user_notes(category);
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roadmaps_user_id ON user_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_opportunities_user_id ON user_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_opportunities_type ON user_opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_user_ai_chats_user_id ON user_ai_chats(user_id);

-- Enable Row Level Security
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_chats ENABLE ROW LEVEL SECURITY;

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