/*
  # Academic Profiles Migration

  1. New Tables
    - `user_academic_profiles`: For storing user academic information
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `gpa` (decimal, current GPA)
      - `sat_score` (integer, SAT score)
      - `act_score` (integer, ACT score)
      - `class_rank` (integer, class rank)
      - `class_size` (integer, total class size)
      - `intended_major` (text, intended major)
      - `extracurriculars` (jsonb, extracurricular activities)
      - `achievements` (jsonb, awards and achievements)
      - `ap_courses` (jsonb, AP courses taken)
      - `honors_courses` (jsonb, honors courses taken)
      - `volunteer_hours` (integer, volunteer hours)
      - `work_experience` (jsonb, work experience)
      - `leadership_roles` (jsonb, leadership positions)
      - `created_at`, `updated_at`, `deleted_at` (timestamps)

  2. Security
    - Enable RLS on the table
    - Add policies for authenticated users to manage their own profiles
*/

-- Create user_academic_profiles table
CREATE TABLE IF NOT EXISTS user_academic_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  gpa decimal(3,2) DEFAULT 0.0,
  sat_score integer DEFAULT 0,
  act_score integer DEFAULT 0,
  class_rank integer DEFAULT 0,
  class_size integer DEFAULT 0,
  intended_major text DEFAULT '',
  extracurriculars jsonb DEFAULT '[]'::jsonb,
  achievements jsonb DEFAULT '[]'::jsonb,
  ap_courses jsonb DEFAULT '[]'::jsonb,
  honors_courses jsonb DEFAULT '[]'::jsonb,
  volunteer_hours integer DEFAULT 0,
  work_experience jsonb DEFAULT '[]'::jsonb,
  leadership_roles jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_academic_profiles_user_id ON user_academic_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE user_academic_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_academic_profiles
CREATE POLICY "academic_profiles_select_own" ON user_academic_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "academic_profiles_insert_own" ON user_academic_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "academic_profiles_update_own" ON user_academic_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "academic_profiles_delete_own" ON user_academic_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "academic_profiles_service_all" ON user_academic_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_user_academic_profiles_updated_at
  BEFORE UPDATE ON user_academic_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();