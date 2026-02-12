-- Seed data for DispatchOps
-- Run this after creating the schema and RLS policies

-- Insert sample owners
INSERT INTO owners (owner_name, driver_name, phone_primary, phone_alternate, whatsapp_available, base_city, base_area, notes) VALUES
('Rajesh Kumar', 'Mohan Singh', '9876543210', '9876543211', true, 'Mumbai', 'Andheri', 'Reliable owner, good communication'),
('Priya Sharma', 'Vikram Patel', '9876543220', NULL, true, 'Delhi', 'Gurgaon', 'Quick response time'),
('Amit Verma', 'Suresh Yadav', '9876543230', '9876543231', false, 'Bangalore', 'Whitefield', 'Prefers long distance trips'),
('Sunita Devi', 'Ramesh Kumar', '9876543240', NULL, true, 'Mumbai', 'Bandra', 'City operations only'),
('Vikash Singh', 'Ajay Mehta', '9876543250', '9876543251', true, 'Delhi', 'Noida', 'New owner, building trust');

-- Insert sample vehicles
INSERT INTO vehicles (owner_id, vehicle_type, vehicle_model, body_type, gvw_tons, payload_tons, length_ft, registration_number, fuel_type, min_rate_per_km, min_trip_rate, preferred_routes, avoid_routes, city_only, max_distance_km, active) VALUES
((SELECT id FROM owners WHERE owner_name = 'Rajesh Kumar'), 'truck', 'Tata 407', 'Container', 7.5, 5.0, 14, 'MH-01-AB-1234', 'diesel', 25.00, 2000.00, ARRAY['Mumbai-Delhi', 'Mumbai-Pune'], ARRAY['Mumbai-Goa'], false, 1000, true),
((SELECT id FROM owners WHERE owner_name = 'Rajesh Kumar'), 'lcv', 'Mahindra Bolero', 'Open', 3.5, 2.0, 10, 'MH-01-CD-5678', 'diesel', 18.00, 1500.00, ARRAY['Mumbai-Pune', 'Mumbai-Nashik'], ARRAY[]::text[], true, 200, true),
((SELECT id FROM owners WHERE owner_name = 'Priya Sharma'), 'pickup', 'Tata Ace', 'Closed', 1.5, 0.8, 7, 'DL-01-EF-9012', 'diesel', 15.00, 1000.00, ARRAY['Delhi-Noida', 'Delhi-Gurgaon'], ARRAY[]::text[], true, 100, true),
((SELECT id FROM owners WHERE owner_name = 'Amit Verma'), 'truck', 'Ashok Leyland', 'Flatbed', 10.0, 7.5, 18, 'KA-01-GH-3456', 'diesel', 30.00, 3000.00, ARRAY['Bangalore-Chennai', 'Bangalore-Hyderabad'], ARRAY[]::text[], false, 1500, true),
((SELECT id FROM owners WHERE owner_name = 'Sunita Devi'), 'lcv', 'Eicher Pro', 'Container', 3.5, 2.5, 12, 'MH-01-IJ-7890', 'diesel', 20.00, 1800.00, ARRAY['Mumbai-Thane', 'Mumbai-Navi Mumbai'], ARRAY[]::text[], true, 150, true),
((SELECT id FROM owners WHERE owner_name = 'Vikash Singh'), 'pickup', 'Mahindra Pickup', 'Open', 1.5, 1.0, 8, 'DL-01-KL-2468', 'diesel', 16.00, 1200.00, ARRAY['Delhi-Faridabad'], ARRAY[]::text[], true, 80, true);

-- Insert sample reliability scores
INSERT INTO reliability_scores (vehicle_id, ontime_pickup_score, ontime_delivery_score, communication_score, behavior_score, vehicle_condition_score, trips_completed, last_trip_date) VALUES
((SELECT id FROM vehicles WHERE registration_number = 'MH-01-AB-1234'), 5, 5, 4, 5, 4, 25, '2026-02-10'),
((SELECT id FROM vehicles WHERE registration_number = 'MH-01-CD-5678'), 4, 4, 5, 4, 4, 18, '2026-02-09'),
((SELECT id FROM vehicles WHERE registration_number = 'DL-01-EF-9012'), 5, 4, 4, 5, 5, 30, '2026-02-11'),
((SELECT id FROM vehicles WHERE registration_number = 'KA-01-GH-3456'), 4, 5, 4, 4, 4, 22, '2026-02-08'),
((SELECT id FROM vehicles WHERE registration_number = 'MH-01-IJ-7890'), 3, 4, 3, 4, 3, 12, '2026-02-07');

