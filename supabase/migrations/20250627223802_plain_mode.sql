/*
  # Fix user creation trigger function

  1. Database Functions
    - Drop and recreate the `create_user_profile` function with proper error handling
    - Ensure the function creates both user_profiles and user_settings entries
    - Add proper exception handling to prevent signup failures

  2. Triggers
    - Recreate the trigger to call the function when a new user is created

  3. Security
    - Ensure RLS policies allow the trigger function to insert data
    - Add service role bypass for trigger operations
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.create_user_profile();

-- Create improved user profile creation function
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile with error handling
  BEGIN
    INSERT INTO public.user_profiles (user_id, stats, achievements, recent_activities)
    VALUES (
      NEW.id,
      jsonb_build_object(
        'daysActive', 1,
        'skillsTracked', 0,
        'goalsCompleted', 0,
        'messagesWithAI', 0,
        'roadmapsCreated', 0,
        'assessmentsTaken', 0,
        'opportunitiesFound', 0,
        'profileCompleteness', 25
      ),
      jsonb_build_array(
        jsonb_build_object(
          'id', 'first-login',
          'title', 'Welcome to FuturePath!',
          'description', 'Created your account and logged in',
          'type', 'milestone',
          'earned', true,
          'earnedAt', NOW(),
          'requirement', 1,
          'currentProgress', 1
        )
      ),
      '[]'::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
  END;

  -- Insert user settings with error handling
  BEGIN
    INSERT INTO public.user_settings (user_id, settings)
    VALUES (
      NEW.id,
      jsonb_build_object(
        'theme', 'default',
        'emailNotifications', true,
        'pushNotifications', true,
        'weeklyReports', false,
        'autoSave', true,
        'publicProfile', false,
        'language', 'en',
        'timezone', 'UTC'
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create user settings for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically call the function when a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_settings TO postgres, anon, authenticated, service_role;

-- Ensure RLS policies allow service role to bypass restrictions for triggers
DO $$
BEGIN
  -- Add service role bypass policy for user_profiles if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Service role can manage all profiles'
  ) THEN
    CREATE POLICY "Service role can manage all profiles"
      ON public.user_profiles
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  -- Add service role bypass policy for user_settings if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_settings' 
    AND policyname = 'Service role can manage all settings'
  ) THEN
    CREATE POLICY "Service role can manage all settings"
      ON public.user_settings
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;