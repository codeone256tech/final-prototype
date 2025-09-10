-- Check if admin user exists, if not create it
DO $$
BEGIN
    -- Only create admin if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@mediscan.ai') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
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
            '{"provider":"email","providers":["email"]}',
            '{"username":"admin","full_name":"System Administrator"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
    END IF;
END $$;

-- Create admin profile if it doesn't exist
INSERT INTO public.profiles (user_id, username, full_name)
SELECT id, 'admin', 'System Administrator'
FROM auth.users 
WHERE email = 'admin@mediscan.ai'
AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = 'admin');

-- Create admin role if it doesn't exist
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'admin@mediscan.ai'
AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@mediscan.ai'));