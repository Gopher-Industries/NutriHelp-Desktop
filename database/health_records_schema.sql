-- Health Records Database Schema
-- Execute this in Supabase SQL Editor to create health records tables

-- Allergies table
CREATE TABLE IF NOT EXISTS allergies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    allergy_name VARCHAR(255) NOT NULL,
    severity VARCHAR(50), -- mild, moderate, severe
    reaction_description TEXT,
    diagnosed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    start_date DATE,
    end_date DATE,
    prescribing_doctor VARCHAR(255),
    purpose TEXT,
    side_effects TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical conditions table
CREATE TABLE IF NOT EXISTS medical_conditions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    condition_name VARCHAR(255) NOT NULL,
    diagnosis_date DATE,
    severity VARCHAR(50), -- mild, moderate, severe
    status VARCHAR(50), -- active, inactive, resolved
    treating_doctor VARCHAR(255),
    treatment_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family history table
CREATE TABLE IF NOT EXISTS family_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    relation VARCHAR(100) NOT NULL, -- mother, father, sister, brother, etc.
    condition_name VARCHAR(255) NOT NULL,
    age_of_onset INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_allergies_user_profile_id ON allergies(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_medications_user_profile_id ON medications(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_user_profile_id ON medical_conditions(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_family_history_user_profile_id ON family_history(user_profile_id);

-- Enable Row Level Security
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for allergies
CREATE POLICY "Users can manage own allergies" ON allergies
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = allergies.user_profile_id
        AND user_profiles.user_id = auth.uid()
    )
);

-- Create RLS policies for medications
CREATE POLICY "Users can manage own medications" ON medications
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = medications.user_profile_id
        AND user_profiles.user_id = auth.uid()
    )
);

-- Create RLS policies for medical conditions
CREATE POLICY "Users can manage own medical conditions" ON medical_conditions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = medical_conditions.user_profile_id
        AND user_profiles.user_id = auth.uid()
    )
);

-- Create RLS policies for family history
CREATE POLICY "Users can manage own family history" ON family_history
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = family_history.user_profile_id
        AND user_profiles.user_id = auth.uid()
    )
);

-- Admin policies (optional - allows admins to view all health records)
CREATE POLICY "Admin can view all allergies" ON allergies
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can view all medications" ON medications
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can view all medical conditions" ON medical_conditions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can view all family history" ON family_history
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- Insert sample data (optional)
-- Note: This assumes there are existing user_profiles to reference
-- You may need to adjust the user_profile_id values based on your actual data

-- Sample allergies
INSERT INTO allergies (user_profile_id, allergy_name, severity, reaction_description, diagnosed_date)
SELECT 
    up.id,
    'Peanuts',
    'severe',
    'Anaphylactic reaction, difficulty breathing',
    '2020-01-15'::date
FROM user_profiles up
WHERE up.email = 'test@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Sample medications
INSERT INTO medications (user_profile_id, medication_name, dosage, frequency, start_date, prescribing_doctor, purpose)
SELECT 
    up.id,
    'Lisinopril',
    '10mg',
    'Once daily',
    '2023-01-01'::date,
    'Dr. Smith',
    'Blood pressure control'
FROM user_profiles up
WHERE up.email = 'test@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Sample medical conditions
INSERT INTO medical_conditions (user_profile_id, condition_name, diagnosis_date, severity, status, treating_doctor)
SELECT 
    up.id,
    'Hypertension',
    '2022-12-15'::date,
    'moderate',
    'active',
    'Dr. Smith'
FROM user_profiles up
WHERE up.email = 'test@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Sample family history
INSERT INTO family_history (user_profile_id, relation, condition_name, age_of_onset, notes)
SELECT 
    up.id,
    'father',
    'Diabetes Type 2',
    55,
    'Diagnosed at age 55, managed with medication'
FROM user_profiles up
WHERE up.email = 'test@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;