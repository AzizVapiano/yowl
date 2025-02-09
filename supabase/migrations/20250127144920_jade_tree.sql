<<<<<<< HEAD
/*
  # Add insert policy for profiles

  1. Security Changes
    - Add policy to allow users to insert their own profile during signup
    
  Note: This policy ensures users can only create a profile with their own user ID
*/
=======
>>>>>>> quentin

CREATE POLICY "Users can insert their own profile"
    ON profiles 
    FOR INSERT
    WITH CHECK (auth.uid() = id);