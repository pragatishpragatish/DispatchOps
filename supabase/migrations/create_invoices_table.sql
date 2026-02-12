-- Migration: Create invoices table
-- Run this migration in your Supabase SQL Editor

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

-- Create indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_provider_id ON invoices(provider_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);

-- Add trigger for invoices updated_at
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view all invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices" ON invoices;

CREATE POLICY "Users can view all invoices" ON invoices
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert invoices" ON invoices
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update invoices" ON invoices
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete invoices" ON invoices
    FOR DELETE USING (auth.role() = 'authenticated');
