/*
  # Resume Builder Tables

  1. New Tables
    - `user_resumes`: For storing user resumes
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `resume_name` (text, resume title)
      - `personal_info` (jsonb, personal information)
      - `experiences` (jsonb, work experience)
      - `education` (jsonb, education history)
      - `projects` (jsonb, projects)
      - `skills` (jsonb, skills array)
      - `awards` (jsonb, awards and achievements)
      - `template` (text, resume template name)
      - `is_default` (boolean, default resume flag)
      - `created_at`, `updated_at`, `deleted_at` (timestamps)

  2. Security
    - Enable RLS on the table
    - Add policies for authenticated users to manage their own resumes
*/

-- Create user_resumes table
CREATE TABLE IF NOT EXISTS user_resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_name text NOT NULL DEFAULT 'My Resume',
  personal_info jsonb DEFAULT '{}'::jsonb,
  experiences jsonb DEFAULT '[]'::jsonb,
  education jsonb DEFAULT '[]'::jsonb,
  projects jsonb DEFAULT '[]'::jsonb,
  skills jsonb DEFAULT '[]'::jsonb,
  awards jsonb DEFAULT '[]'::jsonb,
  template text DEFAULT 'professional',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON user_resumes(user_id);

-- Enable Row Level Security
ALTER TABLE user_resumes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_resumes
CREATE POLICY "resumes_select_own" ON user_resumes FOR SELECT TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "resumes_insert_own" ON user_resumes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resumes_update_own" ON user_resumes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resumes_delete_own" ON user_resumes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "resumes_service_all" ON user_resumes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_user_resumes_updated_at
  BEFORE UPDATE ON user_resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();