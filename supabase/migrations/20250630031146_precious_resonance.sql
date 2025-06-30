/*
  # Add Saved Colleges Table

  1. New Table
    - `saved_colleges`: For storing user's saved colleges
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `college_id` (integer, external college ID)
      - `college_name` (text, name of the college)
      - `notes` (text, user notes about the college)
      - `created_at`, `updated_at`, `deleted_at` (timestamps)

  2. Security
    - Enable RLS on the table
    - Add policies for authenticated users to manage their own saved colleges
*/

-- Create saved_colleges table
CREATE TABLE IF NOT EXISTS saved_colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id integer NOT NULL,
  college_name text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_saved_colleges_user_id ON saved_colleges(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_colleges_college_id ON saved_colleges(college_id);

-- Enable Row Level Security
ALTER TABLE saved_colleges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_colleges
CREATE POLICY "saved_colleges_select_own" ON saved_colleges FOR SELECT TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "saved_colleges_insert_own" ON saved_colleges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_colleges_update_own" ON saved_colleges FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_colleges_delete_own" ON saved_colleges FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "saved_colleges_service_all" ON saved_colleges FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_saved_colleges_updated_at
  BEFORE UPDATE ON saved_colleges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add unique constraint to prevent duplicate saves
CREATE UNIQUE INDEX idx_saved_colleges_user_college ON saved_colleges (user_id, college_id) 
WHERE deleted_at IS NULL;