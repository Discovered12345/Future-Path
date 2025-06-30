/*
  # Complete Account Deletion Setup
  
  This migration creates a database function and trigger to ensure complete
  account deletion including authentication data when user data is deleted.
  
  1. Database Function
    - `delete_user_completely` function that deletes auth user and all related data
  
  2. Security
    - Only allows users to delete their own accounts
    - Includes proper error handling
*/

-- Create a function to completely delete a user account
CREATE OR REPLACE FUNCTION delete_user_completely(user_id_to_delete UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the requesting user is the same as the user being deleted
  IF auth.uid() != user_id_to_delete THEN
    RAISE EXCEPTION 'You can only delete your own account';
  END IF;
  
  -- Delete all user data from custom tables
  DELETE FROM user_profiles WHERE user_id = user_id_to_delete;
  DELETE FROM user_settings WHERE user_id = user_id_to_delete;
  DELETE FROM user_ai_chats WHERE user_id = user_id_to_delete;
  DELETE FROM user_notes WHERE user_id = user_id_to_delete;
  DELETE FROM user_assessments WHERE user_id = user_id_to_delete;
  DELETE FROM user_roadmaps WHERE user_id = user_id_to_delete;
  DELETE FROM user_opportunities WHERE user_id = user_id_to_delete;
  
  -- Delete the user from auth.users (this will cascade to auth.identities)
  DELETE FROM auth.users WHERE id = user_id_to_delete;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO authenticated;

-- Create a function that can be called via RPC for complete account deletion
CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to delete account';
  END IF;
  
  -- Delete all user data from custom tables
  DELETE FROM user_profiles WHERE user_id = current_user_id;
  DELETE FROM user_settings WHERE user_id = current_user_id;
  DELETE FROM user_ai_chats WHERE user_id = current_user_id;
  DELETE FROM user_notes WHERE user_id = current_user_id;
  DELETE FROM user_assessments WHERE user_id = current_user_id;
  DELETE FROM user_roadmaps WHERE user_id = current_user_id;
  DELETE FROM user_opportunities WHERE user_id = current_user_id;
  
  -- Delete the user from auth.users (this will cascade to auth.identities)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_my_account() TO authenticated;