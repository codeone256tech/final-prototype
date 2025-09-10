-- Update RLS policies for medical_records to ensure user isolation
-- Doctors can only see their own records, admins can see all records

-- Drop existing policies
DROP POLICY IF EXISTS "Doctors can view all medical records" ON medical_records;
DROP POLICY IF EXISTS "Doctors can insert medical records" ON medical_records;
DROP POLICY IF EXISTS "Doctors can update medical records" ON medical_records;
DROP POLICY IF EXISTS "Admins can delete medical records" ON medical_records;

-- Create new policies with proper user isolation
CREATE POLICY "Users can view their own records" 
ON medical_records FOR SELECT 
USING (
  (has_role(auth.uid(), 'doctor'::app_role) AND created_by = auth.uid()) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can insert their own records" 
ON medical_records FOR INSERT 
WITH CHECK (
  (has_role(auth.uid(), 'doctor'::app_role) AND created_by = auth.uid()) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can update their own records" 
ON medical_records FOR UPDATE 
USING (
  (has_role(auth.uid(), 'doctor'::app_role) AND created_by = auth.uid()) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete any records" 
ON medical_records FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));