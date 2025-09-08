-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create medical_records table
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  diagnosis TEXT,
  prescription TEXT,
  record_date DATE,
  image_url TEXT,
  extracted_text TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for medical_records
CREATE POLICY "Doctors can view all medical records"
ON public.medical_records
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can insert medical records"
ON public.medical_records
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can update medical records"
ON public.medical_records
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete medical records"
ON public.medical_records
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  -- Assign doctor role by default (admin will be assigned manually)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'doctor');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default admin user data (will need to be created through auth)
-- This is just a placeholder - actual admin creation will be handled in the app

-- Create indexes for better performance
CREATE INDEX idx_medical_records_patient_name ON public.medical_records(patient_name);
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_date ON public.medical_records(record_date);
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();