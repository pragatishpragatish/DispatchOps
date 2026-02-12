-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Owners table
CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_name TEXT NOT NULL,
  driver_name TEXT,
  phone_primary TEXT NOT NULL,
  phone_alternate TEXT,
  whatsapp_available BOOLEAN DEFAULT false,
  base_city TEXT,
  base_area TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('pickup', 'lcv', 'truck', 'container', 'trailer', 'other')),
  vehicle_model TEXT,
  body_type TEXT,
  gvw_tons DECIMAL(10, 2),
  payload_tons DECIMAL(10, 2),
  length_ft DECIMAL(10, 2),
  registration_number TEXT UNIQUE,
  fuel_type TEXT CHECK (fuel_type IN ('diesel', 'petrol', 'cng', 'electric', 'other')),
  min_rate_per_km DECIMAL(10, 2),
  min_trip_rate DECIMAL(10, 2),
  preferred_routes TEXT[] DEFAULT '{}',
  avoid_routes TEXT[] DEFAULT '{}',
  city_only BOOLEAN DEFAULT false,
  max_distance_km DECIMAL(10, 2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reliability scores table
CREATE TABLE IF NOT EXISTS reliability_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  ontime_pickup_score INTEGER CHECK (ontime_pickup_score >= 1 AND ontime_pickup_score <= 5),
  ontime_delivery_score INTEGER CHECK (ontime_delivery_score >= 1 AND ontime_delivery_score <= 5),
  communication_score INTEGER CHECK (communication_score >= 1 AND communication_score <= 5),
  behavior_score INTEGER CHECK (behavior_score >= 1 AND behavior_score <= 5),
  vehicle_condition_score INTEGER CHECK (vehicle_condition_score >= 1 AND vehicle_condition_score <= 5),
  trips_completed INTEGER DEFAULT 0,
  last_trip_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vehicle_id)
);

-- Load providers table
CREATE TABLE IF NOT EXISTS load_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  industry_type TEXT,
  typical_load TEXT,
  typical_routes TEXT[] DEFAULT '{}',
  vehicle_types_used TEXT[] DEFAULT '{}',
  payment_cycle_days INTEGER DEFAULT 30,
  backup_vendor_ok BOOLEAN DEFAULT false,
  trust_level TEXT CHECK (trust_level IN ('cold', 'warm', 'hot')) DEFAULT 'cold',
  notes TEXT,
  last_contact_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Load requests table
CREATE TABLE IF NOT EXISTS load_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES load_providers(id) ON DELETE CASCADE,
  pickup_location TEXT NOT NULL,
  drop_location TEXT NOT NULL,
  material_type TEXT,
  weight_tons DECIMAL(10, 2),
  distance_km DECIMAL(10, 2),
  vehicle_type_needed TEXT NOT NULL,
  quoted_budget DECIMAL(10, 2),
  status TEXT CHECK (status IN ('open', 'matching', 'matched', 'closed', 'failed')) DEFAULT 'open',
  required_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_request_id UUID NOT NULL REFERENCES load_requests(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  client_rate DECIMAL(10, 2) NOT NULL,
  owner_rate DECIMAL(10, 2) NOT NULL,
  margin_amount DECIMAL(10, 2) GENERATED ALWAYS AS (client_rate - owner_rate) STORED,
  pickup_time TIMESTAMP WITH TIME ZONE,
  delivery_time TIMESTAMP WITH TIME ZONE,
  pod_received BOOLEAN DEFAULT false,
  payment_received BOOLEAN DEFAULT false,
  owner_paid BOOLEAN DEFAULT false,
  issue_flag BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vehicles_owner_id ON vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_active ON vehicles(active);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_reliability_scores_vehicle_id ON reliability_scores(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_load_requests_provider_id ON load_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_load_requests_status ON load_requests(status);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_owner_id ON trips(owner_id);
CREATE INDEX IF NOT EXISTS idx_trips_load_request_id ON trips(load_request_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reliability_scores_updated_at BEFORE UPDATE ON reliability_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_load_providers_updated_at BEFORE UPDATE ON load_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_load_requests_updated_at BEFORE UPDATE ON load_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES load_providers(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  coordination_fee DECIMAL(10, 2) NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
  payment_date DATE,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_provider_id ON invoices(provider_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);

-- Add trigger for invoices updated_at
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Other Income table
CREATE TABLE IF NOT EXISTS other_income (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  income_date DATE NOT NULL,
  category TEXT,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Other Expenses table
CREATE TABLE IF NOT EXISTS other_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  category TEXT,
  reference_number TEXT,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_other_income_date ON other_income(income_date);
CREATE INDEX IF NOT EXISTS idx_other_expenses_date ON other_expenses(expense_date);

-- Add triggers for updated_at
CREATE TRIGGER update_other_income_updated_at BEFORE UPDATE ON other_income
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_other_expenses_updated_at BEFORE UPDATE ON other_expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
