-- Migration: Create other_income and other_expenses tables
-- Run this migration in your Supabase SQL Editor

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

-- Enable RLS
ALTER TABLE other_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE other_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for other_income
DROP POLICY IF EXISTS "Users can view all other income" ON other_income;
DROP POLICY IF EXISTS "Users can insert other income" ON other_income;
DROP POLICY IF EXISTS "Users can update other income" ON other_income;
DROP POLICY IF EXISTS "Users can delete other income" ON other_income;

CREATE POLICY "Users can view all other income" ON other_income
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert other income" ON other_income
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update other income" ON other_income
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete other income" ON other_income
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for other_expenses
DROP POLICY IF EXISTS "Users can view all other expenses" ON other_expenses;
DROP POLICY IF EXISTS "Users can insert other expenses" ON other_expenses;
DROP POLICY IF EXISTS "Users can update other expenses" ON other_expenses;
DROP POLICY IF EXISTS "Users can delete other expenses" ON other_expenses;

CREATE POLICY "Users can view all other expenses" ON other_expenses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert other expenses" ON other_expenses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update other expenses" ON other_expenses
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete other expenses" ON other_expenses
    FOR DELETE USING (auth.role() = 'authenticated');
