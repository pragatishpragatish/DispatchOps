-- Migration: Add distance_km column to load_requests table
-- Run this migration in your Supabase SQL Editor

ALTER TABLE load_requests 
ADD COLUMN IF NOT EXISTS distance_km DECIMAL(10, 2);

-- Add comment for documentation
COMMENT ON COLUMN load_requests.distance_km IS 'Distance in kilometers between pickup and drop locations';
