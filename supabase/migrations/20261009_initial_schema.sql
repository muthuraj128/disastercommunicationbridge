-- Disaster Communication Bridge (DCB) Supabase Database Migration
-- Version: 1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Enum Types
CREATE TYPE user_role AS ENUM ('affected_person', 'volunteer', 'coordinator');
CREATE TYPE report_severity AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE report_category AS ENUM ('medical', 'rescue', 'food_water', 'shelter', 'hazard', 'other');
CREATE TYPE report_status AS ENUM ('submitted', 'verified', 'assigned', 'in_progress', 'resolved', 'cancelled');
CREATE TYPE resource_type AS ENUM ('medical_kit', 'food_rations', 'water_liters', 'rescue_boat', 'power_generator', 'ambulance', 'shelter_bed');

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'affected_person',
  organization TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Emergency Reports
CREATE TABLE IF NOT EXISTS public.emergency_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_device_id TEXT NOT NULL,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category report_category NOT NULL,
  severity report_severity NOT NULL,
  description TEXT NOT NULL,
  people_affected INT NOT NULL DEFAULT 1,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_accuracy DOUBLE PRECISION,
  location_name TEXT,
  is_location_stale BOOLEAN DEFAULT FALSE,
  location_timestamp TIMESTAMPTZ,
  contact_info TEXT,
  evidence_notes TEXT,
  status report_status NOT NULL DEFAULT 'submitted',
  device_created_at TIMESTAMPTZ NOT NULL,
  cloud_received_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  hop_count INT DEFAULT 0,
  relay_path JSONB DEFAULT '[]'::jsonb
);

-- 3. Relief Resources
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_phone TEXT,
  resource_type resource_type NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  available_capacity INT NOT NULL DEFAULT 1,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location_name TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Shelters
CREATE TABLE IF NOT EXISTS public.shelters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manager_name TEXT,
  manager_phone TEXT,
  total_capacity INT NOT NULL,
  current_occupancy INT NOT NULL DEFAULT 0,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL,
  has_power BOOLEAN DEFAULT TRUE,
  has_water BOOLEAN DEFAULT TRUE,
  has_medical BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.emergency_reports(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources(id) ON DELETE SET NULL,
  shelter_id UUID REFERENCES public.shelters(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to_volunteer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'assigned',
  recommendation_score DOUBLE PRECISION,
  match_rationale TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Audit Events Log
CREATE TABLE IF NOT EXISTS public.report_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.emergency_reports(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_emergency_reports_severity ON public.emergency_reports(severity);
CREATE INDEX IF NOT EXISTS idx_emergency_reports_status ON public.emergency_reports(status);
CREATE INDEX IF NOT EXISTS idx_resources_available ON public.resources(is_available, available_capacity);
CREATE INDEX IF NOT EXISTS idx_shelters_active ON public.shelters(is_active);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public select emergency reports" ON public.emergency_reports FOR SELECT USING (true);
CREATE POLICY "Public insert emergency reports" ON public.emergency_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public upsert emergency reports" ON public.emergency_reports FOR UPDATE USING (true);

CREATE POLICY "Public read resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Public insert resources" ON public.resources FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read shelters" ON public.shelters FOR SELECT USING (true);
CREATE POLICY "Public read assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Public insert assignments" ON public.assignments FOR INSERT WITH CHECK (true);
