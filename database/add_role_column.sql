-- Add role column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN role VARCHAR(20) DEFAULT 'user';

-- Update existing users to have proper roles
-- Set admin role for specific email
UPDATE user_profiles 
SET role = 'admin' 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 's224384905@deakin.edu.au'
);

-- Ensure all other users have 'user' role
UPDATE user_profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Add constraint to ensure role is not null
ALTER TABLE user_profiles ALTER COLUMN role SET NOT NULL;

-- Add check constraint for valid roles
ALTER TABLE user_profiles ADD CONSTRAINT check_valid_role 
CHECK (role IN ('admin', 'user', 'moderator'));

-- Create index for role column for better performance
CREATE INDEX idx_user_profiles_role ON user_profiles(role);