-- Insert sample load providers
INSERT INTO load_providers (company_name, contact_person, phone, whatsapp, industry_type, typical_load, typical_routes, vehicle_types_used, payment_cycle_days, backup_vendor_ok, trust_level, notes, last_contact_date) VALUES
('ABC Logistics Pvt Ltd', 'Rahul Mehta', '9123456789', '9123456789', 'E-commerce', 'Packages and parcels', ARRAY['Mumbai-Delhi', 'Delhi-Bangalore'], ARRAY['truck', 'lcv'], 30, true, 'hot', 'Regular client, prompt payments', '2026-02-10'),
('XYZ Manufacturing', 'Kavita Shah', '9123456790', NULL, 'Manufacturing', 'Raw materials', ARRAY['Mumbai-Pune', 'Pune-Nashik'], ARRAY['truck'], 45, false, 'warm', 'Good relationship, occasional delays', '2026-02-08'),
('Global Trading Co', 'Anil Desai', '9123456791', '9123456791', 'Trading', 'General goods', ARRAY['Delhi-Mumbai', 'Delhi-Chennai'], ARRAY['truck', 'lcv', 'pickup'], 30, true, 'hot', 'High volume, reliable', '2026-02-11'),
('City Distributors', 'Meera Patel', '9123456792', NULL, 'Distribution', 'FMCG products', ARRAY['Mumbai-Thane', 'Mumbai-Navi Mumbai'], ARRAY['lcv', 'pickup'], 15, true, 'warm', 'City operations, frequent loads', '2026-02-09'),
('Fresh Foods Ltd', 'Suresh Reddy', '9123456793', '9123456793', 'Food & Beverage', 'Perishable goods', ARRAY['Bangalore-Chennai', 'Bangalore-Hyderabad'], ARRAY['truck', 'lcv'], 30, false, 'cold', 'New client, testing waters', '2026-01-25');

-- Insert sample load requests
INSERT INTO load_requests (provider_id, pickup_location, drop_location, material_type, weight_tons, vehicle_type_needed, quoted_budget, status, required_date, notes) VALUES
((SELECT id FROM load_providers WHERE company_name = 'ABC Logistics Pvt Ltd'), 'Mumbai, Andheri', 'Delhi, Connaught Place', 'Packages', 4.5, 'truck', 15000.00, 'open', '2026-02-15', 'Urgent delivery required'),
((SELECT id FROM load_providers WHERE company_name = 'XYZ Manufacturing'), 'Pune, Hinjewadi', 'Mumbai, BKC', 'Raw Materials', 3.0, 'truck', 12000.00, 'matching', '2026-02-14', 'Standard delivery'),
((SELECT id FROM load_providers WHERE company_name = 'Global Trading Co'), 'Delhi, Noida', 'Mumbai, Navi Mumbai', 'General Goods', 6.0, 'truck', 20000.00, 'matched', '2026-02-13', 'Heavy load'),
((SELECT id FROM load_providers WHERE company_name = 'City Distributors'), 'Mumbai, Bandra', 'Mumbai, Andheri', 'FMCG Products', 1.5, 'lcv', 5000.00, 'closed', '2026-02-12', 'Completed successfully'),
((SELECT id FROM load_providers WHERE company_name = 'Fresh Foods Ltd'), 'Bangalore, Whitefield', 'Chennai, T Nagar', 'Perishable Goods', 5.0, 'truck', 18000.00, 'open', '2026-02-16', 'Refrigerated transport preferred');

-- Insert sample trips
INSERT INTO trips (load_request_id, vehicle_id, owner_id, client_rate, owner_rate, pickup_time, delivery_time, pod_received, payment_received, owner_paid, issue_flag, notes) VALUES
((SELECT id FROM load_requests WHERE status = 'matched'), 
 (SELECT id FROM vehicles WHERE registration_number = 'MH-01-AB-1234'),
 (SELECT id FROM owners WHERE owner_name = 'Rajesh Kumar'),
 20000.00, 17500.00, '2026-02-13 08:00:00+00', '2026-02-13 20:00:00+00', true, true, true, false, 'Smooth delivery'),
((SELECT id FROM load_requests WHERE status = 'closed'),
 (SELECT id FROM vehicles WHERE registration_number = 'MH-01-CD-5678'),
 (SELECT id FROM owners WHERE owner_name = 'Rajesh Kumar'),
 5000.00, 4200.00, '2026-02-12 09:00:00+00', '2026-02-12 14:00:00+00', true, true, true, false, 'On-time delivery');

-- Update load request status for matched trip
UPDATE load_requests SET status = 'matched' WHERE id = (SELECT load_request_id FROM trips LIMIT 1 OFFSET 0);
