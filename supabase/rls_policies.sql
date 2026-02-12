-- Enable Row Level Security on all tables
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reliability_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view all owners" ON owners;
DROP POLICY IF EXISTS "Users can insert owners" ON owners;
DROP POLICY IF EXISTS "Users can update owners" ON owners;
DROP POLICY IF EXISTS "Users can delete owners" ON owners;

DROP POLICY IF EXISTS "Users can view all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can insert vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can update vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can delete vehicles" ON vehicles;

DROP POLICY IF EXISTS "Users can view all reliability_scores" ON reliability_scores;
DROP POLICY IF EXISTS "Users can insert reliability_scores" ON reliability_scores;
DROP POLICY IF EXISTS "Users can update reliability_scores" ON reliability_scores;
DROP POLICY IF EXISTS "Users can delete reliability_scores" ON reliability_scores;

DROP POLICY IF EXISTS "Users can view all load_providers" ON load_providers;
DROP POLICY IF EXISTS "Users can insert load_providers" ON load_providers;
DROP POLICY IF EXISTS "Users can update load_providers" ON load_providers;
DROP POLICY IF EXISTS "Users can delete load_providers" ON load_providers;

DROP POLICY IF EXISTS "Users can view all load_requests" ON load_requests;
DROP POLICY IF EXISTS "Users can insert load_requests" ON load_requests;
DROP POLICY IF EXISTS "Users can update load_requests" ON load_requests;
DROP POLICY IF EXISTS "Users can delete load_requests" ON load_requests;

DROP POLICY IF EXISTS "Users can view all trips" ON trips;
DROP POLICY IF EXISTS "Users can insert trips" ON trips;
DROP POLICY IF EXISTS "Users can update trips" ON trips;
DROP POLICY IF EXISTS "Users can delete trips" ON trips;

-- Owners policies (authenticated users can do everything)
CREATE POLICY "Users can view all owners" ON owners
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert owners" ON owners
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update owners" ON owners
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete owners" ON owners
    FOR DELETE USING (auth.role() = 'authenticated');

-- Vehicles policies
CREATE POLICY "Users can view all vehicles" ON vehicles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert vehicles" ON vehicles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update vehicles" ON vehicles
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete vehicles" ON vehicles
    FOR DELETE USING (auth.role() = 'authenticated');

-- Reliability scores policies
CREATE POLICY "Users can view all reliability_scores" ON reliability_scores
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert reliability_scores" ON reliability_scores
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update reliability_scores" ON reliability_scores
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete reliability_scores" ON reliability_scores
    FOR DELETE USING (auth.role() = 'authenticated');

-- Load providers policies
CREATE POLICY "Users can view all load_providers" ON load_providers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert load_providers" ON load_providers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update load_providers" ON load_providers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete load_providers" ON load_providers
    FOR DELETE USING (auth.role() = 'authenticated');

-- Load requests policies
CREATE POLICY "Users can view all load_requests" ON load_requests
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert load_requests" ON load_requests
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update load_requests" ON load_requests
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete load_requests" ON load_requests
    FOR DELETE USING (auth.role() = 'authenticated');

-- Trips policies
CREATE POLICY "Users can view all trips" ON trips
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert trips" ON trips
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update trips" ON trips
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete trips" ON trips
    FOR DELETE USING (auth.role() = 'authenticated');

-- Invoices policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

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

-- Other Income policies
ALTER TABLE other_income ENABLE ROW LEVEL SECURITY;

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

-- Other Expenses policies
ALTER TABLE other_expenses ENABLE ROW LEVEL SECURITY;

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
