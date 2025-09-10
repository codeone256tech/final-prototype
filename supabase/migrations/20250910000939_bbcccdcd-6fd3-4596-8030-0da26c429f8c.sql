-- Add email field to profiles table for easier authentication
ALTER TABLE public.profiles ADD COLUMN email TEXT;

-- Create the admin user account
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@mediscan.ai',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{"username":"admin","full_name":"System Administrator"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create admin profile
INSERT INTO public.profiles (user_id, username, full_name, email)
SELECT id, 'admin', 'System Administrator', 'admin@mediscan.ai'
FROM auth.users 
WHERE email = 'admin@mediscan.ai';

-- Create admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'admin@mediscan.ai';

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  
  -- Assign doctor role by default (admin will be assigned manually)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'doctor');
  
  RETURN NEW;
END;
$$;